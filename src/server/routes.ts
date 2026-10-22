import express, { Router, type Request, type Response } from 'express';
import crypto from 'node:crypto';
import multer from 'multer';
import path from 'node:path';
import fs from 'node:fs';
import { db, type StoredUser } from './db.js';
import {
  hashPassword,
  verifyPassword,
  createToken,
  sanitizeUser,
  requireAuth,
  requireRole,
  type AuthenticatedRequest
} from './auth.js';
import type {
  DiscoveredApp,
  McpServer,
  RiskFinding,
  ActivityEvent,
  ScanReport,
  TeamMember,
  DocArticle,
  FindingStatus,
  Severity,
  AppApprovalStatus
} from '../types/index.js';

export const apiRouter = Router();

// Configure safe Multer upload for avatars & reports
const UPLOADS_DIR = path.resolve(process.cwd(), 'uploads');
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, UPLOADS_DIR);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const safeName = `file-${Date.now()}-${crypto.randomBytes(6).toString('hex')}${ext}`;
    cb(null, safeName);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (_req, file, cb) => {
    const allowed = ['.png', '.jpg', '.jpeg', '.webp', '.svg', '.json', '.jsonl'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Disallowed file type. Only safe images and JSON are permitted.'));
    }
  }
});

/* -------------------------------------------------------------
 * 1. AUTHENTICATION & ACCESS CONTROL
 * ------------------------------------------------------------- */

// GET /api/auth/status
apiRouter.get('/auth/status', (req: AuthenticatedRequest, res: Response) => {
  const data = db.getData();
  const hasAdmin = data.users.some(u => u.role === 'admin');
  res.json({
    initialized: hasAdmin,
    currentUser: req.user || null
  });
});

// POST /api/auth/setup-admin (Only permitted once if no admin exists!)
apiRouter.post('/auth/setup-admin', (req: Request, res: Response) => {
  const data = db.getData();
  const hasAdmin = data.users.some(u => u.role === 'admin');
  if (hasAdmin) {
    return res.status(403).json({ error: 'Administrator account already initialized.' });
  }

  const { fullName, email, password } = req.body;
  if (!fullName || !email || !password) {
    return res.status(400).json({ error: 'Full name, email, and password are required.' });
  }

  if (password.length < 8) {
    return res.status(400).json({ error: 'Password must be at least 8 characters long.' });
  }

  const { hash, salt } = hashPassword(password);
  const newAdmin: StoredUser = {
    id: 'user-' + crypto.randomUUID(),
    email: email.trim().toLowerCase(),
    fullName: fullName.trim(),
    role: 'admin',
    passwordHash: hash,
    salt,
    createdAt: new Date().toISOString()
  };

  data.users.push(newAdmin);
  db.save();

  db.addAuditLog({
    userId: newAdmin.id,
    userEmail: newAdmin.email,
    action: 'ADMIN_INITIALIZED',
    entityType: 'User',
    entityId: newAdmin.id,
    details: 'Initial system administrator initialized.'
  });

  const sanitized = sanitizeUser(newAdmin);
  const token = createToken(sanitized);

  res.status(201).json({
    message: 'Primary administrator created successfully.',
    user: sanitized,
    token
  });
});

// POST /api/auth/login
apiRouter.post('/auth/login', (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  const data = db.getData();
  const user = data.users.find(u => u.email.toLowerCase() === email.trim().toLowerCase());
  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials.' });
  }

  const valid = verifyPassword(password, user.passwordHash, user.salt);
  if (!valid) {
    return res.status(401).json({ error: 'Invalid credentials.' });
  }

  user.lastLogin = new Date().toISOString();
  db.save();

  const sanitized = sanitizeUser(user);
  const token = createToken(sanitized);

  db.addAuditLog({
    userId: user.id,
    userEmail: user.email,
    action: 'USER_LOGIN',
    entityType: 'Auth',
    details: `User ${user.email} logged in with role ${user.role}.`
  });

  res.json({
    user: sanitized,
    token
  });
});

// GET /api/auth/me
apiRouter.get('/auth/me', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  res.json({ user: req.user });
});

/* -------------------------------------------------------------
 * 2. USER MANAGEMENT (Admin only)
 * ------------------------------------------------------------- */
apiRouter.get('/users', requireAuth, requireRole('admin'), (_req: AuthenticatedRequest, res: Response) => {
  const data = db.getData();
  res.json(data.users.map(sanitizeUser));
});

apiRouter.post('/users', requireAuth, requireRole('admin'), (req: AuthenticatedRequest, res: Response) => {
  const { email, fullName, role, password } = req.body;
  if (!email || !fullName || !role || !password) {
    return res.status(400).json({ error: 'Email, full name, role, and temporary password are required.' });
  }

  if (!['admin', 'analyst', 'viewer'].includes(role)) {
    return res.status(400).json({ error: 'Invalid role.' });
  }

  const data = db.getData();
  if (data.users.some(u => u.email.toLowerCase() === email.trim().toLowerCase())) {
    return res.status(400).json({ error: 'User with this email already exists.' });
  }

  const { hash, salt } = hashPassword(password);
  const newUser: StoredUser = {
    id: 'user-' + crypto.randomUUID(),
    email: email.trim().toLowerCase(),
    fullName: fullName.trim(),
    role,
    passwordHash: hash,
    salt,
    createdAt: new Date().toISOString()
  };

  data.users.push(newUser);
  db.save();

  db.addAuditLog({
    userId: req.user!.id,
    userEmail: req.user!.email,
    action: 'USER_CREATED',
    entityType: 'User',
    entityId: newUser.id,
    details: `Created user ${newUser.email} with role ${newUser.role}.`
  });

  res.status(201).json(sanitizeUser(newUser));
});

apiRouter.delete('/users/:id', requireAuth, requireRole('admin'), (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  if (req.user!.id === id) {
    return res.status(400).json({ error: 'Cannot delete your own administrator account.' });
  }

  const data = db.getData();
  const idx = data.users.findIndex(u => u.id === id);
  if (idx === -1) {
    return res.status(404).json({ error: 'User not found.' });
  }

  const deleted = data.users.splice(idx, 1)[0];
  db.save();

  db.addAuditLog({
    userId: req.user!.id,
    userEmail: req.user!.email,
    action: 'USER_DELETED',
    entityType: 'User',
    entityId: id,
    details: `Deleted user ${deleted.email}.`
  });

  res.json({ message: 'User deleted successfully.' });
});

/* -------------------------------------------------------------
 * 3. AI APPLICATION INVENTORY
 * ------------------------------------------------------------- */
apiRouter.get('/apps', requireAuth, (req: Request, res: Response) => {
  const data = db.getData();
  const { category, search, approval } = req.query;

  let apps = [...data.applications];

  if (category && typeof category === 'string') {
    apps = apps.filter(a => a.category === category);
  }
  if (approval && typeof approval === 'string') {
    apps = apps.filter(a => a.approvalStatus === approval);
  }
  if (search && typeof search === 'string') {
    const q = search.toLowerCase();
    apps = apps.filter(a => 
      a.name.toLowerCase().includes(q) || 
      (a.installPath && a.installPath.toLowerCase().includes(q)) ||
      a.discoveryMethod.toLowerCase().includes(q)
    );
  }

  res.json(apps);
});

apiRouter.patch('/apps/:id/approval', requireAuth, requireRole('admin', 'analyst'), (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const { status, notes } = req.body;

  if (!['Approved', 'Unapproved', 'Under Review'].includes(status)) {
    return res.status(400).json({ error: 'Invalid approval status.' });
  }

  const data = db.getData();
  const app = data.applications.find(a => a.id === id);
  if (!app) {
    return res.status(404).json({ error: 'Application not found.' });
  }

  const oldStatus = app.approvalStatus;
  app.approvalStatus = status as AppApprovalStatus;
  if (notes !== undefined) app.notes = notes;
  db.save();

  db.addAuditLog({
    userId: req.user!.id,
    userEmail: req.user!.email,
    action: 'APP_APPROVAL_CHANGED',
    entityType: 'DiscoveredApp',
    entityId: id,
    details: `Changed approval of ${app.name} from ${oldStatus} to ${status}.`
  });

  res.json(app);
});

/* -------------------------------------------------------------
 * 4. MCP SERVER INVENTORY
 * ------------------------------------------------------------- */
apiRouter.get('/mcp-servers', requireAuth, (req: Request, res: Response) => {
  const data = db.getData();
  const { search, pinned, suspicious, approval } = req.query;

  let servers = [...data.mcpServers];

  if (pinned === 'false') {
    servers = servers.filter(s => !s.isVersionPinned);
  } else if (pinned === 'true') {
    servers = servers.filter(s => s.isVersionPinned);
  }

  if (suspicious === 'true') {
    servers = servers.filter(s => s.hasSuspiciousPattern);
  }

  if (approval && typeof approval === 'string') {
    servers = servers.filter(s => s.approvalStatus === approval);
  }

  if (search && typeof search === 'string') {
    const q = search.toLowerCase();
    servers = servers.filter(s => 
      s.name.toLowerCase().includes(q) ||
      s.parentApp.toLowerCase().includes(q) ||
      s.command.toLowerCase().includes(q) ||
      (s.packageName && s.packageName.toLowerCase().includes(q))
    );
  }

  res.json(servers);
});

apiRouter.patch('/mcp-servers/:id/approval', requireAuth, requireRole('admin', 'analyst'), (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!['Approved', 'Unapproved', 'Review Required'].includes(status)) {
    return res.status(400).json({ error: 'Invalid approval status.' });
  }

  const data = db.getData();
  const srv = data.mcpServers.find(s => s.id === id);
  if (!srv) {
    return res.status(404).json({ error: 'MCP server not found.' });
  }

  srv.approvalStatus = status;
  db.save();

  db.addAuditLog({
    userId: req.user!.id,
    userEmail: req.user!.email,
    action: 'MCP_APPROVAL_CHANGED',
    entityType: 'McpServer',
    entityId: id,
    details: `Changed MCP server ${srv.name} approval to ${status}.`
  });

  res.json(srv);
});

/* -------------------------------------------------------------
 * 5. RISK FINDINGS
 * ------------------------------------------------------------- */
apiRouter.get('/findings', requireAuth, (req: Request, res: Response) => {
  const data = db.getData();
  const { severity, status, search } = req.query;

  let findings = [...data.findings];

  if (severity && typeof severity === 'string') {
    findings = findings.filter(f => f.severity === severity);
  }
  if (status && typeof status === 'string') {
    findings = findings.filter(f => f.status === status);
  }
  if (search && typeof search === 'string') {
    const q = search.toLowerCase();
    findings = findings.filter(f => 
      f.title.toLowerCase().includes(q) ||
      f.ruleId.toLowerCase().includes(q) ||
      f.description.toLowerCase().includes(q) ||
      f.evidence.toLowerCase().includes(q)
    );
  }

  res.json(findings);
});

apiRouter.patch('/findings/:id', requireAuth, requireRole('admin', 'analyst'), (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const { status, analystNotes } = req.body;

  const data = db.getData();
  const finding = data.findings.find(f => f.id === id);
  if (!finding) {
    return res.status(404).json({ error: 'Finding not found.' });
  }

  const oldStatus = finding.status;
  if (status && ['Open', 'Reviewing', 'Resolved', 'Accepted Risk'].includes(status)) {
    finding.status = status as FindingStatus;
  }
  if (analystNotes !== undefined) {
    finding.analystNotes = analystNotes;
  }

  const historyEntry = {
    timestamp: new Date().toISOString(),
    userId: req.user!.id,
    userEmail: req.user!.email,
    action: status && status !== oldStatus ? `Status changed to ${status}` : 'Analyst notes updated',
    previousStatus: oldStatus,
    newStatus: finding.status,
    note: analystNotes
  };

  finding.history.unshift(historyEntry);
  db.save();

  db.addAuditLog({
    userId: req.user!.id,
    userEmail: req.user!.email,
    action: 'FINDING_UPDATED',
    entityType: 'RiskFinding',
    entityId: id,
    details: `Updated finding ${finding.ruleId} (${finding.title}) to ${finding.status}.`
  });

  res.json(finding);
});

/* -------------------------------------------------------------
 * 6. ACTIVITY MONITORING EVENTS
 * ------------------------------------------------------------- */
apiRouter.get('/activity-events', requireAuth, (req: Request, res: Response) => {
  const data = db.getData();
  const { eventType, search, attribution } = req.query;

  let events = [...data.activityEvents];

  if (eventType && typeof eventType === 'string') {
    events = events.filter(e => e.eventType === eventType);
  }
  if (attribution && typeof attribution === 'string') {
    events = events.filter(e => e.attributionStatus === attribution);
  }
  if (search && typeof search === 'string') {
    const q = search.toLowerCase();
    events = events.filter(e => 
      e.filePath.toLowerCase().includes(q) ||
      e.responsibleProcess.toLowerCase().includes(q) ||
      e.evidenceDetails.toLowerCase().includes(q)
    );
  }

  res.json(events);
});

/* -------------------------------------------------------------
 * 7. SCAN REPORTS & INGESTION ENGINE
 * ------------------------------------------------------------- */

// Helper function to ingest report JSON object
export function ingestScanReportData(
  reportData: any, 
  source: 'manual_upload' | 'agent_sync' | 'sample_data',
  uploadedByEmail: string,
  fileName?: string
): ScanReport {
  const data = db.getData();

  const reportId = 'scan-' + crypto.randomUUID();
  const timestamp = reportData.scan_timestamp || reportData.timestamp || new Date().toISOString();
  const version = reportData.scanner_version || reportData.version || '0.2.1-py';
  const target = reportData.scanned_target || reportData.target || 'Windows Endpoint';

  // Process discovered apps
  const importedApps: DiscoveredApp[] = [];
  if (Array.isArray(reportData.discovered_apps)) {
    for (const app of reportData.discovered_apps) {
      const existing = data.applications.find(a => a.name.toLowerCase() === (app.name || '').toLowerCase());
      const newApp: DiscoveredApp = {
        id: existing ? existing.id : 'app-' + crypto.randomUUID(),
        name: app.name || 'Unknown AI App',
        category: app.category || 'AI coding editors',
        installPath: app.install_path || app.path,
        runningStatus: app.running_status || (app.is_running ? 'Running' : 'Installed'),
        discoveryMethod: app.discovery_method || 'Windows candidate paths / process check',
        lastObserved: timestamp,
        monitoringCoverage: app.monitoring_coverage || 'Configuration inspection supported',
        detectionConfidence: app.confidence || 'High',
        approvalStatus: existing ? existing.approvalStatus : 'Under Review',
        executableName: app.executable_name || app.binary,
        scanReportId: reportId
      };

      if (existing) {
        Object.assign(existing, newApp);
        importedApps.push(existing);
      } else {
        data.applications.push(newApp);
        importedApps.push(newApp);
      }
    }
  }

  // Process MCP Servers
  const importedServers: McpServer[] = [];
  if (Array.isArray(reportData.mcp_servers)) {
    for (const srv of reportData.mcp_servers) {
      const existing = data.mcpServers.find(s => s.name.toLowerCase() === (srv.name || '').toLowerCase());
      
      const args: string[] = Array.isArray(srv.args) ? srv.args : [];
      const cmd: string = srv.command || '';
      
      // Heuristic detection matching Aiteebar risk rules
      const hasCmdPattern = 
        cmd.includes('cmd.exe') || 
        cmd.includes('powershell') || 
        cmd.includes('bash') || 
        args.some(a => a === '-y' || a === '--yes' || a.includes('powershell') || a.includes('cmd.exe'));
      
      const isPinned = srv.is_version_pinned !== undefined 
        ? Boolean(srv.is_version_pinned) 
        : !args.some(a => a.includes('@latest') || (a.startsWith('@') && !a.includes('@', 1)));

      const suspiciousReasons: string[] = [];
      if (hasCmdPattern) suspiciousReasons.push('Contains shell execution or automated approval bypass (-y, --yes)');
      if (!isPinned) suspiciousReasons.push('Contains unpinned package reference');

      const newServer: McpServer = {
        id: existing ? existing.id : 'mcp-' + crypto.randomUUID(),
        name: srv.name || 'mcp-server',
        parentApp: srv.parent_app || 'Cursor',
        configFilePath: srv.config_file_path || srv.config_path || 'cursor_settings.json',
        command: cmd,
        args,
        packageName: srv.package_name || (args.find(a => a.startsWith('@') || a.includes('/')) || undefined),
        packageVersion: srv.package_version || (isPinned ? 'Pinned' : 'Unpinned/Latest'),
        isVersionPinned: isPinned,
        allowedFolders: Array.isArray(srv.allowed_folders) ? srv.allowed_folders : [],
        findingsCount: {
          high: hasCmdPattern ? 1 : 0,
          medium: !isPinned ? 1 : 0,
          low: 0
        },
        lastObserved: timestamp,
        approvalStatus: existing ? existing.approvalStatus : (hasCmdPattern ? 'Review Required' : 'Approved'),
        evidenceSource: srv.evidence_source || 'Cursor MCP configuration file',
        hasSuspiciousPattern: hasCmdPattern,
        suspiciousReasons,
        scanReportId: reportId
      };

      if (existing) {
        Object.assign(existing, newServer);
        importedServers.push(existing);
      } else {
        data.mcpServers.push(newServer);
        importedServers.push(newServer);
      }
    }
  }

  // Process Findings
  let highCount = 0;
  let medCount = 0;
  let lowCount = 0;

  if (Array.isArray(reportData.findings)) {
    for (const f of reportData.findings) {
      const sev: Severity = (['HIGH', 'MEDIUM', 'LOW', 'INFORMATIONAL'].includes(f.severity) ? f.severity : 'MEDIUM') as Severity;
      if (sev === 'HIGH') highCount++;
      else if (sev === 'MEDIUM') medCount++;
      else if (sev === 'LOW') lowCount++;

      const newFinding: RiskFinding = {
        id: 'find-' + crypto.randomUUID(),
        ruleId: f.rule_id || (sev === 'HIGH' ? 'AIT-MCP-CMD-01' : 'AIT-MCP-VER-02'),
        severity: sev,
        title: f.title || (sev === 'HIGH' ? 'Suspicious Command Pattern in MCP Config' : 'Unpinned MCP Server Package Version'),
        description: f.description || 'Observed risk configuration in MCP server declaration.',
        category: f.category || (sev === 'HIGH' ? 'RUNTIME_SUSPICION' : 'UNPINNED_DEPENDENCY'),
        relatedApp: f.related_app || 'Cursor',
        relatedMcpServer: f.related_mcp_server || f.server_name,
        evidence: f.evidence || 'Configuration command string or argument inspect',
        source: f.source || 'risk_engine.py evaluation',
        timestamp,
        recommendation: f.recommendation || 'Pin package dependencies and avoid automated execution bypass flags.',
        status: 'Open',
        analystNotes: '',
        history: [{
          timestamp: new Date().toISOString(),
          userId: 'system',
          userEmail: uploadedByEmail,
          action: 'Finding ingested from scan report',
          newStatus: 'Open'
        }],
        scanReportId: reportId
      };

      data.findings.unshift(newFinding);
    }
  }

  // Process Activity Events
  let eventCount = 0;
  if (Array.isArray(reportData.activity_events)) {
    for (const ev of reportData.activity_events) {
      eventCount++;
      const newEvent: ActivityEvent = {
        id: 'act-' + crypto.randomUUID(),
        eventType: ev.event_type || ev.type || 'file_modified',
        timestamp: ev.timestamp || timestamp,
        filePath: ev.file_path || ev.path || 'unknown_path',
        isDirectory: Boolean(ev.is_directory),
        evidenceSource: ev.evidence_source || 'Watchdog Filesystem Monitor (activity_monitor.py)',
        responsibleProcess: ev.responsible_process || 'Responsible process unknown',
        processId: ev.process_id !== undefined ? ev.process_id : null,
        relatedApp: ev.related_app,
        relatedMcpServer: ev.related_mcp_server,
        attributionStatus: ev.attribution_status || 'Unavailable',
        evidenceDetails: ev.evidence_details || `Filesystem event observed via Watchdog hook in ${ev.file_path || 'monitored workspace'}.`,
        monitoringCoverageLimitations: ev.limitations || 'Filesystem Watchdog cannot attribute process PID without ETW provider.'
      };
      data.activityEvents.unshift(newEvent);
    }
  }

  const scanReport: ScanReport = {
    id: reportId,
    scannerVersion: version,
    scanTimestamp: timestamp,
    scannedTarget: target,
    reportSource: source,
    summary: {
      totalApps: importedApps.length,
      runningApps: importedApps.filter(a => a.runningStatus === 'Running').length,
      mcpConfigs: importedServers.length > 0 ? 1 : 0,
      mcpServers: importedServers.length,
      highFindings: highCount,
      mediumFindings: medCount,
      lowFindings: lowCount,
      totalActivityEvents: eventCount
    },
    rawReportJson: JSON.stringify(reportData, null, 2),
    uploadedAt: new Date().toISOString(),
    uploadedByEmail,
    fileName
  };

  data.scanReports.unshift(scanReport);
  db.save();

  return scanReport;
}

// GET /api/scans
apiRouter.get('/scans', requireAuth, (_req: Request, res: Response) => {
  const data = db.getData();
  // Return list with lightweight raw json preview
  res.json(data.scanReports);
});

// GET /api/scans/:id
apiRouter.get('/scans/:id', requireAuth, (req: Request, res: Response) => {
  const data = db.getData();
  const report = data.scanReports.find(s => s.id === req.params.id);
  if (!report) {
    return res.status(404).json({ error: 'Scan report not found.' });
  }
  res.json(report);
});

// POST /api/scans/import (Upload scan_report.json)
apiRouter.post('/scans/import', requireAuth, requireRole('admin', 'analyst'), upload.single('reportFile'), (req: AuthenticatedRequest, res: Response) => {
  let reportJsonObj: any;

  try {
    if (req.file) {
      const fileContent = fs.readFileSync(req.file.path, 'utf-8');
      reportJsonObj = JSON.parse(fileContent);
    } else if (req.body.reportJson) {
      reportJsonObj = typeof req.body.reportJson === 'string' 
        ? JSON.parse(req.body.reportJson) 
        : req.body.reportJson;
    } else {
      return res.status(400).json({ error: 'Please upload a JSON report file or provide reportJson in request body.' });
    }
  } catch (err: any) {
    return res.status(400).json({ error: `Malformed JSON scan report: ${err.message}` });
  }

  // Validate structural expectations of untrusted input
  if (typeof reportJsonObj !== 'object' || reportJsonObj === null) {
    return res.status(400).json({ error: 'Invalid report: root must be a JSON object.' });
  }

  const report = ingestScanReportData(
    reportJsonObj, 
    'manual_upload', 
    req.user!.email, 
    req.file ? req.file.originalname : 'scan_report.json'
  );

  db.addAuditLog({
    userId: req.user!.id,
    userEmail: req.user!.email,
    action: 'REPORT_IMPORTED',
    entityType: 'ScanReport',
    entityId: report.id,
    details: `Imported scan report from ${report.scannedTarget} with ${report.summary.totalApps} apps and ${report.summary.highFindings} HIGH findings.`
  });

  res.status(201).json(report);
});

// POST /api/scans/sample (Inject a verified sample from Aiteebar Mini Scanner)
apiRouter.post('/scans/sample', requireAuth, requireRole('admin', 'analyst'), (req: AuthenticatedRequest, res: Response) => {
  const sampleReportData = {
    scanner_version: "0.2.1-py",
    scan_timestamp: new Date().toISOString(),
    scanned_target: "WORKSTATION-SEC-WIN11 (C:\\Users\\kamran\\Desktop\\Aiteebar-Lab)",
    discovered_apps: [
      {
        name: "Cursor",
        category: "AI coding editors",
        install_path: "C:\\Users\\kamran\\AppData\\Local\\Programs\\cursor\\Cursor.exe",
        is_running: true,
        running_status: "Running",
        discovery_method: "Windows candidate path & process table",
        confidence: "High",
        monitoring_coverage: "MCP Config file inspection & filesystem watchdog active",
        executable_name: "Cursor.exe"
      },
      {
        name: "Claude Desktop",
        category: "Desktop AI assistants",
        install_path: "C:\\Users\\kamran\\AppData\\Local\\AnthropicClaude\\Claude.exe",
        is_running: false,
        running_status: "Installed",
        discovery_method: "Windows candidate path inspection",
        confidence: "High",
        monitoring_coverage: "Config discovery supported",
        executable_name: "Claude.exe"
      },
      {
        name: "Ollama Local Runtime",
        category: "Local AI runtimes",
        install_path: "C:\\Users\\kamran\\AppData\\Local\\Programs\\Ollama\\ollama.exe",
        is_running: true,
        running_status: "Running",
        discovery_method: "Local service check (127.0.0.1:11434)",
        confidence: "High",
        monitoring_coverage: "Process verified",
        executable_name: "ollama.exe"
      }
    ],
    mcp_servers: [
      {
        name: "filesystem-tools-cursor",
        parent_app: "Cursor",
        config_file_path: "C:\\Users\\kamran\\AppData\\Roaming\\Cursor\\User\\globalStorage\\cursor_settings.json",
        command: "npx",
        args: ["-y", "@modelcontextprotocol/server-filesystem@latest", "C:\\Users\\kamran\\Projects"],
        is_version_pinned: false,
        allowed_folders: ["C:\\Users\\kamran\\Projects"],
        evidence_source: "Cursor MCP configuration file"
      },
      {
        name: "database-inspect-dev",
        parent_app: "Cursor",
        config_file_path: "C:\\Users\\kamran\\AppData\\Roaming\\Cursor\\User\\globalStorage\\cursor_settings.json",
        command: "cmd.exe",
        args: ["/c", "python", "-m", "mcp_db_bridge", "--auto-approve"],
        is_version_pinned: false,
        allowed_folders: [],
        evidence_source: "Cursor MCP configuration file"
      },
      {
        name: "git-secure-mcp",
        parent_app: "Cursor",
        config_file_path: "C:\\Users\\kamran\\AppData\\Roaming\\Cursor\\User\\globalStorage\\cursor_settings.json",
        command: "docker",
        args: ["run", "-i", "--rm", "mcp/git:v1.2.0"],
        is_version_pinned: true,
        allowed_folders: ["C:\\Users\\kamran\\Projects\\aiteebar"],
        evidence_source: "Cursor MCP configuration file"
      }
    ],
    findings: [
      {
        rule_id: "AIT-MCP-CMD-01",
        severity: "HIGH",
        title: "Suspicious Shell Invocations in MCP Server Declaration",
        description: "The MCP server 'database-inspect-dev' launches via 'cmd.exe /c' with automated approval flags. This bypasses user confirmation prompts and permits subshell command injection.",
        category: "RUNTIME_SUSPICION",
        related_app: "Cursor",
        related_mcp_server: "database-inspect-dev",
        evidence: "command: 'cmd.exe', args: ['/c', 'python', '-m', 'mcp_db_bridge', '--auto-approve']",
        source: "risk_engine.py configuration rule evaluation",
        recommendation: "Remove 'cmd.exe /c' wrapper, invoke python binary directly, and eliminate '--auto-approve' to ensure human-in-the-loop validation."
      },
      {
        rule_id: "AIT-MCP-VER-02",
        severity: "MEDIUM",
        title: "Unpinned MCP Package Reference (@latest)",
        description: "The MCP server 'filesystem-tools-cursor' references unpinned dependency '@modelcontextprotocol/server-filesystem@latest' with auto-install flag '-y'.",
        category: "UNPINNED_DEPENDENCY",
        related_app: "Cursor",
        related_mcp_server: "filesystem-tools-cursor",
        evidence: "args: ['-y', '@modelcontextprotocol/server-filesystem@latest']",
        source: "risk_engine.py version pinning check",
        recommendation: "Pin package to explicit immutable version (e.g., @modelcontextprotocol/server-filesystem@0.6.2) and eliminate '-y' flag."
      }
    ],
    activity_events: [
      {
        event_type: "file_modified",
        timestamp: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
        file_path: "C:\\Users\\kamran\\Projects\\backend\\server.ts",
        is_directory: false,
        evidence_source: "Watchdog Filesystem Monitor (activity_monitor.py)",
        responsible_process: "Responsible process unknown",
        attribution_status: "Unavailable",
        evidence_details: "File modification event detected in monitored directory 'C:\\Users\\kamran\\Projects'.",
        limitations: "Filesystem Watchdog cannot attribute process PID without ETW provider."
      },
      {
        event_type: "file_created",
        timestamp: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
        file_path: "C:\\Users\\kamran\\Projects\\temp_output.log",
        is_directory: false,
        evidence_source: "Watchdog Filesystem Monitor (activity_monitor.py)",
        responsible_process: "Responsible process unknown",
        attribution_status: "Unavailable",
        evidence_details: "File created in root project directory.",
        limitations: "Filesystem Watchdog cannot attribute process PID without ETW provider."
      }
    ]
  };

  const report = ingestScanReportData(sampleReportData, 'sample_data', req.user!.email, 'sample_lab_scan_report.json');

  db.addAuditLog({
    userId: req.user!.id,
    userEmail: req.user!.email,
    action: 'SAMPLE_REPORT_LOADED',
    entityType: 'ScanReport',
    entityId: report.id,
    details: 'Loaded verified sample report from Aiteebar Windows Lab environment.'
  });

  res.status(201).json(report);
});

// DELETE /api/scans/:id
apiRouter.delete('/scans/:id', requireAuth, requireRole('admin'), (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const data = db.getData();
  const idx = data.scanReports.findIndex(s => s.id === id);
  if (idx === -1) {
    return res.status(404).json({ error: 'Scan report not found.' });
  }

  const deleted = data.scanReports.splice(idx, 1)[0];
  // Remove associated findings and apps if linked solely to this report
  data.findings = data.findings.filter(f => f.scanReportId !== id);
  data.activityEvents = data.activityEvents.filter(e => (e as any).scanReportId !== id);
  db.save();

  db.addAuditLog({
    userId: req.user!.id,
    userEmail: req.user!.email,
    action: 'REPORT_DELETED',
    entityType: 'ScanReport',
    entityId: id,
    details: `Deleted scan report ${deleted.scannedTarget} (${id}).`
  });

  res.json({ message: 'Scan report and associated findings removed.' });
});

/* -------------------------------------------------------------
 * 8. TEAM MANAGEMENT (CRUD & Reorder & Uploads)
 * ------------------------------------------------------------- */

// GET /api/team (Public: only published members unless authenticated admin)
apiRouter.get('/team', (req: AuthenticatedRequest, res: Response) => {
  const data = db.getData();
  const isAdmin = req.user && req.user.role === 'admin';
  const members = isAdmin 
    ? data.teamMembers 
    : data.teamMembers.filter(m => m.isPublished);

  const sorted = [...members].sort((a, b) => a.order - b.order);
  res.json(sorted);
});

// POST /api/team
apiRouter.post('/team', requireAuth, requireRole('admin'), (req: AuthenticatedRequest, res: Response) => {
  const { fullName, roleTitle, biography, skills, responsibilities, avatarUrl, linkedInUrl, githubUrl, portfolioUrl, isPublished } = req.body;
  if (!fullName || !roleTitle || !biography) {
    return res.status(400).json({ error: 'Full name, role title, and biography are required.' });
  }

  const data = db.getData();
  const newMember: TeamMember = {
    id: 'team-' + crypto.randomUUID(),
    fullName: fullName.trim(),
    roleTitle: roleTitle.trim(),
    biography: biography.trim(),
    skills: Array.isArray(skills) ? skills : (typeof skills === 'string' ? skills.split(',').map(s => s.trim()).filter(Boolean) : []),
    responsibilities: Array.isArray(responsibilities) ? responsibilities : (typeof responsibilities === 'string' ? responsibilities.split('\n').map(s => s.trim()).filter(Boolean) : []),
    avatarUrl: avatarUrl || undefined,
    linkedInUrl: linkedInUrl || undefined,
    githubUrl: githubUrl || undefined,
    portfolioUrl: portfolioUrl || undefined,
    order: data.teamMembers.length + 1,
    isPublished: isPublished !== undefined ? Boolean(isPublished) : true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  data.teamMembers.push(newMember);
  db.save();

  db.addAuditLog({
    userId: req.user!.id,
    userEmail: req.user!.email,
    action: 'TEAM_MEMBER_CREATED',
    entityType: 'TeamMember',
    entityId: newMember.id,
    details: `Added team member ${newMember.fullName} (${newMember.roleTitle}).`
  });

  res.status(201).json(newMember);
});

// PUT /api/team/:id
apiRouter.put('/team/:id', requireAuth, requireRole('admin'), (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const data = db.getData();
  const member = data.teamMembers.find(m => m.id === id);
  if (!member) {
    return res.status(404).json({ error: 'Team member not found.' });
  }

  const { fullName, roleTitle, biography, skills, responsibilities, avatarUrl, linkedInUrl, githubUrl, portfolioUrl, isPublished } = req.body;
  if (fullName) member.fullName = fullName.trim();
  if (roleTitle) member.roleTitle = roleTitle.trim();
  if (biography) member.biography = biography.trim();
  if (skills !== undefined) {
    member.skills = Array.isArray(skills) ? skills : (typeof skills === 'string' ? skills.split(',').map(s => s.trim()).filter(Boolean) : []);
  }
  if (responsibilities !== undefined) {
    member.responsibilities = Array.isArray(responsibilities) ? responsibilities : (typeof responsibilities === 'string' ? responsibilities.split('\n').map(s => s.trim()).filter(Boolean) : []);
  }
  if (avatarUrl !== undefined) member.avatarUrl = avatarUrl;
  if (linkedInUrl !== undefined) member.linkedInUrl = linkedInUrl;
  if (githubUrl !== undefined) member.githubUrl = githubUrl;
  if (portfolioUrl !== undefined) member.portfolioUrl = portfolioUrl;
  if (isPublished !== undefined) member.isPublished = Boolean(isPublished);

  member.updatedAt = new Date().toISOString();
  db.save();

  db.addAuditLog({
    userId: req.user!.id,
    userEmail: req.user!.email,
    action: 'TEAM_MEMBER_UPDATED',
    entityType: 'TeamMember',
    entityId: id,
    details: `Updated team member ${member.fullName}.`
  });

  res.json(member);
});

// DELETE /api/team/:id
apiRouter.delete('/team/:id', requireAuth, requireRole('admin'), (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const data = db.getData();
  const idx = data.teamMembers.findIndex(m => m.id === id);
  if (idx === -1) {
    return res.status(404).json({ error: 'Team member not found.' });
  }

  const deleted = data.teamMembers.splice(idx, 1)[0];
  db.save();

  db.addAuditLog({
    userId: req.user!.id,
    userEmail: req.user!.email,
    action: 'TEAM_MEMBER_DELETED',
    entityType: 'TeamMember',
    entityId: id,
    details: `Deleted team member ${deleted.fullName}.`
  });

  res.json({ message: 'Team member deleted.' });
});

// POST /api/team/reorder
apiRouter.post('/team/reorder', requireAuth, requireRole('admin'), (req: AuthenticatedRequest, res: Response) => {
  const { orderedIds } = req.body;
  if (!Array.isArray(orderedIds)) {
    return res.status(400).json({ error: 'orderedIds must be an array of team IDs.' });
  }

  const data = db.getData();
  orderedIds.forEach((id: string, index: number) => {
    const member = data.teamMembers.find(m => m.id === id);
    if (member) member.order = index + 1;
  });
  db.save();

  res.json({ message: 'Team order updated.' });
});

// POST /api/team/:id/avatar (Safe avatar image upload)
apiRouter.post('/team/:id/avatar', requireAuth, requireRole('admin'), upload.single('avatar'), (req: AuthenticatedRequest, res: Response) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No image file uploaded.' });
  }

  const { id } = req.params;
  const data = db.getData();
  const member = data.teamMembers.find(m => m.id === id);
  if (!member) {
    return res.status(404).json({ error: 'Team member not found.' });
  }

  const publicUrl = `/uploads/${req.file.filename}`;
  member.avatarUrl = publicUrl;
  member.updatedAt = new Date().toISOString();
  db.save();

  db.addAuditLog({
    userId: req.user!.id,
    userEmail: req.user!.email,
    action: 'TEAM_AVATAR_UPLOADED',
    entityType: 'TeamMember',
    entityId: id,
    details: `Uploaded new avatar for ${member.fullName}.`
  });

  res.json({ avatarUrl: publicUrl, member });
});

/* -------------------------------------------------------------
 * 9. DOCUMENTATION ARTICLES (CRUD)
 * ------------------------------------------------------------- */
apiRouter.get('/docs', (_req: Request, res: Response) => {
  const data = db.getData();
  const sorted = [...data.documentation].sort((a, b) => a.order - b.order);
  res.json(sorted);
});

apiRouter.post('/docs', requireAuth, requireRole('admin'), (req: AuthenticatedRequest, res: Response) => {
  const { title, slug, category, summary, content } = req.body;
  if (!title || !slug || !content) {
    return res.status(400).json({ error: 'Title, slug, and content are required.' });
  }

  const data = db.getData();
  const newDoc: DocArticle = {
    id: 'doc-' + crypto.randomUUID(),
    slug: slug.trim().toLowerCase().replace(/[^a-z0-9-]/g, '-'),
    title: title.trim(),
    category: category || 'Overview',
    summary: summary || '',
    content: content.trim(),
    order: data.documentation.length + 1,
    lastUpdated: new Date().toISOString().split('T')[0]
  };

  data.documentation.push(newDoc);
  db.save();

  db.addAuditLog({
    userId: req.user!.id,
    userEmail: req.user!.email,
    action: 'DOC_CREATED',
    entityType: 'DocArticle',
    entityId: newDoc.id,
    details: `Created doc article '${newDoc.title}'.`
  });

  res.status(201).json(newDoc);
});

apiRouter.put('/docs/:id', requireAuth, requireRole('admin'), (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const data = db.getData();
  const doc = data.documentation.find(d => d.id === id);
  if (!doc) {
    return res.status(404).json({ error: 'Doc article not found.' });
  }

  const { title, slug, category, summary, content, order } = req.body;
  if (title) doc.title = title.trim();
  if (slug) doc.slug = slug.trim();
  if (category) doc.category = category;
  if (summary !== undefined) doc.summary = summary;
  if (content) doc.content = content.trim();
  if (order !== undefined) doc.order = Number(order);

  doc.lastUpdated = new Date().toISOString().split('T')[0];
  db.save();

  db.addAuditLog({
    userId: req.user!.id,
    userEmail: req.user!.email,
    action: 'DOC_UPDATED',
    entityType: 'DocArticle',
    entityId: id,
    details: `Updated doc article '${doc.title}'.`
  });

  res.json(doc);
});

apiRouter.delete('/docs/:id', requireAuth, requireRole('admin'), (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const data = db.getData();
  const idx = data.documentation.findIndex(d => d.id === id);
  if (idx === -1) {
    return res.status(404).json({ error: 'Doc article not found.' });
  }

  const deleted = data.documentation.splice(idx, 1)[0];
  db.save();

  db.addAuditLog({
    userId: req.user!.id,
    userEmail: req.user!.email,
    action: 'DOC_DELETED',
    entityType: 'DocArticle',
    entityId: id,
    details: `Deleted doc article '${deleted.title}'.`
  });

  res.json({ message: 'Doc article deleted.' });
});

/* -------------------------------------------------------------
 * 10. PLATFORM CAPABILITIES (Status & Roadmap)
 * ------------------------------------------------------------- */
apiRouter.get('/capabilities', (_req: Request, res: Response) => {
  const data = db.getData();
  res.json(data.capabilities);
});

apiRouter.patch('/capabilities/:id', requireAuth, requireRole('admin'), (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const { status, scope, description } = req.body;

  const data = db.getData();
  const cap = data.capabilities.find(c => c.id === id);
  if (!cap) {
    return res.status(404).json({ error: 'Capability not found.' });
  }

  if (status && ['Implemented', 'In Development', 'Planned'].includes(status)) {
    cap.status = status;
  }
  if (scope) cap.scope = scope;
  if (description) cap.description = description;

  db.save();

  db.addAuditLog({
    userId: req.user!.id,
    userEmail: req.user!.email,
    action: 'CAPABILITY_UPDATED',
    entityType: 'Capability',
    entityId: id,
    details: `Updated capability '${cap.title}' status to ${cap.status}.`
  });

  res.json(cap);
});

/* -------------------------------------------------------------
 * 11. PLATFORM SETTINGS & AGENT API
 * ------------------------------------------------------------- */
apiRouter.get('/settings', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const data = db.getData();
  const settings = { ...data.settings };
  // Mask agent API key for non-admins
  if (req.user!.role !== 'admin') {
    settings.agentApiKey = '••••••••••••••••••••••••';
  }
  res.json(settings);
});

apiRouter.put('/settings', requireAuth, requireRole('admin'), (req: AuthenticatedRequest, res: Response) => {
  const data = db.getData();
  const { organizationName, platformDisplayName, timezone, contactEmail, dataRetentionDays, enableAgentApi, approvedAppPolicies, approvedMcpCommands } = req.body;

  if (organizationName) data.settings.organizationName = organizationName.trim();
  if (platformDisplayName) data.settings.platformDisplayName = platformDisplayName.trim();
  if (timezone) data.settings.timezone = timezone.trim();
  if (contactEmail) data.settings.contactEmail = contactEmail.trim();
  if (dataRetentionDays) data.settings.dataRetentionDays = Number(dataRetentionDays);
  if (enableAgentApi !== undefined) data.settings.enableAgentApi = Boolean(enableAgentApi);
  if (Array.isArray(approvedAppPolicies)) data.settings.approvedAppPolicies = approvedAppPolicies;
  if (Array.isArray(approvedMcpCommands)) data.settings.approvedMcpCommands = approvedMcpCommands;

  data.settings.updatedAt = new Date().toISOString();
  db.save();

  db.addAuditLog({
    userId: req.user!.id,
    userEmail: req.user!.email,
    action: 'SETTINGS_UPDATED',
    entityType: 'Settings',
    details: 'Platform organization and security policies updated.'
  });

  res.json(data.settings);
});

apiRouter.post('/settings/regenerate-agent-key', requireAuth, requireRole('admin'), (req: AuthenticatedRequest, res: Response) => {
  const data = db.getData();
  data.settings.agentApiKey = 'ait_live_sec_' + crypto.randomBytes(16).toString('hex');
  data.settings.updatedAt = new Date().toISOString();
  db.save();

  db.addAuditLog({
    userId: req.user!.id,
    userEmail: req.user!.email,
    action: 'AGENT_KEY_REGENERATED',
    entityType: 'Settings',
    details: 'Regenerated Python scanner agent API key.'
  });

  res.json({ agentApiKey: data.settings.agentApiKey });
});

/* -------------------------------------------------------------
 * 12. AUDIT LOGS
 * ------------------------------------------------------------- */
apiRouter.get('/audit-log', requireAuth, requireRole('admin'), (_req: Request, res: Response) => {
  const data = db.getData();
  res.json(data.auditLogs);
});

/* -------------------------------------------------------------
 * 13. AGENT REST API (Direct endpoint for Python scanner)
 * ------------------------------------------------------------- */
apiRouter.post('/agent/v1/report', (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  const data = db.getData();

  if (!data.settings.enableAgentApi) {
    return res.status(403).json({ error: 'Agent API is currently disabled in Platform Settings.' });
  }

  const expectedKey = `Bearer ${data.settings.agentApiKey}`;
  if (!authHeader || authHeader !== expectedKey) {
    return res.status(401).json({ error: 'Invalid or missing Agent API key in Authorization header.' });
  }

  const reportData = req.body;
  if (!reportData || typeof reportData !== 'object') {
    return res.status(400).json({ error: 'Payload must be a valid JSON object matching scan_report.json schema.' });
  }

  const report = ingestScanReportData(reportData, 'agent_sync', 'agent-mini-scanner@windows.local', 'agent_sync_report.json');

  db.addAuditLog({
    userId: 'agent-daemon',
    userEmail: 'agent-mini-scanner@windows.local',
    action: 'AGENT_REPORT_SYNCED',
    entityType: 'ScanReport',
    entityId: report.id,
    details: `Automated scan report synchronized from target ${report.scannedTarget} (Scanner v${report.scannerVersion}).`
  });

  res.status(201).json({
    status: 'success',
    message: 'Scan report successfully ingested into Aiteebar Platform.',
    reportId: report.id,
    summary: report.summary
  });
});
