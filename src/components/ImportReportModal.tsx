import React, { useState } from 'react';
import { X, Upload, FileCode, AlertCircle, CheckCircle2, Shield } from 'lucide-react';
import { apiRequest } from '../utils/api.js';

interface ImportReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportSuccess: () => void;
}

export const ImportReportModal: React.FC<ImportReportModalProps> = ({
  isOpen,
  onClose,
  onImportSuccess
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [rawJsonText, setRawJsonText] = useState('');
  const [activeTab, setActiveTab] = useState<'file' | 'raw'>('file');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      if (activeTab === 'file') {
        if (!selectedFile) {
          setErrorMsg('Please select a JSON scan report file to import.');
          setLoading(false);
          return;
        }

        const formData = new FormData();
        formData.append('reportFile', selectedFile);

        const res = await apiRequest('/api/scans/import', {
          method: 'POST',
          body: formData
        });

        setSuccessMsg(`Successfully ingested report from ${res.scannedTarget} (Scanner v${res.scannerVersion}).`);
        setTimeout(() => {
          onImportSuccess();
          onClose();
        }, 1000);
      } else {
        if (!rawJsonText.trim()) {
          setErrorMsg('Please paste valid JSON report content.');
          setLoading(false);
          return;
        }

        let parsed: any;
        try {
          parsed = JSON.parse(rawJsonText);
        } catch (err: any) {
          setErrorMsg(`Malformed JSON syntax: ${err.message}`);
          setLoading(false);
          return;
        }

        const res = await apiRequest('/api/scans/import', {
          method: 'POST',
          body: JSON.stringify({ reportJson: parsed })
        });

        setSuccessMsg(`Report ingested successfully: ${res.summary.totalApps} apps, ${res.summary.highFindings} high findings.`);
        setTimeout(() => {
          onImportSuccess();
          onClose();
        }, 1000);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to ingest scan report.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="w-full max-w-lg rounded-2xl bg-slate-900 border border-cyan-500/30 p-6 shadow-[0_10px_40px_rgba(0,0,0,0.6)]">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-cyan-950 border border-cyan-500/40 flex items-center justify-center">
              <Upload className="w-4 h-4 text-cyan-400" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Import Python Scan Report</h3>
              <p className="text-xs text-slate-400">Ingest scan_report.json produced by aiteebar_mini_scanner.py</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Feedback Messages */}
        {errorMsg && (
          <div className="mt-4 p-3 rounded-lg bg-red-950/70 border border-red-500/40 text-xs text-red-300 flex items-start space-x-2">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}
        {successMsg && (
          <div className="mt-4 p-3 rounded-lg bg-emerald-950/70 border border-emerald-500/40 text-xs text-emerald-300 flex items-start space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Tab switch */}
        <div className="flex space-x-2 mt-4 p-1 rounded-lg bg-slate-950 border border-slate-800">
          <button
            type="button"
            onClick={() => setActiveTab('file')}
            className={`flex-1 py-1.5 rounded-md text-xs font-medium transition-all ${
              activeTab === 'file'
                ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Upload JSON File
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('raw')}
            className={`flex-1 py-1.5 rounded-md text-xs font-medium transition-all ${
              activeTab === 'raw'
                ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Paste Raw JSON
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {activeTab === 'file' ? (
            <div className="border-2 border-dashed border-slate-700 hover:border-cyan-500/50 rounded-xl p-6 text-center cursor-pointer transition-colors bg-slate-950/40">
              <input
                type="file"
                id="file-input"
                accept=".json,.jsonl"
                className="hidden"
                onChange={e => {
                  if (e.target.files && e.target.files[0]) {
                    setSelectedFile(e.target.files[0]);
                  }
                }}
              />
              <label htmlFor="file-input" className="cursor-pointer">
                <FileCode className="w-10 h-10 text-cyan-400 mx-auto mb-2" />
                <span className="text-xs font-semibold text-slate-200 block">
                  {selectedFile ? selectedFile.name : 'Click to select scan_report.json'}
                </span>
                <span className="text-[11px] text-slate-500 block mt-1">
                  Supports standardized Aiteebar Python scanner JSON output (max 5MB)
                </span>
              </label>
            </div>
          ) : (
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Raw JSON Payload
              </label>
              <textarea
                rows={8}
                value={rawJsonText}
                onChange={e => setRawJsonText(e.target.value)}
                placeholder='{\n  "scanner_version": "0.2.1-py",\n  "scanned_target": "WORKSTATION-1",\n  "discovered_apps": [...],\n  "mcp_servers": [...],\n  "findings": [...]\n}'
                className="w-full p-3 rounded-lg bg-slate-950 border border-slate-700 text-xs font-mono text-cyan-300 focus:outline-none focus:border-cyan-500"
              />
            </div>
          )}

          {/* Note on untrusted validation */}
          <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800 text-[11px] text-slate-400 flex items-start space-x-2">
            <Shield className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
            <span>
              All imported reports are validated, sanitized, and stored as immutable audit records in the database.
            </span>
          </div>

          {/* Modal Actions */}
          <div className="flex items-center justify-end space-x-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-teal-500 text-slate-950 font-bold text-xs hover:from-cyan-400 hover:to-teal-400 transition-all shadow-[0_0_15px_rgba(6,182,212,0.3)] disabled:opacity-60"
            >
              {loading ? 'Ingesting...' : 'Ingest Report'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
