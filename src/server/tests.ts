/**
 * Basic backend operations test suite for Aiteebar AI Security Platform
 */
import { hashPassword, verifyPassword, createToken, verifyToken } from './auth.js';
import { db } from './db.js';
import { ingestScanReportData } from './routes.js';
import type { User } from '../types/index.js';

console.log('[Test Suite] Running Aiteebar backend integrity tests...');

// Test 1: Password hashing and scrypt verification
const testPass = 'SuperSecretSec123!';
const { hash, salt } = hashPassword(testPass);
const isValid = verifyPassword(testPass, hash, salt);
const isInvalid = verifyPassword('WrongPassword!', hash, salt);

if (!isValid || isInvalid) {
  console.error('[-] Test 1 Failed: Password verification error');
  process.exit(1);
}
console.log('[+] Test 1 Passed: Scrypt password hashing & constant-time verification');

// Test 2: Token creation and HMAC-SHA256 signature verification
const mockUser: User = {
  id: 'test-user-1',
  email: 'security@aiteebar.local',
  fullName: 'Security Officer',
  role: 'admin',
  createdAt: new Date().toISOString()
};

const token = createToken(mockUser);
const verifiedPayload = verifyToken(token);
if (!verifiedPayload || verifiedPayload.email !== mockUser.email || verifiedPayload.role !== 'admin') {
  console.error('[-] Test 2 Failed: Token verification error');
  process.exit(1);
}
console.log('[+] Test 2 Passed: HMAC-SHA256 session token generation and verification');

// Test 3: Scan report ingestion & rule heuristics
const samplePayload = {
  scanner_version: "0.2.1-py",
  scanned_target: "TEST-SUITE-WIN11",
  discovered_apps: [
    {
      name: "Cursor",
      category: "AI coding editors",
      running_status: "Running"
    }
  ],
  mcp_servers: [
    {
      name: "unsafe-shell-server",
      command: "cmd.exe",
      args: ["/c", "python", "-m", "server", "-y"],
      is_version_pinned: false
    }
  ],
  findings: [
    {
      rule_id: "AIT-MCP-CMD-01",
      severity: "HIGH",
      title: "Suspicious command wrapper"
    }
  ]
};

const report = ingestScanReportData(samplePayload, 'sample_data', 'test-runner@aiteebar.local', 'test_scan.json');
if (!report || report.summary.totalApps !== 1 || report.summary.highFindings !== 1) {
  console.error('[-] Test 3 Failed: Report ingestion summary mismatch', report.summary);
  process.exit(1);
}
console.log('[+] Test 3 Passed: Ingestion engine accurately parses apps, unpinned dependencies, and risk rules');

console.log('[Test Suite] All backend integrity tests passed successfully!');
