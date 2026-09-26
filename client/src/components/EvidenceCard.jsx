import React from 'react';
import { Link } from 'react-router-dom';
import {
  FileText,
  Image as ImageIcon,
  ShieldCheck,
  Calendar,
  HardDrive,
  ArrowUpRight,
  CheckSquare,
  Square,
  MapPin,
  ExternalLink,
  Download
} from 'lucide-react';
import { CategoryBadge, IntegrityBadge } from './StatusBadge';

export const EvidenceCard = ({
  evidence,
  viewMode = 'list',
  selectable = false,
  isSelected = false,
  onSelect = () => {},
  onVerify = () => {},
}) => {
  const isImage = evidence.mimeType?.startsWith('image/');
  const meta = evidence.metadata || {};
  const formattedSize = (evidence.fileSize / 1024).toFixed(1) + ' KB';
  const uploadDate = new Date(evidence.uploadTimestamp || evidence.createdAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
  const takenDate = meta.dateTimeOriginal
    ? new Date(meta.dateTimeOriginal).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : null;

  // List view matching the horizontal cards in the reference image
  if (viewMode === 'list') {
    return (
      <div className={`cyber-card p-5 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 group ${
        isSelected
          ? 'border-purple-500 ring-2 ring-purple-400/30 bg-purple-50/40'
          : 'hover:border-purple-300'
      }`}>
        <div className="flex items-start sm:items-center gap-4 min-w-0">
          {selectable && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onSelect(evidence._id);
              }}
              className="text-purple-600 hover:text-purple-700 p-1 flex-shrink-0 mt-1 sm:mt-0"
            >
              {isSelected ? <CheckSquare className="w-5 h-5 text-purple-600" /> : <Square className="w-5 h-5 text-slate-400" />}
            </button>
          )}

          {/* Avatar with colorful gradient ring matching the reference image */}
          <div className="w-14 h-14 rounded-full p-0.5 bg-gradient-to-tr from-purple-500 via-pink-400 to-amber-300 flex-shrink-0 shadow-md">
            <div className="w-full h-full rounded-full bg-white flex items-center justify-center text-purple-700 overflow-hidden">
              {isImage ? (
                <img
                  src={`/api/evidence/${evidence._id}/file`}
                  alt={evidence.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
              ) : null}
              <div
                style={{ display: isImage ? 'none' : 'flex' }}
                className="w-full h-full items-center justify-center bg-purple-50"
              >
                <FileText className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <Link
                to={`/evidence/${evidence._id}`}
                className="font-display font-bold text-base sm:text-lg text-slate-900 hover:text-purple-700 transition truncate max-w-sm sm:max-w-md"
              >
                {evidence.title}
              </Link>
              <CategoryBadge category={evidence.category} />
              {meta.hasGps && (
                <span className="px-2.5 py-0.5 rounded-full bg-sky-50 text-sky-700 font-mono text-[10px] font-bold border border-sky-200">
                  GPS
                </span>
              )}
            </div>

            <p className="text-xs sm:text-sm text-slate-600 line-clamp-1 leading-relaxed">
              {evidence.description || 'No user description recorded.'}
            </p>

            <div className="flex flex-wrap items-center gap-3 mt-1.5 text-xs text-slate-500 font-medium">
              <span>{evidence.originalFilename}</span>
              <span>•</span>
              <span className="font-mono text-purple-700 font-bold">{formattedSize}</span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                {takenDate ? `Taken: ${takenDate}` : `Preserved: ${uploadDate}`}
              </span>
            </div>
          </div>
        </div>

        {/* Right Action buttons with pill shapes like in the screenshot */}
        <div className="flex items-center gap-2 flex-shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-purple-50">
          <a
            href={`/api/evidence/${evidence._id}/file?download=true`}
            download={evidence.originalFilename || 'evidence-file'}
            className="p-2 rounded-full bg-white hover:bg-purple-50 text-slate-500 hover:text-purple-700 border border-purple-200 transition shadow-sm"
            title="Download File"
          >
            <Download className="w-3.5 h-3.5 text-purple-600" />
          </a>

          <button
            type="button"
            onClick={() => onVerify(evidence)}
            className="px-3.5 py-1.5 rounded-full bg-white hover:bg-purple-50 text-purple-700 text-xs font-bold border border-purple-200 transition shadow-sm flex items-center gap-1.5"
            title="Verify SHA-256 Hash"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Verify</span>
          </button>

          <Link
            to={`/evidence/${evidence._id}`}
            className="px-4 py-1.5 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:opacity-95 text-white text-xs font-bold shadow-md shadow-purple-500/20 transition flex items-center gap-1"
          >
            <span>Inspect</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    );
  }

  // Grid view
  return (
    <div
      onClick={selectable ? () => onSelect(evidence._id) : undefined}
      className={`cyber-card overflow-hidden flex flex-col justify-between group relative cursor-pointer ${
        isSelected ? 'border-purple-600 ring-2 ring-purple-600/25 bg-purple-50/20' : ''
      }`}
    >
      {selectable && (
        <div className="absolute top-3 left-3 z-10">
          <div className="p-1 rounded-xl bg-white/90 backdrop-blur-sm border border-purple-100 shadow-sm">
            {isSelected ? (
              <CheckSquare className="w-5 h-5 text-purple-600" />
            ) : (
              <Square className="w-5 h-5 text-slate-400" />
            )}
          </div>
        </div>
      )}

      {/* Card Header Preview Area with soft pastel mesh */}
      <div className="h-40 bg-gradient-to-br from-purple-100/60 via-pink-50/50 to-indigo-100/50 border-b border-purple-100/70 relative flex items-center justify-center p-4">
        {isImage ? (
          <div className="flex flex-col items-center gap-2 text-purple-600 group-hover:scale-105 transition-transform">
            <div className="w-12 h-12 rounded-2xl bg-white/90 shadow-sm flex items-center justify-center">
              <ImageIcon className="w-6 h-6 text-purple-600" />
            </div>
            <span className="text-xs font-mono font-bold text-purple-900/70">Image Preserved</span>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 text-slate-500 group-hover:text-purple-600 group-hover:scale-105 transition-all">
            <div className="w-12 h-12 rounded-2xl bg-white/90 shadow-sm flex items-center justify-center">
              <FileText className="w-6 h-6 text-purple-600" />
            </div>
            <span className="text-xs font-mono font-bold text-purple-900/70">PDF Document</span>
          </div>
        )}

        <div className="absolute top-3 right-3">
          <CategoryBadge category={evidence.category} />
        </div>

        {meta.hasGps && (
          <div className="absolute bottom-2 left-2 px-2.5 py-0.5 rounded-full bg-white/95 border border-sky-200 text-sky-700 text-[11px] font-mono font-bold shadow-sm">
            GPS Available
          </div>
        )}
      </div>

      {/* Card Body */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-3.5">
        <div>
          <Link
            to={`/evidence/${evidence._id}`}
            onClick={(e) => selectable && e.stopPropagation()}
            className="font-display font-bold text-base text-slate-900 group-hover:text-purple-700 transition line-clamp-1"
          >
            {evidence.title}
          </Link>
          <p className="text-xs text-slate-600 line-clamp-2 mt-1 leading-relaxed font-medium">
            {evidence.description || 'No description provided.'}
          </p>
        </div>

        <div className="pt-3 border-t border-purple-100/70 space-y-2 text-xs text-slate-500">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
              <Calendar className="w-3.5 h-3.5 text-purple-500" />
              {takenDate ? `Taken: ${takenDate}` : `Uploaded: ${uploadDate}`}
            </span>
            <span className="font-mono text-xs text-purple-700 font-bold">{formattedSize}</span>
          </div>

          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-1.5 font-mono text-[11px] text-slate-500">
              <span className="text-purple-600 font-bold">SHA-256</span>
              <span className="truncate w-24 text-slate-700 font-medium">{evidence.sha256.substring(0, 10)}...</span>
            </div>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onVerify(evidence);
              }}
              className="text-xs text-purple-700 hover:text-purple-900 font-bold flex items-center gap-1 transition px-2.5 py-1 rounded-full bg-purple-50 hover:bg-purple-100 border border-purple-200"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              Verify
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
