import React, { useState } from 'react';
import {
  FileSpreadsheet,
  Plus,
  Search,
  Filter,
  ChevronDown,
  ArrowRight,
  Send,
  Download,
  Printer,
  Edit,
  Trash2,
  Eye,
  CheckCircle2,
  Clock,
  AlertCircle,
  X,
  FileCheck,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useApp } from '../../context/AppContext';
import { Offer, OfferStatus, InvoiceItem } from '../../types';
import { formatCurrency, formatDate, calculateInvoiceTotals } from '../../utils/formatters';
import { generatePdfFromElement, printElement } from '../../utils/pdfGenerator';
import { SendEmailModal } from '../email/SendEmailModal';
import { InvoiceDocumentRenderer } from '../invoices/InvoiceTemplates';

export const OffersManagementView: React.FC = () => {
  const {
    offers,
    clients,
    products,
    createOffer,
    updateOffer,
    deleteOffer,
    convertOfferToInvoice,
    businessProfile,
    setCurrentTab,
    setSelectedInvoiceId,
    setSelectedOfferId,
    t,
    language,
  } = useApp();

  const currency = businessProfile.defaultCurrency || 'EUR';

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedOffer, setSelectedOffer] = useState<Offer | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);

  const filterOptions = [
    { id: 'all', label: t.common.all },
    { id: 'draft', label: t.status.draft },
    { id: 'sent', label: t.status.sent },
    { id: 'accepted', label: t.status.accepted },
    { id: 'rejected', label: t.status.rejected },
    { id: 'expired', label: t.status.expired },
  ];

  const filteredOffers = offers.filter((off) => {
    const matchSearch =
      off.number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      off.clientSnapshot.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (off.clientSnapshot.companyName && off.clientSnapshot.companyName.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchStatus = statusFilter === 'all' || off.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const handleOpenCreate = () => {
    setSelectedOfferId(null);
    setCurrentTab('offer_create');
  };

  const handleConvertToInvoice = (offerId: string) => {
    const newInvoice = convertOfferToInvoice(offerId);
    if (newInvoice) {
      try {
        confetti({
          particleCount: 90,
          spread: 80,
          origin: { y: 0.6 },
        });
      } catch (e) {
        // fallback
      }
      setSelectedInvoiceId(newInvoice.id);
      setCurrentTab('invoice_create');
    }
  };

  const handleDownloadOfferPdf = async (off: Offer) => {
    setSelectedOffer(off);
    const targetId = isDetailModalOpen ? 'offer-pdf-target' : 'offer-pdf-hidden-target';
    setTimeout(async () => {
      await generatePdfFromElement(
        targetId,
        `Offer_${off.number}.pdf`,
        true
      );
    }, 120);
  };

  return (
    <div className="space-y-6 max-w-8xl mx-auto pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">{t.offers.title}</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {t.offers.subtitle}
          </p>
        </div>

        <button
          id="offers-btn-create-new"
          onClick={handleOpenCreate}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>{t.offers.newOffer}</span>
        </button>
      </div>

      {/* KPI Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500 block">{language === 'de' ? 'Angebote gesamt' : 'Total Offers'}</span>
          <p className="text-lg font-bold text-slate-900 mt-1">{offers.length}</p>
          <span className="text-[10px] text-slate-400">{language === 'de' ? 'Gesamte Pipeline' : 'Total pipeline count'}</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500 block">{language === 'de' ? 'Angenommene Angebote' : 'Accepted Offers'}</span>
          <p className="text-lg font-bold text-emerald-600 mt-1">
            {offers.filter((o) => o.status === 'accepted').length}
          </p>
          <span className="text-[10px] text-emerald-600 font-medium">{language === 'de' ? 'Erfolgreich beauftragt' : 'Converted to sales'}</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500 block">{language === 'de' ? 'Ausstehend' : 'Pending Response'}</span>
          <p className="text-lg font-bold text-blue-600 mt-1">
            {offers.filter((o) => o.status === 'sent' || o.status === 'draft').length}
          </p>
          <span className="text-[10px] text-slate-400">{language === 'de' ? 'Warten auf Rückmeldung' : 'Awaiting client decision'}</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500 block">{language === 'de' ? 'Pipeline-Wert' : 'Pipeline Value'}</span>
          <p className="text-lg font-bold text-slate-900 mt-1 font-mono">
            {formatCurrency(offers.reduce((acc, o) => acc + o.total, 0), currency)}
          </p>
          <span className="text-[10px] text-slate-400">{language === 'de' ? 'Möglicher Bruttoumsatz' : 'Potential gross revenue'}</span>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row justify-between items-stretch md:items-center gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder={language === 'de' ? 'Angebote nach #, Kunde, Firma durchsuchen...' : 'Search quotations by #, client name, company...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
        </div>

        {/* Mobile Dropdown Filter */}
        <div className="sm:hidden w-full relative">
          <Filter className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full pl-9 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 appearance-none capitalize cursor-pointer"
          >
            {filterOptions.map((st) => (
              <option key={st.id} value={st.id}>
                {st.label}
              </option>
            ))}
          </select>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>

        {/* Desktop Filter Pills */}
        <div className="hidden sm:flex items-center gap-1.5 overflow-x-auto text-xs">
          {filterOptions.map((st) => (
            <button
              key={st.id}
              onClick={() => setStatusFilter(st.id)}
              className={`px-3 py-1.5 rounded-lg font-semibold capitalize transition-all cursor-pointer ${
                statusFilter === st.id ? 'bg-slate-900 text-white shadow-xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {st.label}
            </button>
          ))}
        </div>
      </div>

      {/* Mobile Cards View (Screens < 640px) */}
      <div className="space-y-3 sm:hidden">
        {filteredOffers.length > 0 ? (
          filteredOffers.map((off) => (
            <div
              key={off.id}
              className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs space-y-3"
            >
              {/* Top Row: Offer Number & Status */}
              <div className="flex items-center justify-between">
                <span className="font-mono font-bold text-slate-900 text-sm">
                  {businessProfile.offerPrefix || 'OFF-2026-'}{off.number}
                </span>
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                    off.status === 'accepted'
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : off.status === 'sent'
                      ? 'bg-blue-50 text-blue-700 border border-blue-200'
                      : off.status === 'rejected'
                      ? 'bg-rose-50 text-rose-700 border border-rose-200'
                      : 'bg-slate-100 text-slate-700 border border-slate-200'
                  }`}
                >
                  {off.status === 'accepted' ? t.status.accepted : off.status === 'sent' ? t.status.sent : off.status === 'rejected' ? t.status.rejected : off.status === 'expired' ? t.status.expired : t.status.draft}
                </span>
              </div>

              {/* Client & Amount Row */}
              <div className="flex items-start justify-between gap-3 pt-1 border-t border-slate-100">
                <div>
                  <p className="font-bold text-slate-900 text-xs">{off.clientSnapshot.name}</p>
                  {off.clientSnapshot.companyName && (
                    <p className="text-[11px] text-slate-500">{off.clientSnapshot.companyName}</p>
                  )}
                  <p className="text-[10px] text-slate-400 mt-1">
                    {language === 'de' ? 'Datum:' : 'Date:'} {formatDate(off.date)} • {language === 'de' ? 'Gültig:' : 'Valid:'} {formatDate(off.expiryDate)}
                  </p>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-[10px] text-slate-400 block uppercase font-medium">{t.offers.totalEstimated}</span>
                  <span className="text-sm font-bold text-slate-900 font-mono">
                    {formatCurrency(off.total, off.currency)}
                  </span>
                </div>
              </div>

              {/* Action Buttons Row */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100">
                {off.status !== 'accepted' && (
                  <button
                    onClick={() => handleConvertToInvoice(off.id)}
                    className="flex-1 flex items-center justify-center gap-1 py-2 px-3 text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors cursor-pointer"
                  >
                    <FileCheck className="w-3.5 h-3.5" />
                    <span>{t.offers.convertToInvoice}</span>
                  </button>
                )}

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => {
                      setSelectedOffer(off);
                      setIsDetailModalOpen(true);
                    }}
                    className="p-2 text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl cursor-pointer"
                    title={language === 'de' ? 'Vorschau' : 'View'}
                  >
                    <Eye className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => {
                      setSelectedOfferId(off.id);
                      setCurrentTab('offer_edit');
                    }}
                    className="p-2 text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl cursor-pointer"
                    title={language === 'de' ? 'Bearbeiten' : 'Edit'}
                  >
                    <Edit className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => {
                      setSelectedOffer(off);
                      setIsEmailModalOpen(true);
                    }}
                    className="p-2 text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl cursor-pointer"
                    title={language === 'de' ? 'E-Mail senden' : 'Send Email'}
                  >
                    <Send className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => deleteOffer(off.id)}
                    className="p-2 text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-xl cursor-pointer"
                    title={language === 'de' ? 'Löschen' : 'Delete'}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center text-slate-400">
            <p className="text-xs font-semibold">{t.offers.emptyList}</p>
          </div>
        )}
      </div>

      {/* Desktop Offers Table (Visible on screens >= 640px) */}
      <div className="hidden sm:block bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead className="bg-slate-50 text-slate-600 font-semibold uppercase tracking-wider text-[11px] border-b border-slate-200">
              <tr>
                <th className="py-3.5 px-4">{language === 'de' ? 'Angebot #' : 'Offer #'}</th>
                <th className="py-3.5 px-3">{t.offers.client}</th>
                <th className="py-3.5 px-3">{t.offers.offerDate}</th>
                <th className="py-3.5 px-3">{t.offers.validUntil}</th>
                <th className="py-3.5 px-3 text-right">{t.offers.totalEstimated}</th>
                <th className="py-3.5 px-3 text-center">{t.common.status}</th>
                <th className="py-3.5 px-4 text-right">{t.common.actions}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredOffers.length > 0 ? (
                filteredOffers.map((off) => (
                  <tr key={off.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                      {businessProfile.offerPrefix || 'OFF-2026-'}{off.number}
                    </td>
                    <td className="py-3.5 px-3 font-medium text-slate-800">
                      <div className="font-semibold text-slate-900">{off.clientSnapshot.name}</div>
                      {off.clientSnapshot.companyName && (
                        <div className="text-[11px] text-slate-400">{off.clientSnapshot.companyName}</div>
                      )}
                    </td>
                    <td className="py-3.5 px-3 text-slate-600">{formatDate(off.date)}</td>
                    <td className="py-3.5 px-3 text-slate-600 font-medium">{formatDate(off.expiryDate)}</td>
                    <td className="py-3.5 px-3 text-right font-bold text-slate-900 font-mono">
                      {formatCurrency(off.total, off.currency)}
                    </td>
                    <td className="py-3.5 px-3 text-center">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          off.status === 'accepted'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : off.status === 'sent'
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : off.status === 'rejected'
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : 'bg-slate-100 text-slate-700 border border-slate-200'
                        }`}
                      >
                        {off.status === 'accepted' ? t.status.accepted : off.status === 'sent' ? t.status.sent : off.status === 'rejected' ? t.status.rejected : off.status === 'expired' ? t.status.expired : t.status.draft}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Convert to Invoice action */}
                        {off.status !== 'accepted' && (
                          <button
                            onClick={() => handleConvertToInvoice(off.id)}
                            className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors cursor-pointer"
                            title={language === 'de' ? 'In Rechnung umwandeln' : 'Convert to Live Invoice'}
                          >
                            <FileCheck className="w-3.5 h-3.5" />
                            <span>{t.offers.convertToInvoice}</span>
                          </button>
                        )}

                        <button
                          onClick={() => {
                            setSelectedOffer(off);
                            setIsDetailModalOpen(true);
                          }}
                          className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg cursor-pointer"
                          title={language === 'de' ? 'Vorschau & PDF' : 'View Document'}
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => {
                            setSelectedOfferId(off.id);
                            setCurrentTab('offer_edit');
                          }}
                          className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg cursor-pointer"
                          title={language === 'de' ? 'Angebot bearbeiten' : 'Edit Offer'}
                        >
                          <Edit className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => {
                            setSelectedOffer(off);
                            setIsEmailModalOpen(true);
                          }}
                          className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg cursor-pointer"
                          title={language === 'de' ? 'Angebot per E-Mail senden' : 'Send Offer Email'}
                        >
                          <Send className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => deleteOffer(off.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer"
                          title={language === 'de' ? 'Angebot löschen' : 'Delete Offer'}
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
                    <p className="text-sm font-semibold">{t.offers.emptyList}</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* PDF View Modal */}
      {isDetailModalOpen && selectedOffer && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="p-4 bg-slate-900 text-white flex justify-between items-center">
              <span className="font-bold text-xs">{language === 'de' ? 'Angebot PDF Dokument' : 'Offer PDF Document'} #{selectedOffer.number}</span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => generatePdfFromElement('offer-pdf-target', `Offer_${selectedOffer.number}.pdf`)}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>{language === 'de' ? 'PDF Herunterladen' : 'Download PDF'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => printElement('offer-pdf-target')}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>{language === 'de' ? 'Drucken' : 'Print'}</span>
                </button>
                <button onClick={() => setIsDetailModalOpen(false)} className="text-slate-400 hover:text-white text-xs cursor-pointer ml-2">✕</button>
              </div>
            </div>
            <div className="flex-1 p-6 overflow-y-auto bg-slate-100">
              <div id="offer-pdf-target">
                <InvoiceDocumentRenderer offer={selectedOffer} businessProfile={businessProfile} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Send Email Modal */}
      {isEmailModalOpen && selectedOffer && (
        <SendEmailModal
          offer={selectedOffer}
          isOpen={isEmailModalOpen}
          onClose={() => setIsEmailModalOpen(false)}
        />
      )}

      {/* Hidden Target for Direct PDF Downloads */}
      <div className="fixed -left-[9999px] -top-[9999px] pointer-events-none opacity-0">
        {selectedOffer && (
          <div id="offer-pdf-hidden-target">
            <InvoiceDocumentRenderer offer={selectedOffer} businessProfile={businessProfile} />
          </div>
        )}
      </div>
    </div>
  );
};
