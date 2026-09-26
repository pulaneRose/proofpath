import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Shield,
  UploadCloud,
  FileCheck2,
  Sparkles,
  Lock,
  FileDown,
  ArrowRight,
  Database,
  Fingerprint,
  Layers,
  HelpCircle,
  Clock,
  CheckCircle2,
  Users,
  FileSignature,
  FileText,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';
import { Navbar } from '../components/Navbar';
import { useAuth } from '../context/AuthContext';

export const LandingPage = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-transparent text-slate-800 flex flex-col font-sans overflow-x-hidden">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-16 pb-24 md:pt-24 md:pb-32">
        {/* Animated Background Orbs */}
        <div className="absolute top-10 left-1/4 w-96 h-96 rounded-full bg-purple-300/30 blur-3xl pointer-events-none animate-pulse-glow" />
        <div className="absolute top-40 right-1/4 w-80 h-80 rounded-full bg-pink-300/25 blur-3xl pointer-events-none animate-pulse-glow" style={{ animationDelay: '2s' }} />
        <div className="absolute bottom-10 left-1/3 w-72 h-72 rounded-full bg-indigo-300/20 blur-3xl pointer-events-none animate-pulse-glow" style={{ animationDelay: '3.5s' }} />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-white/80 backdrop-blur-md border border-purple-200/90 text-purple-800 text-xs font-bold uppercase tracking-wider mb-8 shadow-sm hover:scale-105 transition-transform cursor-default">
            <Fingerprint className="w-4 h-4 text-purple-600 animate-pulse" />
            <span>Evidentiary Vault, Case Builder & Legal Contracts</span>
          </div>

          {/* Main Title */}
          <h1 className="font-display text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight max-w-4xl mx-auto text-slate-900 leading-[1.12]">
            Your Evidence.{' '}
            <span className="bg-gradient-to-r from-purple-600 via-fuchsia-600 to-indigo-600 bg-clip-text text-transparent">
              Your Timeline.
            </span>{' '}
            Your Case.
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed font-normal">
            Securely preserve critical evidence and organize it into a clear, AI-assisted case when disputes occur. Never wait until it's too late to preserve your proof.
          </p>

          {/* CTA Buttons */}
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link
              to={isAuthenticated ? "/dashboard" : "/register"}
              className="inline-flex items-center gap-2.5 px-8 py-4 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:opacity-95 text-white font-bold text-base transition shadow-xl shadow-purple-500/25 hover:scale-[1.03] active:scale-[0.98]"
            >
              <span>{isAuthenticated ? 'Open Dashboard' : 'Get Started Free'}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <a
              href="#how-it-works"
              className="inline-flex items-center gap-2 px-7 py-4 rounded-full bg-white/85 hover:bg-white text-slate-700 hover:text-purple-900 font-bold text-base border border-purple-200/80 shadow-md shadow-purple-100/50 transition hover:scale-[1.02]"
            >
              <span>How It Works</span>
            </a>

            <Link
              to={isAuthenticated ? "/contracts" : "/register"}
              className="inline-flex items-center gap-2 px-7 py-4 rounded-full bg-purple-100/80 hover:bg-purple-200/80 text-purple-900 font-bold text-base border border-purple-200/80 transition hover:scale-[1.02]"
            >
              <FileSignature className="w-4 h-4 text-purple-700" />
              <span>Contracts & Contacts</span>
            </Link>
          </div>

          {/* Interactive Floating Preview Graphic */}
          <div className="mt-16 max-w-4xl mx-auto relative">
            <div className="cyber-card p-6 sm:p-8 relative z-20 shadow-2xl border-purple-200/90 text-left">
              <div className="flex items-center justify-between border-b border-purple-100 pb-4 mb-5">
                <div className="flex items-center gap-2.5">
                  <div className="w-3 h-3 rounded-full bg-rose-400"></div>
                  <div className="w-3 h-3 rounded-full bg-amber-400"></div>
                  <div className="w-3 h-3 rounded-full bg-emerald-400"></div>
                  <span className="ml-2 font-display font-bold text-xs uppercase tracking-wider text-slate-500">
                    Live ProofPath Vault Activity
                  </span>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-purple-50 text-purple-700 border border-purple-200">
                  SHA-256 VERIFIED
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="p-4 rounded-2xl bg-white/90 border border-purple-100/90 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-purple-900">Desk Photo — Work Attendance</span>
                    <span className="text-[11px] font-mono text-emerald-600 font-bold">100% Intact</span>
                  </div>
                  <p className="text-xs text-slate-500 font-mono break-all">
                    ed6a658a5a97d82e850b57e7f6071...
                  </p>
                  <div className="flex items-center gap-2 pt-1 text-[11px] text-slate-500">
                    <Clock className="w-3.5 h-3.5 text-purple-400" />
                    <span>Captured: 08:15 AM • EXIF Extracted</span>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-white/90 border border-purple-100/90 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-purple-900">Employment Contract Record</span>
                    <span className="text-[11px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">Active</span>
                  </div>
                  <p className="text-xs text-slate-600">
                    Counterparty: ACME Logistics Inc. (Supervisor: John Henderson)
                  </p>
                  <div className="flex items-center gap-2 pt-1 text-[11px] text-slate-500">
                    <FileSignature className="w-3.5 h-3.5 text-indigo-500" />
                    <span>Linked Evidence: 2 Files Preserved</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Floating Card Left */}
            <div className="hidden lg:flex items-center gap-3 p-4 rounded-2xl bg-white/90 backdrop-blur-xl border border-purple-200 shadow-xl absolute -left-12 -top-8 z-30 animate-float">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div className="text-left">
                <div className="text-xs font-bold text-slate-900 font-display">Zero Modification</div>
                <div className="text-[11px] text-slate-500 font-mono">Tamper-Evident SHA-256</div>
              </div>
            </div>

            {/* Floating Card Right */}
            <div className="hidden lg:flex items-center gap-3 p-4 rounded-2xl bg-white/90 backdrop-blur-xl border border-purple-200 shadow-xl absolute -right-12 -bottom-6 z-30 animate-float-reverse">
              <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-purple-600" />
              </div>
              <div className="text-left">
                <div className="text-xs font-bold text-slate-900 font-display">Evidentiary Timeline</div>
                <div className="text-[11px] text-slate-500">Auto-Generates Case Chronology</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Visual Three-Step Explanation */}
      <section id="how-it-works" className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="font-display text-3xl font-extrabold text-slate-900 tracking-tight sm:text-4xl">
              Three Steps to Secure Proof
            </h2>
            <p className="mt-3 text-slate-500 text-sm sm:text-base font-normal">
              Designed from the ground up for workplace disputes, housing issues, consumer rights, and contracts.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="cyber-card p-8 flex flex-col justify-between hover:-translate-y-1.5 transition-transform duration-300">
              <div>
                <div className="w-14 h-14 rounded-2xl bg-purple-50 border border-purple-200 flex items-center justify-center text-purple-700 font-display font-extrabold text-xl mb-6 shadow-sm">
                  01
                </div>
                <h3 className="font-display text-2xl font-bold text-slate-900 mb-2">1. Preserve</h3>
                <p className="text-sm text-slate-600 leading-relaxed font-normal">
                  Securely upload important evidence before or after a dispute. Upload desk photos, supervisor chats, payslips, emails, and PDFs.
                </p>
              </div>
              <div className="mt-8 pt-4 border-t border-purple-100 text-xs font-mono font-bold text-emerald-700 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>SHA-256 hash calculated at upload</span>
              </div>
            </div>

            {/* Step 2 */}
            <div className="cyber-card p-8 flex flex-col justify-between hover:-translate-y-1.5 transition-transform duration-300">
              <div>
                <div className="w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-700 font-display font-extrabold text-xl mb-6 shadow-sm">
                  02
                </div>
                <h3 className="font-display text-2xl font-bold text-slate-900 mb-2">2. Organize</h3>
                <p className="text-sm text-slate-600 leading-relaxed font-normal">
                  ProofPath automatically extracts available camera EXIF metadata (capture dates, device model, GPS) and keeps your records searchable.
                </p>
              </div>
              <div className="mt-8 pt-4 border-t border-purple-100 text-xs font-mono font-bold text-purple-700 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-purple-600" />
                <span>Strict metadata extraction, never fabricated</span>
              </div>
            </div>

            {/* Step 3 */}
            <div className="cyber-card p-8 flex flex-col justify-between hover:-translate-y-1.5 transition-transform duration-300">
              <div>
                <div className="w-14 h-14 rounded-2xl bg-pink-50 border border-pink-200 flex items-center justify-center text-pink-700 font-display font-extrabold text-xl mb-6 shadow-sm">
                  03
                </div>
                <h3 className="font-display text-2xl font-bold text-slate-900 mb-2">3. Build</h3>
                <p className="text-sm text-slate-600 leading-relaxed font-normal">
                  Select evidence from your vault and let ProofPath organize it into an objective, factual case timeline with clear source attribution and PDF export.
                </p>
              </div>
              <div className="mt-8 pt-4 border-t border-purple-100 text-xs font-mono font-bold text-indigo-700 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-indigo-600" />
                <span>Export ready-to-print Case Reports</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Deep Dive */}
      <section id="features" className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="font-display text-3xl font-extrabold text-slate-900 tracking-tight sm:text-4xl">
              Engineered for Critical Evidence
            </h2>
            <p className="mt-3 text-slate-500 text-sm sm:text-base font-normal">
              Built on cybersecurity standards to prevent tampering, confusion, and data loss.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="cyber-card p-7 space-y-3 hover:-translate-y-1 transition-transform">
              <div className="p-3 w-fit rounded-2xl bg-purple-50 border border-purple-200 text-purple-700">
                <Database className="w-5 h-5" />
              </div>
              <h4 className="font-display text-lg font-bold text-slate-900">Private Evidence Vault</h4>
              <p className="text-sm text-slate-600 leading-relaxed font-normal">
                Files are stored outside public directories and protected with strict per-user authorization checks on every request.
              </p>
            </div>

            <div className="cyber-card p-7 space-y-3 hover:-translate-y-1 transition-transform">
              <div className="p-3 w-fit rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700">
                <Fingerprint className="w-5 h-5" />
              </div>
              <h4 className="font-display text-lg font-bold text-slate-900">SHA-256 Tamper Evidence</h4>
              <p className="text-sm text-slate-600 leading-relaxed font-normal">
                A cryptographic digest is recorded at upload. Verify at any time to demonstrate byte-level consistency since preservation.
              </p>
            </div>

            <div className="cyber-card p-7 space-y-3 hover:-translate-y-1 transition-transform">
              <div className="p-3 w-fit rounded-2xl bg-indigo-50 border border-indigo-200 text-indigo-700">
                <FileSignature className="w-5 h-5" />
              </div>
              <h4 className="font-display text-lg font-bold text-slate-900">Contracts & Contacts</h4>
              <p className="text-sm text-slate-600 leading-relaxed font-normal">
                Record employers, landlords, witnesses, and contracts with key terms, attached vault files, and counterparty records.
              </p>
            </div>

            <div className="cyber-card p-7 space-y-3 hover:-translate-y-1 transition-transform">
              <div className="p-3 w-fit rounded-2xl bg-pink-50 border border-pink-200 text-pink-700">
                <Clock className="w-5 h-5" />
              </div>
              <h4 className="font-display text-lg font-bold text-slate-900">Automated EXIF Extraction</h4>
              <p className="text-sm text-slate-600 leading-relaxed font-normal">
                Extracts DateTimeOriginal, GPS coordinates, camera make, and model. If metadata does not exist, clearly marks it "Not available".
              </p>
            </div>

            <div className="cyber-card p-7 space-y-3 hover:-translate-y-1 transition-transform">
              <div className="p-3 w-fit rounded-2xl bg-purple-50 border border-purple-200 text-purple-700">
                <Layers className="w-5 h-5" />
              </div>
              <h4 className="font-display text-lg font-bold text-slate-900">Chronological Timeline</h4>
              <p className="text-sm text-slate-600 leading-relaxed font-normal">
                Every event links to an exact source: Metadata, Evidence, User statement, or Evidentiary Finding with E-001 reference codes.
              </p>
            </div>

            <div className="cyber-card p-7 space-y-3 hover:-translate-y-1 transition-transform">
              <div className="p-3 w-fit rounded-2xl bg-amber-50 border border-amber-200 text-amber-800">
                <FileDown className="w-5 h-5" />
              </div>
              <h4 className="font-display text-lg font-bold text-slate-900">Vector PDF Export</h4>
              <p className="text-sm text-slate-600 leading-relaxed font-normal">
                Generate clean, vector-sharp PDF reports with letterhead, evidence index, metadata tables, and legal disclaimers.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Security & Limitations Section */}
      <section id="security" className="py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="cyber-card p-8 sm:p-10 space-y-6">
            <div className="flex items-center gap-3">
              <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 shadow-sm">
                <Lock className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-display text-2xl font-bold text-slate-900">Security & Integrity Architecture</h3>
                <p className="text-sm text-slate-500 font-normal">Responsible evidentiary design principles</p>
              </div>
            </div>

            <div className="space-y-4 text-sm text-slate-600 leading-relaxed font-normal">
              <p>
                ProofPath records a <strong className="text-slate-900">SHA-256 cryptographic hash</strong> immediately upon file upload. This ensures tamper evidence: you can recalculate the hash at any time to verify that the file stored in your private vault is byte-for-byte identical to the original upload.
              </p>

              <div className="p-4 rounded-2xl bg-purple-50/60 border border-purple-200/80 font-mono text-xs text-purple-900 shadow-inner">
                SHA-256: 8f3a9c21d7e48b99c0182747183e29f8a92384a... [Cryptographically Sealed]
              </div>

              <div className="pt-2 border-t border-purple-100 space-y-2">
                <h5 className="font-display font-bold text-slate-900">Integrity Limitations Notice:</h5>
                <ul className="list-disc list-inside space-y-1.5 text-slate-600">
                  <li>A hash proves file consistency after hashing, not that evidence was genuine before upload.</li>
                  <li>ProofPath does not claim "blockchain verified" or "authenticity guaranteed".</li>
                  <li>ProofPath strictly distinguishes between tamper-evident integrity records and user-controlled deletion.</li>
                </ul>
              </div>

              <div className="pt-4 flex justify-end">
                <Link
                  to={isAuthenticated ? "/security" : "/register"}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-purple-50 hover:bg-purple-100 text-purple-800 text-xs font-bold border border-purple-200 transition"
                >
                  <span>Read Full Security Policy</span>
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mandatory Disclaimer Footer */}
      <footer className="mt-auto py-12 text-slate-500 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="p-5 rounded-3xl bg-white/70 backdrop-blur-md border border-purple-100/90 text-center max-w-4xl mx-auto shadow-sm">
            <p className="text-slate-600 leading-relaxed font-medium">
              <strong className="text-slate-800">Important Evidentiary Disclaimer:</strong> ProofPath helps users preserve and organize information. ProofPath is NOT a law firm and does NOT provide legal representation, guarantee evidentiary admissibility, or determine whether an allegation has been legally proven.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-purple-100 text-xs font-medium text-slate-500">
            <p>© {new Date().getFullYear()} ProofPath. Your Evidence. Your Timeline. Your Case.</p>
            <div className="flex items-center gap-6">
              <Link to="/login" className="hover:text-purple-700">Sign In</Link>
              <Link to="/register" className="hover:text-purple-700">Register</Link>
              <Link to="/contracts" className="hover:text-purple-700">Contracts</Link>
              <a href="#security" className="hover:text-purple-700">Security Architecture</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
