import React, { useState, useRef, useEffect } from 'react';
import {
  Menu,
  Plus,
  Sparkles,
  Shield,
  UploadCloud,
  Bell,
  Search,
  User,
  X,
  CheckCircle2,
  FileSignature,
  ShieldCheck
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { useAuth } from '../context/AuthContext';

export const DashboardLayout = ({ children, title, subtitle, actions }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [globalSearch, setGlobalSearch] = useState('');
  const { user } = useAuth();
  const navigate = useNavigate();

  // Notification Center State
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const notificationRef = useRef(null);

  const [notifications, setNotifications] = useState([
    {
      id: 'notif-1',
      title: 'Evidence Cryptographically Sealed',
      message: 'SHA-256 digest computed and verified for new vault uploads.',
      time: 'Just now',
      read: false,
      type: 'evidence',
      link: '/vault'
    },
    {
      id: 'notif-2',
      title: 'Formal Contract Synthesized',
      message: 'New 10-article legal agreement ready for execution & export.',
      time: '12m ago',
      read: false,
      type: 'contract',
      link: '/contracts'
    },
    {
      id: 'notif-3',
      title: 'Evidentiary Case Brief Ready',
      message: 'Chronological timeline and causes of action assembled.',
      time: '1h ago',
      read: true,
      type: 'case',
      link: '/cases'
    },
    {
      id: 'notif-4',
      title: 'Integrity Check Passed',
      message: 'Zero tampering detected across all private vault exhibits.',
      time: '3h ago',
      read: true,
      type: 'integrity',
      link: '/security'
    }
  ]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setNotificationsOpen(false);
      }
    };
    if (notificationsOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [notificationsOpen]);

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const markSingleAsRead = (id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const removeNotification = (e, id) => {
    e.stopPropagation();
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (globalSearch.trim()) {
      navigate(`/vault?search=${encodeURIComponent(globalSearch.trim())}`);
    }
  };

  return (
    <div className="min-h-screen flex text-slate-800 font-sans">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Canvas Area */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64">
        {/* Top Header matching reference image */}
        <header className="sticky top-0 z-30 h-20 bg-white/70 backdrop-blur-xl border-b border-purple-100/70 px-4 sm:px-8 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-1 max-w-md">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-2xl text-slate-600 hover:text-slate-900 hover:bg-white shadow-sm"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Pill Search Input */}
            <form onSubmit={handleSearchSubmit} className="relative w-full hidden sm:block">
              <Search className="w-4 h-4 text-purple-400 absolute left-4 top-3" />
              <input
                type="text"
                value={globalSearch}
                onChange={(e) => setGlobalSearch(e.target.value)}
                placeholder="SEARCH VAULT & CASSETTES..."
                className="w-full pl-10 pr-4 py-2 bg-white/80 hover:bg-white border border-purple-100/90 rounded-full text-xs font-mono text-slate-800 placeholder-purple-900/40 uppercase tracking-wider focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 shadow-sm transition"
              />
            </form>
          </div>

          {/* Right Action Elements: Pill Button, Bell, Avatar */}
          <div className="flex items-center gap-3">
            {actions}

            <Link
              to="/evidence/upload"
              className="hidden sm:inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white hover:bg-purple-50 text-purple-700 text-xs font-bold border border-purple-200/90 shadow-sm transition"
            >
              <UploadCloud className="w-3.5 h-3.5 text-purple-600" />
              <span>Preserve</span>
            </Link>

            <Link
              to="/cases/new"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-purple-600 via-fuchsia-600 to-indigo-600 hover:opacity-95 text-white text-xs font-bold shadow-md shadow-purple-500/25 transition active:scale-95"
            >
              <Sparkles className="w-4 h-4" />
              <span className="uppercase tracking-wider">Build Case</span>
            </Link>

            {/* Notification Bell with Responsive Dropdown Panel */}
            <div className="relative" ref={notificationRef}>
              <button
                type="button"
                onClick={() => setNotificationsOpen((prev) => !prev)}
                className={`relative p-2.5 rounded-full border transition-all shadow-sm ${
                  notificationsOpen
                    ? 'bg-purple-100/90 text-purple-900 border-purple-300 ring-2 ring-purple-400/20'
                    : 'bg-white hover:bg-purple-50 text-slate-600 hover:text-purple-700 border-purple-100/80'
                }`}
                title="Notifications"
                aria-expanded={notificationsOpen}
                aria-label="View notifications"
              >
                <Bell className="w-4 h-4 text-purple-700" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-pink-500 text-white font-mono font-bold text-[10px] flex items-center justify-center shadow-xs animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Responsive Notification Popover */}
              {notificationsOpen && (
                <div className="absolute right-0 sm:right-auto sm:-left-36 top-12 w-[calc(100vw-2.5rem)] sm:w-96 max-w-sm bg-white/95 backdrop-blur-2xl border border-purple-200/90 rounded-3xl shadow-2xl z-50 p-4 animate-in fade-in zoom-in-95 duration-150">
                  {/* Header */}
                  <div className="flex items-center justify-between border-b border-purple-100/80 pb-3 mb-2">
                    <div className="flex items-center gap-2">
                      <h4 className="font-display font-extrabold text-sm text-slate-900">Notifications</h4>
                      {unreadCount > 0 ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-pink-100 text-pink-700 border border-pink-200">
                          {unreadCount} new
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          All caught up
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      {unreadCount > 0 && (
                        <button
                          type="button"
                          onClick={markAllAsRead}
                          className="text-[11px] font-bold text-purple-700 hover:text-purple-900 px-2 py-1 rounded-lg hover:bg-purple-50 transition"
                          title="Mark all as read"
                        >
                          Mark all read
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => setNotificationsOpen(false)}
                        className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* List of Notifications */}
                  {notifications.length === 0 ? (
                    <div className="py-8 text-center space-y-2">
                      <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
                      <p className="text-xs font-bold text-slate-700">No active notifications</p>
                      <p className="text-[11px] text-slate-400">All evidentiary activity and events are up to date.</p>
                    </div>
                  ) : (
                    <div className="max-h-80 overflow-y-auto space-y-2 divide-y divide-purple-50 pr-0.5">
                      {notifications.map((notif) => (
                        <div
                          key={notif.id}
                          onClick={() => {
                            markSingleAsRead(notif.id);
                            if (notif.link) {
                              setNotificationsOpen(false);
                              navigate(notif.link);
                            }
                          }}
                          className={`pt-2 first:pt-0 p-2.5 rounded-2xl cursor-pointer transition-all flex items-start gap-3 group ${
                            notif.read
                              ? 'bg-transparent hover:bg-purple-50/50 opacity-75'
                              : 'bg-purple-50/70 hover:bg-purple-100/60 border border-purple-100'
                          }`}
                        >
                          <div className="p-2 rounded-xl bg-white shadow-2xs text-purple-700 flex-shrink-0 mt-0.5 border border-purple-100">
                            {notif.type === 'contract' ? (
                              <FileSignature className="w-4 h-4 text-indigo-600" />
                            ) : notif.type === 'case' ? (
                              <Sparkles className="w-4 h-4 text-purple-600" />
                            ) : notif.type === 'integrity' ? (
                              <ShieldCheck className="w-4 h-4 text-emerald-600" />
                            ) : (
                              <UploadCloud className="w-4 h-4 text-blue-600" />
                            )}
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-1">
                              <p className="text-xs font-bold text-slate-900 truncate group-hover:text-purple-700 transition">
                                {notif.title}
                              </p>
                              {!notif.read && (
                                <span className="w-2 h-2 rounded-full bg-pink-500 flex-shrink-0" />
                              )}
                            </div>
                            <p className="text-[11px] text-slate-600 line-clamp-2 leading-relaxed mt-0.5">
                              {notif.message}
                            </p>
                            <span className="text-[10px] font-mono text-purple-600/70 font-semibold block mt-1">
                              {notif.time}
                            </span>
                          </div>

                          <button
                            type="button"
                            onClick={(e) => removeNotification(e, notif.id)}
                            className="text-slate-300 hover:text-slate-500 p-1 opacity-0 group-hover:opacity-100 transition rounded-lg hover:bg-white"
                            title="Dismiss"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Footer */}
                  <div className="mt-3 pt-2.5 border-t border-purple-100 flex items-center justify-between text-[11px] font-bold">
                    <button
                      type="button"
                      onClick={() => {
                        setNotificationsOpen(false);
                        navigate('/vault');
                      }}
                      className="text-purple-700 hover:text-purple-900 transition"
                    >
                      Open Evidence Vault →
                    </button>
                    {notifications.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setNotifications([])}
                        className="text-slate-400 hover:text-rose-600 transition"
                      >
                        Clear all
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* User Profile Avatar with vibrant gradient ring */}
            <Link
              to="/security"
              className="w-10 h-10 rounded-full p-0.5 bg-gradient-to-tr from-purple-500 via-pink-500 to-yellow-400 shadow-sm hover:scale-105 transition"
              title="Profile & Security"
            >
              <div className="w-full h-full rounded-full bg-white flex items-center justify-center text-xs font-bold text-purple-800 font-display">
                {user?.fullName ? user.fullName[0].toUpperCase() : 'U'}
              </div>
            </Link>
          </div>
        </header>

        {/* Page Content Container */}
        <main className="flex-1 p-4 sm:p-7 lg:p-9 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
};
