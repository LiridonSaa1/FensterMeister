import React, { useState } from 'react';
import {
  Plus,
  Search,
  Filter,
  ChevronDown,
  Download,
  Printer,
  Send,
  CreditCard,
  Copy,
  Edit,
  Trash2,
  Eye,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileEdit,
  ArrowUpDown,
  DollarSign,
  X,
  Loader2,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Invoice, InvoiceStatus } from '../../types';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { generatePdfFromElement, printElement } from '../../utils/pdfGenerator';
import { SendEmailModal } from '../email/SendEmailModal';
import { RecordPaymentModal } from '../payments/RecordPaymentModal';
import { InvoiceDocumentRenderer } from './InvoiceTemplates';

export const InvoiceListView: React.FC = () => {
  const {
    invoices,
    deleteInvoice,
    duplicateInvoice,
    updateInvoiceStatus,
    businessProfile,
    setCurrentTab,
    setSelectedInvoiceId,
    t,
    language,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [activeInvoiceForAction, setActiveInvoiceForAction] = useState<Invoice | null>(null);

  const currency = businessProfile.defaultCurrency || 'EUR';

  // Filter & Search Logic
  const filteredInvoices = invoices.filter((inv) => {
    const matchesSearch =
      inv.number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.clientSnapshot.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (inv.clientSnapshot.companyName && inv.clientSnapshot.companyName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      inv.clientSnapshot.email.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'all' || inv.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Calculate Summary metrics
  const totalInvoiced = invoices.reduce((acc, i) => acc + i.total, 0);
  const totalPaid = invoices.reduce((acc, i) => acc + (i.amountPaid || 0), 0);
  const totalOutstanding = invoices.reduce((acc, i) => acc + (i.status !== 'paid' ? i.amountDue : 0), 0);
  const totalOverdue = invoices.filter((i) => i.status === 'overdue').reduce((acc, i) => acc + i.amountDue, 0);

  const handleOpenDetail = (inv: Invoice) => {
    setSelectedInvoice(inv);
    setIsDetailModalOpen(true);
  };

  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  const handleDownloadPdf = async (inv: Invoice) => {
    if (isGeneratingPdf) return;
    setIsGeneratingPdf(true);
    setSelectedInvoice(inv);
    setTimeout(async () => {
      try {
        await generatePdfFromElement(
          'invoice-printable-target',
          `Invoice_${inv.prefix}${inv.number}.pdf`,
          true
        );
      } catch (err) {
        console.error('PDF download error:', err);
      } finally {
        setIsGeneratingPdf(false);
      }
    }, 120);
  };

  const handlePrint = (inv: Invoice) => {
    setSelectedInvoice(inv);
    setTimeout(() => {
      printElement('invoice-printable-target');
    }, 100);
  };

  return (
    <div className="space-y-6 max-w-8xl mx-auto pb-16">
      {/* Header & New Action */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight">{t.invoices.title}</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {t.invoices.subtitle}
          </p>
        </div>

        <button
          id="invoice-list-new-btn"
          onClick={() => {
            setSelectedInvoiceId(null);
            setCurrentTab('invoice_create');
          }}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-lg shadow-blue-200 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>{t.invoices.newInvoice}</span>
        </button>
      </div>

      {/* Summary KPI Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-[11px] font-medium uppercase tracking-wider text-slate-400 block">{t.invoices.metrics.totalInvoiced}</span>
          <p className="text-xl font-bold text-slate-900 mt-1 font-mono">
            {formatCurrency(totalInvoiced, currency)}
          </p>
          <span className="text-[10px] text-slate-400">{invoices.length} {language === 'de' ? 'Dokumente gesamt' : 'total documents'}</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-[11px] font-medium uppercase tracking-wider text-slate-400 block">{t.invoices.metrics.collected}</span>
          <p className="text-xl font-bold text-emerald-600 mt-1 font-mono">
            {formatCurrency(totalPaid, currency)}
          </p>
          <span className="text-[10px] text-emerald-600 font-bold">
            {totalInvoiced > 0 ? Math.round((totalPaid / totalInvoiced) * 100) : 0}% {language === 'de' ? 'Erfolgsquote' : 'clearance rate'}
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-[11px] font-medium uppercase tracking-wider text-slate-400 block">{t.invoices.metrics.outstanding}</span>
          <p className="text-xl font-bold text-blue-600 mt-1 font-mono">
            {formatCurrency(totalOutstanding, currency)}
          </p>
          <span className="text-[10px] text-slate-400">{language === 'de' ? 'Ausstehend' : 'Awaiting clearance'}</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-[11px] font-medium uppercase tracking-wider text-slate-400 block">{t.invoices.metrics.overdue}</span>
          <p className="text-xl font-bold text-rose-600 mt-1 font-mono">
            {formatCurrency(totalOverdue, currency)}
          </p>
          <span className="text-[10px] text-rose-500 font-bold">{language === 'de' ? 'Mahnung erforderlich' : 'Requires follow up'}</span>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-stretch md:items-center gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            id="invoice-search-input"
            type="text"
            placeholder={t.invoices.searchPlaceholder}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          />
        </div>

        {/* Status Filter Buttons */}
        <div className="sm:hidden w-full relative">
          <Filter className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full pl-9 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 appearance-none cursor-pointer"
          >
            {[
              { id: 'all', label: t.common.all },
              { id: 'unpaid', label: t.status.unpaid },
              { id: 'paid', label: t.status.paid },
              { id: 'overdue', label: t.status.overdue },
              { id: 'draft', label: t.status.draft },
            ].map((st) => (
              <option key={st.id} value={st.id}>
                {st.label}
              </option>
            ))}
          </select>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>

        <div className="hidden sm:flex flex-wrap items-center gap-1.5 text-xs">
          {[
            { id: 'all', label: t.common.all },
            { id: 'unpaid', label: t.status.unpaid },
            { id: 'paid', label: t.status.paid },
            { id: 'overdue', label: t.status.overdue },
            { id: 'draft', label: t.status.draft },
          ].map((st) => (
            <button
              key={st.id}
              onClick={() => setStatusFilter(st.id)}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                statusFilter === st.id
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {st.label}
            </button>
          ))}
        </div>
      </div>

      {/* Mobile Cards View (Screens < 640px) */}
      <div className="space-y-3 sm:hidden">
        {filteredInvoices.length > 0 ? (
          filteredInvoices.map((inv) => (
            <div
              key={inv.id}
              onClick={() => handleOpenDetail(inv)}
              className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3 cursor-pointer hover:border-slate-300 transition-all"
            >
              {/* Top Row: Invoice Number & Status */}
              <div className="flex items-center justify-between">
                <span className="font-mono font-bold text-slate-900 text-sm">
                  {inv.prefix}{inv.number}
                </span>
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                    inv.status === 'paid'
                      ? 'bg-emerald-100 text-emerald-700'
                      : inv.status === 'unpaid'
                      ? 'bg-amber-100 text-amber-700'
                      : inv.status === 'overdue'
                      ? 'bg-red-100 text-red-700'
                      : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  {inv.status === 'paid' ? t.status.paid : inv.status === 'unpaid' ? t.status.unpaid : inv.status === 'overdue' ? t.status.overdue : t.status.draft}
                </span>
              </div>

              {/* Client & Amount Row */}
              <div className="flex items-start justify-between gap-3 pt-1 border-t border-slate-100">
                <div>
                  <p className="font-bold text-slate-900 text-xs">{inv.clientSnapshot.name}</p>
                  {inv.clientSnapshot.companyName && (
                    <p className="text-[11px] text-slate-500">{inv.clientSnapshot.companyName}</p>
                  )}
                  <p className="text-[10px] text-slate-400 mt-1">
                    {language === 'de' ? 'Datum:' : 'Date:'} {formatDate(inv.date)} • {language === 'de' ? 'Fällig:' : 'Due:'} {formatDate(inv.dueDate)}
                  </p>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-[10px] text-slate-400 block uppercase font-medium">{t.invoices.amount}</span>
                  <span className="text-sm font-bold text-slate-900 font-mono block">
                    {formatCurrency(inv.total, inv.currency)}
                  </span>
                  {inv.amountDue > 0 && (
                    <span className="text-[10px] font-mono font-bold text-rose-600">
                      {language === 'de' ? 'Offen:' : 'Due:'} {formatCurrency(inv.amountDue, inv.currency)}
                    </span>
                  )}
                </div>
              </div>

              {/* Action Buttons Row */}
              <div className="flex items-center justify-end gap-1.5 pt-2 border-t border-slate-100" onClick={(e) => e.stopPropagation()}>
                <button
                  onClick={() => handleOpenDetail(inv)}
                  className="p-2 text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl cursor-pointer"
                  title={language === 'de' ? 'Ansehen' : 'View'}
                >
                  <Eye className="w-4 h-4" />
                </button>

                <button
                  onClick={() => handleDownloadPdf(inv)}
                  className="p-2 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-xl cursor-pointer"
                  title={language === 'de' ? 'PDF' : 'PDF'}
                >
                  <Download className="w-4 h-4" />
                </button>

                <button
                  onClick={() => {
                    setActiveInvoiceForAction(inv);
                    setIsEmailModalOpen(true);
                  }}
                  className="p-2 text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl cursor-pointer"
                  title={language === 'de' ? 'E-Mail' : 'Email'}
                >
                  <Send className="w-4 h-4" />
                </button>

                {inv.status !== 'paid' && (
                  <button
                    onClick={() => {
                      setActiveInvoiceForAction(inv);
                      setIsPaymentModalOpen(true);
                    }}
                    className="p-2 text-emerald-600 bg-emerald-50 hover:bg-emerald-100 rounded-xl cursor-pointer"
                    title={language === 'de' ? 'Zahlung' : 'Payment'}
                  >
                    <CreditCard className="w-4 h-4" />
                  </button>
                )}

                <button
                  onClick={() => {
                    setSelectedInvoiceId(inv.id);
                    setCurrentTab('invoice_create');
                  }}
                  className="p-2 text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl cursor-pointer"
                  title={language === 'de' ? 'Bearbeiten' : 'Edit'}
                >
                  <Edit className="w-4 h-4" />
                </button>

                <button
                  onClick={() => deleteInvoice(inv.id)}
                  className="p-2 text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-xl cursor-pointer"
                  title={language === 'de' ? 'Löschen' : 'Delete'}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center text-slate-400">
            <p className="text-xs font-semibold">{t.invoices.emptyList}</p>
          </div>
        )}
      </div>

      {/* Invoices Desktop Table (Visible on screens >= 640px) */}
      <div className="hidden sm:block bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead className="bg-slate-50 text-[10px] text-slate-400 uppercase tracking-widest font-bold border-b border-slate-100">
              <tr>
                <th className="py-3.5 px-4">{language === 'de' ? 'Rechnung #' : 'Invoice #'}</th>
                <th className="py-3.5 px-3">{t.invoices.client}</th>
                <th className="py-3.5 px-3">{t.invoices.date}</th>
                <th className="py-3.5 px-3">{t.invoices.dueDate}</th>
                <th className="py-3.5 px-3 text-right">{t.invoices.amount}</th>
                <th className="py-3.5 px-3 text-right">{language === 'de' ? 'Offen' : 'Due'}</th>
                <th className="py-3.5 px-3 text-center">{t.invoices.status}</th>
                <th className="py-3.5 px-4 text-right">{t.common.actions}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredInvoices.length > 0 ? (
                filteredInvoices.map((inv) => (
                  <tr
                    key={inv.id}
                    className="hover:bg-slate-50/80 transition-colors group cursor-pointer"
                    onClick={() => handleOpenDetail(inv)}
                  >
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900 group-hover:text-blue-600">
                      {inv.prefix}{inv.number}
                    </td>
                    <td className="py-3.5 px-3 font-medium text-slate-800">
                      <div className="font-semibold text-slate-900">{inv.clientSnapshot.name}</div>
                      {inv.clientSnapshot.companyName && (
                        <div className="text-[11px] text-slate-400">{inv.clientSnapshot.companyName}</div>
                      )}
                    </td>
                    <td className="py-3.5 px-3 text-slate-600">{formatDate(inv.date)}</td>
                    <td className="py-3.5 px-3 text-slate-600 font-medium">{formatDate(inv.dueDate)}</td>
                    <td className="py-3.5 px-3 text-right font-bold text-slate-900 font-mono">
                      {formatCurrency(inv.total, inv.currency)}
                    </td>
                    <td className="py-3.5 px-3 text-right font-mono font-semibold">
                      <span className={inv.amountDue > 0 ? 'text-rose-600' : 'text-slate-400'}>
                        {formatCurrency(inv.amountDue, inv.currency)}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 text-center">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold uppercase ${
                          inv.status === 'paid'
                            ? 'bg-emerald-100 text-emerald-700'
                            : inv.status === 'unpaid'
                            ? 'bg-amber-100 text-amber-700'
                            : inv.status === 'overdue'
                            ? 'bg-red-100 text-red-700'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {inv.status === 'paid' ? t.status.paid : inv.status === 'unpaid' ? t.status.unpaid : inv.status === 'overdue' ? t.status.overdue : t.status.draft}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleOpenDetail(inv)}
                          className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg cursor-pointer transition-colors"
                          title={language === 'de' ? 'Rechnung ansehen' : 'View Invoice'}
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => {
                            setActiveInvoiceForAction(inv);
                            setIsEmailModalOpen(true);
                          }}
                          className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg cursor-pointer transition-colors"
                          title={language === 'de' ? 'E-Mail senden' : 'Send Email'}
                        >
                          <Send className="w-4 h-4" />
                        </button>

                        {inv.status !== 'paid' && (
                          <button
                            onClick={() => {
                              setActiveInvoiceForAction(inv);
                              setIsPaymentModalOpen(true);
                            }}
                            className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg cursor-pointer transition-colors"
                            title={language === 'de' ? 'Zahlung erfassen' : 'Record Payment'}
                          >
                            <CreditCard className="w-4 h-4" />
                          </button>
                        )}

                        <button
                          onClick={() => {
                            duplicateInvoice(inv.id);
                          }}
                          className="p-1.5 text-slate-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg cursor-pointer transition-colors"
                          title={language === 'de' ? 'Duplizieren' : 'Duplicate Invoice'}
                        >
                          <Copy className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => {
                            setSelectedInvoiceId(inv.id);
                            setCurrentTab('invoice_create');
                          }}
                          className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg cursor-pointer transition-colors"
                          title={language === 'de' ? 'Bearbeiten' : 'Edit Invoice'}
                        >
                          <Edit className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => deleteInvoice(inv.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer transition-colors"
                          title={language === 'de' ? 'Löschen' : 'Delete Invoice'}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <p className="text-sm font-semibold">{t.invoices.noInvoices}</p>
                    <p className="text-xs mt-1">{language === 'de' ? 'Suchfilter anpassen oder neue Rechnung erstellen.' : 'Try resetting search query or create a new invoice.'}</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail & Full Preview Modal */}
      {isDetailModalOpen && selectedInvoice && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="bg-slate-100 rounded-2xl shadow-2xl border border-slate-200 w-full max-w-5xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Top Bar */}
            <div className="p-4 bg-white border-b border-slate-200 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="text-base font-bold text-slate-900">
                  {language === 'de' ? 'Rechnung' : 'Invoice'} #{selectedInvoice.prefix}{selectedInvoice.number}
                </span>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                    selectedInvoice.status === 'paid'
                      ? 'bg-emerald-100 text-emerald-800'
                      : selectedInvoice.status === 'unpaid'
                      ? 'bg-blue-100 text-blue-800'
                      : selectedInvoice.status === 'overdue'
                      ? 'bg-rose-100 text-rose-800'
                      : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  {selectedInvoice.status === 'paid' ? t.status.paid : selectedInvoice.status === 'unpaid' ? t.status.unpaid : selectedInvoice.status === 'overdue' ? t.status.overdue : t.status.draft}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleDownloadPdf(selectedInvoice)}
                  disabled={isGeneratingPdf}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 disabled:opacity-60 rounded-lg cursor-pointer"
                >
                  {isGeneratingPdf ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-600" />
                  ) : (
                    <Download className="w-3.5 h-3.5" />
                  )}
                  <span>{isGeneratingPdf ? (language === 'de' ? 'PDF...' : 'Generating...') : 'PDF'}</span>
                </button>
                <button
                  onClick={() => handlePrint(selectedInvoice)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>{t.common.print}</span>
                </button>
                <button
                  onClick={() => {
                    setActiveInvoiceForAction(selectedInvoice);
                    setIsEmailModalOpen(true);
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{t.common.send}</span>
                </button>
                {selectedInvoice.status !== 'paid' && (
                  <button
                    onClick={() => {
                      setActiveInvoiceForAction(selectedInvoice);
                      setIsPaymentModalOpen(true);
                    }}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg cursor-pointer shadow-xs"
                  >
                    <CreditCard className="w-3.5 h-3.5" />
                    <span>{language === 'de' ? 'Zahlung erfassen' : 'Record Payment'}</span>
                  </button>
                )}
                <button
                  onClick={() => setIsDetailModalOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg cursor-pointer ml-2"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Document Viewer Area */}
            <div className="p-6 overflow-y-auto flex-1">
              <div id="invoice-printable-target">
                <InvoiceDocumentRenderer
                  invoice={selectedInvoice}
                  businessProfile={businessProfile}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modals for Action Trigger */}
      {isEmailModalOpen && activeInvoiceForAction && (
        <SendEmailModal
          invoice={activeInvoiceForAction}
          isOpen={isEmailModalOpen}
          onClose={() => setIsEmailModalOpen(false)}
        />
      )}

      {isPaymentModalOpen && activeInvoiceForAction && (
        <RecordPaymentModal
          invoice={activeInvoiceForAction}
          isOpen={isPaymentModalOpen}
          onClose={() => {
            setIsPaymentModalOpen(false);
            if (selectedInvoice && selectedInvoice.id === activeInvoiceForAction.id) {
              setIsDetailModalOpen(false);
            }
          }}
        />
      )}
    </div>
  );
};
