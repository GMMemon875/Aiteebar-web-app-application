import React, { useState, useEffect } from 'react';
import { 
  Terminal, 
  Key, 
  Copy, 
  Check, 
  RefreshCw, 
  Code2, 
  ShieldAlert, 
  FolderCheck, 
  FileJson,
  Layers
} from 'lucide-react';
import type { PlatformSettings } from '../../types/index.js';
import { apiRequest } from '../../utils/api.js';
import { useAuth } from '../../context/AuthContext.js';

export const Integrations: React.FC = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const [settings, setSettings] = useState<PlatformSettings | null>(null);
  const [copiedKey, setCopiedKey] = useState(false);
  const [copiedCurl, setCopiedCurl] = useState(false);
  const [copiedPython, setCopiedPython] = useState(false);
  const [regenerating, setRegenerating] = useState(false);

  const fetchSettings = async () => {
    try {
      const data = await apiRequest<PlatformSettings>('/api/settings');
      setSettings(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleRegenerateKey = async () => {
    if (!confirm('Regenerating this key will invalidate all existing Python agents until updated. Continue?')) return;
    try {
      setRegenerating(true);
      const res = await apiRequest<{ agentApiKey: string }>('/api/settings/regenerate-agent-key', { method: 'POST' });
      if (settings) {
        setSettings({ ...settings, agentApiKey: res.agentApiKey });
      }
    } catch (err: any) {
      alert(`Failed to regenerate key: ${err.message}`);
    } finally {
      setRegenerating(false);
    }
  };

  const copyToClipboard = (text: string, setter: (v: boolean) => void) => {
    navigator.clipboard.writeText(text);
    setter(true);
    setTimeout(() => setter(false), 2000);
  };

  const currentHost = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
  const apiKey = settings?.agentApiKey || 'YOUR_AGENT_API_KEY';

  const sampleCurl = `curl -X POST "${currentHost}/api/agent/v1/report" \\
  -H "Authorization: Bearer ${apiKey}" \\
  -H "Content-Type: application/json" \\
  -d @scan_report.json`;

  const pythonSyncSnippet = `# aiteebar_sync_extension.py
import json
import urllib.request

API_URL = "${currentHost}/api/agent/v1/report"
API_KEY = "${apiKey}"

def sync_report(report_path="scan_report.json"):
    with open(report_path, "r", encoding="utf-8") as f:
        data = json.load(f)

    req = urllib.request.Request(
        API_URL,
        data=json.dumps(data).encode("utf-8"),
        headers={
            "Authorization": f"Bearer {API_KEY}",
            "Content-Type": "application/json",
            "User-Agent": "AiteebarMiniScanner/0.2.1"
        },
        method="POST"
    )

    try:
        with urllib.request.urlopen(req) as resp:
            result = json.loads(resp.read().decode("utf-8"))
            print(f"[+] Synchronized successfully: Report ID {result.get('reportId')}")
    except Exception as e:
        print(f"[-] Failed to sync report: {e}")

if __name__ == "__main__":
    sync_report()
`;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-white tracking-tight">
          Python Scanner Integration & REST Contract
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Bridge your existing Windows scanner in <code className="text-cyan-300 font-mono">C:\Users\kamran\Desktop\Aiteebar-Lab</code> with the Aiteebar central security platform.
        </p>
      </div>

      {/* Target Component Blueprint */}
      <div className="p-5 rounded-xl bg-slate-900/70 border border-slate-800 space-y-3">
        <h3 className="text-sm font-bold text-white flex items-center space-x-2">
          <Layers className="w-4 h-4 text-cyan-400" />
          <span>Local Lab Artifacts (C:\Users\kamran\Desktop\Aiteebar-Lab)</span>
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
          <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800 font-mono">
            <span className="text-cyan-400 font-bold block mb-1">aiteebar_mini_scanner.py</span>
            <span className="text-slate-400 text-[11px]">Discovers candidate paths & Cursor MCP settings.</span>
          </div>
          <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800 font-mono">
            <span className="text-teal-400 font-bold block mb-1">risk_engine.py</span>
            <span className="text-slate-400 text-[11px]">Evaluates version pinning & suspicious commands.</span>
          </div>
          <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800 font-mono">
            <span className="text-purple-400 font-bold block mb-1">activity_monitor.py</span>
            <span className="text-slate-400 text-[11px]">Monitors filesystem events with Watchdog library.</span>
          </div>
        </div>
      </div>

      {/* Agent Authentication Key */}
      <div className="p-5 rounded-xl bg-slate-900/70 border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center space-x-2">
              <Key className="w-4 h-4 text-cyan-400" />
              <span>Scanner Agent API Key</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Pass this token in the <code className="text-cyan-300 font-mono">Authorization: Bearer &lt;key&gt;</code> header.
            </p>
          </div>

          {isAdmin && (
            <button
              onClick={handleRegenerateKey}
              disabled={regenerating}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 hover:text-white border border-slate-700 flex items-center space-x-1.5 self-start sm:self-auto"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${regenerating ? 'animate-spin' : ''}`} />
              <span>Regenerate Key</span>
            </button>
          )}
        </div>

        <div className="flex items-center space-x-2">
          <div className="flex-1 p-2.5 rounded-lg bg-slate-950 border border-slate-800 font-mono text-xs text-cyan-300 truncate">
            {apiKey}
          </div>
          <button
            onClick={() => copyToClipboard(apiKey, setCopiedKey)}
            className="p-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700"
            title="Copy Key"
          >
            {copiedKey ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Synchronize via Python Script */}
      <div className="p-5 rounded-xl bg-slate-900/70 border border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white flex items-center space-x-2">
            <Code2 className="w-4 h-4 text-teal-400" />
            <span>Automated Synchronization Python Script</span>
          </h3>
          <button
            onClick={() => copyToClipboard(pythonSyncSnippet, setCopiedPython)}
            className="px-3 py-1 rounded bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 hover:text-white flex items-center space-x-1 border border-slate-700"
          >
            {copiedPython ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>Copy Python Code</span>
          </button>
        </div>
        <p className="text-xs text-slate-400">
          Run this helper in your Windows lab to upload <code className="text-cyan-300 font-mono">scan_report.json</code> immediately after scanning completes:
        </p>
        <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-slate-300 overflow-x-auto leading-relaxed">
          {pythonSyncSnippet}
        </pre>
      </div>

      {/* cURL Ingestion Test */}
      <div className="p-5 rounded-xl bg-slate-900/70 border border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white flex items-center space-x-2">
            <Terminal className="w-4 h-4 text-purple-400" />
            <span>cURL Command Line Ingestion</span>
          </h3>
          <button
            onClick={() => copyToClipboard(sampleCurl, setCopiedCurl)}
            className="px-3 py-1 rounded bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 hover:text-white flex items-center space-x-1 border border-slate-700"
          >
            {copiedCurl ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>Copy cURL</span>
          </button>
        </div>
        <pre className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono text-cyan-300 overflow-x-auto">
          {sampleCurl}
        </pre>
      </div>
    </div>
  );
};
