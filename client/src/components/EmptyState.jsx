import React from 'react';
import { Link } from 'react-router-dom';
import { FolderPlus, PlusCircle } from 'lucide-react';

export const EmptyState = ({
  icon: Icon = FolderPlus,
  title,
  description,
  actionText,
  actionLink,
  onAction,
}) => {
  return (
    <div className="py-16 px-8 text-center bg-white/80 backdrop-blur-md border border-purple-100/90 rounded-3xl max-w-xl mx-auto flex flex-col items-center shadow-sm">
      <div className="w-18 h-18 p-4 rounded-3xl bg-purple-50 border border-purple-200/80 flex items-center justify-center text-purple-600 mb-5 shadow-sm">
        <Icon className="w-9 h-9" />
      </div>
      <h3 className="font-display text-2xl font-bold text-slate-900 mb-2">{title}</h3>
      <p className="text-sm text-slate-500 max-w-md leading-relaxed mb-6 font-normal">
        {description}
      </p>

      {actionLink ? (
        <Link
          to={actionLink}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:opacity-95 text-white font-bold text-sm transition shadow-lg shadow-purple-500/25 hover:scale-[1.02] active:scale-[0.98]"
        >
          <PlusCircle className="w-4 h-4" />
          <span>{actionText}</span>
        </Link>
      ) : onAction ? (
        <button
          onClick={onAction}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:opacity-95 text-white font-bold text-sm transition shadow-lg shadow-purple-500/25 hover:scale-[1.02] active:scale-[0.98]"
        >
          <PlusCircle className="w-4 h-4" />
          <span>{actionText}</span>
        </button>
      ) : null}
    </div>
  );
};
