import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FolderLock,
  Search,
  LayoutGrid,
  List,
  Filter,
  UploadCloud,
  FileText,
  Image as ImageIcon,
  Mic,
  Video,
  ShieldCheck,
  AlertCircle,
  Sparkles
} from 'lucide-react';
import { DashboardLayout } from '../components/DashboardLayout';
import { EvidenceCard } from '../components/EvidenceCard';
import { IntegrityModal } from '../components/IntegrityModal';
import { EmptyState } from '../components/EmptyState';
import api from '../services/api';

export const EvidenceVault = () => {
  const [evidence, setEvidence] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'

  // Filter states
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [tagFilter, setTagFilter] = useState('');

  // Integrity modal
  const [verifyModalOpen, setVerifyModalOpen] = useState(false);
  const [selectedVerifyEvidence, setSelectedVerifyEvidence] = useState(null);
  const [verifyResult, setVerifyResult] = useState(null);
  const [verifying, setVerifying] = useState(false);

  const categories = [
    'All Categories',
    'Attendance',
    'Employment',
    'Communication',
    'Payment',
    'Contract',
    'Workplace Conditions',
    'Housing',
    'Consumer',
    'Fraud',
    'Personal',
    'Other',
  ];

  useEffect(() => {
    fetchVault();
  }, [categoryFilter, typeFilter, search]);

  const fetchVault = async () => {
    try {
      setLoading(true);
      const params = {};
      if (categoryFilter !== 'All Categories' && categoryFilter !== 'All') {
        params.category = categoryFilter;
      }
      if (typeFilter !== 'All') params.type = typeFilter;
      if (search.trim()) params.search = search.trim();
      if (tagFilter.trim()) params.tag = tagFilter.trim();

      const res = await api.get('/evidence', { params });
      setEvidence(res.data.evidence || []);
    } catch (err) {
      console.error('Failed to fetch evidence vault:', err);
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
        calculatedHash: 'Error calculating hash',
      });
    } finally {
      setVerifying(false);
    }
  };

  return (
    <DashboardLayout
      title="Evidence Vault"
      subtitle="Preserve crucial documents, photos, and messages securely before any dispute occurs."
    >
      <div className="space-y-6">
        {/* Controls Bar: Search, Category, File Type, View Switcher */}
        <div className="cyber-card p-6 space-y-4">
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-5 h-5 text-slate-400 absolute left-4 top-3.5" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search preserved items by title, description, tags, filename..."
                className="w-full pl-11 pr-4 py-3 bg-white/70 hover:bg-white border border-purple-200/80 rounded-2xl text-base text-slate-900 placeholder-slate-400 focus:outline-none focus:border-purple-600 focus:ring-4 focus:ring-purple-500/10 transition shadow-sm"
              />
            </div>

            {/* Category Dropdown */}
            <div className="flex items-center gap-2">
              <div className="relative">
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="bg-white/80 border border-purple-200/80 text-sm font-semibold text-slate-800 rounded-2xl px-4 py-3 pr-8 focus:outline-none focus:border-purple-600 shadow-sm appearance-none cursor-pointer hover:bg-white transition"
                >
                  {categories.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
                <Filter className="w-4 h-4 text-purple-600 absolute right-3 top-3.5 pointer-events-none" />
              </div>
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center gap-1 bg-purple-100/60 p-1.5 rounded-2xl border border-purple-200/70">
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={`p-2.5 rounded-xl text-xs transition flex items-center gap-1 ${
                  viewMode === 'grid'
                    ? 'bg-white text-purple-800 shadow-sm font-bold'
                    : 'text-slate-600 hover:text-purple-900'
                }`}
                title="Grid View"
              >
                <LayoutGrid className="w-4 h-4" />
                <span className="hidden sm:inline font-bold">Grid</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('list')}
                className={`p-2.5 rounded-xl text-xs transition flex items-center gap-1 ${
                  viewMode === 'list'
                    ? 'bg-white text-purple-800 shadow-sm font-bold'
                    : 'text-slate-600 hover:text-purple-900'
                }`}
                title="List View"
              >
                <List className="w-4 h-4" />
                <span className="hidden sm:inline font-bold">List</span>
              </button>
            </div>
          </div>

          {/* Quick File Type Pills */}
          <div className="flex flex-wrap items-center gap-2 pt-4 border-t border-purple-100/80 text-sm">
            <span className="text-purple-400 text-xs font-mono font-bold mr-2 uppercase tracking-wider">FILTER FORMAT:</span>
            {['All', 'Images', 'Documents'].map((ft) => (
              <button
                key={ft}
                type="button"
                onClick={() => setTypeFilter(ft)}
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                  typeFilter === ft
                    ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-500/20'
                    : 'bg-white/80 hover:bg-white text-slate-700 border border-purple-200/70'
                }`}
              >
                {ft}
              </button>
            ))}

            <span
              title="Audio evidence extraction scheduled for future roadmap"
              className="px-3.5 py-1.5 rounded-full text-xs font-semibold bg-purple-50/50 text-slate-400 border border-purple-100 flex items-center gap-1.5 cursor-not-allowed opacity-70"
            >
              <Mic className="w-3.5 h-3.5 text-purple-400" />
              <span>Audio (Planned)</span>
            </span>
            <span
              title="Video forensic preservation scheduled for future roadmap"
              className="px-3.5 py-1.5 rounded-full text-xs font-semibold bg-purple-50/50 text-slate-400 border border-purple-100 flex items-center gap-1.5 cursor-not-allowed opacity-70"
            >
              <Video className="w-3.5 h-3.5 text-purple-400" />
              <span>Video (Planned)</span>
            </span>
          </div>
        </div>

        {/* Content Listing */}
        {loading ? (
          <div className="py-24 flex flex-col items-center justify-center gap-3">
            <div className="w-10 h-10 border-3 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-sm font-display font-bold text-purple-800">Decryption & Loading Vault Records...</p>
          </div>
        ) : evidence.length === 0 ? (
          <EmptyState
            icon={FolderLock}
            title="Your Evidence Vault is Empty"
            description="Start preserving important documents, photographs, and records before any dispute arises."
            actionText="Upload Your First Evidence"
            actionLink="/evidence/upload"
          />
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {evidence.map((item) => (
              <EvidenceCard
                key={item._id}
                evidence={item}
                viewMode="grid"
                onVerify={handleVerify}
              />
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {evidence.map((item) => (
              <EvidenceCard
                key={item._id}
                evidence={item}
                viewMode="list"
                onVerify={handleVerify}
              />
            ))}
          </div>
        )}
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
