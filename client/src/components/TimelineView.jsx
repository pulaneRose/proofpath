import React from 'react';
import { Calendar, Clock, FileText, UserCheck, Sparkles, ExternalLink, ShieldCheck, ChevronRight } from 'lucide-react';
import { SourceBadge } from './StatusBadge';
import { Link } from 'react-router-dom';

export const TimelineView = ({ timeline = [], evidenceList = [] }) => {
  if (!timeline || timeline.length === 0) {
    return (
      <div className="py-12 text-center bg-white/70 backdrop-blur-md border border-purple-100 rounded-3xl p-8 shadow-sm">
        <Clock className="w-12 h-12 text-purple-400 mx-auto mb-3" />
        <p className="text-slate-800 font-display font-bold text-base">No timeline events have been generated yet.</p>
        <p className="text-sm text-slate-500 mt-1">Run AI analysis to organize selected evidence into an objective chronological timeline.</p>
      </div>
    );
  }

  return (
    <div className="relative pl-7 space-y-7 before:absolute before:left-3 before:top-2 before:bottom-2 before:w-1 before:bg-gradient-to-b before:from-purple-600 before:via-purple-300 before:to-indigo-200 before:rounded-full">
      {timeline.map((event, idx) => {
        const isDiscrepancy = event.description?.toLowerCase().includes('discrepancy') || event.title?.toLowerCase().includes('discrepancy');

        return (
          <div key={event.id || idx} className="relative group">
            {/* Timeline Dot */}
            <div className={`absolute -left-[23px] top-3 w-5 h-5 rounded-full border-3 bg-white transition-transform group-hover:scale-125 shadow-md ${
              event.sourceType === 'Metadata'
                ? 'border-purple-500'
                : event.sourceType === 'User statement'
                ? 'border-amber-500'
                : event.sourceType === 'Evidence'
                ? 'border-indigo-600'
                : 'border-pink-500'
            }`}></div>

            {/* Event Box */}
            <div className={`p-6 rounded-3xl border transition-all ${
              isDiscrepancy
                ? 'bg-rose-50/70 border-rose-300 shadow-md'
                : 'bg-white/85 backdrop-blur-md border-purple-100/90 hover:border-purple-300 hover:shadow-lg'
            }`}>
              <div className="flex flex-wrap items-center justify-between gap-2 mb-2.5">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-purple-800 flex items-center gap-1.5 bg-purple-50 px-3 py-1 rounded-full border border-purple-200">
                    <Calendar className="w-3.5 h-3.5 text-purple-600" />
                    {event.date}
                    {event.time && <span className="text-slate-600">({event.time})</span>}
                  </span>
                  <SourceBadge sourceType={event.sourceType} />
                </div>

                {event.evidenceRefCode && (
                  <span className="px-3 py-0.5 rounded-full bg-slate-100 text-slate-700 font-mono text-xs font-bold border border-slate-200">
                    Ref: {event.evidenceRefCode}
                  </span>
                )}
              </div>

              <h4 className="font-display font-bold text-lg text-slate-900 mb-1.5">{event.title}</h4>
              <p className="text-sm text-slate-600 leading-relaxed font-normal">{event.description}</p>

              {event.sourceDetails && (
                <div className="mt-3.5 pt-3 border-t border-purple-100 flex items-center justify-between text-xs text-slate-500">
                  <span className="truncate max-w-sm font-medium">Source record: {event.sourceDetails}</span>
                  {event.evidenceId && (
                    <Link
                      to={`/evidence/${event.evidenceId}`}
                      className="text-purple-700 hover:text-purple-900 font-bold flex items-center gap-1 transition"
                    >
                      <span>View Evidence Record</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  )}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
