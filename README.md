# Aiteebar AI Security Platform

Tagline: **Discover. Assess. Monitor. Protect.**

Aiteebar is a dedicated AI security platform designed to discover installed AI applications, inspect Model Context Protocol (MCP) server configurations, detect unpinned packages and risky commands, and track evidence-based filesystem activity on developer endpoints.

---

## 1. Architecture Overview

- **Frontend**: React 19, TypeScript, Tailwind CSS, Three.js 3D Interactive Cyber Globe & Telemetry Grid, Lucide Icons.
- **Backend**: Node.js & Express REST API (`server.ts`) with custom token authentication, role-based access control, and untrusted report validation.
- **Database**: Persistent JSON data storage with automated transactional serialization, audit logs, and settings.
- **Local Endpoint Scanner**: Python Mini Scanner (`aiteebar_mini_scanner.py`, `risk_engine.py`, `activity_monitor.py`) producing standardized `scan_report.json` outputs.

---

## 2. What Was Implemented

1. **Public Project Website**:
   - **Home Page**: Interactive 3D security globe, 4 core security pillars, 7-step workflow, capability verification matrix, team preview, and reduced-motion toggle.
   - **Platform Page**: Detailed breakdown of the 7-step security lifecycle and interactive capability matrix filtered by status (*Implemented*, *In Development*, *Planned*).
   - **Project Page**: Architecture specifications, problem statement, threat scope, and boundary documentation.
   - **Team Page**: Editable researcher profiles with truthful empty placeholder state when unpopulated.
   - **Documentation Page**: Multi-category reference with searchable articles on MCP security, risk rules (AIT-MCP-CMD-01, AIT-MCP-VER-02), scanner architecture, and privacy limitations.
   - **Login & Onboarding**: First-admin setup flow with master password hashing (scrypt + unique salt) and subsequent public registration locking.

2. **Private Security Dashboard (11 Core Sections)**:
   - **Overview Dashboard**: Posture metrics, discovered app counts, MCP server flags, HIGH/MED/LOW finding tallies, and realtime filesystem watchdog stream.
   - **AI Application Inventory**: Searchable catalog with category filtering (AI coding editors, desktop assistants, local runtimes) and approval status workflows.
   - **MCP Server Inventory**: Detailed command inspection, unpinned package warnings, argument evaluation, and secret masking.
   - **Risk Findings**: Comprehensive triage with severity indicators (HIGH, MEDIUM, LOW, INFORMATIONAL), recommendation guidance, history log, and analyst notes.
   - **Activity Monitoring**: Filesystem event timeline (creation, modification, deletion) with truthful attribution labelling (*"Responsible process unknown"*).
   - **Scan Reports Archive**: JSON/CSV report export, raw JSON inspector, and report deletion.
   - **Team Management**: Administrator CRUD for team members, profile reordering, and direct avatar photo uploads.
   - **Documentation Management**: Full markdown content authoring and slug management.
   - **Integrations**: Python agent REST API contract (`/api/agent/v1/report`), API key generator, ready-to-copy Python sync script, and curl commands.
   - **Audit Log**: Immutable chronological record of administrative and analyst actions.
   - **Settings**: Organization parameters, data retention configuration, and user provisioning.

---

## 3. How to Run Locally

### Prerequisites
- Node.js 20+ or 22+
- npm or pnpm

### Installation & Startup
```bash
# 1. Install dependencies
npm install

# 2. Run in development mode
npm run dev

# 3. Server starts on http://localhost:3000
```

### Production Build
```bash
npm run build
npm start
```

---

## 4. Environment Variables (`.env`)

Refer to `.env.example`:
```env
# APP_URL: Base URL where this platform is hosted
APP_URL="http://localhost:3000"

# APP_SECRET: Key for HMAC-SHA256 session token signatures
APP_SECRET="your_secure_random_key_here"

# PORT: Server listening port (default: 3000)
PORT=3000
```

---

## 5. How to Create the First Administrator

1. Navigate to `http://localhost:3000/` and click **Login** (or **Open Security Dashboard**).
2. Because no administrator account exists in a fresh database, the platform displays the **Initialize Security Administrator** onboarding view.
3. Enter your **Full Name**, **Administrator Email**, and a secure **Password** (minimum 8 characters).
4. Click **Initialize Platform Admin**. The platform generates a salted scrypt hash, writes the audit log entry, and locks public registration.

---

## 6. How to Upload and Inspect a Real `scan_report.json`

1. Log in with your administrator or security analyst account.
2. In the top navigation bar, click **Import Report** (or **Load Lab Sample** to test with the verified Windows lab report immediately).
3. Either drag and drop your local `scan_report.json` or paste the raw JSON text.
4. Click **Ingest Report**.
5. The platform validates the JSON structure, ingests discovered applications into the inventory, maps MCP servers, evaluates risk rules, logs activity events, and creates a report archive entry.
6. Click **Inspect JSON** in the **Scan Reports** tab to view the formatted raw telemetry.

---

## 7. Python Scanner Synchronization Contract

Your local Python script (`C:\Users\kamran\Desktop\Aiteebar-Lab\aiteebar_mini_scanner.py`) can push reports directly to the platform API:

- **Endpoint**: `POST /api/agent/v1/report`
- **Headers**:
  - `Authorization: Bearer <agentApiKey>` (retrieved from Dashboard -> Integrations)
  - `Content-Type: application/json`
- **Body**: The contents of `scan_report.json`.

---

## 8. Status of Features: Working vs Requiring Local Python Agent

### Fully Working in Central Platform:
- Full-stack authentication & role permissions (`admin`, `analyst`, `viewer`).
- First-admin initialization & registration lock.
- Team member CRUD, reordering, and image file upload storage.
- Documentation authoring and editing.
- Scan report validation, ingestion, JSON inspection, and CSV/JSON export.
- Risk finding triage, status updates, and historical audit trail.
- AI application & MCP server approval policies.
- Audit logging of all security events.
- Three.js 3D interactive cyber globe visualization.

### Requiring Local Python Agent (`Aiteebar-Lab`):
- Local discovery of Windows executable paths (`Cursor.exe`, `Claude.exe`, `ollama.exe`).
- Reading local `cursor_settings.json` from `%APPDATA%`.
- Filesystem event watching via Python `watchdog`.

---

## 9. Known Operational Limitations & Privacy Truths

- **Process Attribution**: Basic filesystem monitors (Watchdog) only receive filesystem notifications from the OS kernel; they do not capture the caller process ID. Events are strictly labelled *"Responsible process unknown"*.
- **No Automatic Execution**: The platform inspects MCP declarations statically and will never run arbitrary binaries or subshells.
- **Privacy Protection**: Environment-variable secrets, API keys, and sensitive document contents are never stored or displayed.
