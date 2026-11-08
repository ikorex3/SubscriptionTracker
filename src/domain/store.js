/**
 * In-memory / persisted Data Store for Subscription Tracker.
 * Manages Subscriptions, Trials, BillingEvents, Notifications, and Settings.
 */
import { randomUUID } from 'node:crypto';
import {
  calculateNextBillingDate,
  calculateSpendEstimates,
  calculateTotalAnalytics
} from './calculations.js';

export class Store {
  constructor() {
    this.reset();
  }

  reset() {
    this.subscriptions = new Map();
    this.trials = new Map();
    this.billingEvents = new Map();
    this.notifications = new Map();
    this.settings = {
      renewalLeadTimeDays: 3,
      trialLeadTimeDays: 3,
      currency: 'UAH',
      updatedAt: new Date().toISOString()
    };
  }

  // ──────────────────────────────────────────────────────────────────────────
  // Subscriptions
  // ──────────────────────────────────────────────────────────────────────────

  listSubscriptions(filterStatus) {
    const list = Array.from(this.subscriptions.values());
    if (filterStatus && filterStatus !== 'all') {
      return list.filter((s) => s.status === filterStatus);
    }
    return list;
  }

  getSubscription(id) {
    return this.subscriptions.get(id) || null;
  }

  createSubscription(data) {
    const id = randomUUID();
    const now = new Date().toISOString();
    const {
      serviceName,
      cost,
      billingIntervalType,
      customIntervalValue,
      customIntervalUnit,
      firstBillingDate,
      paymentMethod = null,
      category = 'other',
      notificationLeadTimeDays = this.settings.renewalLeadTimeDays
    } = data;

    const nextBillingDate = calculateNextBillingDate(
      firstBillingDate,
      billingIntervalType,
      customIntervalValue,
      customIntervalUnit
    );

    const { annualSpendEstimate, monthlySpendEstimate } = calculateSpendEstimates(
      cost,
      billingIntervalType,
      customIntervalValue,
      customIntervalUnit
    );

    const today = new Date().toISOString().slice(0, 10);
    const billingDue = today >= nextBillingDate;
    const overdue = today > nextBillingDate;

    const subscription = {
      id,
      serviceName,
      cost: Number(cost),
      currency: 'UAH',
      billingIntervalType,
      customIntervalValue: customIntervalValue ? Number(customIntervalValue) : undefined,
      customIntervalUnit: customIntervalUnit || undefined,
      firstBillingDate,
      nextBillingDate,
      paymentMethod,
      category,
      status: 'active',
      billingDue,
      overdue,
      notificationLeadTimeDays: Number(notificationLeadTimeDays),
      annualSpendEstimate,
      monthlySpendEstimate,
      createdAt: now,
      updatedAt: now
    };

    this.subscriptions.set(id, subscription);
    return subscription;
  }

  updateSubscription(id, data) {
    const existing = this.subscriptions.get(id);
    if (!existing) return null;

    const now = new Date().toISOString();
    const updated = { ...existing, ...data, id, updatedAt: now };

    if (data.cost !== undefined || data.billingIntervalType !== undefined || data.customIntervalValue !== undefined) {
      const intervalType = updated.billingIntervalType;
      const customVal = updated.customIntervalValue;
      const customUnit = updated.customIntervalUnit;
      const { annualSpendEstimate, monthlySpendEstimate } = calculateSpendEstimates(
        updated.cost,
        intervalType,
        customVal,
        customUnit
      );
      updated.annualSpendEstimate = annualSpendEstimate;
      updated.monthlySpendEstimate = monthlySpendEstimate;

      if (!updated.nextBillingDate || updated.firstBillingDate) {
        updated.nextBillingDate = calculateNextBillingDate(
          updated.firstBillingDate,
          intervalType,
          customVal,
          customUnit
        );
      }
    }

    this.subscriptions.set(id, updated);
    return updated;
  }

  cancelSubscription(id) {
    const existing = this.subscriptions.get(id);
    if (!existing) return { notFound: true };
    if (existing.status === 'cancelled') return { conflict: true };

    const now = new Date().toISOString();
    const updated = {
      ...existing,
      status: 'cancelled',
      updatedAt: now
    };
    this.subscriptions.set(id, updated);
    return { subscription: updated };
  }

  // ──────────────────────────────────────────────────────────────────────────
  // Trials
  // ──────────────────────────────────────────────────────────────────────────

  listTrials(filterStatus) {
    const list = Array.from(this.trials.values());
    if (filterStatus) {
      return list.filter((t) => t.status === filterStatus);
    }
    return list;
  }

  getTrial(id) {
    return this.trials.get(id) || null;
  }

  createTrial(data) {
    const id = randomUUID();
    const now = new Date().toISOString();
    const {
      serviceName,
      startDate,
      endDate,
      linkedSubscriptionId = null,
      notificationLeadTimeDays = this.settings.trialLeadTimeDays
    } = data;

    const trial = {
      id,
      serviceName,
      startDate,
      endDate,
      linkedSubscriptionId,
      status: 'active',
      assumedCost: 0.00,
      notificationLeadTimeDays: Number(notificationLeadTimeDays),
      createdAt: now,
      updatedAt: now
    };

    this.trials.set(id, trial);
    return trial;
  }

  updateTrial(id, data) {
    const existing = this.trials.get(id);
    if (!existing) return null;

    const now = new Date().toISOString();
    // Do not allow status change through PUT
    const { status, ...allowedUpdates } = data;
    const updated = { ...existing, ...allowedUpdates, id, updatedAt: now };
    this.trials.set(id, updated);
    return updated;
  }

  resolveTrial(id, action) {
    const trial = this.trials.get(id);
    if (!trial) return { notFound: true };
    if (trial.status !== 'expired') {
      return { invalidStatus: true, currentStatus: trial.status };
    }

    const now = new Date().toISOString();
    if (action === 'convert') {
      trial.status = 'converted';
      trial.updatedAt = now;
      if (trial.linkedSubscriptionId) {
        const linkedSub = this.subscriptions.get(trial.linkedSubscriptionId);
        if (linkedSub) {
          linkedSub.status = 'active';
          linkedSub.updatedAt = now;
        }
      }
    } else if (action === 'cancel') {
      trial.status = 'cancelled';
      trial.updatedAt = now;
      if (trial.linkedSubscriptionId) {
        const linkedSub = this.subscriptions.get(trial.linkedSubscriptionId);
        if (linkedSub) {
          linkedSub.status = 'cancelled';
          linkedSub.updatedAt = now;
        }
      }
    } else {
      return { invalidAction: true };
    }

    return { trial };
  }

  // ──────────────────────────────────────────────────────────────────────────
  // Billing Events
  // ──────────────────────────────────────────────────────────────────────────

  listBillingEvents(subscriptionId, paymentStatus, sort = 'desc') {
    let list = Array.from(this.billingEvents.values());
    if (subscriptionId) {
      list = list.filter((b) => b.subscriptionId === subscriptionId);
    }
    if (paymentStatus) {
      list = list.filter((b) => b.paymentStatus === paymentStatus);
    }
    list.sort((a, b) => {
      const cmp = a.dateConfirmed.localeCompare(b.dateConfirmed);
      return sort === 'asc' ? cmp : -cmp;
    });
    return list;
  }

  getBillingEvent(id) {
    return this.billingEvents.get(id) || null;
  }

  confirmBillingEvent(data) {
    const { subscriptionId, paymentStatus, dateConfirmed } = data;
    const subscription = this.subscriptions.get(subscriptionId);
    if (!subscription) return { notFound: true };

    if (subscription.status !== 'active') {
      return { invalid: true, message: 'Subscription is not active' };
    }

    const today = new Date().toISOString().slice(0, 10);
    if (dateConfirmed > today) {
      return { invalid: true, message: 'dateConfirmed cannot be in the future' };
    }

    // Check if billing is due or overdue
    const isDue = subscription.billingDue || subscription.overdue || dateConfirmed >= subscription.nextBillingDate;
    if (!isDue) {
      return { billingNotDue: true, message: 'No billing event is currently due for this subscription.' };
    }

    const id = randomUUID();
    const now = new Date().toISOString();
    const event = {
      id,
      subscriptionId,
      serviceName: subscription.serviceName,
      amount: subscription.cost,
      currency: 'UAH',
      billingDate: subscription.nextBillingDate,
      dateConfirmed,
      paymentStatus,
      createdAt: now
    };

    // Calculate new next billing date
    const newNextDate = calculateNextBillingDate(
      dateConfirmed,
      subscription.billingIntervalType,
      subscription.customIntervalValue,
      subscription.customIntervalUnit
    );

    subscription.nextBillingDate = newNextDate;
    subscription.billingDue = false;
    subscription.overdue = false;
    subscription.updatedAt = now;

    this.billingEvents.set(id, event);
    return { event, subscription };
  }

  // ──────────────────────────────────────────────────────────────────────────
  // Analytics
  // ──────────────────────────────────────────────────────────────────────────

  getAnalyticsSummary() {
    return calculateTotalAnalytics(Array.from(this.subscriptions.values()));
  }

  // ──────────────────────────────────────────────────────────────────────────
  // Notifications
  // ──────────────────────────────────────────────────────────────────────────

  listNotifications(type, includeDismissed = false) {
    let list = Array.from(this.notifications.values());
    if (!includeDismissed) {
      list = list.filter((n) => !n.isDismissed);
    }
    if (type) {
      list = list.filter((n) => n.type === type);
    }

    // Sort priority (TRIAL_EXPIRY first, then STARTUP_SUMMARY, then RENEWAL), then by createdAt desc
    const typePriority = { TRIAL_EXPIRY: 1, STARTUP_SUMMARY: 2, RENEWAL: 3 };
    list.sort((a, b) => {
      const pDiff = (typePriority[a.type] || 4) - (typePriority[b.type] || 4);
      if (pDiff !== 0) return pDiff;
      return b.createdAt.localeCompare(a.createdAt);
    });

    return list;
  }

  dismissNotification(id) {
    const notif = this.notifications.get(id);
    if (!notif) return { notFound: true };
    if (notif.isDismissed) return { conflict: true };

    notif.isDismissed = true;
    notif.dismissedAt = new Date().toISOString();
    return { notification: notif };
  }

  // ──────────────────────────────────────────────────────────────────────────
  // Settings
  // ──────────────────────────────────────────────────────────────────────────

  getSettings() {
    return { ...this.settings };
  }

  updateSettings(data) {
    const now = new Date().toISOString();
    this.settings = {
      ...this.settings,
      ...data,
      currency: 'UAH',
      updatedAt: now
    };
    return { ...this.settings };
  }

  // ──────────────────────────────────────────────────────────────────────────
  // System Startup Check
  // ──────────────────────────────────────────────────────────────────────────

  runStartupCheck() {
    const today = new Date().toISOString().slice(0, 10);
    const now = new Date().toISOString();

    const newlyExpiredTrials = [];
    const overdueSubscriptions = [];
    let notificationsGenerated = 0;

    // 1. Detect expired trials
    for (const trial of this.trials.values()) {
      if (trial.status === 'active' && today > trial.endDate) {
        trial.status = 'expired';
        trial.updatedAt = now;
        newlyExpiredTrials.push(trial);
      }
    }

    // 2. Detect overdue subscriptions
    for (const sub of this.subscriptions.values()) {
      if (sub.status === 'active') {
        if (today >= sub.nextBillingDate) {
          sub.billingDue = true;
        }
        if (today > sub.nextBillingDate) {
          sub.overdue = true;
          overdueSubscriptions.push(sub);
        }
      }
    }

    // 3. Generate notifications
    // Trial expiry alerts
    for (const trial of this.trials.values()) {
      if (trial.status === 'active') {
        const leadTime = trial.notificationLeadTimeDays || this.settings.trialLeadTimeDays;
        const endDate = new Date(trial.endDate);
        const diffDays = Math.ceil((endDate.getTime() - new Date(today).getTime()) / (1000 * 3600 * 24));
        if (diffDays <= leadTime && diffDays >= 0) {
          const notifId = randomUUID();
          this.notifications.set(notifId, {
            id: notifId,
            type: 'TRIAL_EXPIRY',
            priority: 'high',
            title: `Trial Ending: ${trial.serviceName}`,
            message: `Free trial for ${trial.serviceName} expires in ${diffDays} day(s).`,
            targetResourceId: trial.id,
            targetResourceType: 'trial',
            isDismissed: false,
            dismissedAt: null,
            createdAt: now
          });
          notificationsGenerated++;
        }
      }
    }

    // Renewal alerts
    for (const sub of this.subscriptions.values()) {
      if (sub.status === 'active') {
        const leadTime = sub.notificationLeadTimeDays || this.settings.renewalLeadTimeDays;
        const nextDate = new Date(sub.nextBillingDate);
        const diffDays = Math.ceil((nextDate.getTime() - new Date(today).getTime()) / (1000 * 3600 * 24));
        if (diffDays <= leadTime && diffDays >= 0) {
          const notifId = randomUUID();
          this.notifications.set(notifId, {
            id: notifId,
            type: 'RENEWAL',
            priority: 'normal',
            title: `Renewal Approaching: ${sub.serviceName}`,
            message: `Subscription for ${sub.serviceName} will renew in ${diffDays} day(s).`,
            targetResourceId: sub.id,
            targetResourceType: 'subscription',
            isDismissed: false,
            dismissedAt: null,
            createdAt: now
          });
          notificationsGenerated++;
        }
      }
    }

    // Startup summary banner
    if (newlyExpiredTrials.length > 0 || overdueSubscriptions.length > 0) {
      const summaryId = randomUUID();
      this.notifications.set(summaryId, {
        id: summaryId,
        type: 'STARTUP_SUMMARY',
        priority: 'normal',
        title: 'Application Startup Summary',
        message: `Detected ${newlyExpiredTrials.length} expired trial(s) and ${overdueSubscriptions.length} overdue subscription(s).`,
        targetResourceId: null,
        targetResourceType: null,
        isDismissed: false,
        dismissedAt: null,
        createdAt: now
      });
      notificationsGenerated++;
    }

    return {
      newlyExpiredTrials,
      overdueSubscriptions,
      notificationsGenerated,
      checkedAt: now
    };
  }

  // ──────────────────────────────────────────────────────────────────────────
  // Export & Import
  // ──────────────────────────────────────────────────────────────────────────

  exportData() {
    return {
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      subscriptions: Array.from(this.subscriptions.values()),
      trials: Array.from(this.trials.values()),
      billingEvents: Array.from(this.billingEvents.values()),
      notifications: Array.from(this.notifications.values()),
      settings: { ...this.settings }
    };
  }

  importData(snapshot) {
    this.reset();
    for (const sub of snapshot.subscriptions || []) {
      this.subscriptions.set(sub.id, sub);
    }
    for (const tr of snapshot.trials || []) {
      this.trials.set(tr.id, tr);
    }
    for (const b of snapshot.billingEvents || []) {
      this.billingEvents.set(b.id, b);
    }
    for (const n of snapshot.notifications || []) {
      this.notifications.set(n.id, n);
    }
    if (snapshot.settings) {
      this.settings = { ...snapshot.settings };
    }
    return {
      message: 'Data imported successfully. All previous records replaced.',
      importedAt: new Date().toISOString()
    };
  }
}

