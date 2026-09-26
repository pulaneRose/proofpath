import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Briefcase,
  PlusCircle,
  FileDown,
  ArrowRight,
  Calendar,
  Layers,
  Sparkles,
  Search,
  Filter,
  ChevronRight
} from 'lucide-react';
import { DashboardLayout } from '../components/DashboardLayout';
import { EmptyState } from '../components/EmptyState';
import api from '../services/api';

export const CaseList = () => {
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [issueFilter, setIssueFilter] = useState('All');

  useEffect(() => {
    fetchCases();
  }, []);

  const fetchCases = async () => {
    try {
      setLoading(true);
      const res = await api.get('/cases');
      setCases(res.data.cases || []);
    } catch (err) {
      console.error('Failed to fetch cases:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (caseId, title) => {
    try {
      const res = await api.get(`/cases/${caseId}/export`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `ProofPath_Report_${title.replace(/[^a-zA-Z0-9_-]/g, '_')}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch (err) {
      alert('Failed to export PDF: ' + err.message);
    }
  };

  const filteredCases = cases.filter((c) => {
    const matchesFilter = issueFilter === 'All' || c.issueType === issueFilter;
    const matchesSearch =
      !search.trim() ||
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.userDescription.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <DashboardLayout
      title="My Cases"
      subtitle="Structured chronological timelines and organized dispute records"
      actions={
        <Link
          to="/cases/new"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:opacity-95 text-white text-xs font-bold transition shadow-md shadow-purple-500/20 hover:scale-[1.02] active:scale-[0.98]"
        >
          <Sparkles className="w-4 h-4 text-yellow-300" />
          <span>Build New Case</span>
        </Link>
      }
    >
      <div className="space-y-6">
        {/* Controls */}
        <div className="cyber-card p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-purple-400 absolute left-4 top-3.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search cases by title or dispute details..."
              className="w-full pl-11 pr-4 py-2.5 bg-white/80 border border-purple-200/80 rounded-2xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-purple-600 focus:ring-4 focus:ring-purple-500/10 transition shadow-sm"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative w-full sm:w-auto">
              <select
                value={issueFilter}
                onChange={(e) => setIssueFilter(e.target.value)}
                className="w-full sm:w-auto bg-white/80 border border-purple-200/80 text-sm font-semibold text-slate-800 rounded-2xl px-4 py-2.5 pr-8 focus:outline-none focus:border-purple-600 shadow-sm appearance-none cursor-pointer hover:bg-white transition"
              >
                {['All Categories', 'Employment', 'Housing', 'Consumer', 'Payment', 'Fraud', 'Contract', 'Other'].map(
                  (opt) => (
                    <option key={opt} value={opt === 'All Categories' ? 'All' : opt}>
                      {opt}
                    </option>
                  )
                )}
              </select>
              <Filter className="w-4 h-4 text-purple-600 absolute right-3 top-3.5 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Case List */}
        {loading ? (
          <div className="py-20 text-center text-sm font-display font-bold text-purple-700">Loading cases...</div>
        ) : filteredCases.length === 0 ? (
          <EmptyState
            icon={Briefcase}
            title="No Cases Built Yet"
            description="When you need to organize evidence around a dispute or event, you can build a case here."
            actionText="Build Your First Case"
            actionLink="/cases/new"
          />
        ) : (
          <div className="space-y-4">
            {filteredCases.map((c) => (
              <div
                key={c._id}
                className="cyber-card p-6 sm:p-7 flex flex-col md:flex-row md:items-center justify-between gap-5 group hover:border-purple-300 transition-all shadow-sm"
              >
                <div className="space-y-2.5 flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-3.5 py-1 rounded-full text-xs font-bold bg-purple-50 text-purple-700 border border-purple-200">
                      {c.issueType}
                    </span>
                    <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-slate-100 text-slate-700 border border-slate-200">
                      {c.evidenceIds?.length || 0} evidence record{c.evidenceIds?.length === 1 ? '' : 's'}
                    </span>
                    {c.incidentDate && (
                      <span className="text-xs font-medium text-slate-500 flex items-center gap-1 bg-white/70 px-3 py-1 rounded-full border border-purple-100">
                        <Calendar className="w-3.5 h-3.5 text-purple-500" />
                        Incident Date: {c.incidentDate}
                      </span>
                    )}
                  </div>

                  <Link
                    to={`/cases/${c._id}`}
                    className="font-display font-extrabold text-lg sm:text-xl text-slate-900 group-hover:text-purple-700 transition block truncate"
                  >
                    {c.title}
                  </Link>

                  <p className="text-sm text-slate-600 line-clamp-2 max-w-3xl leading-relaxed font-normal">
                    {c.userDescription}
                  </p>
                </div>

                <div className="flex items-center gap-3 flex-shrink-0 pt-3 md:pt-0 border-t md:border-t-0 border-purple-100">
                  <button
                    onClick={() => handleExport(c._id, c.title)}
                    className="p-3 rounded-full bg-white hover:bg-purple-50 text-slate-700 hover:text-purple-700 text-xs font-bold border border-purple-200 shadow-sm transition flex items-center gap-1.5"
                    title="Export PDF Report"
                  >
                    <FileDown className="w-4 h-4 text-purple-600" />
                    <span className="hidden sm:inline">Export PDF</span>
                  </button>

                  <Link
                    to={`/cases/${c._id}`}
                    className="px-6 py-3 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:opacity-95 text-white font-bold text-xs transition shadow-md shadow-purple-500/20 flex items-center gap-1.5 hover:scale-[1.02] active:scale-[0.98]"
                  >
                    <span>Inspect Case</span>
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};
