import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  UploadCloud,
  FileText,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  X,
  ShieldCheck,
  Tag,
  ArrowRight,
  Lock,
  Sparkles
} from 'lucide-react';
import { DashboardLayout } from '../components/DashboardLayout';
import api from '../services/api';

export const EvidenceUpload = () => {
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Attendance');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [dragActive, setDragActive] = useState(false);

  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  const categories = [
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

  const handleFileChange = (selectedFile) => {
    if (!selectedFile) return;

    if (selectedFile.size > 25 * 1024 * 1024) {
      setError('File size exceeds the 25 MB limit.');
      return;
    }

    if (selectedFile.size === 0) {
      setError('Empty files cannot be preserved as evidence.');
      return;
    }

    const ext = selectedFile.name.substring(selectedFile.name.lastIndexOf('.')).toLowerCase();
    const validExts = ['.jpg', '.jpeg', '.png', '.webp', '.heic', '.pdf'];

    if (!validExts.includes(ext) && !selectedFile.type.startsWith('image/') && selectedFile.type !== 'application/pdf') {
      setError('This file type is not currently supported. ProofPath supports JPG, PNG, HEIC, and PDF.');
      return;
    }

    setError('');
    setFile(selectedFile);

    if (!title.trim()) {
      const cleanName = selectedFile.name.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' ');
      setTitle(cleanName.charAt(0).toUpperCase() + cleanName.slice(1));
    }

    if (selectedFile.type.startsWith('image/')) {
      const url = URL.createObjectURL(selectedFile);
      setPreviewUrl(url);
    } else {
      setPreviewUrl(null);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleRemoveFile = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setFile(null);
    setPreviewUrl(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('Please select an evidence file to preserve.');
      return;
    }
    if (!title.trim()) {
      setError('Evidence title is required.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('title', title.trim());
      formData.append('category', category);
      formData.append('description', description.trim());
      formData.append('tags', tags);

      const res = await api.post('/evidence', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const newId = res.data.evidence?._id;
      navigate(`/evidence/${newId}`);
    } catch (err) {
      console.error('Evidence preservation failed:', err);
      setError(
        err.response?.data?.error || "We couldn't preserve this evidence. Your file was not added to the vault."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout
      title="Upload & Preserve Evidence"
      subtitle="Original files are securely sealed with automatic EXIF extraction and SHA-256 cryptographic hashing."
    >
      <div className="max-w-3xl mx-auto space-y-6">
        {error && (
          <div className="p-4 rounded-2xl bg-rose-50/90 border border-rose-200 text-rose-800 text-sm font-medium flex items-center gap-3 shadow-sm">
            <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-600" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Dropzone / File Selector */}
          {!file ? (
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-3xl p-10 text-center cursor-pointer transition-all duration-300 flex flex-col items-center justify-center gap-4 ${
                dragActive
                  ? 'border-purple-600 bg-purple-50/60 scale-[1.01]'
                  : 'border-purple-200 hover:border-purple-400 bg-white/70 hover:bg-white/95 shadow-sm'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".jpg,.jpeg,.png,.webp,.heic,.pdf,image/*,application/pdf"
                onChange={(e) => handleFileChange(e.target.files?.[0])}
                className="hidden"
              />

              <div className="w-18 h-18 p-4 rounded-3xl bg-purple-50 border border-purple-200 flex items-center justify-center text-purple-600 shadow-sm">
                <UploadCloud className="w-9 h-9" />
              </div>

              <div>
                <p className="font-display text-lg font-bold text-slate-800">
                  Drag and drop your evidence file here, or <span className="text-purple-700 underline decoration-purple-400 underline-offset-4">browse files</span>
                </p>
                <p className="text-sm text-slate-500 mt-1 font-medium">
                  Supported formats: JPG, PNG, HEIC, and PDF (Up to 25 MB)
                </p>
              </div>

              <div className="flex flex-wrap justify-center items-center gap-4 text-xs font-mono text-purple-700 pt-3 border-t border-purple-100 font-medium">
                <span className="flex items-center gap-1"><Lock className="w-3.5 h-3.5" /> Immutable storage</span>
                <span className="flex items-center gap-1"><Sparkles className="w-3.5 h-3.5" /> EXIF metadata parsing</span>
                <span className="flex items-center gap-1"><ShieldCheck className="w-3.5 h-3.5" /> SHA-256 integrity seal</span>
              </div>
            </div>
          ) : (
            <div className="cyber-card p-6 relative">
              <button
                type="button"
                onClick={handleRemoveFile}
                className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-purple-100/60 transition"
                title="Change File"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex flex-col sm:flex-row items-center gap-5">
                {previewUrl ? (
                  <div className="w-24 h-24 rounded-2xl overflow-hidden border border-purple-200 bg-purple-50 flex-shrink-0 shadow-sm">
                    <img
                      src={previewUrl}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-24 h-24 rounded-2xl border border-purple-200 bg-purple-50 flex flex-col items-center justify-center text-purple-600 flex-shrink-0 shadow-sm">
                    <FileText className="w-10 h-10" />
                    <span className="text-[11px] font-mono font-bold mt-1 text-purple-700 uppercase">
                      {file.name.split('.').pop()}
                    </span>
                  </div>
                )}

                <div className="min-w-0 flex-1 space-y-1 text-center sm:text-left">
                  <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-purple-50 text-purple-700 border border-purple-200">
                    READY TO SEAL IN VAULT
                  </span>
                  <h4 className="font-display font-bold text-lg text-slate-900 truncate">{file.name}</h4>
                  <p className="text-xs text-slate-500 font-mono font-medium">
                    Size: {(file.size / 1024).toFixed(1)} KB • Content: {file.type || 'Binary / Document'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Metadata & Description Form */}
          <div className="cyber-card p-6 sm:p-8 space-y-5">
            <h3 className="font-display text-base font-bold text-slate-900 uppercase tracking-wider border-b border-purple-100/80 pb-3 flex items-center gap-2">
              <FileText className="w-5 h-5 text-purple-600" />
              <span>Evidence Record Details</span>
            </h3>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wider font-display">
                Evidence Title <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Workplace desk arrival photo — September 23"
                className="w-full px-4 py-3 bg-white/80 border border-purple-200/80 rounded-2xl text-base text-slate-900 placeholder-slate-400 focus:outline-none focus:border-purple-600 focus:ring-4 focus:ring-purple-500/10 transition shadow-sm"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wider font-display">
                  Category <span className="text-rose-500">*</span>
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-4 py-3 bg-white/80 border border-purple-200/80 rounded-2xl text-base text-slate-900 focus:outline-none focus:border-purple-600 shadow-sm cursor-pointer"
                >
                  {categories.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wider font-display">
                  Tags (Comma separated)
                </label>
                <div className="relative">
                  <Tag className="w-4 h-4 text-purple-400 absolute left-4 top-4" />
                  <input
                    type="text"
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                    placeholder="e.g. work, attendance, dispute"
                    className="w-full pl-11 pr-4 py-3 bg-white/80 border border-purple-200/80 rounded-2xl text-base text-slate-900 placeholder-slate-400 focus:outline-none focus:border-purple-600 focus:ring-4 focus:ring-purple-500/10 transition shadow-sm"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wider font-display">
                Description / Context
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g. Photo taken on mobile camera immediately upon reaching workstation on the 4th floor engineering wing."
                className="w-full px-4 py-3 bg-white/80 border border-purple-200/80 rounded-2xl text-base text-slate-900 placeholder-slate-400 focus:outline-none focus:border-purple-600 focus:ring-4 focus:ring-purple-500/10 resize-none leading-relaxed shadow-sm"
              />
            </div>

            <div className="p-4 rounded-2xl bg-purple-50/70 border border-purple-100 text-xs text-purple-900 space-y-1">
              <span className="font-bold text-purple-950 font-display block">Security & Integrity Guarantee:</span>
              <p className="leading-relaxed">
                1. Cryptographic SHA-256 hash calculated & recorded immediately upon upload. <br />
                2. EXIF camera/device metadata extracted automatically (strictly without fabrication). <br />
                3. Raw file isolated in encrypted private vault outside public routing.
              </p>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                disabled={loading || !file}
                className="px-8 py-3.5 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:opacity-95 text-white font-bold text-sm transition shadow-lg shadow-purple-500/25 flex items-center gap-2.5 disabled:opacity-50 hover:scale-[1.02] active:scale-[0.98]"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Preserving Evidence & Hashing...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4 text-emerald-300" />
                    <span>Seal & Preserve in Vault</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
};
