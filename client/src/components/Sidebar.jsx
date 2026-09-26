import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  FolderLock,
  UploadCloud,
  FilePlus,
  Briefcase,
  ShieldCheck,
  User,
  LogOut,
  Sparkles,
  Shield,
  X,
  FileSignature,
  Users
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Sidebar = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const services = [
    { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
    { label: 'Evidence Vault', icon: FolderLock, path: '/vault' },
    { label: 'Upload Evidence', icon: UploadCloud, path: '/evidence/upload' },
    { label: 'Legal Contracts', icon: FileSignature, path: '/contracts' },
    { label: 'Contacts Directory', icon: Users, path: '/contacts' },
  ];

  const caseServices = [
    { label: 'Build a Case', icon: FilePlus, path: '/cases/new' },
    { label: 'My Cases', icon: Briefcase, path: '/cases' },
    { label: 'Security & Privacy', icon: ShieldCheck, path: '/security' },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-purple-950/20 backdrop-blur-sm lg:hidden"
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 glass-sidebar flex flex-col justify-between transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="overflow-y-auto">
          {/* Brand header */}
          <div className="h-20 px-6 flex items-center justify-between">
            <NavLink to="/dashboard" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-600 via-fuchsia-500 to-pink-500 flex items-center justify-center text-white font-bold shadow-md shadow-purple-500/30 group-hover:scale-105 transition-transform">
                <Shield className="w-5 h-5 fill-white/20" />
              </div>
              <div className="flex flex-col">
                <span className="font-display font-extrabold text-2xl tracking-tight bg-gradient-to-r from-purple-950 via-purple-800 to-indigo-900 bg-clip-text text-transparent">
                  proofpath
                </span>
                <span className="text-[10px] font-mono tracking-widest text-purple-600 uppercase font-semibold">
                  Vault & Case Builder
                </span>
              </div>
            </NavLink>
            <button
              onClick={onClose}
              className="lg:hidden text-slate-400 hover:text-slate-700 p-1.5 rounded-xl hover:bg-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation sections */}
          <div className="px-4 py-3 space-y-6">
            <div>
              <p className="px-3 text-[11px] font-mono uppercase tracking-wider text-purple-900/50 font-bold mb-2">
                Services
              </p>
              <nav className="space-y-1">
                {services.map((item) => {
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      onClick={() => onClose && onClose()}
                      className={({ isActive }) =>
                        `flex items-center gap-3.5 px-3.5 py-2.5 rounded-2xl text-[14px] font-bold transition-all ${
                          isActive
                            ? 'bg-purple-100/80 text-purple-800 shadow-sm'
                            : 'text-slate-600 hover:text-purple-800 hover:bg-white/70'
                        }`
                      }
                    >
                      <Icon className="w-4 h-4 flex-shrink-0 text-purple-600" />
                      <span>{item.label}</span>
                    </NavLink>
                  );
                })}
              </nav>
            </div>

            <div>
              <p className="px-3 text-[11px] font-mono uppercase tracking-wider text-purple-900/50 font-bold mb-2">
                Case Management
              </p>
              <nav className="space-y-1">
                {caseServices.map((item) => {
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      onClick={() => onClose && onClose()}
                      className={({ isActive }) =>
                        `flex items-center gap-3.5 px-3.5 py-2.5 rounded-2xl text-[14px] font-bold transition-all ${
                          isActive
                            ? 'bg-purple-100/80 text-purple-800 shadow-sm'
                            : 'text-slate-600 hover:text-purple-800 hover:bg-white/70'
                        }`
                      }
                    >
                      <Icon className="w-4 h-4 flex-shrink-0 text-purple-600" />
                      <span>{item.label}</span>
                    </NavLink>
                  );
                })}
              </nav>
            </div>
          </div>
        </div>

        {/* User profile & Logout */}
        <div className="p-4 border-t border-purple-100/80 space-y-3 bg-white/40">
          <div className="flex items-center gap-3 px-2 py-1">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-500 to-indigo-500 flex items-center justify-center text-white text-sm font-bold shadow-md shadow-purple-500/25">
              {user?.fullName ? user.fullName[0].toUpperCase() : 'U'}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-slate-900 truncate">
                {user?.fullName || 'Authorized User'}
              </p>
              <p className="text-xs text-slate-500 truncate font-medium">{user?.email}</p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-2xl bg-white hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 text-slate-600 text-xs font-bold border border-slate-200/80 transition-all shadow-sm"
          >
            <LogOut className="w-3.5 h-3.5 text-rose-500" />
            <span>Sign Out</span>
          </button>

          <p className="text-center text-[11px] text-slate-400 font-mono pt-1">
            © 2026 ProofPath Vault
          </p>
        </div>
      </aside>
    </>
  );
};
