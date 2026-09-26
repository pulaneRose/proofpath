import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  CheckSquare,
  Square,
  Search,
  Filter,
  FileText,
  AlertCircle,
  Clock,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import { DashboardLayout } from '../components/DashboardLayout';
import { EvidenceCard } from '../components/EvidenceCard';
import api from '../services/api';

export const CaseBuilder = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Wizard Step: 1 = Describe, 2 = Select Evidence, 3 = Analyzing
  const [step, setStep] = useState(1);

  // Step 1 Form Data
  const [title, setTitle] = useState('');
  const [issueType, setIssueType] = useState('Employment');
  const [userDescription, setUserDescription] = useState('');
  const [incidentDate, setIncidentDate] = useState('2026-09-23');

  // Step 2 Evidence Selection
  const [vaultEvidence, setVaultEvidence] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [evidenceLoading, setEvidenceLoading] = useState(true);
  const [evidenceSearch, setEvidenceSearch] = useState('');
  const [evidenceCategory, setEvidenceCategory] = useState('All');

  // Step 3 AI Progress Execution
  const [progressStage, setProgressStage] = useState('');
  const [error, setError] = useState('');

  const issueTypes = [
    'Employment',
    'Housing',
    'Consumer',
    'Payment',
    'Fraud',
    'Contract',
    'Other',
  ];

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const initialEvidenceId = params.get('evidenceId');
    if (initialEvidenceId) {
      setSelectedIds([initialEvidenceId]);
    }
    fetchVaultEvidence();
  }, [location.search]);

  const fetchVaultEvidence = async () => {
    try {
      setEvidenceLoading(true);
      const res = await api.get('/evidence');
      setVaultEvidence(res.data.evidence || []);
    } catch (err) {
      console.error('Failed to fetch evidence for case builder:', err);
    } finally {
      setEvidenceLoading(false);
    }
  };

  const toggleSelect = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    const filteredIds = filteredEvidence.map((e) => e._id);
    setSelectedIds(filteredIds);
  };

  const handleDeselectAll = () => {
    setSelectedIds([]);
  };

  const handleStartAnalysis = async () => {
    if (!title.trim() || !userDescription.trim()) {
      setError('Please provide a case title and description.');
      setStep(1);
      return;
    }

    setStep(3);
    setError('');

    try {
      setProgressStage('Cataloging selected evidence records...');
      await new Promise((r) => setTimeout(r, 600));

      const createRes = await api.post('/cases', {
        title: title.trim(),
        issueType,
        userDescription: userDescription.trim(),
        incidentDate,
        evidenceIds: selectedIds,
      });

      const caseId = createRes.data.case._id;

      setProgressStage('Synthesizing chronological timeline with EXIF timestamps...');
      await new Promise((r) => setTimeout(r, 600));

      setProgressStage('Structuring factual case narrative & evidentiary analysis...');
      await api.post(`/cases/${caseId}/analyze`);

      await new Promise((r) => setTimeout(r, 400));
      navigate(`/cases/${caseId}`);
    } catch (err) {
      console.error('Case building failed:', err);
      setError(err.response?.data?.error || 'Failed to complete case analysis.');
      setStep(2);
    }
  };

  const filteredEvidence = vaultEvidence.filter((e) => {
    const matchesCategory = evidenceCategory === 'All' || e.category === evidenceCategory;
    const matchesSearch =
      !evidenceSearch.trim() ||
      e.title.toLowerCase().includes(evidenceSearch.toLowerCase()) ||
      e.description.toLowerCase().includes(evidenceSearch.toLowerCase()) ||
      e.originalFilename.toLowerCase().includes(evidenceSearch.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <DashboardLayout
      title="Build a Case"
      subtitle="Organize preserved evidence into a factual, chronological case timeline"
    >
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Step Indicator */}
        <div className="cyber-card p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span
              className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold transition font-display ${
                step >= 1
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-500/20'
                  : 'bg-purple-100 text-purple-400'
              }`}
            >
              1
            </span>
            <div>
              <span className={`text-xs uppercase font-bold tracking-wider font-display block ${step >= 1 ? 'text-purple-900' : 'text-slate-400'}`}>
                Step 1
              </span>
              <span className={`text-sm font-bold ${step >= 1 ? 'text-slate-800' : 'text-slate-400'}`}>
                Describe Dispute
              </span>
            </div>
          </div>

          <div className="h-0.5 w-8 bg-purple-200 hidden sm:block"></div>

          <div className="flex items-center gap-3">
            <span
              className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold transition font-display ${
                step >= 2
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-500/20'
                  : 'bg-purple-100 text-purple-400'
              }`}
            >
              2
            </span>
            <div>
              <span className={`text-xs uppercase font-bold tracking-wider font-display block ${step >= 2 ? 'text-purple-900' : 'text-slate-400'}`}>
                Step 2
              </span>
              <span className={`text-sm font-bold ${step >= 2 ? 'text-slate-800' : 'text-slate-400'}`}>
                Select Vault Items
              </span>
            </div>
          </div>

          <div className="h-0.5 w-8 bg-purple-200 hidden sm:block"></div>

          <div className="flex items-center gap-3">
            <span
              className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold transition font-display ${
                step >= 3
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-500/20'
                  : 'bg-purple-100 text-purple-400'
              }`}
            >
              3
            </span>
            <div>
              <span className={`text-xs uppercase font-bold tracking-wider font-display block ${step >= 3 ? 'text-purple-900' : 'text-slate-400'}`}>
                Step 3
              </span>
              <span className={`text-sm font-bold ${step >= 3 ? 'text-slate-800' : 'text-slate-400'}`}>
                AI Timeline Synthesis
              </span>
            </div>
          </div>
        </div>

        {error && (
          <div className="p-4 rounded-2xl bg-rose-50/90 border border-rose-200 text-rose-800 text-sm font-medium flex items-center gap-3 shadow-sm">
            <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-600" />
            <span>{error}</span>
          </div>
        )}

        {/* STEP 1: Describe Situation */}
        {step === 1 && (
          <div className="cyber-card p-6 sm:p-9 space-y-6">
            <div>
              <h3 className="font-display text-2xl font-extrabold text-slate-900 mb-1">Step 1 — Describe the Situation</h3>
              <p className="text-sm text-slate-500 font-normal leading-relaxed">
                State your account of what occurred. ProofPath distinguishes user assertions from immutable file metadata.
              </p>
            </div>

            <div className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wider font-display">
                  Case Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Workplace Attendance Dispute — September 23"
                  className="w-full px-4 py-3 bg-white/80 border border-purple-200/80 rounded-2xl text-base text-slate-900 placeholder-slate-400 focus:outline-none focus:border-purple-600 focus:ring-4 focus:ring-purple-500/10 transition shadow-sm"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wider font-display">
                    Dispute Category
                  </label>
                  <select
                    value={issueType}
                    onChange={(e) => setIssueType(e.target.value)}
                    className="w-full px-4 py-3 bg-white/80 border border-purple-200/80 rounded-2xl text-base text-slate-900 focus:outline-none focus:border-purple-600 shadow-sm cursor-pointer"
                  >
                    {issueTypes.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wider font-display">
                    Incident Date
                  </label>
                  <input
                    type="text"
                    value={incidentDate}
                    onChange={(e) => setIncidentDate(e.target.value)}
                    placeholder="e.g. 2026-09-23 or September 23, 2026"
                    className="w-full px-4 py-3 bg-white/80 border border-purple-200/80 rounded-2xl text-base text-slate-900 placeholder-slate-400 focus:outline-none focus:border-purple-600 focus:ring-4 focus:ring-purple-500/10 shadow-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wider font-display">
                  What happened? (Your Narrative) <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={5}
                  required
                  value={userDescription}
                  onChange={(e) => setUserDescription(e.target.value)}
                  placeholder="Describe what occurred. Example: 'My employer claims that I did not report to work on September 23, but I arrived at 08:15 AM, worked at my workstation, and communicated with my shift supervisor.'"
                  className="w-full px-4 py-3 bg-white/80 border border-purple-200/80 rounded-2xl text-base text-slate-900 placeholder-slate-400 focus:outline-none focus:border-purple-600 focus:ring-4 focus:ring-purple-500/10 resize-none leading-relaxed shadow-sm"
                />
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-purple-100">
              <button
                type="button"
                onClick={() => {
                  if (!title.trim() || !userDescription.trim()) {
                    setError('Please fill in both the Case Title and Description.');
                    return;
                  }
                  setError('');
                  setStep(2);
                }}
                className="px-8 py-3.5 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:opacity-95 text-white font-bold text-sm transition shadow-lg shadow-purple-500/25 flex items-center gap-2 hover:scale-[1.02] active:scale-[0.98]"
              >
                <span>Continue to Select Evidence</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: Select Evidence from Vault */}
        {step === 2 && (
          <div className="space-y-6">
            <div className="cyber-card p-6 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="font-display text-2xl font-extrabold text-slate-900">Step 2 — Select Evidence from Vault</h3>
                  <p className="text-sm text-slate-500 font-normal">
                    Choose existing items from your private vault. No duplicate uploads required.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="px-4 py-1.5 rounded-full bg-purple-50 text-purple-700 font-mono text-xs font-bold border border-purple-200">
                    {selectedIds.length} item{selectedIds.length === 1 ? '' : 's'} selected
                  </span>
                </div>
              </div>

              {/* Filter controls */}
              <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
                <div className="relative flex-1 w-full">
                  <Search className="w-4 h-4 text-purple-400 absolute left-4 top-3.5" />
                  <input
                    type="text"
                    value={evidenceSearch}
                    onChange={(e) => setEvidenceSearch(e.target.value)}
                    placeholder="Search vault items..."
                    className="w-full pl-11 pr-4 py-2.5 bg-white/80 border border-purple-200/80 rounded-2xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-purple-600"
                  />
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={handleSelectAll}
                    className="text-xs text-purple-700 hover:text-purple-900 px-4 py-2.5 rounded-full bg-purple-50 border border-purple-200 font-bold transition hover:bg-purple-100"
                  >
                    Select All
                  </button>
                  <button
                    type="button"
                    onClick={handleDeselectAll}
                    className="text-xs text-slate-600 hover:text-slate-900 px-4 py-2.5 rounded-full bg-white border border-slate-200 font-bold transition hover:bg-slate-50"
                  >
                    Clear
                  </button>
                </div>
              </div>
            </div>

            {/* Evidence Selection Grid */}
            {evidenceLoading ? (
              <div className="py-20 text-center text-sm font-display font-bold text-purple-700">
                Loading evidence from vault...
              </div>
            ) : filteredEvidence.length === 0 ? (
              <div className="cyber-card p-10 text-center space-y-3">
                <p className="font-display text-base font-bold text-slate-800">No Matching Evidence Found</p>
                <p className="text-sm text-slate-500">
                  {vaultEvidence.length === 0
                    ? 'Your vault is currently empty. You can still continue to build a draft case or upload evidence first.'
                    : 'No evidence matches your search query.'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredEvidence.map((item) => (
                  <EvidenceCard
                    key={item._id}
                    evidence={item}
                    viewMode="grid"
                    selectable={true}
                    isSelected={selectedIds.includes(item._id)}
                    onSelect={() => toggleSelect(item._id)}
                  />
                ))}
              </div>
            )}

            {/* Wizard Navigation */}
            <div className="flex items-center justify-between pt-4">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="px-6 py-3 rounded-full bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold border border-purple-200 shadow-sm transition flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Description</span>
              </button>

              <button
                type="button"
                onClick={handleStartAnalysis}
                className="px-8 py-3.5 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:opacity-95 text-white font-bold text-sm transition shadow-lg shadow-purple-500/25 flex items-center gap-2 hover:scale-[1.02] active:scale-[0.98]"
              >
                <Sparkles className="w-4 h-4 text-yellow-300" />
                <span>Analyze Evidence ({selectedIds.length})</span>
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Progress State */}
        {step === 3 && (
          <div className="cyber-card p-12 text-center max-w-lg mx-auto space-y-6 shadow-2xl">
            <div className="w-20 h-20 rounded-3xl bg-purple-50 border border-purple-200 flex items-center justify-center text-purple-600 mx-auto animate-pulse shadow-sm">
              <Sparkles className="w-10 h-10 text-purple-600" />
            </div>

            <div className="space-y-2">
              <h3 className="font-display text-2xl font-extrabold text-slate-900">AI Chronological Case Builder</h3>
              <p className="text-sm font-mono font-bold text-purple-700">{progressStage}</p>
            </div>

            <div className="space-y-2 text-xs text-slate-500 max-w-xs mx-auto font-medium">
              <p>• Correlating capture metadata with stated dates</p>
              <p>• Applying strict non-conclusive evidentiary rules</p>
              <p>• Generating indexed source references</p>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};
