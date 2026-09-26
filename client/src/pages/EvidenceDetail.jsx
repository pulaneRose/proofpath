import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  FolderLock,
  Download,
  ShieldCheck,
  Briefcase,
  Trash2,
  Calendar,
  Clock,
  MapPin,
  Camera,
  Layers,
  ArrowLeft,
  AlertTriangle,
  FileText,
  Image as ImageIcon,
  CheckCircle2,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { DashboardLayout } from '../components/DashboardLayout';
import { CategoryBadge, IntegrityBadge } from '../components/StatusBadge';
import { IntegrityModal } from '../components/IntegrityModal';
import api from '../services/api';

export const EvidenceDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [evidence, setEvidence] = useState(null);
  const [linkedCases, setLinkedCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Integrity Verification state
  const [verifyModalOpen, setVerifyModalOpen] = useState(false);
  const [verifyResult, setVerifyResult] = useState(null);
  const [verifying, setVerifying] = useState(false);

  // Deletion modal state
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchDetail();
  }, [id]);

  const fetchDetail = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/evidence/${id}`);
      setEvidence(res.data.evidence);
      setLinkedCases(res.data.linkedCases || []);
    } catch (err) {
      console.error('Failed to load evidence record:', err);
      setError(err.response?.data?.error || 'Evidence record could not be loaded.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    setVerifyResult(null);
    setVerifying(true);
    setVerifyModalOpen(true);

    try {
      const res = await api.post(`/evidence/${id}/verify`);
      setVerifyResult(res.data);
    } catch (err) {
      setVerifyResult({
        valid: false,
        status: 'Verification failed',
        message: err.response?.data?.error || err.message,
        recordedHash: evidence?.sha256,
        calculatedHash: 'Error calculating hash',
      });
    } finally {
      setVerifying(false);
    }
  };

  const handleDownload = async () => {
    try {
      const res = await api.get(`/evidence/${id}/file?download=true`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', evidence.originalFilename || 'evidence-file');
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch (err) {
      alert('Could not download evidence file: ' + err.message);
    }
  };

  const handleDelete = async (force = false) => {
    setDeleting(true);
    try {
      await api.delete(`/evidence/${id}${force ? '?force=true' : ''}`);
      navigate('/vault');
    } catch (err) {
      if (err.response?.status === 409) {
        if (confirm(`${err.response.data.error}\nDo you still wish to delete this evidence from all cases?`)) {
          handleDelete(true);
        }
      } else {
        alert('Deletion failed: ' + (err.response?.data?.error || err.message));
      }
    } finally {
      setDeleting(false);
      setDeleteConfirmOpen(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout title="Evidence Record" subtitle="Loading details...">
        <div className="py-24 flex flex-col items-center justify-center gap-3">
          <div className="w-10 h-10 border-3 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm font-display font-bold text-purple-800">Retrieving Vault Record...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !evidence) {
    return (
      <DashboardLayout title="Evidence Record">
        <div className="max-w-xl mx-auto py-12 text-center space-y-4">
          <AlertTriangle className="w-14 h-14 text-rose-500 mx-auto" />
          <h2 className="font-display text-xl font-bold text-slate-900">Record Not Found</h2>
          <p className="text-sm text-slate-500">{error || 'You do not have permission to access this evidence.'}</p>
          <Link
            to="/vault"
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:opacity-95 text-white rounded-full text-xs font-bold shadow-md shadow-purple-500/20"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Vault</span>
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  const isImage = evidence.mimeType?.startsWith('image/');
  const meta = evidence.metadata || {};

  return (
    <DashboardLayout
      title={evidence.title}
      subtitle={`Preserved in Vault: ${new Date(evidence.uploadTimestamp).toLocaleString()}`}
      actions={
        <div className="flex items-center gap-3">
          <button
            onClick={handleVerify}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold border border-emerald-200 shadow-sm transition hover:scale-[1.02] active:scale-[0.98]"
          >
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Verify Integrity</span>
          </button>
          <button
            onClick={handleDownload}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:opacity-95 text-white text-xs font-bold shadow-md shadow-purple-500/20 transition hover:scale-[1.02] active:scale-[0.98]"
          >
            <Download className="w-4 h-4" />
            <span>Download</span>
          </button>
        </div>
      }
    >
      <div className="space-y-6 max-w-5xl mx-auto">
        <Link
          to="/vault"
          className="inline-flex items-center gap-2 text-xs font-bold text-purple-700 hover:text-purple-900 transition bg-purple-50/80 px-4 py-1.5 rounded-full border border-purple-200/80 w-fit"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Evidence Vault</span>
        </Link>

        {/* Main Grid: File View & Core Attributes */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* File Preview Column */}
          <div className="cyber-card p-6 lg:col-span-1 flex flex-col justify-between space-y-5">
            <div className="bg-purple-50/50 border border-purple-100 rounded-3xl overflow-hidden aspect-square flex items-center justify-center p-3 relative group shadow-inner">
              {isImage ? (
                <img
                  src={`/api/evidence/${evidence._id}/file`}
                  alt={evidence.title}
                  className="w-full h-full object-contain rounded-2xl"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
              ) : null}

              <div
                style={{ display: isImage ? 'none' : 'flex' }}
                className="flex-col items-center justify-center text-slate-500 gap-3"
              >
                <FileText className="w-16 h-16 text-purple-600" />
                <span className="text-xs font-mono font-bold text-purple-800 uppercase tracking-wider">Document (PDF)</span>
              </div>
            </div>

            <div className="space-y-2.5">
              <button
                onClick={handleDownload}
                className="w-full py-3 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:opacity-95 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-md shadow-purple-500/20 transition hover:scale-[1.01]"
              >
                <Download className="w-4 h-4" />
                <span>Download Unaltered File</span>
              </button>

              <button
                onClick={() => setDeleteConfirmOpen(true)}
                className="w-full py-2.5 rounded-full bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold flex items-center justify-center gap-2 border border-rose-200 transition"
              >
                <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                <span>Delete Evidence Record</span>
              </button>
            </div>
          </div>

          {/* Details & Metadata Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Overview Card */}
            <div className="cyber-card p-6 sm:p-8 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-purple-100/80 pb-3">
                <div className="flex items-center gap-2">
                  <CategoryBadge category={evidence.category} />
                  <IntegrityBadge />
                </div>
                <span className="text-xs font-mono text-slate-400 bg-slate-100 px-3 py-1 rounded-full">
                  ID: {evidence._id}
                </span>
              </div>

              <div>
                <h3 className="font-display text-2xl sm:text-3xl font-extrabold text-slate-900 mb-2">{evidence.title}</h3>
                <p className="text-sm text-slate-600 leading-relaxed font-normal">
                  {evidence.description || 'No user description provided for this evidence item.'}
                </p>
              </div>

              {evidence.tags?.length > 0 && (
                <div className="flex flex-wrap items-center gap-1.5 pt-2">
                  {evidence.tags.map((t) => (
                    <span
                      key={t}
                      className="px-3 py-1 rounded-full bg-purple-50 text-purple-700 text-xs font-mono font-medium border border-purple-200"
                    >
                      #{t}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Cryptographic SHA-256 Card */}
            <div className="cyber-card p-6 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-600" />
                  <h4 className="font-display text-sm font-bold text-slate-900 uppercase tracking-wider">
                    Cryptographic Integrity Digest
                  </h4>
                </div>
                <button
                  onClick={handleVerify}
                  className="text-xs text-purple-700 hover:text-purple-900 font-bold bg-purple-50 px-3 py-1 rounded-full border border-purple-200"
                >
                  Verify Now
                </button>
              </div>

              <div className="p-4 bg-purple-50/50 border border-purple-200/80 rounded-2xl space-y-1 font-mono text-xs">
                <span className="text-purple-600 block text-[11px] font-bold uppercase tracking-wider">
                  Recorded SHA-256 Digest:
                </span>
                <span className="text-purple-900 break-all select-all font-bold text-[13px]">
                  {evidence.sha256}
                </span>
              </div>

              <p className="text-xs text-slate-500 leading-relaxed font-normal">
                Cryptographic hashing verifies bit-level integrity since upload. Re-computing the hash against the stored vault file proves zero alteration or tampering.
              </p>
            </div>

            {/* Structured Metadata Breakdown */}
            <div className="cyber-card p-6 sm:p-8 space-y-5">
              <h4 className="font-display text-sm font-bold text-slate-900 uppercase tracking-wider border-b border-purple-100/80 pb-3 flex items-center justify-between">
                <span>Detailed Evidence Metadata</span>
                <span className="text-xs font-normal text-slate-400 lowercase">
                  Strictly distinguishes file headers from vault records
                </span>
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* File Metadata (Extracted from file headers) */}
                <div className="space-y-3 bg-purple-50/40 p-5 rounded-3xl border border-purple-100">
                  <div className="flex items-center gap-2 text-purple-800 text-xs font-bold uppercase tracking-wider font-display">
                    <Camera className="w-4 h-4 text-purple-600" />
                    <span>Embedded File EXIF</span>
                  </div>

                  <dl className="space-y-2.5 text-xs">
                    <div className="flex justify-between border-b border-purple-100 pb-2">
                      <dt className="text-slate-500 font-medium">Date Taken:</dt>
                      <dd className="font-mono text-slate-900 font-semibold">
                        {meta.dateTimeOriginal
                          ? new Date(meta.dateTimeOriginal).toLocaleString()
                          : 'Not available'}
                      </dd>
                    </div>

                    <div className="flex justify-between border-b border-purple-100 pb-2">
                      <dt className="text-slate-500 font-medium">Camera Make:</dt>
                      <dd className="text-slate-900 font-semibold">{meta.make || 'Not available'}</dd>
                    </div>

                    <div className="flex justify-between border-b border-purple-100 pb-2">
                      <dt className="text-slate-500 font-medium">Camera Model:</dt>
                      <dd className="text-slate-900 font-semibold">{meta.model || 'Not available'}</dd>
                    </div>

                    <div className="flex justify-between border-b border-purple-100 pb-2">
                      <dt className="text-slate-500 font-medium">Dimensions:</dt>
                      <dd className="font-mono text-slate-900 font-semibold">
                        {meta.imageWidth && meta.imageHeight
                          ? `${meta.imageWidth} × ${meta.imageHeight} px`
                          : 'Not available'}
                      </dd>
                    </div>

                    <div className="flex justify-between pt-1">
                      <dt className="text-slate-500 font-medium">GPS Coordinates:</dt>
                      <dd className="font-mono text-slate-900 font-semibold">
                        {meta.hasGps && meta.gpsLatitude && meta.gpsLongitude
                          ? `${meta.gpsLatitude}, ${meta.gpsLongitude}`
                          : 'Not available'}
                      </dd>
                    </div>
                  </dl>
                </div>

                {/* ProofPath Vault Record */}
                <div className="space-y-3 bg-indigo-50/40 p-5 rounded-3xl border border-indigo-100">
                  <div className="flex items-center gap-2 text-indigo-800 text-xs font-bold uppercase tracking-wider font-display">
                    <FolderLock className="w-4 h-4 text-indigo-600" />
                    <span>ProofPath Vault Record</span>
                  </div>

                  <dl className="space-y-2.5 text-xs">
                    <div className="flex justify-between border-b border-indigo-100 pb-2">
                      <dt className="text-slate-500 font-medium">Original Filename:</dt>
                      <dd className="font-mono text-slate-900 font-semibold truncate max-w-[140px]">
                        {evidence.originalFilename}
                      </dd>
                    </div>

                    <div className="flex justify-between border-b border-indigo-100 pb-2">
                      <dt className="text-slate-500 font-medium">MIME Type:</dt>
                      <dd className="font-mono text-slate-900 font-semibold">{evidence.mimeType}</dd>
                    </div>

                    <div className="flex justify-between border-b border-indigo-100 pb-2">
                      <dt className="text-slate-500 font-medium">File Size:</dt>
                      <dd className="font-mono text-slate-900 font-semibold">
                        {(evidence.fileSize / 1024).toFixed(1)} KB
                      </dd>
                    </div>

                    <div className="flex justify-between border-b border-indigo-100 pb-2">
                      <dt className="text-slate-500 font-medium">Vault Upload Time:</dt>
                      <dd className="font-mono text-slate-900 font-semibold">
                        {new Date(evidence.uploadTimestamp).toLocaleString()}
                      </dd>
                    </div>

                    <div className="flex justify-between pt-1">
                      <dt className="text-slate-500 font-medium">Access Authorization:</dt>
                      <dd className="text-emerald-700 font-bold">User Private (Enforced)</dd>
                    </div>
                  </dl>
                </div>
              </div>
            </div>

            {/* Cases Using This Evidence */}
            <div className="cyber-card p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-purple-100/80 pb-3">
                <div className="flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-purple-600" />
                  <h4 className="font-display text-sm font-bold text-slate-900 uppercase tracking-wider">
                    Linked Cases ({linkedCases.length})
                  </h4>
                </div>
                <Link
                  to={`/cases/new`}
                  className="text-xs text-purple-700 hover:text-purple-900 font-bold bg-purple-50 px-3 py-1 rounded-full border border-purple-200"
                >
                  + Build New Case
                </Link>
              </div>

              {linkedCases.length === 0 ? (
                <p className="text-sm text-slate-500 font-normal">
                  This evidence item is safely preserved in your vault and is not yet attached to any dispute case.
                </p>
              ) : (
                <div className="space-y-2.5">
                  {linkedCases.map((c) => (
                    <Link
                      key={c._id}
                      to={`/cases/${c._id}`}
                      className="p-4 rounded-2xl bg-white/70 border border-purple-100 hover:border-purple-300 flex items-center justify-between text-xs transition group shadow-sm"
                    >
                      <div className="flex items-center gap-3">
                        <span className="font-display font-bold text-sm text-slate-900 group-hover:text-purple-700">
                          {c.title}
                        </span>
                        <span className="px-3 py-0.5 rounded-full text-xs font-bold bg-purple-50 text-purple-700 border border-purple-200">
                          {c.issueType}
                        </span>
                      </div>
                      <span className="text-purple-600 group-hover:translate-x-0.5 transition flex items-center gap-1 font-bold">
                        Inspect <ChevronRight className="w-4 h-4" />
                      </span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Verification Modal */}
      <IntegrityModal
        isOpen={verifyModalOpen}
        onClose={() => setVerifyModalOpen(false)}
        result={verifyResult}
        loading={verifying}
        evidenceTitle={evidence.title}
      />

      {/* Delete Confirmation Modal */}
      {deleteConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white border border-purple-100 w-full max-w-md rounded-3xl p-6 sm:p-7 space-y-4 shadow-2xl">
            <div className="flex items-center gap-3 text-rose-600">
              <AlertTriangle className="w-6 h-6" />
              <h3 className="font-display text-lg font-bold text-slate-900">Confirm Evidence Deletion</h3>
            </div>
            <p className="text-sm text-slate-600 leading-relaxed font-normal">
              Are you sure you want to permanently remove <strong className="text-slate-900">{evidence.title}</strong>? The original file and its cryptographic integrity record will be deleted from your vault.
            </p>
            {linkedCases.length > 0 && (
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-900">
                Warning: This item is referenced by {linkedCases.length} case(s). Deleting it will remove it from those cases.
              </div>
            )}
            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmOpen(false)}
                className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-full text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deleting}
                onClick={() => handleDelete(false)}
                className="px-6 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-full text-xs font-bold transition disabled:opacity-50"
              >
                {deleting ? 'Deleting...' : 'Permanently Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};
