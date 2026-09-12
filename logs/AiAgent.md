# Coding Agent Profile

## 1. General Tool Information
- **Environment name:** Antigravity (Google Agentic IDE)
- **Agent base model:** Claude Sonnet 4.6 (Thinking)
- **Tool class:** Agentic IDE

## 2. Repository Access Method
- **Integration level:** Direct local access to the workspace and repository file system.
- **Context analysis:** Automatic indexing of the project file tree (`/spec`, `/src`, `/docs`, `/logs`, `/tests`) and reading specification artifacts directly from the directory.
- **Interaction method:** Natural language requests and directives via the built-in agent chat interface.

## 3. Available Operations in the Working Environment
- **Structure analysis:** scanning the file tree, reading specification artifacts and requirements.
- **Code and file manipulation:** creating new files, editing existing ones, refactoring, and applying edits.
- **Validation and verification:** analyzing discrepancies between implementation and specification (SDD compliance).
- **Instruction execution:** applying edits upon user approval (human control over Git commits).
- **Changelog updates:** describing implemented changes or adding new features in a separate file for convenient review of project history.