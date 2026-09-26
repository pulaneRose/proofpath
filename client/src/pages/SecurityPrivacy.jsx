import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Lock,
  Database,
  Trash2,
  FileCheck,
  AlertTriangle,
  Fingerprint,
  Layers,
  KeyRound
} from 'lucide-react';
import { DashboardLayout } from '../components/DashboardLayout';
import api from '../services/api';

export const SecurityPrivacy = () => {
  const [evidenceCount, setEvidenceCount] = useState(0);
  const [caseCount, setCaseCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const [evRes, caseRes] = await Promise.all([
          api.get('/evidence'),
          api.get('/cases'),
        ]);
        setEvidenceCount(evRes.data.count || 0);
        setCaseCount(caseRes.data.count || 0);
      } catch (err) {
        console.error('Failed to load security counts:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchCounts();
  }, []);

  return (
    <DashboardLayout
      title="Security & Privacy Controls"
      subtitle="Cryptographic integrity guarantees, private storage policies, and user ownership model"
    >
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Top Summary Banner */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="cyber-card p-6">
            <div className="flex items-center gap-3.5">
              <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 shadow-sm">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider font-display">Preserved Files</p>
                <h4 className="font-display text-2xl sm:text-3xl font-extrabold text-slate-900">{loading ? '...' : evidenceCount} files</h4>
              </div>
            </div>
            <p className="text-xs text-emerald-700 mt-3 font-mono font-bold">100% SHA-256 Hashed</p>
          </div>

          <div className="cyber-card p-6">
            <div className="flex items-center gap-3.5">
              <div className="p-3.5 rounded-2xl bg-purple-50 border border-purple-200 text-purple-700 shadow-sm">
                <Lock className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider font-display">Storage Architecture</p>
                <h4 className="font-display text-2xl sm:text-3xl font-extrabold text-slate-900">Private Vault</h4>
              </div>
            </div>
            <p className="text-xs text-purple-700 mt-3 font-mono font-bold">Zero Public File URLs</p>
          </div>

          <div className="cyber-card p-6">
            <div className="flex items-center gap-3.5">
              <div className="p-3.5 rounded-2xl bg-indigo-50 border border-indigo-200 text-indigo-700 shadow-sm">
                <Layers className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider font-display">Referenced In</p>
                <h4 className="font-display text-2xl sm:text-3xl font-extrabold text-slate-900">{loading ? '...' : caseCount} cases</h4>
              </div>
            </div>
            <p className="text-xs text-indigo-700 mt-3 font-mono font-bold">Factual Timeline Tracing</p>
          </div>
        </div>

        {/* Core Principles */}
        <div className="cyber-card p-6 sm:p-8 space-y-6">
          <div className="flex items-center gap-3 border-b border-purple-100/80 pb-4">
            <Fingerprint className="w-6 h-6 text-purple-600" />
            <div>
              <h3 className="font-display text-xl font-extrabold text-slate-900">
                Tamper-Evident Integrity vs. User-Controlled Deletion
              </h3>
              <p className="text-sm text-slate-500 font-normal">ProofPath’s responsible evidentiary design</p>
            </div>
          </div>

          <div className="space-y-4 text-sm text-slate-600 leading-relaxed font-normal">
            <p>
              In evidence preservation systems, terms like "immutable blockchain" or "guaranteed legal win" create false confidence. ProofPath adheres to precise legal-tech principles:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
              <div className="p-6 rounded-3xl bg-emerald-50/50 border border-emerald-200/80 space-y-2">
                <div className="flex items-center gap-2 text-emerald-800 font-bold text-xs uppercase tracking-wider font-display">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Tamper-Evident Integrity</span>
                </div>
                <p className="text-slate-700 text-xs sm:text-sm leading-relaxed font-normal">
                  Every uploaded file is passed through the SHA-256 cryptographic hash function upon upload. If any byte changes in storage, re-running verification immediately flags an <strong className="text-slate-900 font-semibold">Integrity Mismatch</strong>.
                </p>
              </div>

              <div className="p-6 rounded-3xl bg-purple-50/50 border border-purple-200/80 space-y-2">
                <div className="flex items-center gap-2 text-purple-800 font-bold text-xs uppercase tracking-wider font-display">
                  <Trash2 className="w-4 h-4 text-purple-600" />
                  <span>User-Controlled Deletion</span>
                </div>
                <p className="text-slate-700 text-xs sm:text-sm leading-relaxed font-normal">
                  You retain complete privacy rights over your data. ProofPath allows you to permanently delete any evidence item or case. If evidence is referenced by active cases, ProofPath issues a clear confirmation prompt before removal.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Data Isolation & Security Safeguards */}
        <div className="cyber-card p-6 sm:p-8 space-y-5">
          <div className="flex items-center gap-3 border-b border-purple-100/80 pb-4">
            <KeyRound className="w-6 h-6 text-purple-600" />
            <div>
              <h3 className="font-display text-xl font-extrabold text-slate-900">Ownership Isolation Safeguards</h3>
              <p className="text-sm text-slate-500 font-normal">Backend multi-tenant security enforcement</p>
            </div>
          </div>

          <ul className="space-y-4 text-sm text-slate-600 font-normal">
            <li className="flex items-start gap-3">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-600 mt-2 flex-shrink-0"></span>
              <div>
                <strong className="text-slate-900 font-bold">Authenticated File Streaming:</strong> Evidence files are never stored in the web server's public document root. Every download and image preview stream requires a valid JWT session and explicitly checks <code className="bg-purple-50 text-purple-700 px-2 py-0.5 rounded-md font-mono text-xs">userId === record.userId</code>.
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-600 mt-2 flex-shrink-0"></span>
              <div>
                <strong className="text-slate-900 font-bold">No Blind ID Lookups:</strong> Every database query for evidence or cases scopes strictly to the authenticated user ID. Attempting to fetch another user's evidence ID returns a 403 or 404 response.
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-600 mt-2 flex-shrink-0"></span>
              <div>
                <strong className="text-slate-900 font-bold">Never Fabricate Metadata:</strong> If EXIF metadata (such as GPS coordinates or camera capture timestamps) is absent from an image, ProofPath explicitly labels it <em>"Not available"</em>. It never estimates, guesses, or fabricates missing coordinates.
              </div>
            </li>
          </ul>
        </div>

        {/* Limitations Notice */}
        <div className="p-6 sm:p-7 rounded-3xl bg-amber-50/80 border border-amber-200 text-sm text-amber-950 space-y-2 shadow-sm">
          <div className="flex items-center gap-2 font-bold text-amber-900 font-display">
            <AlertTriangle className="w-5 h-5 text-amber-600" />
            <span>Evidentiary Scope & Legal Limitations</span>
          </div>
          <p className="text-amber-900/90 leading-relaxed font-normal">
            ProofPath preserves files and calculates cryptographic hashes. A SHA-256 hash confirms that a file has not been altered after upload; it cannot independently prove that the file was truthful, unedited, or authentic before you uploaded it to ProofPath. Legal admissibility remains subject to the rules of evidence in your relevant jurisdiction.
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
};
