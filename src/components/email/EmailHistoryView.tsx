import React, { useState } from 'react';
import {
  Mail,
  Send,
  CheckCircle2,
  AlertCircle,
  FileText,
  Search,
  Eye,
  X,
  Clock,
  Trash2,
  Download,
  RotateCw,
  ExternalLink,
  ShieldCheck,
  Zap,
  Filter,
  Check,
  RefreshCw,
  SlidersHorizontal,
  FileCheck,
  AlertTriangle,
  Radio,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { EmailLog } from '../../types';
import { formatDate } from '../../utils/formatters';
import { ConfirmModal } from '../common/ConfirmModal';
import { sendBrevoTestEmail, verifyBrevoApiKey } from '../../services/brevoService';

export const EmailHistoryView: React.FC = () => {
  const {
    emailLogs,
    businessProfile,
    deleteEmailLog,
    clearAllEmailLogs,
    resendEmailLog,
    brevoStatus,
    refreshBrevoStatus,
    setCurrentTab,
    setSelectedInvoiceId,
    setSelectedOfferId,
    showToast,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'invoice' | 'offer'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'delivered' | 'failed'>('all');
  const [selectedLog, setSelectedLog] = useState<EmailLog | null>(null);
  const [activeDetailTab, setActiveDetailTab] = useState<'html' | 'text' | 'meta'>('html');
  const [isResending, setIsResending] = useState(false);
  const [isTestEmailModalOpen, setIsTestEmailModalOpen] = useState(false);
  const [testRecipient, setTestRecipient] = useState(businessProfile.email || 'test@example.com');
  const [isSendingTest, setIsSendingTest] = useState(false);
  const [isConfirmClearOpen, setIsConfirmClearOpen] = useState(false);

  // Safe filtering logic
  const filteredLogs = emailLogs.filter((l) => {
    const recipientStr = l.recipient || '';
    const recipientNameStr = l.recipientName || '';
    const entityNumStr = l.entityNumber || '';
    const subjectStr = l.subject || '';
    const messageStr = l.message || '';

    const matchesSearch =
      recipientStr.toLowerCase().includes(searchQuery.toLowerCase()) ||
      recipientNameStr.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entityNumStr.toLowerCase().includes(searchQuery.toLowerCase()) ||
      subjectStr.toLowerCase().includes(searchQuery.toLowerCase()) ||
      messageStr.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesType = filterType === 'all' || l.entityType === filterType;
    const matchesStatus = filterStatus === 'all' || l.status === filterStatus;

    return matchesSearch && matchesType && matchesStatus;
  });

  const totalDispatched = emailLogs.length;
  const deliveredCount = emailLogs.filter((l) => l.status === 'delivered').length;
  const failedCount = emailLogs.filter((l) => l.status === 'failed').length;
  const deliveryRate = totalDispatched > 0 ? Math.round((deliveredCount / totalDispatched) * 100) : 100;
  const brevoDispatchedCount = emailLogs.filter((l) => l.provider === 'brevo').length;

  // Handle single log resend
  const handleResend = async (logId: string) => {
    setIsResending(true);
    const success = await resendEmailLog(logId);
    setIsResending(false);
    if (success) {
      // refresh selected log if open
      const updated = emailLogs.find((l) => l.id === logId);
      if (updated) setSelectedLog(updated);
    }
  };

  // Handle Send Test Email
  const handleSendTestEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testRecipient) return;
    setIsSendingTest(true);

    const res = await sendBrevoTestEmail({
      apiKey: businessProfile.brevoApiKey,
      senderEmail: businessProfile.brevoSenderEmail || businessProfile.email,
      senderName: businessProfile.brevoSenderName || businessProfile.businessName,
      recipientEmail: testRecipient,
    });

    setIsSendingTest(false);
    if (res.success) {
      showToast(res.message || `Test email dispatched to ${testRecipient}!`, 'success');
      setIsTestEmailModalOpen(false);
      refreshBrevoStatus();
    } else {
      showToast(res.message || 'Failed to send test email.', 'error');
    }
  };

  // Export CSV
  const handleExportCsv = () => {
    if (emailLogs.length === 0) {
      showToast('No logs available to export.', 'error');
      return;
    }

    const headers = ['ID', 'Date', 'Document', 'Type', 'Recipient', 'Recipient Name', 'Subject', 'Status', 'Provider', 'Brevo Message ID'];
    const rows = emailLogs.map((l) => [
      l.id,
      l.sentAt,
      l.entityNumber,
      l.entityType,
      `"${l.recipient}"`,
      `"${l.recipientName}"`,
      `"${l.subject.replace(/"/g, '""')}"`,
      l.status,
      l.provider || 'simulation',
      l.brevoMessageId || '',
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Email_Dispatch_Logs_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Email logs exported to CSV.');
  };

  // Navigate to document
  const handleViewDocument = (log: EmailLog) => {
    if (log.entityType === 'invoice') {
      setSelectedInvoiceId(log.entityId);
      setCurrentTab('invoices');
    } else {
      setSelectedOfferId(log.entityId);
      setCurrentTab('offers');
    }
  };

  const isBrevoConfigured = brevoStatus?.configured || (businessProfile.brevoApiKey && businessProfile.brevoApiKey.length > 5);

  return (
    <div className="space-y-6 max-w-8xl mx-auto pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-200">
              Outbound Email Gateway
            </span>
            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
              isBrevoConfigured 
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                : 'bg-amber-50 text-amber-700 border border-amber-200'
            }`}>
              <Radio className={`w-2.5 h-2.5 ${isBrevoConfigured ? 'text-emerald-500 animate-pulse' : 'text-amber-500'}`} />
              {isBrevoConfigured ? 'Brevo SMTP Connected' : 'Simulation Mode'}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight mt-1">
            Email History & Brevo Dispatch
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Audit outbound invoice notices, payment receipts, quotations, and automated delivery records
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setIsTestEmailModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl shadow-xs transition-all cursor-pointer"
          >
            <Zap className="w-3.5 h-3.5 text-amber-500" />
            <span>Send Test Email</span>
          </button>

          <button
            onClick={() => setCurrentTab('settings')}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-xl transition-all cursor-pointer"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Brevo Settings</span>
          </button>

          <button
            onClick={handleExportCsv}
            disabled={emailLogs.length === 0}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl shadow-xs transition-all cursor-pointer disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Brevo Connection Status Banner */}
      <div className={`p-4 rounded-2xl border flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xs ${
        isBrevoConfigured
          ? 'bg-gradient-to-r from-emerald-50/60 to-blue-50/40 border-emerald-200/80'
          : 'bg-gradient-to-r from-amber-50/80 to-slate-50 border-amber-200'
      }`}>
        <div className="flex items-start sm:items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
            isBrevoConfigured ? 'bg-emerald-600 text-white shadow-md shadow-emerald-200' : 'bg-amber-500 text-white shadow-md shadow-amber-200'
          }`}>
            <Mail className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-slate-900">
                {isBrevoConfigured ? 'Brevo Transactional SMTP Active' : 'Brevo Integration Available'}
              </h3>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                isBrevoConfigured ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
              }`}>
                {isBrevoConfigured ? 'Live Delivery' : 'Simulation Mode'}
              </span>
            </div>
            <p className="text-xs text-slate-600 mt-0.5">
              {isBrevoConfigured
                ? `Sender: ${businessProfile.brevoSenderName || businessProfile.businessName} <${businessProfile.brevoSenderEmail || businessProfile.email}> • High deliverability relay active`
                : 'Connect your Brevo API key in Settings to dispatch real invoices directly to clients with tracking.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end md:self-center">
          <button
            onClick={() => refreshBrevoStatus()}
            className="p-2 text-slate-500 hover:text-slate-800 hover:bg-white/80 rounded-lg cursor-pointer transition-colors"
            title="Refresh Status"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          {!isBrevoConfigured && (
            <button
              onClick={() => setCurrentTab('settings')}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow-sm transition-colors cursor-pointer"
            >
              Configure API Key
            </button>
          )}
        </div>
      </div>

      {/* KPI Cards Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block">
            Total Dispatched
          </span>
          <p className="text-2xl font-bold text-slate-900 mt-1 font-mono">{totalDispatched}</p>
          <span className="text-[10px] text-slate-400">All email events</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block">
            Delivery Success Rate
          </span>
          <p className="text-2xl font-bold text-emerald-600 mt-1 font-mono">{deliveryRate}%</p>
          <span className="text-[10px] text-emerald-600 font-medium">{deliveredCount} confirmed delivered</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block">
            Brevo SMTP Relayed
          </span>
          <p className="text-2xl font-bold text-blue-600 mt-1 font-mono">{brevoDispatchedCount}</p>
          <span className="text-[10px] text-blue-600 font-medium">Delivered via Brevo</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block">
            Failed / Bounced
          </span>
          <p className={`text-2xl font-bold mt-1 font-mono ${failedCount > 0 ? 'text-rose-600' : 'text-slate-400'}`}>
            {failedCount}
          </p>
          <span className="text-[10px] text-slate-400">Delivery errors</span>
        </div>
      </div>

      {/* Search & Filter Controls */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row justify-between items-stretch md:items-center gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search email logs by recipient, document #, subject, or message..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Document Type Filter */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs">
            <button
              onClick={() => setFilterType('all')}
              className={`px-3 py-1.5 rounded-md font-medium transition-all cursor-pointer ${
                filterType === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All Types
            </button>
            <button
              onClick={() => setFilterType('invoice')}
              className={`px-3 py-1.5 rounded-md font-medium transition-all cursor-pointer ${
                filterType === 'invoice' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Invoices
            </button>
            <button
              onClick={() => setFilterType('offer')}
              className={`px-3 py-1.5 rounded-md font-medium transition-all cursor-pointer ${
                filterType === 'offer' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Offers
            </button>
          </div>

          {/* Status Filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 cursor-pointer focus:outline-none"
          >
            <option value="all">All Statuses</option>
            <option value="delivered">Delivered</option>
            <option value="failed">Failed</option>
          </select>

          {emailLogs.length > 0 && (
            <button
              onClick={() => setIsConfirmClearOpen(true)}
              className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer transition-colors"
              title="Clear all email logs"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead className="bg-slate-50 text-slate-600 font-semibold uppercase tracking-wider text-[11px] border-b border-slate-200">
              <tr>
                <th className="py-3.5 px-4">Recipient</th>
                <th className="py-3.5 px-3">Document</th>
                <th className="py-3.5 px-3">Subject</th>
                <th className="py-3.5 px-3">Gateway</th>
                <th className="py-3.5 px-3">Sent At</th>
                <th className="py-3.5 px-3 text-center">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLogs.length > 0 ? (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4">
                      <p className="font-semibold text-slate-900">{log.recipientName || 'Client'}</p>
                      <p className="text-[11px] text-slate-500">{log.recipient || 'N/A'}</p>
                    </td>
                    <td className="py-3.5 px-3">
                      <button
                        onClick={() => handleViewDocument(log)}
                        className="font-mono font-bold text-blue-600 hover:underline inline-flex items-center gap-1 cursor-pointer"
                        title="View Document"
                      >
                        <span>{log.entityNumber || 'DOC'}</span>
                        <ExternalLink className="w-3 h-3 text-blue-400" />
                      </button>
                      <span className="block text-[10px] text-slate-400 capitalize">{log.entityType}</span>
                    </td>
                    <td className="py-3.5 px-3 text-slate-700 font-medium truncate max-w-[260px]">
                      {log.subject}
                    </td>
                    <td className="py-3.5 px-3">
                      {log.provider === 'brevo' ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                          <ShieldCheck className="w-3 h-3" /> Brevo
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 text-slate-600">
                          Direct
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-3 text-slate-500 whitespace-nowrap">
                      {new Date(log.sentAt).toLocaleString([], {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td className="py-3.5 px-3 text-center whitespace-nowrap">
                      {log.status === 'delivered' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 uppercase">
                          <CheckCircle2 className="w-3 h-3" /> Delivered
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200 uppercase">
                          <AlertCircle className="w-3 h-3" /> Failed
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => {
                            setSelectedLog(log);
                            setActiveDetailTab('html');
                          }}
                          className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg cursor-pointer transition-colors"
                          title="View Message Payload & HTML"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleResend(log.id)}
                          className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg cursor-pointer transition-colors"
                          title="Resend this email via Brevo"
                        >
                          <Send className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => deleteEmailLog(log.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer transition-colors"
                          title="Delete Log"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <Mail className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                    <p className="text-sm font-semibold text-slate-600">No email logs match your filter criteria</p>
                    <p className="text-xs text-slate-400 mt-1">
                      Emails dispatched through the Invoice, Offer, or Payment views will appear here in real-time.
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Log Detail & Preview Modal */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-3xl overflow-hidden animate-in zoom-in-95 duration-150 flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Email Dispatch Inspector</h3>
                  <p className="text-[11px] text-slate-500">
                    {selectedLog.entityNumber} • Sent to {selectedLog.recipient}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleResend(selectedLog.id)}
                  disabled={isResending}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition-colors cursor-pointer disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isResending ? 'Resending...' : 'Resend Email'}</span>
                </button>

                <button
                  onClick={() => setSelectedLog(null)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Sub-header Tabs */}
            <div className="flex border-b border-slate-200 bg-slate-50/50 px-6 pt-2 gap-4">
              <button
                onClick={() => setActiveDetailTab('html')}
                className={`pb-2.5 text-xs font-bold border-b-2 transition-all cursor-pointer ${
                  activeDetailTab === 'html'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                Rendered HTML Preview
              </button>
              <button
                onClick={() => setActiveDetailTab('text')}
                className={`pb-2.5 text-xs font-bold border-b-2 transition-all cursor-pointer ${
                  activeDetailTab === 'text'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                Plain Text Version
              </button>
              <button
                onClick={() => setActiveDetailTab('meta')}
                className={`pb-2.5 text-xs font-bold border-b-2 transition-all cursor-pointer ${
                  activeDetailTab === 'meta'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                Metadata & Brevo Headers
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto flex-1 space-y-4 text-xs">
              {/* Common Info Strip */}
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 space-y-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-slate-400 font-medium">To:</span>{' '}
                    <strong className="text-slate-800">{selectedLog.recipientName}</strong>{' '}
                    <span className="text-slate-500">&lt;{selectedLog.recipient}&gt;</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-medium">Sent Date:</span>{' '}
                    <span className="text-slate-800">{new Date(selectedLog.sentAt).toLocaleString()}</span>
                  </div>
                </div>

                <div className="pt-1.5 border-t border-slate-200/60">
                  <span className="text-slate-400 font-medium">Subject:</span>{' '}
                  <strong className="text-slate-900">{selectedLog.subject}</strong>
                </div>

                {selectedLog.attachments && selectedLog.attachments.length > 0 && (
                  <div className="pt-1.5 border-t border-slate-200/60 flex items-center gap-2">
                    <span className="text-slate-400 font-medium">Attachments:</span>
                    {selectedLog.attachments.map((att, i) => (
                      <span
                        key={i}
                        className="inline-flex items-center gap-1 px-2 py-0.5 bg-white border border-slate-200 rounded text-[10px] font-mono text-slate-700"
                      >
                        <FileCheck className="w-3 h-3 text-emerald-600" />
                        {att}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Tab 1: Rendered HTML Preview */}
              {activeDetailTab === 'html' && (
                <div className="border border-slate-200 rounded-xl overflow-hidden bg-slate-100 p-2">
                  <div className="bg-white rounded-lg p-2 min-h-[360px] overflow-auto">
                    {selectedLog.htmlContent ? (
                      <div
                        dangerouslySetInnerHTML={{ __html: selectedLog.htmlContent }}
                        className="max-w-full overflow-x-auto"
                      />
                    ) : (
                      <div className="p-6 font-sans whitespace-pre-wrap text-slate-800">
                        <h2 className="text-base font-bold text-slate-900 mb-2">{selectedLog.subject}</h2>
                        <p>{selectedLog.message}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Tab 2: Plain Text */}
              {activeDetailTab === 'text' && (
                <div className="p-4 bg-slate-900 text-slate-100 font-mono text-[11px] rounded-xl overflow-auto whitespace-pre-wrap max-h-[380px] leading-relaxed">
                  {selectedLog.message}
                </div>
              )}

              {/* Tab 3: Metadata & Headers */}
              {activeDetailTab === 'meta' && (
                <div className="space-y-3 font-mono text-[11px]">
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                    <div>
                      <strong className="text-slate-600">Event ID:</strong> {selectedLog.id}
                    </div>
                    <div>
                      <strong className="text-slate-600">Entity Target:</strong> {selectedLog.entityType} (
                      {selectedLog.entityId})
                    </div>
                    <div>
                      <strong className="text-slate-600">Gateway Provider:</strong>{' '}
                      {selectedLog.provider === 'brevo' ? 'Brevo Transactional SMTP' : 'Simulation Engine'}
                    </div>
                    <div>
                      <strong className="text-slate-600">Brevo Message ID:</strong>{' '}
                      <span className="text-blue-600">{selectedLog.brevoMessageId || 'N/A'}</span>
                    </div>
                    <div>
                      <strong className="text-slate-600">Delivery Status:</strong>{' '}
                      <span
                        className={selectedLog.status === 'delivered' ? 'text-emerald-600 font-bold' : 'text-rose-600'}
                      >
                        {selectedLog.status.toUpperCase()}
                      </span>
                    </div>
                    {selectedLog.deliveryError && (
                      <div className="text-rose-600">
                        <strong>Error Message:</strong> {selectedLog.deliveryError}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
              <button
                onClick={() => handleViewDocument(selectedLog)}
                className="flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-800 cursor-pointer"
              >
                <span>Go to {selectedLog.entityType === 'invoice' ? 'Invoice' : 'Quotation'}</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => setSelectedLog(null)}
                className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-semibold rounded-lg cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Send Test Email Modal */}
      {isTestEmailModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-150">
            <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center">
                  <Zap className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Send Brevo Test Email</h3>
                  <p className="text-[11px] text-slate-500">Verify your transactional email configuration</p>
                </div>
              </div>
              <button
                onClick={() => setIsTestEmailModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSendTestEmail} className="p-6 space-y-4 text-xs">
              <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-xl space-y-1">
                <p className="font-semibold text-blue-900">Brevo Gateway Testing</p>
                <p className="text-blue-700 text-[11px]">
                  This sends a branded HTML test message via Brevo's SMTP API to verify your sender domain, API key, and inbox deliverability.
                </p>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Sender Email</label>
                <input
                  type="text"
                  disabled
                  value={businessProfile.brevoSenderEmail || businessProfile.email || 'billing@example.com'}
                  className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-lg text-slate-600 font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Recipient Test Email *</label>
                <input
                  type="email"
                  required
                  value={testRecipient}
                  onChange={(e) => setTestRecipient(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 font-medium focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsTestEmailModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSendingTest}
                  className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold shadow-md cursor-pointer disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isSendingTest ? 'Transmitting...' : 'Send Test Notice'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Custom Confirmation Modal for Clearing Email Logs */}
      <ConfirmModal
        isOpen={isConfirmClearOpen}
        title="Clear Dispatch History"
        message="Are you sure you want to clear all dispatch history logs? This action cannot be undone."
        confirmText="Clear History"
        cancelText="Cancel"
        variant="danger"
        onConfirm={() => {
          clearAllEmailLogs();
          setIsConfirmClearOpen(false);
        }}
        onCancel={() => setIsConfirmClearOpen(false)}
      />
    </div>
  );
};
