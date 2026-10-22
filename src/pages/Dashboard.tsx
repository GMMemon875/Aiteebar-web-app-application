import React, { useState, useEffect } from 'react';
import { Sidebar } from '../components/Sidebar.js';
import { TopHeader } from '../components/TopHeader.js';
import { ImportReportModal } from '../components/ImportReportModal.js';
import { DashboardOverview } from './dashboard/DashboardOverview.js';
import { AppInventory } from './dashboard/AppInventory.js';
import { McpInventory } from './dashboard/McpInventory.js';
import { RiskFindings } from './dashboard/RiskFindings.js';
import { ActivityMonitoring } from './dashboard/ActivityMonitoring.js';
import { ScanReports } from './dashboard/ScanReports.js';
import { TeamManagement } from './dashboard/TeamManagement.js';
import { DocsManagement } from './dashboard/DocsManagement.js';
import { Integrations } from './dashboard/Integrations.js';
import { AuditLogView } from './dashboard/AuditLogView.js';
import { SettingsView } from './dashboard/SettingsView.js';

import type { DiscoveredApp, McpServer, RiskFinding, ActivityEvent, ScanReport } from '../types/index.js';
import { apiRequest } from '../utils/api.js';

interface DashboardProps {
  initialSection?: string;
  onNavigateHome: () => void;
  onPreviewPublicTeam: () => void;
  onPreviewPublicDocs: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  initialSection = 'overview',
  onNavigateHome,
  onPreviewPublicTeam,
  onPreviewPublicDocs
}) => {
  const [currentSection, setCurrentSection] = useState(initialSection);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [loadingSample, setLoadingSample] = useState(false);

  // Global Telemetry State
  const [apps, setApps] = useState<DiscoveredApp[]>([]);
  const [mcpServers, setMcpServers] = useState<McpServer[]>([]);
  const [findings, setFindings] = useState<RiskFinding[]>([]);
  const [activityEvents, setActivityEvents] = useState<ActivityEvent[]>([]);
  const [scanReports, setScanReports] = useState<ScanReport[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAllData = async () => {
    try {
      const [a, m, f, ev, r] = await Promise.all([
        apiRequest<DiscoveredApp[]>('/api/apps').catch(() => []),
        apiRequest<McpServer[]>('/api/mcp-servers').catch(() => []),
        apiRequest<RiskFinding[]>('/api/findings').catch(() => []),
        apiRequest<ActivityEvent[]>('/api/activity-events').catch(() => []),
        apiRequest<ScanReport[]>('/api/scans').catch(() => [])
      ]);
      setApps(a);
      setMcpServers(m);
      setFindings(f);
      setActivityEvents(ev);
      setScanReports(r);
    } catch (err) {
      console.error('Error fetching dashboard telemetry:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  const handleLoadSample = async () => {
    try {
      setLoadingSample(true);
      await apiRequest('/api/scans/sample', { method: 'POST' });
      await fetchAllData();
      alert('Verified sample report from Aiteebar Windows Lab loaded successfully!');
    } catch (err: any) {
      alert(`Failed to load sample: ${err.message}`);
    } finally {
      setLoadingSample(false);
    }
  };

  const getSectionTitle = () => {
    switch (currentSection) {
      case 'overview': return 'Security Operations Overview';
      case 'apps': return 'AI Application Inventory';
      case 'mcp-servers': return 'Model Context Protocol (MCP) Servers';
      case 'findings': return 'Risk Findings & Triage';
      case 'activity': return 'Filesystem Activity Stream';
      case 'scans': return 'Scan Reports Archive';
      case 'team': return 'Team Management';
      case 'docs-mgmt': return 'Documentation Management';
      case 'integrations': return 'Python Scanner Integration & API Contract';
      case 'audit-log': return 'Security Audit Trail';
      case 'settings': return 'Platform Organization & Security Policies';
      default: return 'Security Dashboard';
    }
  };

  return (
    <div className="flex h-screen bg-[#070b14] text-slate-100 overflow-hidden font-sans">
      {/* Sidebar */}
      <Sidebar
        currentSection={currentSection}
        onSelectSection={setCurrentSection}
        onNavigateHome={onNavigateHome}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        <TopHeader
          currentSectionTitle={getSectionTitle()}
          onOpenImportModal={() => setIsImportModalOpen(true)}
          onLoadSample={handleLoadSample}
          loadingSample={loadingSample}
        />

        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          {loading ? (
            <div className="h-full flex items-center justify-center font-mono text-xs text-slate-500 animate-pulse">
              SYNCHRONIZING TELEMETRY STREAM...
            </div>
          ) : (
            <>
              {currentSection === 'overview' && (
                <DashboardOverview
                  apps={apps}
                  mcpServers={mcpServers}
                  findings={findings}
                  activityEvents={activityEvents}
                  scanReports={scanReports}
                  onNavigateSection={setCurrentSection}
                  onOpenImport={() => setIsImportModalOpen(true)}
                  onLoadSample={handleLoadSample}
                  loadingSample={loadingSample}
                />
              )}

              {currentSection === 'apps' && (
                <AppInventory
                  apps={apps}
                  onRefresh={fetchAllData}
                  onOpenImport={() => setIsImportModalOpen(true)}
                  onLoadSample={handleLoadSample}
                />
              )}

              {currentSection === 'mcp-servers' && (
                <McpInventory
                  servers={mcpServers}
                  onRefresh={fetchAllData}
                  onOpenImport={() => setIsImportModalOpen(true)}
                  onLoadSample={handleLoadSample}
                />
              )}

              {currentSection === 'findings' && (
                <RiskFindings
                  findings={findings}
                  onRefresh={fetchAllData}
                  onOpenImport={() => setIsImportModalOpen(true)}
                  onLoadSample={handleLoadSample}
                />
              )}

              {currentSection === 'activity' && (
                <ActivityMonitoring
                  events={activityEvents}
                  onOpenImport={() => setIsImportModalOpen(true)}
                  onLoadSample={handleLoadSample}
                />
              )}

              {currentSection === 'scans' && (
                <ScanReports
                  reports={scanReports}
                  onRefresh={fetchAllData}
                  onOpenImport={() => setIsImportModalOpen(true)}
                  onLoadSample={handleLoadSample}
                  loadingSample={loadingSample}
                />
              )}

              {currentSection === 'team' && (
                <TeamManagement onPreviewPublicTeam={onPreviewPublicTeam} />
              )}

              {currentSection === 'docs-mgmt' && (
                <DocsManagement onPreviewPublicDocs={onPreviewPublicDocs} />
              )}

              {currentSection === 'integrations' && <Integrations />}

              {currentSection === 'audit-log' && <AuditLogView />}

              {currentSection === 'settings' && <SettingsView />}
            </>
          )}
        </main>
      </div>

      {/* Import Modal */}
      <ImportReportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImportSuccess={fetchAllData}
      />
    </div>
  );
};
