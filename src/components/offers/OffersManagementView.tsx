import React, { useState } from 'react';
import {
  FileSpreadsheet,
  Plus,
  Search,
  Filter,
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
    t,
    language,
  } = useApp();

  const currency = businessProfile.defaultCurrency || 'EUR';

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedOffer, setSelectedOffer] = useState<Offer | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Form State
  const [clientId, setClientId] = useState<string>(clients[0]?.id || '');
  const [offerNumber, setOfferNumber] = useState<string>(`10${offers.length + 1}`);
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [expiryDate, setExpiryDate] = useState<string>(
    new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [notes, setNotes] = useState<string>(
    language === 'de'
      ? 'Dieses verbindliche Angebot ist 14 Kalendertage ab Ausstellungsdatum gültig.'
      : 'This formal quotation is valid for 14 calendar days from issue date.'
  );
  const [terms, setTerms] = useState<string>(
    language === 'de'
      ? '50% Anzahlung bei Auftragserteilung, 50% nach Fertigstellung und Abnahme.'
      : '50% upfront deposit upon contract signing, 50% upon final acceptance.'
  );
  const [items, setItems] = useState<InvoiceItem[]>([
    {
      id: 'off-item-1',
      name: language === 'de' ? 'Fenster- und Türmontage Service' : 'Custom Software Specification & Architecture Design',
      description: language === 'de' ? 'Fachgerechter Einbau nach RAL-Montagestandard inkl. Abdichtung.' : 'System modeling, API contracts, and technology stack selection.',
      quantity: 1,
      unit: language === 'de' ? 'Pauschal' : 'project',
      unitPrice: 3500,
      discount: 0,
      discountType: 'percentage',
      vatRate: businessProfile.defaultVatRate || 20,
      total: 3500,
      type: 'service',
    },
  ]);

  const filteredOffers = offers.filter((off) => {
    const matchSearch =
      off.number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      off.clientSnapshot.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (off.clientSnapshot.companyName && off.clientSnapshot.companyName.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchStatus = statusFilter === 'all' || off.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const totals = calculateInvoiceTotals(items, 0, 'percentage', 0, 0);

  const handleOpenCreate = () => {
    setClientId(clients[0]?.id || '');
    setOfferNumber(`10${offers.length + 1}`);
    setDate(new Date().toISOString().split('T')[0]);
    setExpiryDate(new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
    setIsCreateModalOpen(true);
  };

  const handleSaveOffer = (e: React.FormEvent) => {
    e.preventDefault();
    const client = clients.find((c) => c.id === clientId) || clients[0];

    createOffer({
      number: offerNumber,
      clientId,
      clientSnapshot: client,
      date,
      expiryDate,
      items,
      currency,
      subtotal: totals.subtotal,
      vatTotal: totals.vatTotal,
      total: totals.grandTotal,
      status: 'draft',
      notes,
      termsAndConditions: terms,
    });

    setIsCreateModalOpen(false);
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
      setCurrentTab('invoices');
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
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
          <span className="text-[11px] font-semibold text-slate-500 block">{language === 'de' ? 'Angebote gesamt' : 'Total Quotations'}</span>
          <p className="text-lg font-bold text-slate-900 mt-1">{offers.length}</p>
          <span className="text-[10px] text-slate-400">{language === 'de' ? 'Gesamte Pipeline' : 'Total pipeline count'}</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500 block">{language === 'de' ? 'Angenommene Angebote' : 'Accepted Quotes'}</span>
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

        <div className="flex items-center gap-1.5 overflow-x-auto text-xs">
          {[
            { id: 'all', label: t.common.all },
            { id: 'draft', label: t.status.draft },
            { id: 'sent', label: t.status.sent },
            { id: 'accepted', label: t.status.accepted },
            { id: 'rejected', label: t.status.rejected },
            { id: 'expired', label: t.status.expired },
          ].map((st) => (
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

      {/* Offers Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
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
                            setIsEmailModalOpen(true);
                          }}
                          className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg cursor-pointer"
                          title={language === 'de' ? 'Angebot per E-Mail senden' : 'Send Quote Email'}
                        >
                          <Send className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => deleteOffer(off.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer"
                          title={language === 'de' ? 'Angebot löschen' : 'Delete Quote'}
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

      {/* Create Offer Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
            <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900">{t.offers.newOffer}</h3>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveOffer} className="p-6 space-y-4 text-xs overflow-y-auto flex-1">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block font-semibold text-slate-700 mb-1">{t.offers.client} *</label>
                  <select
                    value={clientId}
                    onChange={(e) => setClientId(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    {clients.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} {c.companyName ? `(${c.companyName})` : ''} - {c.email}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">{t.offers.offerDate}</label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">{t.offers.validUntil}</label>
                  <input
                    type="date"
                    value={expiryDate}
                    onChange={(e) => setExpiryDate(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block font-semibold text-slate-700 mb-1">{t.offers.scopeOfWork}</label>
                  <input
                    type="text"
                    value={items[0]?.name || ''}
                    onChange={(e) => {
                      const updated = [...items];
                      updated[0].name = e.target.value;
                      setItems(updated);
                    }}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-medium"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">{language === 'de' ? 'Einzelpreis geschätzt' : 'Estimated Unit Price'} ({currency})</label>
                  <input
                    type="number"
                    value={items[0]?.unitPrice || 0}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value) || 0;
                      const updated = [...items];
                      updated[0].unitPrice = val;
                      updated[0].total = val * updated[0].quantity;
                      setItems(updated);
                    }}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">{t.offers.totalEstimated}</label>
                  <div className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-mono font-bold text-slate-900">
                    {formatCurrency(totals.grandTotal, currency)}
                  </div>
                </div>

                <div className="col-span-2">
                  <label className="block font-semibold text-slate-700 mb-1">{t.common.notes}</label>
                  <textarea
                    rows={2}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                >
                  {t.common.cancel}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md cursor-pointer"
                >
                  {t.common.save}
                </button>
              </div>
            </form>
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
    </div>
  );
};
