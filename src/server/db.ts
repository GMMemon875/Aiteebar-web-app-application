import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import type {
  User,
  DiscoveredApp,
  McpServer,
  RiskFinding,
  ActivityEvent,
  ScanReport,
  TeamMember,
  DocArticle,
  AuditLog,
  PlatformSettings,
  PlatformCapability
} from '../types/index.js';

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'aiteebar_db.json');
const UPLOADS_DIR = path.resolve(process.cwd(), 'uploads');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

export interface StoredUser extends User {
  passwordHash: string;
  salt: string;
}

export interface DatabaseSchema {
  users: StoredUser[];
  applications: DiscoveredApp[];
  mcpServers: McpServer[];
  findings: RiskFinding[];
  activityEvents: ActivityEvent[];
  scanReports: ScanReport[];
  teamMembers: TeamMember[];
  documentation: DocArticle[];
  capabilities: PlatformCapability[];
  auditLogs: AuditLog[];
  settings: PlatformSettings;
}

const DEFAULT_CAPABILITIES: PlatformCapability[] = [
  {
    id: 'cap-1',
    title: 'Selected Windows AI Application Discovery',
    category: 'Discovery',
    status: 'Implemented',
    description: 'Discovers known candidate paths and installed binaries for Cursor, VS Code AI extensions, Claude Desktop, and Ollama.',
    scope: 'Windows Registry, LocalAppData, and Program Files candidate paths.'
  },
  {
    id: 'cap-2',
    title: 'Cursor MCP Configuration Inspection',
    category: 'Inspection',
    status: 'Implemented',
    description: 'Inspects Cursor configuration files (cursor_settings.json) to locate defined Model Context Protocol server entries.',
    scope: 'Candidate Cursor config paths on local Windows filesystem.'
  },
  {
    id: 'cap-3',
    title: 'Package Version Pinning Analysis',
    category: 'Risk Analysis',
    status: 'Implemented',
    description: 'Flags MCP server configurations referencing unpinned packages (e.g. npx/uvx @latest or without explicit version locks).',
    scope: 'Configured args in inspected MCP server declarations.'
  },
  {
    id: 'cap-4',
    title: 'Suspicious Command Pattern Detection',
    category: 'Risk Analysis',
    status: 'Implemented',
    description: 'Detects high-risk command strings, shell invocations (cmd.exe, powershell -enc, bash -c), and auto-approval flags (-y, --yes).',
    scope: 'MCP server execution command lines and argument arrays.'
  },
  {
    id: 'cap-5',
    title: 'JSON Scan Report Generation & Ingestion',
    category: 'Reporting',
    status: 'Implemented',
    description: 'Standardized scan_report.json generation with full metadata, findings, targets, and evidence records.',
    scope: 'Aiteebar scanner output schema.'
  },
  {
    id: 'cap-6',
    title: 'Filesystem Event Monitoring with Watchdog',
    category: 'Activity Monitoring',
    status: 'Implemented',
    description: 'Records file creation, modification, deletion, and moves within designated folders.',
    scope: 'Configured folder monitoring via Python Watchdog library. Process attribution not collected in this mode.'
  },
  {
    id: 'cap-7',
    title: 'Clearer Dashboard Risk Reporting',
    category: 'Risk Analysis',
    status: 'In Development',
    description: 'Unified visualization of high, medium, and low severity security posture across workspaces.',
    scope: 'Web dashboard analytics and posture metrics.'
  },
  {
    id: 'cap-8',
    title: 'Scan Report Ingestion & Normalization',
    category: 'Reporting',
    status: 'In Development',
    description: 'Validates untrusted scanner JSON, sanitizes path metadata, and normalizes findings into searchable database records.',
    scope: 'Platform API import engine.'
  },
  {
    id: 'cap-9',
    title: 'Expanded AI Application Discovery',
    category: 'Discovery',
    status: 'In Development',
    description: 'Extending heuristics to detect Windsurf, Zed, Continue.dev, LM Studio, and Jan.ai.',
    scope: 'Expanded candidate process names and config paths.'
  },
  {
    id: 'cap-10',
    title: 'Broader MCP Configuration Discovery',
    category: 'Inspection',
    status: 'In Development',
    description: 'Locating Claude Desktop config, Windsurf config, and custom MCP JSON files in workspace roots.',
    scope: 'Standardized %APPDATA% and project-level MCP files.'
  },
  {
    id: 'cap-11',
    title: 'Improved Activity Evidence Correlation',
    category: 'Activity Monitoring',
    status: 'In Development',
    description: 'Matching filesystem event timestamps with known MCP invocation windows when available.',
    scope: 'Heuristic correlation engine.'
  },
  {
    id: 'cap-12',
    title: 'Reliable Process Attribution',
    category: 'Activity Monitoring',
    status: 'Planned',
    description: 'Capturing exact process ID and parent process tree for filesystem and network activity via ETW (Event Tracing for Windows).',
    scope: 'Native Windows kernel/ETW driver integration.'
  },
  {
    id: 'cap-13',
    title: 'Windows Security Event Log Integration',
    category: 'Activity Monitoring',
    status: 'Planned',
    description: 'Correlating Sysmon and Event Log 4688 (Process Creation) with AI runtime activities.',
    scope: 'Windows Event Log collector.'
  },
  {
    id: 'cap-14',
    title: 'Approved / Unapproved AI Application Policy Enforcement',
    category: 'Discovery',
    status: 'Planned',
    description: 'Automated policy alerting and workflow ticketing when unauthorized AI binaries are detected.',
    scope: 'Enterprise policy engine.'
  },
  {
    id: 'cap-15',
    title: 'Browser & Network Security Integrations',
    category: 'Inspection',
    status: 'Planned',
    description: 'Detecting browser AI sessions via network proxy evidence or managed browser extension logs.',
    scope: 'Enterprise proxy & browser policy integrations.'
  },
  {
    id: 'cap-16',
    title: 'Data Loss Prevention (DLP) Integration',
    category: 'Risk Analysis',
    status: 'Planned',
    description: 'Inspecting data transfers to external AI APIs for PII, API tokens, and confidential source code.',
    scope: 'DLP content inspection modules.'
  }
];

const DEFAULT_DOCS: DocArticle[] = [
  {
    id: 'doc-1',
    slug: 'project-overview',
    title: 'Aiteebar AI Security Platform Overview',
    category: 'Overview',
    order: 1,
    summary: 'Introduction to Aiteebar: why AI application and MCP configuration security matters.',
    lastUpdated: '2026-10-20',
    content: `### Mission & Philosophy
Aiteebar is built on a simple premise: **Enterprises cannot secure AI adoption if they do not know what AI applications and MCP servers are configured on developer machines.**

Modern AI developer environments rely heavily on the Model Context Protocol (MCP) and agentic extensions. While these grant LLMs autonomous access to filesystems, databases, and CLI tools, they also introduce unverified dependencies, unpinned scripts, and potential privilege escalation vectors.

Aiteebar follows a four-pillar lifecycle:
1. **Discover**: Locate AI editors, desktop assistants, and local inference runtimes without relying on self-reporting.
2. **Assess**: Inspect configuration files (e.g. Cursor, Claude Desktop), command arguments, package versions, and directory access permissions.
3. **Monitor**: Collect filesystem activity evidence in designated AI workspaces using lightweight file monitoring.
4. **Protect**: Surface actionable, severity-rated findings, distinguish configuration risks from confirmed runtime actions, and enforce organizational policy.
`
  },
  {
    id: 'doc-2',
    slug: 'scanner-workflow',
    title: 'Python Mini Scanner Architecture & Workflow',
    category: 'Scanner',
    order: 2,
    summary: 'How the Aiteebar Python scanner runs on Windows endpoints and generates reports.',
    lastUpdated: '2026-10-20',
    content: `### Architecture of Aiteebar Mini Scanner
The existing Python scanner located on target workstations (e.g. in \`C:\\Users\\kamran\\Desktop\\Aiteebar-Lab\`) comprises:
- \`aiteebar_mini_scanner.py\`: Orchestrator that scans registry keys, default paths, and config files.
- \`risk_engine.py\`: Evaluates discovered configurations against security rules.
- \`activity_monitor.py\`: Uses the Python \`watchdog\` library to log filesystem modifications in monitored directories.
- \`scan_report.json\`: Standardized output containing discovered applications, MCP server details, and rule evaluation findings.

### Execution Model
1. The scanner is executed locally by an authorized administrator or scheduled service.
2. It **never** executes MCP commands or runs arbitrary server binaries.
3. It sanitizes sensitive tokens and generates a structured JSON report.
4. The JSON report is ingested into this Aiteebar Platform via the web dashboard or authenticated Agent REST API.
`
  },
  {
    id: 'doc-3',
    slug: 'mcp-configuration-security',
    title: 'MCP Server Configuration Inspection & Risks',
    category: 'MCP Security',
    order: 3,
    summary: 'Understanding Model Context Protocol configurations and vulnerabilities.',
    lastUpdated: '2026-10-20',
    content: `### What is Model Context Protocol (MCP)?
Model Context Protocol allows AI client applications (such as Cursor, Windsurf, or Claude Desktop) to connect with local or remote servers that expose tools, resources, and prompt templates.

### Common Configuration Risks
1. **Unpinned Packages (Rule AIT-MCP-001)**:
   Configurations often execute \`npx -y @some/mcp-server\` without pinning a specific cryptographic hash or semantic version. If the package maintainer's account is compromised, the next time the AI editor starts, a malicious payload could be pulled down and executed.
2. **Suspicious Shell Execution (Rule AIT-MCP-002)**:
   Configurations invoking \`cmd.exe /c\`, \`powershell.exe -EncodedCommand\`, or shell redirects inside tool execution pipelines.
3. **Broad Filesystem Whitelists (Rule AIT-MCP-003)**:
   Allowing root drives (\`C:\\\` or \`/\`) or sensitive user directories (\`~/.ssh\`, \`~/.aws\`) in MCP access permissions.
`
  },
  {
    id: 'doc-4',
    slug: 'risk-rules-spec',
    title: 'Risk Engine Rules & Severity Standards',
    category: 'Risk Rules',
    order: 4,
    summary: 'Detailed specification of Aiteebar risk rules, scoring, and remediation.',
    lastUpdated: '2026-10-20',
    content: `### Severity Tiers
- **HIGH**: Imminent or dangerous configuration vulnerability (e.g. arbitrary command execution flags, unsafe interpreter chaining).
- **MEDIUM**: Significant security hygiene gap that could lead to supply-chain tampering (e.g. unpinned package version fetched over network).
- **LOW**: Suboptimal configuration with limited attack surface.
- **INFORMATIONAL**: Noteworthy configuration element recorded for audit compliance.

### Currently Implemented Rules
- **AIT-MCP-CMD-01 (HIGH)**:
  *Trigger*: MCP server command contains \`cmd.exe\`, \`powershell\`, \`sh\`, or automated execution bypass flags (\`-y\`, \`--yes\`).
  *Evidence*: Exact command line and matched token.
  *Remediation*: Pin command to dedicated binary, eliminate arbitrary shell wrappers, and require explicit user prompt for tool approvals.

- **AIT-MCP-VER-02 (MEDIUM)**:
  *Trigger*: MCP server package reference lacks explicit version tag (e.g. \`@latest\` or bare package name).
  *Evidence*: Target package argument.
  *Remediation*: Lock package to a specific immutable semantic version (e.g. \`@package@1.4.2\`).
`
  },
  {
    id: 'doc-5',
    slug: 'limitations-and-privacy',
    title: 'Operational Limitations & Privacy Constitution',
    category: 'Limitations & Privacy',
    order: 5,
    summary: 'Clear boundaries, ethical guidelines, and known technical limitations of the platform.',
    lastUpdated: '2026-10-20',
    content: `### Truthful Scope & Known Limitations
To maintain high credibility, Aiteebar adheres to strict reporting truths:
1. **Process Attribution**: When monitoring via basic filesystem hooks (Watchdog), the operating system does not automatically attach the PID or process image path to file modification events. Unless an Event Tracing for Windows (ETW) provider is active, the platform labels process attribution as **"Responsible process unknown"**.
2. **No Guaranteed Leak Detection**: The platform observes file and configuration telemetry. It does not inspect encrypted network traffic or claim guaranteed detection of all data exfiltration.
3. **No Automatic Command Execution**: The platform strictly inspects configurations statically. It will never run discovered MCP servers or execute scripts.
4. **Privacy Protection**: The platform never collects environment variable secrets, API keys, or raw file contents.
`
  }
];

const DEFAULT_SETTINGS: PlatformSettings = {
  organizationName: 'Aiteebar Security Lab',
  platformDisplayName: 'Aiteebar AI Security',
  timezone: 'UTC',
  contactEmail: 'security@aiteebar.local',
  dataRetentionDays: 90,
  enableAgentApi: true,
  agentApiKey: 'ait_live_sec_' + crypto.randomBytes(16).toString('hex'),
  approvedAppPolicies: [
    { name: 'Cursor', category: 'AI coding editors', note: 'Authorized for engineering team with pinned extension version' },
    { name: 'Claude Desktop', category: 'Desktop AI assistants', note: 'Authorized with organizational login' },
    { name: 'VS Code with GitHub Copilot', category: 'AI coding editors', note: 'Standard approved configuration' }
  ],
  approvedMcpCommands: ['node', 'python', 'docker run'],
  updatedAt: new Date().toISOString()
};

function getInitialDb(): DatabaseSchema {
  return {
    users: [], // First-admin setup is required
    applications: [],
    mcpServers: [],
    findings: [],
    activityEvents: [],
    scanReports: [],
    teamMembers: [], // Initially empty as requested by prompt
    documentation: DEFAULT_DOCS,
    capabilities: DEFAULT_CAPABILITIES,
    auditLogs: [],
    settings: DEFAULT_SETTINGS
  };
}

export class Database {
  private data: DatabaseSchema;

  constructor() {
    this.data = this.load();
  }

  private load(): DatabaseSchema {
    try {
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        // Ensure all collections exist
        return {
          users: parsed.users || [],
          applications: parsed.applications || [],
          mcpServers: parsed.mcpServers || [],
          findings: parsed.findings || [],
          activityEvents: parsed.activityEvents || [],
          scanReports: parsed.scanReports || [],
          teamMembers: parsed.teamMembers || [],
          documentation: parsed.documentation && parsed.documentation.length > 0 ? parsed.documentation : DEFAULT_DOCS,
          capabilities: parsed.capabilities && parsed.capabilities.length > 0 ? parsed.capabilities : DEFAULT_CAPABILITIES,
          auditLogs: parsed.auditLogs || [],
          settings: parsed.settings || DEFAULT_SETTINGS
        };
      }
    } catch (err) {
      console.error('Error reading db file, re-initializing:', err);
    }
    const initial = getInitialDb();
    this.saveDirect(initial);
    return initial;
  }

  private saveDirect(data: DatabaseSchema): void {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
  }

  public save(): void {
    this.saveDirect(this.data);
  }

  public getData(): DatabaseSchema {
    return this.data;
  }

  // Helper for audit logs
  public addAuditLog(entry: Omit<AuditLog, 'id' | 'timestamp'>): AuditLog {
    const log: AuditLog = {
      id: 'log-' + crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      ...entry
    };
    this.data.auditLogs.unshift(log);
    // Keep last 1000 logs
    if (this.data.auditLogs.length > 1000) {
      this.data.auditLogs = this.data.auditLogs.slice(0, 1000);
    }
    this.save();
    return log;
  }
}

export const db = new Database();
