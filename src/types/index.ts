export type Role = 'admin' | 'analyst' | 'viewer';

export interface User {
  id: string;
  email: string;
  fullName: string;
  role: Role;
  createdAt: string;
  lastLogin?: string;
}

export type Severity = 'HIGH' | 'MEDIUM' | 'LOW' | 'INFORMATIONAL';
export type FindingStatus = 'Open' | 'Reviewing' | 'Resolved' | 'Accepted Risk';
export type FindingCategory = 'CONFIG_RISK' | 'RUNTIME_SUSPICION' | 'UNPINNED_DEPENDENCY' | 'PERMISSIVE_ACCESS' | 'OBSERVED_EVENT';

export interface FindingHistoryEntry {
  timestamp: string;
  userId: string;
  userEmail: string;
  action: string;
  previousStatus?: FindingStatus;
  newStatus?: FindingStatus;
  note?: string;
}

export interface RiskFinding {
  id: string;
  ruleId: string;
  severity: Severity;
  title: string;
  description: string;
  category: FindingCategory;
  relatedApp?: string;
  relatedMcpServer?: string;
  evidence: string;
  source: string;
  timestamp: string;
  recommendation: string;
  status: FindingStatus;
  analystNotes: string;
  history: FindingHistoryEntry[];
  scanReportId?: string;
}

export type AppCategory = 
  | 'AI coding editors' 
  | 'Desktop AI assistants' 
  | 'Local AI runtimes' 
  | 'Browser-based AI services' 
  | 'Other AI applications';

export type AppApprovalStatus = 'Approved' | 'Unapproved' | 'Under Review';
export type AppRunningStatus = 'Running' | 'Installed' | 'Not Detected' | 'Unknown';

export interface DiscoveredApp {
  id: string;
  name: string;
  category: AppCategory;
  installPath?: string;
  runningStatus: AppRunningStatus;
  discoveryMethod: string;
  lastObserved: string;
  monitoringCoverage: string;
  detectionConfidence: 'High' | 'Medium' | 'Low';
  approvalStatus: AppApprovalStatus;
  notes?: string;
  executableName?: string;
  scanReportId?: string;
}

export interface McpServer {
  id: string;
  name: string;
  parentApp: string;
  configFilePath: string;
  command: string;
  args: string[];
  packageName?: string;
  packageVersion?: string;
  isVersionPinned: boolean;
  allowedFolders: string[];
  findingsCount: {
    high: number;
    medium: number;
    low: number;
  };
  lastObserved: string;
  approvalStatus: 'Approved' | 'Unapproved' | 'Review Required';
  evidenceSource: string;
  hasSuspiciousPattern: boolean;
  suspiciousReasons?: string[];
  scanReportId?: string;
}

export type EventType = 
  | 'file_created' 
  | 'file_modified' 
  | 'file_deleted' 
  | 'file_moved' 
  | 'process_started' 
  | 'network_connection' 
  | 'policy_violation';

export type AttributionStatus = 'Confirmed' | 'Correlated' | 'Unknown' | 'Unavailable';

export interface ActivityEvent {
  id: string;
  eventType: EventType;
  timestamp: string;
  filePath: string;
  isDirectory: boolean;
  evidenceSource: string;
  responsibleProcess: string; // e.g. "Responsible process unknown"
  processId?: number | null;
  relatedApp?: string;
  relatedMcpServer?: string;
  attributionStatus: AttributionStatus;
  evidenceDetails: string;
  monitoringCoverageLimitations: string;
}

export interface ScanReport {
  id: string;
  scannerVersion: string;
  scanTimestamp: string;
  scannedTarget: string;
  reportSource: 'manual_upload' | 'agent_sync' | 'sample_data';
  summary: {
    totalApps: number;
    runningApps: number;
    mcpConfigs: number;
    mcpServers: number;
    highFindings: number;
    mediumFindings: number;
    lowFindings: number;
    totalActivityEvents: number;
  };
  rawReportJson: string;
  uploadedAt: string;
  uploadedByEmail: string;
  fileName?: string;
}

export interface TeamMember {
  id: string;
  fullName: string;
  roleTitle: string;
  biography: string;
  skills: string[];
  responsibilities: string[];
  avatarUrl?: string;
  linkedInUrl?: string;
  githubUrl?: string;
  portfolioUrl?: string;
  order: number;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface DocArticle {
  id: string;
  slug: string;
  title: string;
  category: 'Overview' | 'Architecture' | 'Scanner' | 'MCP Security' | 'Risk Rules' | 'Monitoring' | 'Limitations & Privacy';
  summary: string;
  content: string;
  order: number;
  lastUpdated: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  userId: string;
  userEmail: string;
  action: string;
  entityType: string;
  entityId?: string;
  details: string;
  ipAddress?: string;
}

export type CapabilityStatus = 'Implemented' | 'In Development' | 'Planned';

export interface PlatformCapability {
  id: string;
  title: string;
  category: 'Discovery' | 'Inspection' | 'Risk Analysis' | 'Activity Monitoring' | 'Reporting';
  status: CapabilityStatus;
  description: string;
  scope: string;
}

export interface PlatformSettings {
  organizationName: string;
  platformDisplayName: string;
  logoUrl?: string;
  timezone: string;
  contactEmail: string;
  dataRetentionDays: number;
  enableAgentApi: boolean;
  agentApiKey: string;
  approvedAppPolicies: { name: string; category: AppCategory; note: string }[];
  approvedMcpCommands: string[];
  updatedAt: string;
}
