import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  FileText,
  FileDown,
  Sparkles,
  RefreshCw,
  Save,
  Clock,
  ShieldCheck,
  AlertCircle,
  PlusCircle,
  CheckCircle2,
  ExternalLink,
  HelpCircle,
  ArrowLeft,
  Calendar,
  Layers,
  Info,
  ChevronRight,
  Download,
  FolderArchive,
  Compass,
  ShieldAlert,
  ListChecks,
  CheckCircle,
  Scale,
  Shield
} from 'lucide-react';
import { DashboardLayout } from '../components/DashboardLayout';
import { TimelineView } from '../components/TimelineView';
import { SourceBadge, CategoryBadge, IntegrityBadge } from '../components/StatusBadge';
import api from '../services/api';

export const CaseDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [caseDoc, setCaseDoc] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Editing state
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState('');
  const [editedDescription, setEditedDescription] = useState('');
  const [saving, setSaving] = useState(false);

  // AI & Export state
  const [regenerating, setRegenerating] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [downloadingZip, setDownloadingZip] = useState(false);
  const [downloadingFileId, setDownloadingFileId] = useState(null);

  useEffect(() => {
    fetchCase();
  }, [id]);

  const fetchCase = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/cases/${id}`);
      setCaseDoc(res.data.case);
      setEditedTitle(res.data.case.title);
      setEditedDescription(res.data.case.userDescription);
    } catch (err) {
      console.error('Failed to load case:', err);
      setError(err.response?.data?.error || 'Failed to load case.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveEdits = async () => {
    try {
      setSaving(true);
      const res = await api.put(`/cases/${id}`, {
        title: editedTitle.trim(),
        userDescription: editedDescription.trim(),
      });
      setCaseDoc(res.data.case);
      setIsEditing(false);
    } catch (err) {
      alert('Failed to save changes: ' + (err.response?.data?.error || err.message));
    } finally {
      setSaving(false);
    }
  };

  const handleRegenerate = async () => {
    try {
      setRegenerating(true);
      const res = await api.post(`/cases/${id}/analyze`);
      setCaseDoc(res.data.case);
    } catch (err) {
      alert('Analysis failed: ' + (err.response?.data?.error || err.message));
    } finally {
      setRegenerating(false);
    }
  };

  const handleExportPdf = async () => {
    try {
      setExporting(true);
      const res = await api.get(`/cases/${id}/export`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      const safeTitle = (caseDoc?.title || 'Case').replace(/[^a-zA-Z0-9_-]/g, '_');
      link.setAttribute('download', `ProofPath_Official_Case_Dossier_${safeTitle}_${id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch (err) {
      alert('Failed to export PDF: ' + err.message);
    } finally {
      setExporting(false);
    }
  };

  const handleDownloadZip = async () => {
    try {
      setDownloadingZip(true);
      const res = await api.get(`/cases/${id}/download-zip`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/zip' }));
      const link = document.createElement('a');
      link.href = url;
      const safeTitle = (caseDoc?.title || 'Case').replace(/[^a-zA-Z0-9_-]/g, '_');
      link.setAttribute('download', `ProofPath_Case_Bundle_${safeTitle}_${id}.zip`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch (err) {
      alert('Failed to download case bundle: ' + (err.response?.data?.error || err.message));
    } finally {
      setDownloadingZip(false);
    }
  };

  const handleDownloadEvidenceFile = async (evidenceId, originalFilename) => {
    try {
      setDownloadingFileId(evidenceId);
      const res = await api.get(`/evidence/${evidenceId}/file?download=true`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', originalFilename || `evidence_${evidenceId}`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch (err) {
      alert('Failed to download evidence file: ' + (err.response?.data?.error || err.message));
    } finally {
      setDownloadingFileId(null);
    }
  };

  if (loading) {
    return (
      <DashboardLayout title="Case Review" subtitle="Loading case timeline and analysis...">
        <div className="py-24 flex flex-col items-center justify-center gap-3">
          <div className="w-10 h-10 border-3 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm font-display font-bold text-purple-800">Retrieving Case Timeline...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !caseDoc) {
    return (
      <DashboardLayout title="Case Review">
        <div className="max-w-xl mx-auto py-12 text-center space-y-4">
          <AlertCircle className="w-14 h-14 text-rose-500 mx-auto" />
          <h2 className="font-display text-xl font-bold text-slate-900">Case Not Found</h2>
          <p className="text-sm text-slate-500">{error || 'You do not have permission to view this case.'}</p>
          <Link
            to="/cases"
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:opacity-95 text-white rounded-full text-xs font-bold shadow-md shadow-purple-500/20"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Cases</span>
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  const analysis = caseDoc.aiAnalysis || {};
  const evidenceList = caseDoc.evidenceIds || [];

  return (
    <DashboardLayout
      title={caseDoc.title}
      subtitle={`Category: ${caseDoc.issueType} • Incident Date: ${caseDoc.incidentDate || 'Undated'}`}
      actions={
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handleRegenerate}
            disabled={regenerating}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-white/80 hover:bg-white text-purple-700 text-xs font-bold border border-purple-200 shadow-sm transition disabled:opacity-50 hover:scale-[1.02] active:scale-[0.98]"
            title="Re-run evidentiary organization & strategic advice"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-purple-600 ${regenerating ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Re-Analyze & Advise</span>
          </button>

          <button
            onClick={handleExportPdf}
            disabled={exporting}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white hover:bg-purple-50 text-purple-900 text-xs font-bold border border-purple-200 shadow-sm transition disabled:opacity-50 hover:scale-[1.02] active:scale-[0.98]"
          >
            <FileDown className="w-4 h-4 text-purple-600" />
            <span>{exporting ? 'Generating PDF...' : 'Export Case Dossier (.PDF)'}</span>
          </button>

          <button
            onClick={handleDownloadZip}
            disabled={downloadingZip}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:opacity-95 text-white text-xs font-bold shadow-md shadow-purple-500/20 transition disabled:opacity-50 hover:scale-[1.02] active:scale-[0.98]"
          >
            <FolderArchive className="w-4 h-4" />
            <span>{downloadingZip ? 'Packaging ZIP...' : 'Download Complete Bundle (.ZIP)'}</span>
          </button>
        </div>
      }
    >
      <div className="max-w-5xl mx-auto space-y-8">
        <Link
          to="/cases"
          className="inline-flex items-center gap-2 text-xs font-bold text-purple-700 hover:text-purple-900 transition bg-purple-50/80 px-4 py-1.5 rounded-full border border-purple-200/80 w-fit"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to All Cases</span>
        </Link>

        {/* Header / Case Meta Banner */}
        <div className="cyber-card p-6 sm:p-8 space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-purple-100/80 pb-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3.5 py-1 rounded-full bg-purple-50 text-purple-700 font-bold text-xs border border-purple-200">
                {caseDoc.issueType}
              </span>
              <span className="px-3.5 py-1 rounded-full bg-indigo-50 text-indigo-700 font-mono text-xs font-bold border border-indigo-200">
                {evidenceList.length} Evidence Record{evidenceList.length === 1 ? '' : 's'}
              </span>
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-indigo-50 text-indigo-800 font-bold text-xs border border-indigo-200">
                <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
                Verified Evidentiary Record
              </span>
            </div>

            <div className="flex items-center gap-2">
              {isEditing ? (
                <>
                  <button
                    onClick={handleSaveEdits}
                    disabled={saving}
                    className="px-4 py-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:opacity-95 text-white font-bold text-xs rounded-full transition flex items-center gap-1.5 shadow-sm"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>{saving ? 'Saving...' : 'Save Changes'}</span>
                  </button>
                  <button
                    onClick={() => {
                      setEditedTitle(caseDoc.title);
                      setEditedDescription(caseDoc.userDescription);
                      setIsEditing(false);
                    }}
                    className="px-4 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-full transition"
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setIsEditing(true)}
                  className="text-xs text-purple-700 hover:text-purple-900 font-bold bg-purple-50 px-4 py-1.5 rounded-full border border-purple-200 hover:bg-purple-100 transition"
                >
                  Edit Narrative
                </button>
              )}
            </div>
          </div>

          {/* Title & Stated Description */}
          {isEditing ? (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 font-display uppercase tracking-wider">Case Title</label>
                <input
                  type="text"
                  value={editedTitle}
                  onChange={(e) => setEditedTitle(e.target.value)}
                  className="w-full px-4 py-3 bg-white/90 border border-purple-200 rounded-2xl text-base text-slate-900 focus:border-purple-600 focus:ring-4 focus:ring-purple-500/10 shadow-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 font-display uppercase tracking-wider">Statement of Claimant (Narrative)</label>
                <textarea
                  rows={4}
                  value={editedDescription}
                  onChange={(e) => setEditedDescription(e.target.value)}
                  className="w-full px-4 py-3 bg-white/90 border border-purple-200 rounded-2xl text-base text-slate-900 focus:border-purple-600 focus:ring-4 focus:ring-purple-500/10 resize-none leading-relaxed shadow-sm"
                />
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">{caseDoc.title}</h2>
              <div className="p-5 bg-amber-50/70 border border-amber-200/90 rounded-3xl space-y-1.5">
                <span className="text-[11px] font-mono font-bold text-amber-800 uppercase tracking-wider block">
                  STATEMENT OF CLAIMANT (Factual Narrative):
                </span>
                <p className="text-sm text-amber-950 italic leading-relaxed">
                  "{caseDoc.userDescription}"
                </p>
              </div>

              {/* Executive Legal Brief */}
              {analysis.executiveBrief && (
                <div className="p-6 bg-slate-900 text-slate-100 border border-slate-800 rounded-3xl space-y-2.5 shadow-md">
                  <div className="flex items-center gap-2 text-indigo-400">
                    <Scale className="w-4 h-4" />
                    <span className="text-[11px] font-mono font-bold uppercase tracking-wider">
                      EXECUTIVE LEGAL BRIEF & STATEMENT OF FACTS
                    </span>
                  </div>
                  <p className="text-sm text-slate-200 leading-relaxed font-sans whitespace-pre-line">
                    {analysis.executiveBrief}
                  </p>
                </div>
              )}

              {/* Formal Legal Claims */}
              {analysis.legalClaims?.length > 0 && (
                <div className="p-5 bg-indigo-50/70 border border-indigo-200/90 rounded-3xl space-y-2.5">
                  <div className="flex items-center gap-2 text-indigo-900">
                    <Shield className="w-4 h-4 text-indigo-600" />
                    <span className="text-[11px] font-mono font-bold uppercase tracking-wider">
                      FORMAL CAUSES OF ACTION / LEGAL GROUNDS ({analysis.legalClaims.length})
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mt-2">
                    {analysis.legalClaims.map((claim, idx) => (
                      <div key={idx} className="bg-white/90 border border-indigo-100 rounded-2xl p-3 text-xs font-semibold text-slate-800 flex items-start gap-2 shadow-2xs">
                        <span className="font-mono text-indigo-600 font-bold">#{idx + 1}</span>
                        <span>{claim}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Issue Summary (Fallback if no executive brief) */}
          {analysis.issueSummary && !analysis.executiveBrief && (
            <div className="p-5 bg-purple-50/50 border border-purple-100 rounded-3xl space-y-1.5">
              <span className="text-[11px] font-mono font-bold text-purple-700 uppercase tracking-wider block">
                ISSUE SUMMARY (Objective Synthesis):
              </span>
              <p className="text-sm text-slate-700 leading-relaxed font-normal">{analysis.issueSummary}</p>
            </div>
          )}
        </div>

        {/* Chronological Timeline Section */}
        <div className="cyber-card p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-purple-100/80 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-purple-600" />
                <h3 className="font-display text-lg font-extrabold text-slate-900">Chronological Case Timeline</h3>
              </div>
              <p className="text-sm text-slate-500 mt-1 font-normal">
                Every event cites its exact factual origin (Metadata, Stored Evidence, User statement).
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="px-3 py-1 rounded-full bg-purple-50 text-purple-700 font-bold border border-purple-200">
                Metadata
              </span>
              <span className="px-3 py-1 rounded-full bg-amber-50 text-amber-800 font-bold border border-amber-200">
                User statement
              </span>
              <span className="px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 font-bold border border-indigo-200">
                Evidence
              </span>
            </div>
          </div>

          <TimelineView timeline={analysis.timeline} evidenceList={evidenceList} />
        </div>

        {/* Preserved Evidence Index (E-001, E-002...) */}
        <div className="cyber-card p-6 sm:p-8 space-y-5">
          <div className="flex items-center justify-between border-b border-purple-100/80 pb-3">
            <div className="flex items-center gap-2">
              <Layers className="w-5 h-5 text-purple-600" />
              <h3 className="font-display text-base font-bold text-slate-900 uppercase tracking-wider">
                Preserved Evidence Index ({evidenceList.length})
              </h3>
            </div>
            <Link
              to="/vault"
              className="text-xs font-bold text-purple-700 hover:text-purple-900 bg-purple-50 px-3.5 py-1 rounded-full border border-purple-200"
            >
              Open Vault
            </Link>
          </div>

          {evidenceList.length === 0 ? (
            <p className="text-sm text-slate-500">No evidence items attached to this case.</p>
          ) : (
            <div className="space-y-3.5">
              {evidenceList.map((ev, idx) => {
                const refCode = `E-${String(idx + 1).padStart(3, '0')}`;
                const meta = ev.metadata || {};

                return (
                  <div
                    key={ev._id}
                    className="p-5 rounded-3xl bg-white/70 border border-purple-100 hover:border-purple-300 transition space-y-2.5 shadow-sm"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <span className="font-mono text-xs font-bold text-purple-700 px-3 py-1 bg-purple-50 border border-purple-200 rounded-full">
                          {refCode}
                        </span>
                        <Link
                          to={`/evidence/${ev._id}`}
                          className="font-display font-bold text-base text-slate-900 hover:text-purple-700 transition"
                        >
                          {ev.title}
                        </Link>
                        <CategoryBadge category={ev.category} />
                      </div>

                      <div className="flex items-center gap-2">
                        <IntegrityBadge />
                        <button
                          onClick={() => handleDownloadEvidenceFile(ev._id, ev.originalFilename)}
                          disabled={downloadingFileId === ev._id}
                          className="inline-flex items-center gap-1.5 px-3 py-1 bg-purple-50 hover:bg-purple-100 text-purple-700 text-xs font-bold rounded-full border border-purple-200 transition"
                          title="Download Evidence File"
                        >
                          <Download className="w-3.5 h-3.5 text-purple-600" />
                          <span>{downloadingFileId === ev._id ? 'Downloading...' : 'Download File'}</span>
                        </button>
                        <Link
                          to={`/evidence/${ev._id}`}
                          className="text-xs text-slate-400 hover:text-purple-700 p-1"
                          title="Inspect Evidence"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Link>
                      </div>
                    </div>

                    <p className="text-sm text-slate-600 font-normal">{ev.description || 'No description provided.'}</p>

                    {/* Evidentiary Proof Assessment */}
                    {(() => {
                      const proof = analysis.evidenceProofAssessments?.find(
                        (p) => String(p.evidenceId) === String(ev._id)
                      );
                      if (!proof) return null;
                      return (
                        <div className="mt-3 p-3.5 bg-purple-50/60 border border-purple-200/80 rounded-2xl space-y-2">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <div className="flex items-center gap-1.5 text-purple-900 font-mono text-[11px] font-bold uppercase tracking-wider">
                              <Scale className="w-3.5 h-3.5 text-purple-600" />
                              <span>Evidentiary Finding & Probative Status</span>
                            </div>
                            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-purple-100 text-purple-800 border border-purple-200 font-mono">
                              {proof.probativeValue || 'Direct Corroboration'}
                            </span>
                          </div>
                          <p className="text-xs text-slate-700 leading-relaxed font-medium">
                            {proof.finding}
                          </p>
                          {proof.verifiableElements?.length > 0 && (
                            <div className="flex flex-wrap items-center gap-1.5 pt-1">
                              <span className="text-[10px] font-mono text-purple-700 font-bold uppercase">Verified:</span>
                              {proof.verifiableElements.map((elem, i) => (
                                <span key={i} className="px-2 py-0.5 bg-white text-slate-700 rounded-md text-[10px] font-mono border border-purple-100 shadow-2xs">
                                  {elem}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })()}

                    <div className="pt-3 border-t border-purple-100 flex flex-wrap items-center justify-between gap-2 text-xs font-mono text-slate-500 font-medium">
                      <span>File: {ev.originalFilename} ({(ev.fileSize / 1024).toFixed(1)} KB)</span>
                      <span>
                        EXIF Date: {meta.dateTimeOriginal ? new Date(meta.dateTimeOriginal).toLocaleString() : 'Not available'}
                      </span>
                      <span className="truncate max-w-[220px]" title={ev.sha256}>
                        SHA-256: {ev.sha256.substring(0, 16)}...
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Evidentiary Strategy & Case Advisory */}
        {analysis.caseAdvice && (
          <div className="cyber-card p-6 sm:p-8 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-purple-100/80 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-purple-500/20">
                  <Compass className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-display text-xl font-extrabold text-slate-900">
                    Evidentiary Strategy & Case Advisory
                  </h3>
                  <p className="text-sm text-slate-500 font-normal">
                    Strategic assessment of case strengths, vulnerabilities, and recommended action steps.
                  </p>
                </div>
              </div>

              {/* Evidentiary Readiness Score Gauge */}
              {analysis.caseAdvice.credibilityScore && (
                <div className="bg-purple-50/80 border border-purple-200/90 rounded-2xl px-5 py-3 flex items-center gap-4">
                  <div>
                    <span className="text-[10px] font-mono font-bold text-purple-700 uppercase tracking-wider block">
                      Readiness Score
                    </span>
                    <span className="font-display font-extrabold text-2xl text-purple-950">
                      {analysis.caseAdvice.credibilityScore.score}
                      <span className="text-sm font-normal text-purple-600">/100</span>
                    </span>
                  </div>
                  <div className="h-8 w-px bg-purple-200" />
                  <div>
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                      analysis.caseAdvice.credibilityScore.score >= 80
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : analysis.caseAdvice.credibilityScore.score >= 68
                        ? 'bg-indigo-100 text-indigo-800 border border-indigo-300'
                        : 'bg-amber-100 text-amber-800 border border-amber-300'
                    }`}>
                      {analysis.caseAdvice.credibilityScore.rating}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {analysis.caseAdvice.credibilityScore?.rationale && (
              <p className="text-xs text-slate-600 italic bg-purple-50/40 p-3 rounded-2xl border border-purple-100 font-normal">
                {analysis.caseAdvice.credibilityScore.rationale}
              </p>
            )}

            {/* Strengths & Vulnerabilities Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Strengths */}
              <div className="p-5 rounded-3xl bg-emerald-50/50 border border-emerald-200/70 space-y-3">
                <h4 className="font-display text-sm font-bold text-emerald-900 uppercase tracking-wider flex items-center gap-2 border-b border-emerald-200/50 pb-2">
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                  <span>Evidentiary Strengths</span>
                </h4>
                {analysis.caseAdvice.strengths?.length === 0 ? (
                  <p className="text-xs text-emerald-700 italic">No specific strengths cataloged yet.</p>
                ) : (
                  <ul className="space-y-2.5 text-xs text-slate-700">
                    {analysis.caseAdvice.strengths.map((str, i) => (
                      <li key={i} className="flex items-start gap-2.5 leading-relaxed font-normal">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                        <span>{str}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Vulnerabilities & Gaps */}
              <div className="p-5 rounded-3xl bg-rose-50/50 border border-rose-200/70 space-y-3">
                <h4 className="font-display text-sm font-bold text-rose-900 uppercase tracking-wider flex items-center gap-2 border-b border-rose-200/50 pb-2">
                  <ShieldAlert className="w-4 h-4 text-rose-600" />
                  <span>Potential Gaps & Counterarguments</span>
                </h4>
                {analysis.caseAdvice.vulnerabilities?.length === 0 ? (
                  <p className="text-xs text-rose-700 italic">No significant evidentiary vulnerabilities identified.</p>
                ) : (
                  <ul className="space-y-2.5 text-xs text-slate-700">
                    {analysis.caseAdvice.vulnerabilities.map((vuln, i) => (
                      <li key={i} className="flex items-start gap-2.5 leading-relaxed font-normal">
                        <AlertCircle className="w-4 h-4 text-rose-500 flex-shrink-0 mt-0.5" />
                        <span>{vuln}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            {/* Strategic Next Steps & Recommendations */}
            {analysis.caseAdvice.recommendations?.length > 0 && (
              <div className="p-5 rounded-3xl bg-purple-50/50 border border-purple-200/70 space-y-3">
                <h4 className="font-display text-sm font-bold text-purple-950 uppercase tracking-wider flex items-center gap-2 border-b border-purple-200/50 pb-2">
                  <ListChecks className="w-4 h-4 text-purple-700" />
                  <span>Strategic Next Steps for Case Builder</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {analysis.caseAdvice.recommendations.map((rec, i) => (
                    <div
                      key={i}
                      className="p-3.5 rounded-2xl bg-white/80 border border-purple-100 flex items-start gap-3 shadow-xs"
                    >
                      <div className="w-6 h-6 rounded-full bg-purple-600 text-white font-mono font-bold text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                        {i + 1}
                      </div>
                      <p className="text-xs text-slate-700 leading-relaxed font-normal">
                        {rec}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Legal Preparation Guidance */}
            {analysis.caseAdvice.legalPreparationTips?.length > 0 && (
              <div className="p-5 rounded-3xl bg-indigo-50/40 border border-indigo-100 space-y-2.5">
                <h4 className="font-display text-xs font-bold text-indigo-950 uppercase tracking-wider">
                  Preparation Tips for Counsel or Dispute Tribunals:
                </h4>
                <ul className="space-y-1.5 text-xs text-indigo-950">
                  {analysis.caseAdvice.legalPreparationTips.map((tip, i) => (
                    <li key={i} className="flex items-start gap-2 leading-relaxed">
                      <span className="text-indigo-600 font-bold">•</span>
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Observations & Missing Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Observations */}
          <div className="cyber-card p-6 space-y-3">
            <h4 className="font-display text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2 border-b border-purple-100 pb-2.5">
              <Sparkles className="w-4 h-4 text-purple-600" />
              <span>Evidence Observations</span>
            </h4>
            {analysis.evidenceObservations?.length === 0 ? (
              <p className="text-sm text-slate-500">No observations generated yet.</p>
            ) : (
              <ul className="space-y-2.5 text-sm text-slate-600">
                {analysis.evidenceObservations.map((obs, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-purple-600 mt-1 font-bold">•</span>
                    <span className="leading-relaxed font-normal">{obs}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Missing Information / Inquiries */}
          <div className="cyber-card p-6 space-y-3">
            <h4 className="font-display text-sm font-bold text-amber-800 uppercase tracking-wider flex items-center gap-2 border-b border-amber-100 pb-2.5">
              <HelpCircle className="w-4 h-4 text-amber-600" />
              <span>Missing Information & Inquiries</span>
            </h4>
            {analysis.missingInformation?.length === 0 ? (
              <p className="text-sm text-slate-500">No missing corroboration identified.</p>
            ) : (
              <ul className="space-y-2.5 text-sm text-slate-600">
                {analysis.missingInformation.map((m, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-amber-600 mt-1 font-bold">•</span>
                    <span className="leading-relaxed font-normal">{m}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Mandatory Evidentiary Disclaimer */}
        <div className="p-6 rounded-3xl bg-purple-50/70 border border-purple-100 text-xs text-purple-950 space-y-1.5 shadow-sm">
          <span className="font-bold text-purple-950 flex items-center gap-2 font-display text-sm">
            <Info className="w-4 h-4 text-purple-600" />
            Evidentiary Notice
          </span>
          <p className="leading-relaxed font-medium">
            ProofPath organizes factual information and file metadata. ProofPath does not determine whether an allegation has been conclusively proven. Phrases such as "may support" or "is consistent with" reflect factual alignment between metadata and statements, not legal rulings.
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
};
