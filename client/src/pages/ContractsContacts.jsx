import React, { useState, useEffect } from 'react';
import {
  Users,
  FileSignature,
  Plus,
  Search,
  Filter,
  Mail,
  Phone,
  MapPin,
  Building2,
  Trash2,
  Edit2,
  FileText,
  Calendar,
  DollarSign,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  ExternalLink,
  X,
  ChevronRight,
  Briefcase,
  FileDown,
  Download,
  FolderArchive,
  Sparkles,
  Wand2,
  Scale,
  ScrollText
} from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { DashboardLayout } from '../components/DashboardLayout';
import { EmptyState } from '../components/EmptyState';
import api from '../services/api';

export const ContractsContacts = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const isContractRoute = location.pathname.startsWith('/contracts');
  const [activeTab, setActiveTab] = useState(isContractRoute ? 'contracts' : 'contacts');

  useEffect(() => {
    if (location.pathname.startsWith('/contracts')) {
      setActiveTab('contracts');
    } else if (location.pathname.startsWith('/contacts')) {
      setActiveTab('contacts');
    }
  }, [location.pathname]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab === 'contracts') {
      navigate('/contracts');
    } else {
      navigate('/contacts');
    }
  };

  // Contacts state
  const [contacts, setContacts] = useState([]);
  const [loadingContacts, setLoadingContacts] = useState(true);
  const [contactSearch, setContactSearch] = useState('');
  const [contactModalOpen, setContactModalOpen] = useState(false);
  const [editingContact, setEditingContact] = useState(null);

  // Contracts state
  const [contracts, setContracts] = useState([]);
  const [loadingContracts, setLoadingContracts] = useState(true);
  const [contractSearch, setContractSearch] = useState('');
  const [contractModalOpen, setContractModalOpen] = useState(false);
  const [editingContractId, setEditingContractId] = useState(null);
  const [contractModalTab, setContractModalTab] = useState('terms'); // 'terms' | 'body'
  const [draftingAi, setDraftingAi] = useState(false);
  const [vaultEvidence, setVaultEvidence] = useState([]);

  // Download states
  const [downloadingContractPdfId, setDownloadingContractPdfId] = useState(null);
  const [downloadingLegalPdfId, setDownloadingLegalPdfId] = useState(null);
  const [downloadingContractZipId, setDownloadingContractZipId] = useState(null);
  const [downloadingEvidenceId, setDownloadingEvidenceId] = useState(null);

  // Form states - Contact
  const [contactForm, setContactForm] = useState({
    name: '',
    organization: '',
    role: 'Counterparty',
    email: '',
    phone: '',
    address: '',
    relationship: 'Opposing Party',
    notes: '',
  });

  // Form states - Contract
  const [contractForm, setContractForm] = useState({
    title: '',
    contractType: 'Employment Agreement',
    counterpartyName: '',
    contactId: '',
    status: 'Active',
    startDate: '',
    endDate: '',
    value: '',
    keyTerms: '',
    governingLaw: 'State of New York',
    contractBody: '',
    notes: '',
    evidenceIds: [],
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchContacts();
    fetchContracts();
    fetchVaultEvidence();
  }, []);

  const fetchContacts = async () => {
    try {
      setLoadingContacts(true);
      const res = await api.get('/contacts');
      setContacts(res.data.contacts || []);
    } catch (err) {
      console.error('Failed to load contacts:', err);
    } finally {
      setLoadingContacts(false);
    }
  };

  const fetchContracts = async () => {
    try {
      setLoadingContracts(true);
      const res = await api.get('/contacts/contracts/all');
      setContracts(res.data.contracts || []);
    } catch (err) {
      console.error('Failed to load contracts:', err);
    } finally {
      setLoadingContracts(false);
    }
  };

  const fetchVaultEvidence = async () => {
    try {
      const res = await api.get('/evidence');
      setVaultEvidence(res.data.evidence || []);
    } catch (err) {
      console.error('Failed to load vault evidence:', err);
    }
  };

  // Contact Handlers
  const handleOpenContactModal = (contact = null) => {
    setError('');
    if (contact) {
      setEditingContact(contact);
      setContactForm({
        name: contact.name || '',
        organization: contact.organization || '',
        role: contact.role || 'Counterparty',
        email: contact.email || '',
        phone: contact.phone || '',
        address: contact.address || '',
        relationship: contact.relationship || 'Opposing Party',
        notes: contact.notes || '',
      });
    } else {
      setEditingContact(null);
      setContactForm({
        name: '',
        organization: '',
        role: 'Counterparty',
        email: '',
        phone: '',
        address: '',
        relationship: 'Opposing Party',
        notes: '',
      });
    }
    setContactModalOpen(true);
  };

  const handleSaveContact = async (e) => {
    e.preventDefault();
    if (!contactForm.name.trim()) {
      setError('Contact name is required.');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      if (editingContact) {
        await api.put(`/contacts/${editingContact._id}`, contactForm);
      } else {
        await api.post('/contacts', contactForm);
      }
      setContactModalOpen(false);
      fetchContacts();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save contact.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteContact = async (id) => {
    if (!confirm('Are you sure you want to delete this contact record?')) return;
    try {
      await api.delete(`/contacts/${id}`);
      fetchContacts();
    } catch (err) {
      alert('Failed to delete contact: ' + (err.response?.data?.error || err.message));
    }
  };

  // Contract Handlers
  const handleOpenContractModal = (contract = null) => {
    setError('');
    setContractModalTab('terms');
    if (contract) {
      setEditingContractId(contract._id);
      setContractForm({
        title: contract.title || '',
        contractType: contract.contractType || 'Employment Agreement',
        counterpartyName: contract.counterpartyName || '',
        contactId: contract.contactId?._id || contract.contactId || '',
        status: contract.status || 'Active',
        startDate: contract.startDate || '',
        endDate: contract.endDate || '',
        value: contract.value || '',
        keyTerms: contract.keyTerms || '',
        governingLaw: contract.governingLaw || 'State of New York',
        contractBody: contract.contractBody || '',
        notes: contract.notes || '',
        evidenceIds: (contract.evidenceIds || []).map((e) => (typeof e === 'object' ? e._id : e)),
      });
    } else {
      setEditingContractId(null);
      setContractForm({
        title: '',
        contractType: 'Employment Agreement',
        counterpartyName: '',
        contactId: '',
        status: 'Active',
        startDate: '',
        endDate: '',
        value: '',
        keyTerms: '',
        governingLaw: 'State of New York',
        contractBody: '',
        notes: '',
        evidenceIds: [],
      });
    }
    setContractModalOpen(true);
  };

  // AI Contract Drafting Action
  const handleGenerateContractWithAi = async () => {
    let activeTitle = contractForm.title.trim();
    if (!activeTitle) {
      activeTitle = `${contractForm.contractType || 'Legal Agreement'}${
        contractForm.counterpartyName ? ' — ' + contractForm.counterpartyName : ''
      }`;
      setContractForm((prev) => ({ ...prev, title: activeTitle }));
    }
    setDraftingAi(true);
    setError('');
    try {
      const res = await api.post('/contacts/contracts/generate', {
        ...contractForm,
        title: activeTitle,
      });
      if (res.data?.contractBody) {
        setContractForm((prev) => ({
          ...prev,
          title: activeTitle,
          contractBody: res.data.contractBody,
        }));
        setContractModalTab('body');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to synthesize contract draft.');
    } finally {
      setDraftingAi(false);
    }
  };

  const handleSaveContract = async (e) => {
    e.preventDefault();
    if (!contractForm.title.trim()) {
      setError('Contract title is required.');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      if (editingContractId) {
        await api.put(`/contacts/contracts/${editingContractId}`, contractForm);
      } else {
        await api.post('/contacts/contracts/new', contractForm);
      }
      setContractModalOpen(false);
      fetchContracts();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save contract record.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteContract = async (id) => {
    if (!confirm('Are you sure you want to delete this contract record?')) return;
    try {
      await api.delete(`/contacts/contracts/${id}`);
      fetchContracts();
    } catch (err) {
      alert('Failed to delete contract: ' + (err.response?.data?.error || err.message));
    }
  };

  const toggleContractEvidence = (evId) => {
    setContractForm((prev) => ({
      ...prev,
      evidenceIds: prev.evidenceIds.includes(evId)
        ? prev.evidenceIds.filter((id) => id !== evId)
        : [...prev.evidenceIds, evId],
    }));
  };

  // Export Formal Legal Agreement PDF
  const handleExportLegalContractPdf = async (contract) => {
    try {
      setDownloadingLegalPdfId(contract._id);
      const res = await api.get(`/contacts/contracts/${contract._id}/export-contract-doc`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      const safeTitle = (contract.title || 'Contract').replace(/[^a-zA-Z0-9_-]/g, '_');
      link.setAttribute('download', `ProofPath_Legal_Agreement_${safeTitle}_${contract._id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch (err) {
      alert('Failed to export legal agreement: ' + (err.response?.data?.error || err.message));
    } finally {
      setDownloadingLegalPdfId(null);
    }
  };

  const handleExportContractPdf = async (contract) => {
    try {
      setDownloadingContractPdfId(contract._id);
      const res = await api.get(`/contacts/contracts/${contract._id}/export`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      const safeTitle = (contract.title || 'Contract').replace(/[^a-zA-Z0-9_-]/g, '_');
      link.setAttribute('download', `ProofPath_Contract_Certificate_${safeTitle}_${contract._id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch (err) {
      alert('Failed to export contract certificate: ' + (err.response?.data?.error || err.message));
    } finally {
      setDownloadingContractPdfId(null);
    }
  };

  const handleDownloadContractZip = async (contract) => {
    try {
      setDownloadingContractZipId(contract._id);
      const res = await api.get(`/contacts/contracts/${contract._id}/download-zip`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/zip' }));
      const link = document.createElement('a');
      link.href = url;
      const safeTitle = (contract.title || 'Contract').replace(/[^a-zA-Z0-9_-]/g, '_');
      link.setAttribute('download', `ProofPath_Contract_Bundle_${safeTitle}_${contract._id}.zip`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch (err) {
      alert('Failed to download contract bundle: ' + (err.response?.data?.error || err.message));
    } finally {
      setDownloadingContractZipId(null);
    }
  };

  const handleDownloadEvidenceFile = async (evidenceId, originalFilename) => {
    try {
      setDownloadingEvidenceId(evidenceId);
      const res = await api.get(`/evidence/${evidenceId}/file?download=true`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', originalFilename || `contract_evidence_${evidenceId}`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch (err) {
      alert('Failed to download document: ' + (err.response?.data?.error || err.message));
    } finally {
      setDownloadingEvidenceId(null);
    }
  };

  const filteredContacts = contacts.filter(
    (c) =>
      c.name.toLowerCase().includes(contactSearch.toLowerCase()) ||
      c.organization?.toLowerCase().includes(contactSearch.toLowerCase()) ||
      c.role?.toLowerCase().includes(contactSearch.toLowerCase()) ||
      c.email?.toLowerCase().includes(contactSearch.toLowerCase())
  );

  const filteredContracts = contracts.filter(
    (c) =>
      c.title.toLowerCase().includes(contractSearch.toLowerCase()) ||
      c.contractType?.toLowerCase().includes(contractSearch.toLowerCase()) ||
      c.counterpartyName?.toLowerCase().includes(contractSearch.toLowerCase())
  );

  return (
    <DashboardLayout
      title={activeTab === 'contracts' ? 'Legal Contracts & Agreements' : 'Contacts Directory'}
      subtitle={
        activeTab === 'contracts'
          ? 'Draft, preserve, and execute multi-article agreements with cryptographic evidence custody.'
          : 'Record counterparties, employers, landlords, witnesses, and opposing parties.'
      }
      actions={
        <div className="flex items-center gap-2">
          {activeTab === 'contacts' ? (
            <button
              onClick={() => handleOpenContactModal()}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:opacity-95 text-white font-bold text-xs shadow-md shadow-purple-500/20 transition hover:scale-[1.02] active:scale-[0.98]"
            >
              <Plus className="w-4 h-4" />
              <span>Create Contact</span>
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  handleOpenContractModal();
                  setTimeout(() => {
                    handleGenerateContractWithAi();
                  }, 150);
                }}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 hover:opacity-95 text-white font-bold text-xs shadow-md shadow-purple-500/20 transition hover:scale-[1.02] active:scale-[0.98]"
                title="Synthesize a complete multi-article formal legal agreement"
              >
                <Sparkles className="w-4 h-4" />
                <span>Draft with AI</span>
              </button>

              <button
                onClick={handleOpenContractModal}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-white hover:bg-purple-50 text-purple-700 font-bold text-xs border border-purple-200 transition shadow-sm hover:scale-[1.02] active:scale-[0.98]"
              >
                <Plus className="w-4 h-4 text-purple-600" />
                <span className="hidden sm:inline">New Contract</span>
              </button>
            </div>
          )}
        </div>
      }
    >
      <div className="space-y-6">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 p-1.5 bg-white/70 backdrop-blur-md rounded-2xl border border-purple-200/80 w-fit shadow-sm">
          <button
            onClick={() => handleTabChange('contracts')}
            className={`flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'contracts'
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-500/20'
                : 'text-slate-600 hover:text-purple-900'
            }`}
          >
            <FileSignature className="w-4 h-4" />
            <span>Contracts & Agreements ({contracts.length})</span>
          </button>

          <button
            onClick={() => handleTabChange('contacts')}
            className={`flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'contacts'
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-500/20'
                : 'text-slate-600 hover:text-purple-900'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Contacts & Parties ({contacts.length})</span>
          </button>
        </div>

        {/* TAB 1: CONTACTS */}
        {activeTab === 'contacts' && (
          <div className="space-y-6">
            {/* Search Bar */}
            <div className="cyber-card p-4 sm:p-5 flex items-center justify-between gap-4">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-purple-400 absolute left-4 top-3.5" />
                <input
                  type="text"
                  value={contactSearch}
                  onChange={(e) => setContactSearch(e.target.value)}
                  placeholder="Search contacts by name, company, email, or role..."
                  className="w-full pl-11 pr-4 py-2.5 bg-white/80 border border-purple-200/80 rounded-2xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-purple-600 shadow-sm"
                />
              </div>
              <button
                onClick={() => handleOpenContactModal()}
                className="hidden sm:inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-purple-50 hover:bg-purple-100 text-purple-800 font-bold text-xs border border-purple-200 transition"
              >
                <Plus className="w-3.5 h-3.5 text-purple-600" />
                <span>Add Contact</span>
              </button>
            </div>

            {/* Contact Cards Grid */}
            {loadingContacts ? (
              <div className="py-20 text-center text-sm font-display font-bold text-purple-700">
                Loading contacts...
              </div>
            ) : filteredContacts.length === 0 ? (
              <EmptyState
                icon={Users}
                title="No Contacts Created Yet"
                description="Keep record of employers, landlords, witnesses, merchants, or attorneys relevant to your evidence."
                actionText="Create Your First Contact"
                onAction={() => handleOpenContactModal()}
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredContacts.map((contact) => (
                  <div
                    key={contact._id}
                    className="cyber-card p-6 flex flex-col justify-between group hover:border-purple-300 transition-all shadow-sm"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-3">
                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-purple-50 text-purple-700 border border-purple-200">
                          {contact.role || 'Contact'}
                        </span>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleOpenContactModal(contact)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-purple-700 hover:bg-purple-50 transition"
                            title="Edit Contact"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteContact(contact._id)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                            title="Delete Contact"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      <h3 className="font-display font-extrabold text-xl text-slate-900 group-hover:text-purple-700 transition">
                        {contact.name}
                      </h3>

                      {contact.organization && (
                        <p className="text-sm font-semibold text-slate-600 flex items-center gap-1.5 mt-1">
                          <Building2 className="w-3.5 h-3.5 text-purple-500" />
                          <span>{contact.organization}</span>
                        </p>
                      )}

                      <div className="space-y-2 mt-4 pt-3 border-t border-purple-100/70 text-xs text-slate-600">
                        {contact.email && (
                          <div className="flex items-center gap-2 text-slate-700">
                            <Mail className="w-3.5 h-3.5 text-purple-400 flex-shrink-0" />
                            <a
                              href={`mailto:${contact.email}`}
                              className="hover:text-purple-700 hover:underline truncate"
                            >
                              {contact.email}
                            </a>
                          </div>
                        )}
                        {contact.phone && (
                          <div className="flex items-center gap-2 text-slate-700">
                            <Phone className="w-3.5 h-3.5 text-purple-400 flex-shrink-0" />
                            <a
                              href={`tel:${contact.phone}`}
                              className="hover:text-purple-700 hover:underline"
                            >
                              {contact.phone}
                            </a>
                          </div>
                        )}
                        {contact.address && (
                          <div className="flex items-center gap-2 text-slate-700">
                            <MapPin className="w-3.5 h-3.5 text-purple-400 flex-shrink-0" />
                            <span className="truncate">{contact.address}</span>
                          </div>
                        )}
                      </div>

                      {contact.notes && (
                        <p className="text-xs text-slate-500 italic mt-3 bg-white/60 p-2.5 rounded-xl border border-purple-100/60 leading-relaxed">
                          "{contact.notes}"
                        </p>
                      )}
                    </div>

                    <div className="pt-3 mt-4 border-t border-purple-100 text-[11px] text-slate-400 flex items-center justify-between">
                      <span className="font-mono">Party: {contact.relationship}</span>
                      <span>Added {new Date(contact.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: CONTRACTS */}
        {activeTab === 'contracts' && (
          <div className="space-y-6">
            {/* Search Bar */}
            <div className="cyber-card p-4 sm:p-5 flex items-center justify-between gap-4">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-purple-400 absolute left-4 top-3.5" />
                <input
                  type="text"
                  value={contractSearch}
                  onChange={(e) => setContractSearch(e.target.value)}
                  placeholder="Search contracts by title, type, or counterparty..."
                  className="w-full pl-11 pr-4 py-2.5 bg-white/80 border border-purple-200/80 rounded-2xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-purple-600 shadow-sm"
                />
              </div>
              <button
                onClick={handleOpenContractModal}
                className="hidden sm:inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-purple-50 hover:bg-purple-100 text-purple-800 font-bold text-xs border border-purple-200 transition"
              >
                <Plus className="w-3.5 h-3.5 text-purple-600" />
                <span>Add Contract</span>
              </button>
            </div>

            {/* Contract Cards Grid */}
            {loadingContracts ? (
              <div className="py-20 text-center text-sm font-display font-bold text-purple-700">
                Loading contracts...
              </div>
            ) : filteredContracts.length === 0 ? (
              <div className="cyber-card p-12 text-center max-w-xl mx-auto space-y-4">
                <div className="w-16 h-16 rounded-3xl bg-indigo-50 border border-indigo-200 text-indigo-600 flex items-center justify-center mx-auto shadow-sm">
                  <FileSignature className="w-8 h-8" />
                </div>
                <h3 className="font-display text-xl font-bold text-slate-900">No Legal Contracts Yet</h3>
                <p className="text-sm text-slate-500 leading-relaxed">
                  Synthesize complete multi-article formal agreements (Employment, NDAs, Consulting, Leases) or record existing signed contracts linked to your evidence vault.
                </p>
                <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                  <button
                    onClick={() => {
                      handleOpenContractModal();
                      setTimeout(() => handleGenerateContractWithAi(), 150);
                    }}
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 hover:opacity-95 text-white font-bold text-xs shadow-md shadow-purple-500/25 transition hover:scale-[1.02] active:scale-[0.98]"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>Draft Legal Agreement with AI</span>
                  </button>
                  <button
                    onClick={handleOpenContractModal}
                    className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-white hover:bg-purple-50 text-purple-700 font-bold text-xs border border-purple-200 transition"
                  >
                    <Plus className="w-4 h-4 text-purple-600" />
                    <span>New Blank Record</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredContracts.map((contract) => (
                  <div
                    key={contract._id}
                    className="cyber-card p-6 flex flex-col justify-between group hover:border-purple-300 transition-all shadow-sm"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-3">
                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                          {contract.contractType}
                        </span>
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                              contract.status === 'Active'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : contract.status === 'Disputed'
                                ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                : 'bg-slate-100 text-slate-600 border border-slate-200'
                            }`}
                          >
                            {contract.status}
                          </span>
                          <button
                            onClick={() => handleOpenContractModal(contract)}
                            className="p-1 rounded-lg text-slate-400 hover:text-purple-700 hover:bg-purple-50 transition"
                            title="Edit Contract & Clauses"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteContract(contract._id)}
                            className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                            title="Delete Contract"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      <h3 className="font-display font-extrabold text-xl text-slate-900 group-hover:text-purple-700 transition">
                        {contract.title}
                      </h3>

                      {(contract.counterpartyName || contract.contactId?.name) && (
                        <p className="text-sm font-semibold text-purple-700 flex items-center gap-1.5 mt-1">
                          <Building2 className="w-3.5 h-3.5 text-purple-500" />
                          <span>
                            Party: {contract.contactId?.name || contract.counterpartyName}
                          </span>
                        </p>
                      )}

                      <div className="space-y-2 mt-4 pt-3 border-t border-purple-100/70 text-xs text-slate-600">
                        {(contract.startDate || contract.endDate) && (
                          <div className="flex items-center gap-2">
                            <Calendar className="w-3.5 h-3.5 text-purple-400" />
                            <span>
                              Term: {contract.startDate || 'N/A'} → {contract.endDate || 'Ongoing'}
                            </span>
                          </div>
                        )}
                        {contract.value && (
                          <div className="flex items-center gap-2">
                            <DollarSign className="w-3.5 h-3.5 text-purple-400" />
                            <span className="font-semibold text-slate-800">
                              Value: {contract.value}
                            </span>
                          </div>
                        )}
                        {contract.governingLaw && (
                          <div className="flex items-center gap-2">
                            <Scale className="w-3.5 h-3.5 text-indigo-500" />
                            <span>Law: {contract.governingLaw}</span>
                          </div>
                        )}
                      </div>

                      {contract.keyTerms && (
                        <div className="mt-3 bg-purple-50/40 p-3 rounded-2xl border border-purple-100 text-xs">
                          <span className="font-bold text-purple-900 block mb-1">Key Terms:</span>
                          <p className="text-slate-700 leading-relaxed font-normal line-clamp-3">
                            {contract.keyTerms}
                          </p>
                        </div>
                      )}

                      {/* Complete agreement drafted badge */}
                      {contract.contractBody && (
                        <div className="mt-2.5 inline-flex items-center gap-1.5 text-[11px] font-bold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Formal Legal Agreement Ready</span>
                        </div>
                      )}

                      {/* Linked Evidence Files */}
                      {contract.evidenceIds?.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-purple-100">
                          <span className="text-[11px] font-mono font-bold text-purple-700 uppercase tracking-wider block mb-1.5">
                            Attached Vault Evidence ({contract.evidenceIds.length}):
                          </span>
                          <div className="space-y-1.5">
                            {contract.evidenceIds.map((ev) => (
                              <div
                                key={ev._id}
                                className="flex items-center justify-between text-xs text-slate-700 bg-white/70 px-2.5 py-1.5 rounded-xl border border-purple-100 shadow-2xs"
                              >
                                <span className="truncate max-w-[160px] font-medium" title={ev.title}>{ev.title}</span>
                                <div className="flex items-center gap-1.5">
                                  <span className="font-mono text-[10px] text-purple-600 bg-purple-50 px-1.5 py-0.5 rounded">
                                    {ev.category}
                                  </span>
                                  <button
                                    onClick={() => handleDownloadEvidenceFile(ev._id, ev.originalFilename)}
                                    disabled={downloadingEvidenceId === ev._id}
                                    className="p-1 rounded hover:bg-purple-100 text-purple-700 transition"
                                    title="Download Document"
                                  >
                                    <Download className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Action Download Buttons & Footer */}
                    <div className="pt-3 mt-4 border-t border-purple-100 flex flex-col gap-2">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <button
                          onClick={() => handleExportLegalContractPdf(contract)}
                          disabled={downloadingLegalPdfId === contract._id}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-indigo-50 hover:bg-indigo-100 text-indigo-900 font-bold text-xs border border-indigo-200 transition"
                          title="Download Formatted Legal Agreement (.PDF)"
                        >
                          <ScrollText className="w-3.5 h-3.5 text-indigo-600" />
                          <span>{downloadingLegalPdfId === contract._id ? 'Generating...' : 'Legal Agreement (.PDF)'}</span>
                        </button>

                        <button
                          onClick={() => handleExportContractPdf(contract)}
                          disabled={downloadingContractPdfId === contract._id}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-purple-50 hover:bg-purple-100 text-purple-800 font-bold text-xs border border-purple-200 transition"
                          title="Download Preservation Certificate PDF"
                        >
                          <FileDown className="w-3.5 h-3.5 text-purple-600" />
                          <span>{downloadingContractPdfId === contract._id ? 'Generating...' : 'Certificate (.PDF)'}</span>
                        </button>

                        <button
                          onClick={() => handleDownloadContractZip(contract)}
                          disabled={downloadingContractZipId === contract._id}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:opacity-95 text-white font-bold text-xs shadow-xs transition"
                          title="Download Complete Contract Bundle ZIP"
                        >
                          <FolderArchive className="w-3.5 h-3.5" />
                          <span>{downloadingContractZipId === contract._id ? 'Zipping...' : 'Bundle (.ZIP)'}</span>
                        </button>
                      </div>

                      <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 pt-1">
                        <span>Ref: {contract._id.substring(0, 10)}...</span>
                        <span>{new Date(contract.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* CREATE CONTACT MODAL */}
      {contactModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white/95 backdrop-blur-xl border border-purple-200 w-full max-w-lg rounded-3xl p-7 shadow-2xl space-y-5 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setContactModalOpen(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 p-2 rounded-full hover:bg-purple-100/60 transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-purple-50 text-purple-700 border border-purple-200">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-display text-xl font-bold text-slate-900">
                  {editingContact ? 'Edit Contact Record' : 'Create Contact Record'}
                </h3>
                <p className="text-xs text-slate-500">Record a person, employer, landlord, or organization</p>
              </div>
            </div>

            {error && (
              <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-600" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSaveContact} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider font-display">
                  Full Name / Contact Person <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={contactForm.name}
                  onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                  placeholder="e.g. John Henderson or ACME Management LLC"
                  className="w-full px-4 py-2.5 bg-white border border-purple-200 rounded-2xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-purple-600"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider font-display">
                    Organization / Company
                  </label>
                  <input
                    type="text"
                    value={contactForm.organization}
                    onChange={(e) => setContactForm({ ...contactForm, organization: e.target.value })}
                    placeholder="e.g. Global Logistics Inc."
                    className="w-full px-4 py-2.5 bg-white border border-purple-200 rounded-2xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-purple-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider font-display">
                    Role
                  </label>
                  <select
                    value={contactForm.role}
                    onChange={(e) => setContactForm({ ...contactForm, role: e.target.value })}
                    className="w-full px-4 py-2.5 bg-white border border-purple-200 rounded-2xl text-sm text-slate-900 focus:outline-none focus:border-purple-600 cursor-pointer"
                  >
                    <option value="Employer / Company">Employer / Company</option>
                    <option value="Landlord / Property Manager">Landlord / Property Manager</option>
                    <option value="Contractor / Vendor">Contractor / Vendor</option>
                    <option value="Merchant / Seller">Merchant / Seller</option>
                    <option value="Legal Counsel / Attorney">Legal Counsel / Attorney</option>
                    <option value="Witness / Third Party">Witness / Third Party</option>
                    <option value="Counterparty">Counterparty</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider font-display">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={contactForm.email}
                    onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                    placeholder="contact@company.com"
                    className="w-full px-4 py-2.5 bg-white border border-purple-200 rounded-2xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-purple-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider font-display">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={contactForm.phone}
                    onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })}
                    placeholder="+1 (555) 000-0000"
                    className="w-full px-4 py-2.5 bg-white border border-purple-200 rounded-2xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-purple-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider font-display">
                  Physical / Mailing Address
                </label>
                <input
                  type="text"
                  value={contactForm.address}
                  onChange={(e) => setContactForm({ ...contactForm, address: e.target.value })}
                  placeholder="e.g. 100 Main St, Suite 400, San Francisco, CA"
                  className="w-full px-4 py-2.5 bg-white border border-purple-200 rounded-2xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-purple-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider font-display">
                  Relationship to Dispute
                </label>
                <select
                  value={contactForm.relationship}
                  onChange={(e) => setContactForm({ ...contactForm, relationship: e.target.value })}
                  className="w-full px-4 py-2.5 bg-white border border-purple-200 rounded-2xl text-sm text-slate-900 focus:outline-none focus:border-purple-600 cursor-pointer"
                >
                  <option value="Opposing Party">Opposing Party</option>
                  <option value="Shift Supervisor / Manager">Shift Supervisor / Manager</option>
                  <option value="HR Representative">HR Representative</option>
                  <option value="Witness">Witness</option>
                  <option value="Customer / Client">Customer / Client</option>
                  <option value="Neutral Inspector">Neutral Inspector</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider font-display">
                  Notes & Context
                </label>
                <textarea
                  rows={2}
                  value={contactForm.notes}
                  onChange={(e) => setContactForm({ ...contactForm, notes: e.target.value })}
                  placeholder="Context regarding this party..."
                  className="w-full px-4 py-2.5 bg-white border border-purple-200 rounded-2xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-purple-600 resize-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-purple-100">
                <button
                  type="button"
                  onClick={() => setContactModalOpen(false)}
                  className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-full text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:opacity-95 text-white font-bold text-xs rounded-full shadow-md shadow-purple-500/20 disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : editingContact ? 'Update Contact' : 'Create Contact'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CREATE / EDIT CONTRACT MODAL */}
      {contractModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white/95 backdrop-blur-xl border border-purple-200 w-full max-w-2xl rounded-3xl p-7 shadow-2xl space-y-5 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setContractModalOpen(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 p-2 rounded-full hover:bg-purple-100/60 transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-indigo-50 text-indigo-700 border border-indigo-200">
                  <FileSignature className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-display text-xl font-bold text-slate-900">
                    {editingContractId ? 'Edit Contract Record' : 'Create & Draft Contract'}
                  </h3>
                  <p className="text-xs text-slate-500">Record terms, synthesize legal clauses, and link evidence vault files</p>
                </div>
              </div>

              {/* Action to Draft with AI */}
              <button
                type="button"
                onClick={handleGenerateContractWithAi}
                disabled={draftingAi}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 text-white font-bold text-xs shadow-md shadow-purple-500/20 hover:opacity-95 transition disabled:opacity-50"
                title="Synthesize formal multi-article legal agreement clauses"
              >
                <Sparkles className={`w-3.5 h-3.5 ${draftingAi ? 'animate-spin' : ''}`} />
                <span>{draftingAi ? 'Synthesizing...' : 'Draft Full Contract with AI'}</span>
              </button>
            </div>

            {/* Modal Internal Tabs */}
            <div className="flex items-center gap-2 border-b border-purple-100 pb-2">
              <button
                type="button"
                onClick={() => setContractModalTab('terms')}
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition ${
                  contractModalTab === 'terms'
                    ? 'bg-purple-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-purple-900 bg-purple-50/60'
                }`}
              >
                1. Parameters & Terms
              </button>
              <button
                type="button"
                onClick={() => setContractModalTab('body')}
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition flex items-center gap-1.5 ${
                  contractModalTab === 'body'
                    ? 'bg-purple-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-purple-900 bg-purple-50/60'
                }`}
              >
                <span>2. Executed Legal Agreement Text</span>
                {contractForm.contractBody && (
                  <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                )}
              </button>
            </div>

            {error && (
              <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-600" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSaveContract} className="space-y-4">
              {contractModalTab === 'terms' ? (
                <>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider font-display">
                      Contract Title <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={contractForm.title}
                      onChange={(e) => setContractForm({ ...contractForm, title: e.target.value })}
                      placeholder="e.g. Employment Offer & Non-Compete Agreement"
                      className="w-full px-4 py-2.5 bg-white border border-purple-200 rounded-2xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-purple-600"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider font-display">
                        Contract Type
                      </label>
                      <select
                        value={contractForm.contractType}
                        onChange={(e) => setContractForm({ ...contractForm, contractType: e.target.value })}
                        className="w-full px-4 py-2.5 bg-white border border-purple-200 rounded-2xl text-sm text-slate-900 focus:outline-none focus:border-purple-600 cursor-pointer"
                      >
                        <option value="Employment Agreement">Employment Agreement</option>
                        <option value="Residential Lease Agreement">Residential Lease Agreement</option>
                        <option value="Non-Disclosure Agreement (NDA)">Non-Disclosure Agreement (NDA)</option>
                        <option value="Independent Contractor Agreement">Independent Contractor Agreement</option>
                        <option value="Commercial Service Contract">Commercial Service Contract</option>
                        <option value="Purchase / Sales Order">Purchase / Sales Order</option>
                        <option value="Severance / Settlement Agreement">Severance / Settlement Agreement</option>
                        <option value="Commercial Lease">Commercial Lease</option>
                        <option value="General Agreement">General Agreement</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider font-display">
                        Status
                      </label>
                      <select
                        value={contractForm.status}
                        onChange={(e) => setContractForm({ ...contractForm, status: e.target.value })}
                        className="w-full px-4 py-2.5 bg-white border border-purple-200 rounded-2xl text-sm text-slate-900 focus:outline-none focus:border-purple-600 cursor-pointer"
                      >
                        <option value="Active">Active</option>
                        <option value="Disputed">Disputed</option>
                        <option value="Draft">Draft</option>
                        <option value="Expired">Expired</option>
                        <option value="Fulfilled">Fulfilled</option>
                        <option value="Terminated">Terminated</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider font-display">
                        Link Saved Contact
                      </label>
                      <select
                        value={contractForm.contactId}
                        onChange={(e) => setContractForm({ ...contractForm, contactId: e.target.value })}
                        className="w-full px-4 py-2.5 bg-white border border-purple-200 rounded-2xl text-sm text-slate-900 focus:outline-none focus:border-purple-600 cursor-pointer"
                      >
                        <option value="">-- Select Contact (Optional) --</option>
                        {contacts.map((c) => (
                          <option key={c._id} value={c._id}>
                            {c.name} {c.organization ? `(${c.organization})` : ''}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider font-display">
                        Or Enter Counterparty Name
                      </label>
                      <input
                        type="text"
                        value={contractForm.counterpartyName}
                        onChange={(e) => setContractForm({ ...contractForm, counterpartyName: e.target.value })}
                        placeholder="e.g. Apex Corporation"
                        className="w-full px-4 py-2.5 bg-white border border-purple-200 rounded-2xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-purple-600"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider font-display">
                        Start / Effective Date
                      </label>
                      <input
                        type="date"
                        value={contractForm.startDate}
                        onChange={(e) => setContractForm({ ...contractForm, startDate: e.target.value })}
                        className="w-full px-4 py-2.5 bg-white border border-purple-200 rounded-2xl text-sm text-slate-900 focus:outline-none focus:border-purple-600"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider font-display">
                        End / Expiry Date
                      </label>
                      <input
                        type="date"
                        value={contractForm.endDate}
                        onChange={(e) => setContractForm({ ...contractForm, endDate: e.target.value })}
                        className="w-full px-4 py-2.5 bg-white border border-purple-200 rounded-2xl text-sm text-slate-900 focus:outline-none focus:border-purple-600"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider font-display">
                        Value / Consideration
                      </label>
                      <input
                        type="text"
                        value={contractForm.value}
                        onChange={(e) => setContractForm({ ...contractForm, value: e.target.value })}
                        placeholder="e.g. $85,000 / year"
                        className="w-full px-4 py-2.5 bg-white border border-purple-200 rounded-2xl text-sm text-slate-900 focus:outline-none focus:border-purple-600"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider font-display">
                      Governing Jurisdiction / Law
                    </label>
                    <select
                      value={contractForm.governingLaw}
                      onChange={(e) => setContractForm({ ...contractForm, governingLaw: e.target.value })}
                      className="w-full px-4 py-2.5 bg-white border border-purple-200 rounded-2xl text-sm text-slate-900 focus:outline-none focus:border-purple-600 cursor-pointer"
                    >
                      <option value="State of New York">State of New York</option>
                      <option value="State of California">State of California</option>
                      <option value="State of Delaware">State of Delaware</option>
                      <option value="State of Texas">State of Texas</option>
                      <option value="State of Florida">State of Florida</option>
                      <option value="State of Illinois">State of Illinois</option>
                      <option value="United Kingdom">United Kingdom (England & Wales)</option>
                      <option value="Federal / General Jurisdiction">Federal / General Jurisdiction</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider font-display">
                      Key Terms & Obligations
                    </label>
                    <textarea
                      rows={2}
                      value={contractForm.keyTerms}
                      onChange={(e) => setContractForm({ ...contractForm, keyTerms: e.target.value })}
                      placeholder="Key clauses, notice requirements, deliverables, termination terms..."
                      className="w-full px-4 py-2.5 bg-white border border-purple-200 rounded-2xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-purple-600 resize-none leading-relaxed"
                    />
                  </div>

                  {/* Link Vault Evidence */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wider font-display">
                      Attach Vault Evidence (Preserved Documents/PDFs)
                    </label>
                    {vaultEvidence.length === 0 ? (
                      <p className="text-xs text-slate-500 italic">No files in your evidence vault yet.</p>
                    ) : (
                      <div className="max-h-32 overflow-y-auto space-y-1.5 p-2 bg-purple-50/40 rounded-2xl border border-purple-100">
                        {vaultEvidence.map((ev) => (
                          <label
                            key={ev._id}
                            className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-white text-xs cursor-pointer transition"
                          >
                            <input
                              type="checkbox"
                              checked={contractForm.evidenceIds.includes(ev._id)}
                              onChange={() => toggleContractEvidence(ev._id)}
                              className="w-4 h-4 text-purple-600 rounded border-purple-300 focus:ring-purple-500"
                            />
                            <span className="font-semibold text-slate-800 truncate flex-1">{ev.title}</span>
                            <span className="text-[10px] font-mono text-purple-600 bg-purple-100/70 px-2 py-0.5 rounded-full">
                              {ev.category}
                            </span>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              ) : (
                /* Legal Agreement Text (Multi-Article) Tab */
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider font-display">
                        Full Legal Agreement Clauses
                      </label>
                      <p className="text-[11px] text-slate-500">
                        Review, modify, or customize all formal articles and covenants before generating the executed agreement.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={handleGenerateContractWithAi}
                      disabled={draftingAi}
                      className="inline-flex items-center gap-1.5 text-xs text-purple-700 font-bold hover:underline"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                      <span>Re-draft with AI</span>
                    </button>
                  </div>

                  <textarea
                    rows={14}
                    value={contractForm.contractBody}
                    onChange={(e) => setContractForm({ ...contractForm, contractBody: e.target.value })}
                    placeholder="Click 'Draft Full Contract with AI' above to automatically synthesize all formal articles, recitals, and covenants..."
                    className="w-full px-4 py-3 bg-slate-900 text-slate-100 font-mono text-xs rounded-2xl border border-slate-700 focus:outline-none focus:border-purple-500 resize-none leading-relaxed"
                  />
                </div>
              )}

              <div className="flex justify-end gap-3 pt-3 border-t border-purple-100">
                <button
                  type="button"
                  onClick={() => setContractModalOpen(false)}
                  className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-full text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:opacity-95 text-white font-bold text-xs rounded-full shadow-md shadow-purple-500/20 disabled:opacity-50"
                >
                  {submitting ? 'Preserving...' : editingContractId ? 'Update Contract Record' : 'Preserve Contract Record'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};
