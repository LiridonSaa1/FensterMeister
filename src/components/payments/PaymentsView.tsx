import React, { useState } from 'react';
import {
  CreditCard,
  Search,
  Filter,
  CheckCircle2,
  Calendar,
  Building,
  DollarSign,
  ArrowUpRight,
  Printer,
  X,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { PaymentRecord } from '../../types';
import { formatCurrency, formatDate } from '../../utils/formatters';

export const PaymentsView: React.FC = () => {
  const { payments, businessProfile, invoices, setSelectedInvoiceId, setCurrentTab, t, language } = useApp();
  const currency = businessProfile.defaultCurrency || 'EUR';

  const [searchQuery, setSearchQuery] = useState('');
  const [methodFilter, setMethodFilter] = useState('all');

  const filteredPayments = payments.filter((p: PaymentRecord) => {
    const matchSearch =
      p.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.reference.toLowerCase().includes(searchQuery.toLowerCase());
    const matchMethod = methodFilter === 'all' || p.method === methodFilter;
    return matchSearch && matchMethod;
  });

  const totalCollected = payments.reduce((acc, p) => acc + p.amount, 0);

  const getMethodLabel = (m: string) => {
    switch (m) {
      case 'bank_transfer':
        return t.payments.bankTransfer;
      case 'credit_card':
        return t.payments.creditCard;
      case 'stripe':
        return t.payments.stripe;
      case 'paypal':
        return t.payments.paypal;
      case 'cash':
        return t.payments.cash;
      default:
        return m;
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">{t.payments.title}</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {t.payments.subtitle}
          </p>
        </div>
      </div>

      {/* KPI Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500 block">{t.payments.totalCollected}</span>
          <p className="text-2xl font-bold text-emerald-600 mt-1 font-mono">
            {formatCurrency(totalCollected, currency)}
          </p>
          <span className="text-[10px] text-slate-400">{payments.length} {language === 'de' ? 'verifizierte Zahlungen' : 'verified transactions'}</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500 block">{language === 'de' ? 'Banküberweisungen' : 'Bank Wire Settlements'}</span>
          <p className="text-2xl font-bold text-slate-900 mt-1 font-mono">
            {formatCurrency(
              payments.filter((p) => p.method === 'bank_transfer').reduce((acc, p) => acc + p.amount, 0),
              currency
            )}
          </p>
          <span className="text-[10px] text-slate-400">{language === 'de' ? 'Direkte SEPA- & Bankeingänge' : 'Direct ACH & wire clearances'}</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500 block">{language === 'de' ? 'Kreditkarten & Gateways' : 'Card & Digital Gateways'}</span>
          <p className="text-2xl font-bold text-blue-600 mt-1 font-mono">
            {formatCurrency(
              payments.filter((p) => p.method === 'credit_card' || p.method === 'stripe' || p.method === 'paypal').reduce((acc, p) => acc + p.amount, 0),
              currency
            )}
          </p>
          <span className="text-[10px] text-slate-400">{language === 'de' ? 'Sofortige digitale Zahlungen' : 'Instant digital transactions'}</span>
        </div>
      </div>

      {/* Search & Method Filter */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row justify-between items-stretch md:items-center gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder={language === 'de' ? 'Zahlungen nach Kunde, Rechnungs-# oder Ref suchen...' : 'Search payments by client, invoice #, transaction ref...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto text-xs">
          {[
            { id: 'all', label: t.common.all },
            { id: 'bank_transfer', label: t.payments.bankTransfer },
            { id: 'credit_card', label: t.payments.creditCard },
            { id: 'stripe', label: t.payments.stripe },
            { id: 'paypal', label: t.payments.paypal },
            { id: 'cash', label: t.payments.cash },
          ].map((m) => (
            <button
              key={m.id}
              onClick={() => setMethodFilter(m.id)}
              className={`px-3 py-1.5 rounded-lg font-semibold capitalize transition-all cursor-pointer ${
                methodFilter === m.id ? 'bg-slate-900 text-white shadow-xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      {/* Payments Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead className="bg-slate-50 text-slate-600 font-semibold uppercase tracking-wider text-[11px] border-b border-slate-200">
              <tr>
                <th className="py-3.5 px-4">{language === 'de' ? 'Transaktions-Ref' : 'Transaction Ref'}</th>
                <th className="py-3.5 px-3">{t.invoices.client}</th>
                <th className="py-3.5 px-3">{t.payments.invoiceRef}</th>
                <th className="py-3.5 px-3">{t.payments.paymentDate}</th>
                <th className="py-3.5 px-3">{t.payments.paymentMethod}</th>
                <th className="py-3.5 px-3 text-right">{t.payments.amount}</th>
                <th className="py-3.5 px-4 text-center">{t.common.status}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredPayments.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-bold text-slate-900">{p.reference}</td>
                  <td className="py-3.5 px-3 font-semibold text-slate-800">{p.clientName}</td>
                  <td className="py-3.5 px-3">
                    <button
                      onClick={() => {
                        setSelectedInvoiceId(p.invoiceId);
                        setCurrentTab('invoices');
                      }}
                      className="font-mono font-semibold text-blue-600 hover:underline cursor-pointer"
                    >
                      {p.invoiceNumber}
                    </button>
                  </td>
                  <td className="py-3.5 px-3 text-slate-600">{formatDate(p.date)}</td>
                  <td className="py-3.5 px-3">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-700">
                      {getMethodLabel(p.method)}
                    </span>
                  </td>
                  <td className="py-3.5 px-3 text-right font-bold text-emerald-600 font-mono text-sm">
                    +{formatCurrency(p.amount, currency)}
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <CheckCircle2 className="w-3 h-3" /> {language === 'de' ? 'Verbucht' : 'Settled'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
