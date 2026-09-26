import React from 'react';
import { ShieldCheck, AlertTriangle, FileText, Image, MessageSquare, Clock, UserCheck, Sparkles } from 'lucide-react';

export const CategoryBadge = ({ category }) => {
  const styles = {
    Attendance: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
    Employment: 'bg-indigo-50 text-indigo-700 border-indigo-200/80',
    Communication: 'bg-fuchsia-50 text-fuchsia-700 border-fuchsia-200/80',
    Payment: 'bg-purple-50 text-purple-700 border-purple-200/80',
    Contract: 'bg-amber-50 text-amber-800 border-amber-200/80',
    'Workplace Conditions': 'bg-rose-50 text-rose-700 border-rose-200/80',
    Housing: 'bg-violet-50 text-violet-700 border-violet-200/80',
    Consumer: 'bg-teal-50 text-teal-700 border-teal-200/80',
    Fraud: 'bg-red-50 text-red-700 border-red-200/80',
    Personal: 'bg-slate-100 text-slate-700 border-slate-200',
    Other: 'bg-slate-100 text-slate-600 border-slate-200',
  };

  const style = styles[category] || styles['Other'];

  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border tracking-wide shadow-sm ${style}`}>
      {category}
    </span>
  );
};

export const SourceBadge = ({ sourceType }) => {
  switch (sourceType) {
    case 'Metadata':
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-sky-50 text-sky-700 border border-sky-200 shadow-sm">
          <Clock className="w-3.5 h-3.5 text-sky-600" />
          Metadata
        </span>
      );
    case 'Evidence':
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 shadow-sm">
          <FileText className="w-3.5 h-3.5 text-indigo-600" />
          Evidence
        </span>
      );
    case 'User statement':
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200 shadow-sm">
          <UserCheck className="w-3.5 h-3.5 text-amber-600" />
          User statement
        </span>
      );
    case 'Evidentiary Finding':
    case 'Investigative Finding':
    case 'AI observation':
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-purple-50 text-purple-700 border border-purple-200 shadow-sm">
          <ShieldCheck className="w-3.5 h-3.5 text-purple-600" />
          Evidentiary Finding
        </span>
      );
    case 'Document content':
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-sm">
          <FileText className="w-3.5 h-3.5 text-emerald-600" />
          Document content
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200 shadow-sm">
          {sourceType}
        </span>
      );
  }
};

export const IntegrityBadge = ({ recorded = true }) => {
  return (
    <div
      title="The integrity hash can be used to check whether the stored file has changed since the hash was recorded."
      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/90 cursor-help shadow-sm"
    >
      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
      <span>Integrity Recorded</span>
    </div>
  );
};
