const API_BASE = '';

let currentSubscriptionStatus = 'all';

const statusBannerEl = document.getElementById('status-banner');
const subIntervalSelect = document.getElementById('sub-interval-type');
const customValueWrap = document.getElementById('custom-value-wrap');
const customUnitWrap = document.getElementById('custom-unit-wrap');

function showBanner(message, type = 'success') {
  statusBannerEl.textContent = message;
  statusBannerEl.className = `banner ${type}`;
}

function todayIsoDate() {
  return new Date().toISOString().slice(0, 10);
}

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

async function apiRequest(path, options = {}) {
  const config = {
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    ...options
  };
  const response = await fetch(`${API_BASE}${path}`, config);
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || `Request failed with status ${response.status}`);
  }
  return data;
}

function formatInterval(sub) {
  if (sub.billingIntervalType === 'custom') {
    return `Every ${sub.customIntervalValue} ${sub.customIntervalUnit}`;
  }
  return sub.billingIntervalType;
}

async function loadAnalytics() {
  const summary = await apiRequest('/analytics/summary');
  document.getElementById('stat-monthly').textContent = `${summary.totalMonthlySpend.toFixed(2)} UAH`;
  document.getElementById('stat-annual').textContent = `${summary.totalAnnualSpend.toFixed(2)} UAH`;
  document.getElementById('stat-active').textContent = String(summary.activeSubscriptionCount);
  document.getElementById('analytics-updated').textContent = `Updated: ${new Date(summary.calculatedAt).toLocaleString()}`;
}

async function loadSubscriptions() {
  const query = currentSubscriptionStatus ? `?status=${encodeURIComponent(currentSubscriptionStatus)}` : '';
  const list = await apiRequest(`/subscriptions${query}`);
  const container = document.getElementById('subscriptions-list');

  // Populate linked subscription dropdown in Trials form using all subscriptions
  const allSubs = currentSubscriptionStatus === 'all' ? list : await apiRequest('/subscriptions?status=all');
  const linkedSelect = document.getElementById('trial-linked-sub');
  const prevValue = linkedSelect.value;
  linkedSelect.innerHTML = '<option value="">Standalone (none)</option>' +
    allSubs.map((s) => `<option value="${escapeHtml(s.id)}">${escapeHtml(s.serviceName)} (${escapeHtml(s.status)})</option>`).join('');
  linkedSelect.value = prevValue;

  if (list.length === 0) {
    container.innerHTML = '<p class="muted">No subscriptions found.</p>';
    return;
  }

  container.innerHTML = list.map((sub) => {
    const dueBadge = sub.overdue
      ? '<span class="badge badge-overdue">overdue</span>'
      : (sub.billingDue ? '<span class="badge badge-due">billing due</span>' : '');
    const actions = sub.status === 'active'
      ? `
        <button class="btn btn-secondary" data-action="pay" data-id="${escapeHtml(sub.id)}" type="button">Mark Paid</button>
        <button class="btn btn-secondary" data-action="skip" data-id="${escapeHtml(sub.id)}" type="button">Mark Skipped</button>
        <button class="btn btn-danger" data-action="cancel-sub" data-id="${escapeHtml(sub.id)}" type="button">Cancel</button>
      `
      : '';

    return `
      <div class="list-item">
        <div class="item-main">
          <div class="item-title-row">
            <strong>${escapeHtml(sub.serviceName)}</strong>
            <span class="badge badge-${escapeHtml(sub.status)}">${escapeHtml(sub.status)}</span>
            ${dueBadge}
          </div>
          <p class="muted small">
            ${Number(sub.cost).toFixed(2)} UAH · ${escapeHtml(formatInterval(sub))} ·
            Next billing: ${escapeHtml(sub.nextBillingDate)} ·
            Est: ${Number(sub.monthlySpendEstimate).toFixed(2)}/mo (${Number(sub.annualSpendEstimate).toFixed(2)}/yr)
          </p>
        </div>
        <div class="item-actions">${actions}</div>
      </div>
    `;
  }).join('');
}

async function loadTrials() {
  const list = await apiRequest('/trials');
  const container = document.getElementById('trials-list');

  if (list.length === 0) {
    container.innerHTML = '<p class="muted">No free trials recorded.</p>';
    return;
  }

  container.innerHTML = list.map((trial) => {
    const actions = trial.status === 'expired'
      ? `
        <button class="btn btn-primary" data-action="convert-trial" data-id="${escapeHtml(trial.id)}" type="button">Convert</button>
        <button class="btn btn-danger" data-action="cancel-trial" data-id="${escapeHtml(trial.id)}" type="button">Cancel</button>
      `
      : '';

    return `
      <div class="list-item">
        <div class="item-main">
          <div class="item-title-row">
            <strong>${escapeHtml(trial.serviceName)}</strong>
            <span class="badge badge-${escapeHtml(trial.status)}">${escapeHtml(trial.status)}</span>
          </div>
          <p class="muted small">
            ${escapeHtml(trial.startDate)} → ${escapeHtml(trial.endDate)} ·
            Assumed cost: ${Number(trial.assumedCost ?? 0).toFixed(2)} UAH
            ${trial.linkedSubscriptionId ? `· Linked sub: ${escapeHtml(trial.linkedSubscriptionId)}` : ''}
          </p>
        </div>
        <div class="item-actions">${actions}</div>
      </div>
    `;
  }).join('');
}

async function loadNotifications() {
  const list = await apiRequest('/notifications');
  const container = document.getElementById('notifications-list');

  if (list.length === 0) {
    container.innerHTML = '<p class="muted">No active notifications.</p>';
    return;
  }

  container.innerHTML = list.map((n) => `
    <div class="list-item">
      <div class="item-main">
        <div class="item-title-row">
          <strong>${escapeHtml(n.title || n.type)}</strong>
          <span class="badge badge-${escapeHtml(n.priority)}">${escapeHtml(n.priority)}</span>
          <span class="muted small">${escapeHtml(n.type)}</span>
        </div>
        <p class="muted small">${escapeHtml(n.message)}</p>
      </div>
      <div class="item-actions">
        <button class="btn btn-secondary" data-action="dismiss-notif" data-id="${escapeHtml(n.id)}" type="button">Dismiss</button>
      </div>
    </div>
  `).join('');
}

async function loadBillingHistory() {
  const list = await apiRequest('/billing-events');
  const container = document.getElementById('billing-list');

  if (list.length === 0) {
    container.innerHTML = '<p class="muted">No billing events confirmed yet.</p>';
    return;
  }

  container.innerHTML = list.map((ev) => `
    <div class="list-item">
      <div class="item-main">
        <div class="item-title-row">
          <strong>${escapeHtml(ev.serviceName || ev.subscriptionName)}</strong>
          <span class="badge badge-${escapeHtml(ev.paymentStatus)}">${escapeHtml(ev.paymentStatus)}</span>
        </div>
        <p class="muted small">
          Amount: ${Number(ev.amount).toFixed(2)} UAH · Due: ${escapeHtml(ev.billingDate || '-')} · Confirmed: ${escapeHtml(ev.dateConfirmed)}
        </p>
      </div>
    </div>
  `).join('');
}

async function loadSettings() {
  const settings = await apiRequest('/settings');
  document.getElementById('setting-renewal-days').value = settings.renewalLeadTimeDays;
  document.getElementById('setting-trial-days').value = settings.trialLeadTimeDays;
}

async function refreshAll() {
  await Promise.all([
    loadAnalytics(),
    loadSubscriptions(),
    loadTrials(),
    loadNotifications(),
    loadBillingHistory(),
    loadSettings()
  ]);
}

// Toggle custom interval inputs
subIntervalSelect.addEventListener('change', () => {
  const isCustom = subIntervalSelect.value === 'custom';
  customValueWrap.classList.toggle('hidden', !isCustom);
  customUnitWrap.classList.toggle('hidden', !isCustom);
});

// Status filter buttons
document.querySelectorAll('.btn-filter').forEach((btn) => {
  btn.addEventListener('click', async () => {
    document.querySelectorAll('.btn-filter').forEach((b) => b.classList.remove('active'));
    btn.classList.add('active');
    currentSubscriptionStatus = btn.dataset.status;
    try {
      await loadSubscriptions();
    } catch (err) {
      showBanner(err.message, 'error');
    }
  });
});

// Startup check
document.getElementById('startup-check-btn').addEventListener('click', async () => {
  try {
    const res = await apiRequest('/system/startup-check', { method: 'POST' });
    await refreshAll();
    showBanner(
      `Startup check complete: ${res.newlyExpiredTrials.length} expired trial(s), ` +
      `${res.overdueSubscriptions.length} overdue subscription(s), ${res.notificationsGenerated} notification(s) generated.`
    );
  } catch (err) {
    showBanner(err.message, 'error');
  }
});

// Create subscription
document.getElementById('subscription-form').addEventListener('submit', async (event) => {
  event.preventDefault();
  const form = event.currentTarget;
  const formData = new FormData(form);
  const payload = {
    serviceName: formData.get('serviceName'),
    cost: Number(formData.get('cost')),
    billingIntervalType: formData.get('billingIntervalType'),
    firstBillingDate: formData.get('firstBillingDate')
  };

  if (payload.billingIntervalType === 'custom') {
    payload.customIntervalValue = Number(formData.get('customIntervalValue'));
    payload.customIntervalUnit = formData.get('customIntervalUnit');
  }

  const leadTime = formData.get('notificationLeadTimeDays');
  if (leadTime) {
    payload.notificationLeadTimeDays = Number(leadTime);
  }

  try {
    await apiRequest('/subscriptions', { method: 'POST', body: JSON.stringify(payload) });
    form.reset();
    subIntervalSelect.dispatchEvent(new Event('change'));
    await refreshAll();
    showBanner(`Subscription "${payload.serviceName}" created.`);
  } catch (err) {
    showBanner(err.message, 'error');
  }
});

// Create trial
document.getElementById('trial-form').addEventListener('submit', async (event) => {
  event.preventDefault();
  const form = event.currentTarget;
  const formData = new FormData(form);
  const payload = {
    serviceName: formData.get('serviceName'),
    startDate: formData.get('startDate'),
    endDate: formData.get('endDate')
  };

  const linkedSub = formData.get('linkedSubscriptionId');
  if (linkedSub) {
    payload.linkedSubscriptionId = linkedSub;
  }

  const leadTime = formData.get('notificationLeadTimeDays');
  if (leadTime) {
    payload.notificationLeadTimeDays = Number(leadTime);
  }

  try {
    await apiRequest('/trials', { method: 'POST', body: JSON.stringify(payload) });
    form.reset();
    await refreshAll();
    showBanner(`Free trial "${payload.serviceName}" created.`);
  } catch (err) {
    showBanner(err.message, 'error');
  }
});

// Save settings
document.getElementById('settings-form').addEventListener('submit', async (event) => {
  event.preventDefault();
  const formData = new FormData(event.currentTarget);
  const payload = {
    renewalLeadTimeDays: Number(formData.get('renewalLeadTimeDays')),
    trialLeadTimeDays: Number(formData.get('trialLeadTimeDays'))
  };

  try {
    await apiRequest('/settings', { method: 'PUT', body: JSON.stringify(payload) });
    await loadSettings();
    showBanner('Notification settings saved.');
  } catch (err) {
    showBanner(err.message, 'error');
  }
});

// Export JSON
document.getElementById('export-btn').addEventListener('click', async () => {
  try {
    const snapshot = await apiRequest('/system/export');
    const blob = new Blob([JSON.stringify(snapshot, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `subscription-tracker-backup-${todayIsoDate()}.json`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    showBanner('Backup snapshot exported.');
  } catch (err) {
    showBanner(err.message, 'error');
  }
});

// Import JSON
document.getElementById('import-btn').addEventListener('click', async () => {
  const fileInput = document.getElementById('import-file');
  const file = fileInput.files?.[0];
  if (!file) {
    showBanner('Please select a JSON backup file first.', 'error');
    return;
  }

  const confirmed = window.confirm(
    'Warning: Importing a backup snapshot will replace ALL existing subscriptions, trials, billing events, notifications, and settings. Continue?'
  );
  if (!confirmed) return;

  try {
    const text = await file.text();
    const snapshot = JSON.parse(text);
    const res = await apiRequest('/system/import', { method: 'POST', body: JSON.stringify(snapshot) });
    fileInput.value = '';
    await refreshAll();
    showBanner(res.message || 'Snapshot imported.');
  } catch (err) {
    showBanner(err.message, 'error');
  }
});

// Delegated list item actions
document.addEventListener('click', async (event) => {
  const btn = event.target.closest('button[data-action]');
  if (!btn) return;

  const { action, id } = btn.dataset;
  try {
    if (action === 'pay' || action === 'skip') {
      const paymentStatus = action === 'pay' ? 'paid' : 'skipped';
      await apiRequest('/billing-events', {
        method: 'POST',
        body: JSON.stringify({ subscriptionId: id, paymentStatus, dateConfirmed: todayIsoDate() })
      });
      await refreshAll();
      showBanner(`Billing event confirmed as ${paymentStatus}.`);
    } else if (action === 'cancel-sub') {
      if (!window.confirm('Cancel this subscription? The record will be retained as cancelled.')) return;
      await apiRequest(`/subscriptions/${encodeURIComponent(id)}`, { method: 'DELETE' });
      await refreshAll();
      showBanner('Subscription cancelled.');
    } else if (action === 'convert-trial' || action === 'cancel-trial') {
      const resolutionAction = action === 'convert-trial' ? 'convert' : 'cancel';
      await apiRequest(`/trials/${encodeURIComponent(id)}/resolve`, {
        method: 'PATCH',
        body: JSON.stringify({ action: resolutionAction })
      });
      await refreshAll();
      showBanner(`Trial resolved (${resolutionAction}).`);
    } else if (action === 'dismiss-notif') {
      await apiRequest(`/notifications/${encodeURIComponent(id)}/dismiss`, { method: 'PATCH' });
      await loadNotifications();
      showBanner('Notification dismissed.');
    }
  } catch (err) {
    showBanner(err.message, 'error');
  }
});

// Initial load
refreshAll().catch((err) => showBanner(err.message, 'error'));
