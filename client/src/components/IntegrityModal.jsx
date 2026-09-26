import React from 'react';
import { ShieldCheck, AlertTriangle, X, CheckCircle2, Clock } from 'lucide-react';

export const IntegrityModal = ({ isOpen, onClose, result, loading, evidenceTitle }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
      <div className="bg-white/95 backdrop-blur-xl border border-purple-200/90 w-full max-w-xl rounded-3xl shadow-2xl p-7 relative animate-fadeIn">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 p-2 rounded-full hover:bg-purple-100/60 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3.5 mb-5">
          <div className={`p-3 rounded-2xl border ${
            result?.valid
              ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
              : 'bg-rose-50 border-rose-200 text-rose-700'
          }`}>
            <ShieldCheck className="w-7 h-7" />
          </div>
          <div>
            <h3 className="font-display text-xl font-bold text-slate-900">Cryptographic Integrity Verification</h3>
            <p className="text-xs text-slate-500 truncate max-w-md mt-0.5">{evidenceTitle}</p>
          </div>
        </div>

        {loading ? (
          <div className="py-10 flex flex-col items-center justify-center gap-3">
            <div className="w-10 h-10 border-3 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-sm font-display font-bold text-purple-800">Recalculating SHA-256 digest from private vault storage...</p>
          </div>
        ) : result ? (
          <div className="space-y-4">
            <div className={`p-5 rounded-2xl border flex items-start gap-3 ${
              result.valid
                ? 'bg-emerald-50/80 border-emerald-200 text-emerald-900'
                : 'bg-rose-50/80 border-rose-200 text-rose-900'
            }`}>
              {result.valid ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-rose-600 mt-0.5 flex-shrink-0" />
              )}
              <div>
                <p className="font-bold text-sm text-emerald-950">{result.status}</p>
                <p className="text-xs mt-1 text-emerald-800 leading-relaxed">{result.message}</p>
              </div>
            </div>

            <div className="space-y-2.5 bg-purple-50/40 p-5 rounded-2xl border border-purple-100 font-mono text-xs">
              <div>
                <span className="text-purple-600 block mb-1 text-[11px] font-bold uppercase tracking-wider font-display">
                  Recorded Upload Hash (SHA-256):
                </span>
                <span className="text-slate-800 break-all select-all font-medium text-[13px]">{result.recordedHash}</span>
              </div>
              <div className="pt-2.5 border-t border-purple-100">
                <span className="text-purple-600 block mb-1 text-[11px] font-bold uppercase tracking-wider font-display">
                  Recalculated Vault File Hash:
                </span>
                <span className="text-purple-900 font-bold break-all select-all text-[13px]">{result.calculatedHash}</span>
              </div>
              {result.checkedAt && (
                <div className="pt-2 border-t border-purple-100 flex items-center gap-1.5 text-slate-500 text-xs">
                  <Clock className="w-3.5 h-3.5 text-purple-400" />
                  <span>Verified at: {new Date(result.checkedAt).toLocaleString()}</span>
                </div>
              )}
            </div>

            <div className="p-4 bg-purple-50/50 border border-purple-100 rounded-2xl text-xs text-purple-950 leading-relaxed">
              <span className="font-bold text-purple-950 font-display block mb-1">Evidentiary Notice:</span>
              The integrity hash proves file consistency after hashing. It confirms the file stored in your vault has remained byte-for-byte identical since it was preserved. It does not certify that the evidence was genuine or unaltered prior to initial upload.
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={onClose}
                className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-full text-xs font-bold transition shadow-md"
              >
                Close Verification
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};
