import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FolderLock,
  Briefcase,
  UploadCloud,
  ShieldCheck,
  PlusCircle,
  Sparkles,
  ArrowRight,
  Clock,
  Layers,
  FileText,
  Lock,
  ExternalLink,
  ChevronRight,
  CheckCircle2,
  FileSignature
} from 'lucide-react';
import { DashboardLayout } from '../components/DashboardLayout';
import { EvidenceCard } from '../components/EvidenceCard';
import { IntegrityModal } from '../components/IntegrityModal';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export const Dashboard = () => {
  const { user } = useAuth();
  const [evidence, setEvidence] = useState([]);
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal verification state
  const [verifyModalOpen, setVerifyModalOpen] = useState(false);
  const [selectedVerifyEvidence, setSelectedVerifyEvidence] = useState(null);
  const [verifyResult, setVerifyResult] = useState(null);
  const [verifying, setVerifying] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [evRes, casesRes] = await Promise.all([
        api.get('/evidence'),
        api.get('/cases'),
      ]);
      setEvidence(evRes.data.evidence || []);
      setCases(casesRes.data.cases || []);
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (item) => {
    setSelectedVerifyEvidence(item);
    setVerifyResult(null);
    setVerifying(true);
    setVerifyModalOpen(true);

    try {
      const res = await api.post(`/evidence/${item._id}/verify`);
      setVerifyResult(res.data);
    } catch (err) {
      setVerifyResult({
        valid: false,
        status: 'Verification failed',
        message: err.response?.data?.error || err.message,
        recordedHash: item.sha256,
        calculatedHash: 'Error reading file',
      });
    } finally {
      setVerifying(false);
    }
  };

  const integrityCount = evidence.filter((e) => !!e.sha256).length;

  return (
    <DashboardLayout
      title="Evidence & Case Command"
      subtitle={`Welcome back, ${user?.fullName || 'User'}`}
    >
      <div className="space-y-8">
        {/* Featured Gradient Banner Card (Hero Reference Style) */}
        <div className="gradient-banner-card rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden shadow-xl shadow-purple-500/15">
          {/* Decorative background glow circles */}
          <div className="absolute -right-10 -bottom-10 w-64 h-64 rounded-full bg-white/10 blur-2xl pointer-events-none" />
          <div className="absolute right-1/3 -top-10 w-48 h-48 rounded-full bg-pink-400/20 blur-xl pointer-events-none" />

          <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div className="space-y-3 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white text-xs font-bold tracking-wide uppercase">
                <ShieldCheck className="w-3.5 h-3.5 text-pink-200" />
                <span>Zero-Knowledge Evidence Vault</span>
              </div>
              
              <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white drop-shadow-sm">
                Preserve Evidence Today. <br className="hidden sm:inline" />
                Build Your Case When It Counts.
              </h2>
              
              <p className="text-white/90 text-sm sm:text-base leading-relaxed font-normal">
                Upload photographs, chat logs, contracts, and audio before disputes develop. When needed, our chronological AI organizes your verified evidence into a court-ready factual case.
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Link
                  to="/evidence/upload"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white text-purple-900 font-bold text-sm shadow-lg shadow-black/10 hover:bg-purple-50 hover:scale-[1.02] active:scale-[0.98] transition-all"
                >
                  <UploadCloud className="w-4 h-4 text-purple-700" />
                  <span>Preserve Evidence</span>
                </Link>
                
                <Link
                  to="/cases/new"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white/15 hover:bg-white/25 text-white font-bold text-sm backdrop-blur-md border border-white/30 hover:scale-[1.02] active:scale-[0.98] transition-all"
                >
                  <Sparkles className="w-4 h-4 text-yellow-300" />
                  <span>Build Case Timeline</span>
                </Link>

                <Link
                  to="/contracts"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white/15 hover:bg-white/25 text-white font-bold text-sm backdrop-blur-md border border-white/30 hover:scale-[1.02] active:scale-[0.98] transition-all"
                >
                  <FileSignature className="w-4 h-4 text-pink-200" />
                  <span>Contracts & Contacts</span>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Metric Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="cyber-card p-6 flex items-center justify-between group hover:border-purple-300 transition-all duration-300">
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider font-display">Preserved Evidence</p>
              <h3 className="font-display text-3xl sm:text-4xl font-extrabold text-slate-800 mt-1">
                {loading ? '...' : evidence.length}
              </h3>
              <p className="text-xs text-purple-600 font-medium mt-1 flex items-center gap-1">
                <span>Stored in secure vault</span>
              </p>
            </div>
            <div className="w-14 h-14 rounded-2xl bg-purple-50 border border-purple-200 text-purple-600 flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
              <FolderLock className="w-7 h-7" />
            </div>
          </div>

          <div className="cyber-card p-6 flex items-center justify-between group hover:border-indigo-300 transition-all duration-300">
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider font-display">Active Cases</p>
              <h3 className="font-display text-3xl sm:text-4xl font-extrabold text-slate-800 mt-1">
                {loading ? '...' : cases.length}
              </h3>
              <p className="text-xs text-indigo-600 font-medium mt-1 flex items-center gap-1">
                <span>Chronological timelines</span>
              </p>
            </div>
            <div className="w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-200 text-indigo-600 flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
              <Briefcase className="w-7 h-7" />
            </div>
          </div>

          <div className="cyber-card p-6 flex items-center justify-between group hover:border-emerald-300 transition-all duration-300">
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider font-display">Integrity Hashes</p>
              <h3 className="font-display text-3xl sm:text-4xl font-extrabold text-emerald-600 mt-1">
                {loading ? '...' : integrityCount}
              </h3>
              <p className="text-xs text-emerald-600 font-medium mt-1 flex items-center gap-1">
                <span>100% Tamper-Evident</span>
              </p>
            </div>
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
              <ShieldCheck className="w-7 h-7" />
            </div>
          </div>

          <div className="cyber-card p-6 flex items-center justify-between group hover:border-pink-300 transition-all duration-300">
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider font-display">Recent Preservations</p>
              <h3 className="font-display text-3xl sm:text-4xl font-extrabold text-slate-800 mt-1">
                {loading ? '...' : evidence.slice(0, 7).length}
              </h3>
              <p className="text-xs text-pink-600 font-medium mt-1 flex items-center gap-1">
                <span>Ready for dispute review</span>
              </p>
            </div>
            <div className="w-14 h-14 rounded-2xl bg-pink-50 border border-pink-200 text-pink-600 flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
              <UploadCloud className="w-7 h-7" />
            </div>
          </div>
        </div>

        {/* Recent Cases Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-3 h-3 rounded-full bg-purple-500"></div>
              <h3 className="font-display text-lg font-bold text-slate-900 tracking-tight">Active Case Files</h3>
            </div>
            <Link
              to="/cases"
              className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-purple-50 text-purple-700 text-xs font-bold hover:bg-purple-100 transition border border-purple-200"
            >
              <span>View all cases ({cases.length})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {cases.length === 0 ? (
            <div className="p-8 text-center bg-white/80 backdrop-blur-md border border-purple-100/90 rounded-3xl shadow-sm space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center mx-auto">
                <Briefcase className="w-6 h-6" />
              </div>
              <h4 className="font-display text-base text-slate-800 font-bold">No Cases Built Yet</h4>
              <p className="text-sm text-slate-500 max-w-md mx-auto">
                Select preserved items from your vault and describe your dispute to generate an organized chronological case timeline.
              </p>
              <div className="pt-2">
                <Link
                  to="/cases/new"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-xs font-bold shadow-md shadow-purple-500/20 hover:opacity-95 transition"
                >
                  <Sparkles className="w-4 h-4 text-yellow-300" />
                  <span>Build Your First Case</span>
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {cases.slice(0, 3).map((c) => (
                <Link
                  key={c._id}
                  to={`/cases/${c._id}`}
                  className="cyber-card p-6 flex flex-col justify-between group hover:border-purple-300 hover:shadow-lg transition-all"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-purple-50 text-purple-700 border border-purple-200">
                        {c.issueType}
                      </span>
                      <span className="text-xs text-slate-500 font-mono font-medium bg-slate-100 px-2 py-0.5 rounded-full">
                        {c.evidenceIds?.length || 0} evidence items
                      </span>
                    </div>
                    <h4 className="font-display font-bold text-lg text-slate-900 group-hover:text-purple-700 transition line-clamp-1">
                      {c.title}
                    </h4>
                    <p className="text-sm text-slate-600 line-clamp-2 mt-2 leading-relaxed font-normal">
                      {c.userDescription}
                    </p>
                  </div>

                  <div className="pt-4 mt-4 border-t border-purple-100/60 flex items-center justify-between text-xs text-slate-500 font-medium">
                    <span>Created {new Date(c.createdAt).toLocaleDateString()}</span>
                    <span className="text-purple-600 font-bold flex items-center gap-1 group-hover:translate-x-0.5 transition">
                      Inspect Case <ChevronRight className="w-4 h-4" />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Recent Preserved Evidence Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-3 h-3 rounded-full bg-indigo-500"></div>
              <h3 className="font-display text-lg font-bold text-slate-900 tracking-tight">Recent Preserved Vault Items</h3>
            </div>
            <Link
              to="/vault"
              className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold hover:bg-indigo-100 transition border border-indigo-200"
            >
              <span>Explore Vault ({evidence.length})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {evidence.length === 0 ? (
            <div className="p-8 text-center bg-white/80 backdrop-blur-md border border-purple-100/90 rounded-3xl shadow-sm space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
                <FolderLock className="w-6 h-6" />
              </div>
              <h4 className="font-display text-base text-slate-800 font-bold">Your Evidence Vault is Empty</h4>
              <p className="text-sm text-slate-500 max-w-md mx-auto">
                Securely store photos, receipts, audio records, or screenshots. Every item is stamped with an immutable SHA-256 hash.
              </p>
              <div className="pt-2">
                <Link
                  to="/evidence/upload"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:opacity-95 text-white text-xs font-bold transition shadow-md shadow-purple-500/20"
                >
                  <UploadCloud className="w-4 h-4" />
                  <span>Upload Initial Evidence</span>
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {evidence.slice(0, 3).map((item) => (
                <EvidenceCard
                  key={item._id}
                  evidence={item}
                  viewMode="grid"
                  onVerify={handleVerify}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Verification Modal */}
      <IntegrityModal
        isOpen={verifyModalOpen}
        onClose={() => setVerifyModalOpen(false)}
        result={verifyResult}
        loading={verifying}
        evidenceTitle={selectedVerifyEvidence?.title}
      />
    </DashboardLayout>
  );
};
