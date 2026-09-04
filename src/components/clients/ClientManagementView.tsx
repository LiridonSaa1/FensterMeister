import React, { useState, useRef } from 'react';
import {
  Users,
  UserPlus,
  Search,
  Filter,
  Download,
  Upload,
  Building,
  User,
  Phone,
  Mail,
  MapPin,
  FileText,
  DollarSign,
  CreditCard,
  FileSpreadsheet,
  Edit,
  Trash2,
  Eye,
  Plus,
  ArrowUpDown,
  ChevronRight,
  ExternalLink,
  History,
  X,
} from 'lucide-react';
import Papa from 'papaparse';
import { useApp } from '../../context/AppContext';
import { Client, ClientType } from '../../types';
import { formatCurrency, formatDate, exportClientsToCSV } from '../../utils/formatters';

export const ClientManagementView: React.FC = () => {
  const {
    clients,
    addClient,
    updateClient,
    deleteClient,
    importClients,
    invoices,
    offers,
    payments,
    activityLogs,
    businessProfile,
    currentTab,
    setCurrentTab,
    selectedClientId,
    setSelectedClientId,
    setSelectedInvoiceId,
    t,
    language,
  } = useApp();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const currency = businessProfile.defaultCurrency || 'EUR';

  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'individual' | 'business'>('all');
  const [sortBy, setSortBy] = useState<'name' | 'revenue' | 'invoices' | 'created'>('name');

  // Modals state
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [country, setCountry] = useState(language === 'de' ? 'Deutschland' : 'United States');
  const [vatNumber, setVatNumber] = useState('');
  const [businessNumber, setBusinessNumber] = useState('');
  const [type, setType] = useState<ClientType>('business');
  const [notes, setNotes] = useState('');

  // Active Client Detail Selection
  const activeClient = clients.find((c) => c.id === selectedClientId) || (currentTab === 'client_detail' ? clients[0] : null);

  // Filter and Sort Clients
  const filteredClients = clients
    .filter((c) => {
      const matchSearch =
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (c.companyName && c.companyName.toLowerCase().includes(searchQuery.toLowerCase())) ||
        c.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.city.toLowerCase().includes(searchQuery.toLowerCase());
      const matchType = typeFilter === 'all' || c.type === typeFilter;
      return matchSearch && matchType;
    })
    .sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      if (sortBy === 'created') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();

      const aInvoices = invoices.filter((i) => i.clientId === a.id);
      const bInvoices = invoices.filter((i) => i.clientId === b.id);

      if (sortBy === 'invoices') return bInvoices.length - aInvoices.length;
      if (sortBy === 'revenue') {
        const aRev = aInvoices.reduce((acc, i) => acc + (i.amountPaid || 0), 0);
        const bRev = bInvoices.reduce((acc, i) => acc + (i.amountPaid || 0), 0);
        return bRev - aRev;
      }
      return 0;
    });

  const handleOpenCreateModal = () => {
    setEditingClient(null);
    setName('');
    setCompanyName('');
    setEmail('');
    setPhone('');
    setAddress('');
    setCity('');
    setCountry(language === 'de' ? 'Deutschland' : 'United States');
    setVatNumber('');
    setBusinessNumber('');
    setType('business');
    setNotes('');
    setIsClientModalOpen(true);
  };

  const handleOpenEditModal = (client: Client, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setEditingClient(client);
    setName(client.name);
    setCompanyName(client.companyName || '');
    setEmail(client.email);
    setPhone(client.phone);
    setAddress(client.address);
    setCity(client.city);
    setCountry(client.country);
    setVatNumber(client.vatNumber || '');
    setBusinessNumber(client.businessNumber || '');
    setType(client.type);
    setNotes(client.notes || '');
    setIsClientModalOpen(true);
  };

  const handleSaveClient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;

    if (editingClient) {
      updateClient(editingClient.id, {
        name,
        companyName,
        email,
        phone,
        address,
        city,
        country,
        vatNumber,
        businessNumber,
        type,
        notes,
      });
    } else {
      const created = addClient({
        name,
        companyName,
        email,
        phone,
        address,
        city,
        country,
        vatNumber,
        businessNumber,
        type,
        notes,
      });
      setSelectedClientId(created.id);
    }

    setIsClientModalOpen(false);
  };

  // CSV File Import Handler
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const importedData = results.data.map((row: any) => ({
          name: row['Name'] || row['Full Name'] || row['name'] || '',
          companyName: row['Company'] || row['Company Name'] || row['companyName'] || '',
          email: row['Email'] || row['email'] || '',
          phone: row['Phone'] || row['Telephone'] || row['phone'] || '',
          address: row['Address'] || row['address'] || '',
          city: row['City'] || row['city'] || '',
          country: row['Country'] || row['country'] || (language === 'de' ? 'Deutschland' : 'United States'),
          vatNumber: row['VAT Number'] || row['vatNumber'] || '',
          businessNumber: row['Business Registration'] || row['businessNumber'] || '',
          type: (row['Type'] || 'business').toLowerCase() === 'individual' ? 'individual' : 'business',
          notes: row['Notes'] || (language === 'de' ? 'Importiert via CSV Datei.' : 'Imported via CSV file.'),
        }));

        importClients(importedData);
        if (fileInputRef.current) fileInputRef.current.value = '';
      },
      error: (err) => {
        console.error('CSV parse error:', err);
      },
    });
  };

  // Client Detail View Calculation
  const clientInvoices = activeClient ? invoices.filter((i) => i.clientId === activeClient.id) : [];
  const clientPaidInvoices = clientInvoices.filter((i) => i.status === 'paid');
  const clientUnpaidInvoices = clientInvoices.filter((i) => i.status === 'unpaid');
  const clientOverdueInvoices = clientInvoices.filter((i) => i.status === 'overdue');

  const clientTotalRevenue = clientPaidInvoices.reduce((acc, i) => acc + (i.amountPaid || 0), 0);
  const clientTotalPaid = clientInvoices.reduce((acc, i) => acc + (i.amountPaid || 0), 0);
  const clientTotalUnpaid = clientUnpaidInvoices.reduce((acc, i) => acc + i.amountDue, 0);
  const clientTotalOverdue = clientOverdueInvoices.reduce((acc, i) => acc + i.amountDue, 0);

  const clientPayments = activeClient ? payments.filter((p) => p.clientId === activeClient.id) : [];
  const clientOffers = activeClient ? offers.filter((o) => o.clientId === activeClient.id) : [];

  return (
    <div className="space-y-6 max-w-8xl mx-auto pb-16">
      {/* If in Client Detail View, show comprehensive profile */}
      {currentTab === 'client_detail' && activeClient ? (
        <div className="space-y-6 animate-in fade-in duration-150">
          {/* Back button & Profile Header */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setCurrentTab('clients')}
                className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg cursor-pointer"
                title={language === 'de' ? 'Zurück zur Kundenliste' : 'Back to Clients'}
              >
                <ChevronRight className="w-5 h-5 rotate-180" />
              </button>

              <div className="flex items-center gap-3">
                {activeClient.avatarUrl ? (
                  <img
                    src={activeClient.avatarUrl}
                    alt={activeClient.name}
                    referrerPolicy="no-referrer"
                    className="w-14 h-14 rounded-2xl object-cover border-2 border-slate-100 shadow-xs"
                  />
                ) : (
                  <div className="w-14 h-14 rounded-2xl bg-blue-600 text-white font-extrabold text-xl flex items-center justify-center shadow-xs">
                    {activeClient.name.charAt(0)}
                  </div>
                )}
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-bold text-slate-900">{activeClient.name}</h2>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-slate-100 text-slate-700">
                      {activeClient.type === 'business' ? (language === 'de' ? 'Unternehmen' : 'Business') : (language === 'de' ? 'Privatkunde' : 'Individual')}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {activeClient.companyName || (language === 'de' ? 'Privatkonto' : 'Individual Account')} • {language === 'de' ? 'Kunde seit' : 'Client since'} {formatDate(activeClient.createdAt)}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handleOpenEditModal(activeClient)}
                className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
              >
                <Edit className="w-3.5 h-3.5" />
                <span>{t.clients.editClient}</span>
              </button>

              <button
                onClick={() => {
                  setSelectedClientId(activeClient.id);
                  setCurrentTab('invoice_create');
                }}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{language === 'de' ? 'Rechnung für Kunden erstellen' : 'Create Invoice for Client'}</span>
              </button>
            </div>
          </div>

          {/* Client Metrics Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <span className="text-[11px] font-medium uppercase tracking-wider text-slate-400 block">{t.clients.totalInvoiced}</span>
              <p className="text-xl font-bold text-emerald-600 mt-1 font-mono">{formatCurrency(clientTotalRevenue, currency)}</p>
              <span className="text-[10px] text-slate-400">{language === 'de' ? 'Bisher bezahlt' : 'Paid to date'}</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <span className="text-[11px] font-medium uppercase tracking-wider text-slate-400 block">{language === 'de' ? 'Rechnungen gesamt' : 'Total Invoices'}</span>
              <p className="text-xl font-bold text-slate-900 mt-1">{clientInvoices.length}</p>
              <span className="text-[10px] text-slate-400">{clientPaidInvoices.length} {language === 'de' ? 'beglichen' : 'settled'}</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <span className="text-[11px] font-medium uppercase tracking-wider text-slate-400 block">{language === 'de' ? 'Zahlungseingänge' : 'Total Paid'}</span>
              <p className="text-xl font-bold text-slate-900 mt-1 font-mono">{formatCurrency(clientTotalPaid, currency)}</p>
              <span className="text-[10px] text-slate-400">{clientPayments.length} {language === 'de' ? 'Transaktionen' : 'transactions'}</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <span className="text-[11px] font-medium uppercase tracking-wider text-slate-400 block">{t.clients.outstandingBalance}</span>
              <p className="text-xl font-bold text-blue-600 mt-1 font-mono">{formatCurrency(clientTotalUnpaid, currency)}</p>
              <span className="text-[10px] text-slate-400">{clientUnpaidInvoices.length} {language === 'de' ? 'offene Rechnungen' : 'active bills'}</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm col-span-2 sm:col-span-1">
              <span className="text-[11px] font-medium uppercase tracking-wider text-slate-400 block">{language === 'de' ? 'Überfällig' : 'Total Overdue'}</span>
              <p className="text-xl font-bold text-rose-600 mt-1 font-mono">{formatCurrency(clientTotalOverdue, currency)}</p>
              <span className="text-[10px] text-rose-500 font-bold">{clientOverdueInvoices.length} {language === 'de' ? 'überfällig' : 'overdue'}</span>
            </div>
          </div>

          {/* Details & Invoices Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Contact & Tax Card */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4 text-xs">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">{language === 'de' ? 'Kontakt- & Unternehmensdaten' : 'Contact & Company Info'}</h3>

              <div className="space-y-2.5">
                <div className="flex items-center gap-2.5 text-slate-700">
                  <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                  <span className="font-medium">{activeClient.email}</span>
                </div>
                {activeClient.phone && (
                  <div className="flex items-center gap-2.5 text-slate-700">
                    <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                    <span>{activeClient.phone}</span>
                  </div>
                )}
                <div className="flex items-start gap-2.5 text-slate-700">
                  <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                  <span>
                    {activeClient.address}, {activeClient.city}, {activeClient.country}
                  </span>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 space-y-2">
                {activeClient.vatNumber && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">{t.clients.vatNumber}:</span>
                    <span className="font-mono font-semibold text-slate-900">{activeClient.vatNumber}</span>
                  </div>
                )}
                {activeClient.businessNumber && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">{t.clients.businessNumber}:</span>
                    <span className="font-mono text-slate-900">{activeClient.businessNumber}</span>
                  </div>
                )}
              </div>

              {activeClient.notes && (
                <div className="pt-3 border-t border-slate-100 bg-slate-50 p-3 rounded-xl">
                  <span className="font-semibold text-slate-700 block mb-1">{language === 'de' ? 'Interne Notizen:' : 'Account Notes:'}</span>
                  <p className="text-slate-600 whitespace-pre-line text-[11px]">{activeClient.notes}</p>
                </div>
              )}
            </div>

            {/* Right: Invoices & Activity History */}
            <div className="lg:col-span-2 space-y-6">
              {/* Invoices History Table */}
              <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
                <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">{t.clients.clientHistory}</h3>
                  <span className="text-xs text-slate-400">{clientInvoices.length} {language === 'de' ? 'Rechnungen erstellt' : 'invoices issued'}</span>
                </div>

                {/* Mobile Cards View for Client Invoices (< 640px) */}
                <div className="space-y-3 p-4 sm:hidden">
                  {clientInvoices.length > 0 ? (
                    clientInvoices.map((inv) => (
                      <div
                        key={inv.id}
                        onClick={() => {
                          setSelectedInvoiceId(inv.id);
                          setCurrentTab('invoices');
                        }}
                        className="bg-slate-50/80 p-3.5 rounded-xl border border-slate-200/80 space-y-2.5 cursor-pointer hover:bg-slate-100/80 transition-all"
                      >
                        {/* Top Row: Invoice Number & Status */}
                        <div className="flex items-center justify-between">
                          <span className="font-mono font-bold text-blue-600 text-xs">
                            {inv.prefix}{inv.number}
                          </span>
                          <span
                            className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                              inv.status === 'paid'
                                ? 'bg-emerald-100 text-emerald-700'
                                : inv.status === 'unpaid'
                                ? 'bg-amber-100 text-amber-700'
                                : inv.status === 'overdue'
                                ? 'bg-red-100 text-red-700'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {inv.status === 'paid'
                              ? t.status.paid
                              : inv.status === 'unpaid'
                              ? t.status.unpaid
                              : inv.status === 'overdue'
                              ? t.status.overdue
                              : t.status.draft}
                          </span>
                        </div>

                        {/* Dates & Amount Row */}
                        <div className="flex items-start justify-between gap-3 text-xs pt-2 border-t border-slate-200/60">
                          <div className="space-y-0.5">
                            <p className="text-[11px] text-slate-600">
                              <span className="text-slate-400">{t.invoices.date}:</span> {formatDate(inv.date)}
                            </p>
                            <p className="text-[11px] text-slate-600">
                              <span className="text-slate-400">{t.invoices.dueDate}:</span> {formatDate(inv.dueDate)}
                            </p>
                          </div>

                          <div className="text-right shrink-0">
                            <span className="font-mono font-bold text-slate-900 text-sm block">
                              {formatCurrency(inv.total, inv.currency)}
                            </span>
                            {inv.amountDue > 0 && (
                              <span className="text-[10px] font-mono font-bold text-rose-600">
                                {language === 'de' ? 'Offen:' : 'Due:'} {formatCurrency(inv.amountDue, inv.currency)}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-4 text-center text-xs text-slate-400">
                      {language === 'de' ? 'Keine Rechnungen vorhanden.' : 'No invoices found.'}
                    </div>
                  )}
                </div>

                {/* Desktop Table View (>= 640px) */}
                <div className="hidden sm:block overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-50 text-slate-500 uppercase text-[10px]">
                      <tr>
                        <th className="py-3 px-4">{language === 'de' ? 'Rechnung' : 'Invoice'}</th>
                        <th className="py-3 px-3">{t.invoices.date}</th>
                        <th className="py-3 px-3">{t.invoices.dueDate}</th>
                        <th className="py-3 px-3 text-right">{t.invoices.amount}</th>
                        <th className="py-3 px-3 text-right">{language === 'de' ? 'Offen' : 'Due'}</th>
                        <th className="py-3 px-3 text-center">{t.invoices.status}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {clientInvoices.map((inv) => (
                        <tr
                          key={inv.id}
                          onClick={() => {
                            setSelectedInvoiceId(inv.id);
                            setCurrentTab('invoices');
                          }}
                          className="hover:bg-slate-50 cursor-pointer"
                        >
                          <td className="py-3 px-4 font-mono font-bold text-blue-600">{inv.prefix}{inv.number}</td>
                          <td className="py-3 px-3 text-slate-600">{formatDate(inv.date)}</td>
                          <td className="py-3 px-3 text-slate-600">{formatDate(inv.dueDate)}</td>
                          <td className="py-3 px-3 text-right font-bold text-slate-900 font-mono">{formatCurrency(inv.total, inv.currency)}</td>
                          <td className="py-3 px-3 text-right font-mono text-slate-600">{formatCurrency(inv.amountDue, inv.currency)}</td>
                          <td className="py-3 px-3 text-center">
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-100 text-slate-700">
                              {inv.status === 'paid' ? t.status.paid : inv.status === 'unpaid' ? t.status.unpaid : inv.status === 'overdue' ? t.status.overdue : t.status.draft}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Offers & Payments Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Quotations / Offers */}
                <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="text-xs font-bold text-slate-800 uppercase">{t.offers.title} ({clientOffers.length})</h4>
                  </div>
                  <div className="space-y-2">
                    {clientOffers.map((off) => (
                      <div key={off.id} className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 flex justify-between items-center text-xs">
                        <div>
                          <span className="font-bold text-slate-900 font-mono">#{off.number}</span>
                          <span className="text-[10px] text-slate-400 ml-2">{formatDate(off.date)}</span>
                        </div>
                        <span className="font-bold text-slate-800">{formatCurrency(off.total, off.currency)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Payments History */}
                <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="text-xs font-bold text-slate-800 uppercase">{t.payments.paymentLedger} ({clientPayments.length})</h4>
                  </div>
                  <div className="space-y-2">
                    {clientPayments.map((p) => (
                      <div key={p.id} className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 flex justify-between items-center text-xs">
                        <div>
                          <span className="font-bold text-emerald-700 font-mono">+{formatCurrency(p.amount, currency)}</span>
                          <p className="text-[10px] text-slate-400">{p.invoiceNumber} • {formatDate(p.date)}</p>
                        </div>
                        <span className="text-[10px] font-mono text-slate-500">{p.method.replace('_', ' ')}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Standard Clients List View */
        <div className="space-y-6 animate-in fade-in duration-150">
          {/* Actions & CSV Import/Export */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">{t.clients.title}</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                {t.clients.subtitle}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <input
                type="file"
                ref={fileInputRef}
                accept=".csv"
                className="hidden"
                onChange={handleFileUpload}
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>{t.common.importCsv}</span>
              </button>

              <button
                onClick={() => exportClientsToCSV(clients)}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>{t.common.exportCsv}</span>
              </button>

              <button
                id="clients-add-new-btn"
                onClick={handleOpenCreateModal}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm transition-colors cursor-pointer"
              >
                <UserPlus className="w-4 h-4" />
                <span>{t.clients.newClient}</span>
              </button>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row justify-between items-stretch md:items-center gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                id="client-search-input"
                type="text"
                placeholder={t.clients.searchPlaceholder}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>

            <div className="flex items-center gap-2 text-xs">
              <select
                value={typeFilter}
                onChange={(e: any) => setTypeFilter(e.target.value)}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none font-medium"
              >
                <option value="all">{t.common.all}</option>
                <option value="business">{language === 'de' ? 'Unternehmen / B2B' : 'Business / Corporate'}</option>
                <option value="individual">{language === 'de' ? 'Privatkunden' : 'Individual'}</option>
              </select>

              <select
                value={sortBy}
                onChange={(e: any) => setSortBy(e.target.value)}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none font-medium"
              >
                <option value="name">{language === 'de' ? 'Nach Name sortieren' : 'Sort by Name'}</option>
                <option value="revenue">{language === 'de' ? 'Nach Umsatz sortieren' : 'Sort by Revenue'}</option>
                <option value="invoices">{language === 'de' ? 'Nach Rechnungsanzahl' : 'Sort by Invoices'}</option>
                <option value="created">{language === 'de' ? 'Zuletzt hinzugefügt' : 'Recently Added'}</option>
              </select>
            </div>
          </div>

          {/* Clients Grid Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredClients.map((client) => {
              const cInvoices = invoices.filter((i) => i.clientId === client.id);
              const cRevenue = cInvoices.reduce((acc, i) => acc + (i.amountPaid || 0), 0);
              const cDue = cInvoices.reduce((acc, i) => acc + i.amountDue, 0);

              return (
                <div
                  key={client.id}
                  onClick={() => {
                    setSelectedClientId(client.id);
                    setCurrentTab('client_detail');
                  }}
                  className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-3">
                    {/* Top Row: Avatar + Name + Type Pill */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        {client.avatarUrl ? (
                          <img
                            src={client.avatarUrl}
                            alt={client.name}
                            referrerPolicy="no-referrer"
                            className="w-11 h-11 rounded-xl object-cover border border-slate-200 shrink-0"
                          />
                        ) : (
                          <div className="w-11 h-11 rounded-xl bg-blue-50 border border-blue-100 text-blue-700 font-extrabold text-base flex items-center justify-center shrink-0">
                            {client.name.charAt(0)}
                          </div>
                        )}
                        <div className="min-w-0">
                          <h3 className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors text-sm truncate">
                            {client.name}
                          </h3>
                          {client.companyName ? (
                            <p className="text-xs text-slate-500 font-medium truncate flex items-center gap-1">
                              <Building className="w-3 h-3 text-slate-400 shrink-0" />
                              <span className="truncate">{client.companyName}</span>
                            </p>
                          ) : (
                            <p className="text-xs text-slate-400 font-medium truncate flex items-center gap-1">
                              <User className="w-3 h-3 text-slate-400 shrink-0" />
                              <span>{language === 'de' ? 'Privatkonto' : 'Individual Account'}</span>
                            </p>
                          )}
                        </div>
                      </div>

                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shrink-0 ${
                        client.type === 'business'
                          ? 'bg-blue-50 text-blue-700 border border-blue-200/60'
                          : 'bg-slate-100 text-slate-700 border border-slate-200/60'
                      }`}>
                        {client.type === 'business' ? (language === 'de' ? 'Unternehmen' : 'Business') : (language === 'de' ? 'Privat' : 'Individual')}
                      </span>
                    </div>

                    {/* Contact Details */}
                    <div className="space-y-1.5 text-xs text-slate-600 p-3 bg-slate-50/80 rounded-xl border border-slate-100">
                      <p className="truncate flex items-center gap-2">
                        <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{client.email}</span>
                      </p>
                      {client.phone && (
                        <p className="truncate flex items-center gap-2">
                          <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>{client.phone}</span>
                        </p>
                      )}
                      <p className="truncate flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{client.address ? `${client.address}, ` : ''}{client.city}, {client.country}</span>
                      </p>
                    </div>
                  </div>

                  {/* Financial Metrics & Actions Footer */}
                  <div className="pt-3 border-t border-slate-100 space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <div>
                        <span className="text-[10px] text-slate-400 block font-medium uppercase tracking-wider">{t.clients.totalInvoiced}</span>
                        <span className="font-bold text-slate-900 font-mono text-sm">{formatCurrency(cRevenue, currency)}</span>
                      </div>
                      {cDue > 0 ? (
                        <div className="text-right">
                          <span className="text-[10px] text-rose-500 block font-medium uppercase tracking-wider">{t.clients.outstandingBalance}</span>
                          <span className="font-bold text-rose-600 font-mono text-sm">{formatCurrency(cDue, currency)}</span>
                        </div>
                      ) : (
                        <div className="text-right">
                          <span className="text-[10px] text-slate-400 block font-medium uppercase tracking-wider">{language === 'de' ? 'Rechnungen' : 'Invoices'}</span>
                          <span className="font-semibold text-slate-700 text-xs">{cInvoices.length} {language === 'de' ? 'gesamt' : 'total'}</span>
                        </div>
                      )}
                    </div>

                    {/* Touch-Friendly Action Buttons */}
                    <div className="flex items-center justify-between gap-2 pt-1" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => {
                          setSelectedClientId(client.id);
                          setCurrentTab('client_detail');
                        }}
                        className="flex-1 flex items-center justify-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5 text-slate-500" />
                        <span>{language === 'de' ? 'Details' : 'Details'}</span>
                      </button>

                      <button
                        onClick={() => {
                          setSelectedClientId(client.id);
                          setCurrentTab('invoice_create');
                        }}
                        className="flex items-center justify-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors cursor-pointer"
                        title={language === 'de' ? 'Rechnung für Kunden erstellen' : 'Create Invoice'}
                      >
                        <Plus className="w-3.5 h-3.5 text-blue-600" />
                        <span className="hidden sm:inline">{language === 'de' ? 'Rechnung' : 'Invoice'}</span>
                      </button>

                      <button
                        onClick={(e) => handleOpenEditModal(client, e)}
                        className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                        title={language === 'de' ? 'Kunden bearbeiten' : 'Edit'}
                      >
                        <Edit className="w-4 h-4" />
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteClient(client.id);
                        }}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                        title={language === 'de' ? 'Kunden löschen' : 'Delete'}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Create / Edit Client Modal */}
      {isClientModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
                  <UserPlus className="w-4 h-4" />
                </div>
                <h3 className="text-base font-bold text-slate-900">
                  {editingClient ? t.clients.editClient : t.clients.newClient}
                </h3>
              </div>
              <button
                onClick={() => setIsClientModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveClient} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">{language === 'de' ? 'Kundentyp *' : 'Client Type *'}</label>
                  <select
                    value={type}
                    onChange={(e: any) => setType(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="business">{language === 'de' ? 'Unternehmen / Firma' : 'Business / Corporation'}</option>
                    <option value="individual">{language === 'de' ? 'Privatperson' : 'Individual'}</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">{t.clients.clientName} *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={language === 'de' ? 'z.B. Markus Schmidt' : 'e.g. Marcus Vance'}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block font-semibold text-slate-700 mb-1">{t.clients.companyName}</label>
                  <input
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder={language === 'de' ? 'z.B. Fenstermontage Schmidt GmbH' : 'e.g. Quantum Cloud Solutions LLC'}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">{t.clients.email} *</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="kontakt@beispiel.de"
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">{t.clients.phone}</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+49 (0) 30 123456"
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block font-semibold text-slate-700 mb-1">{t.clients.address}</label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder={language === 'de' ? 'Hauptstraße 123' : '450 Mission Street, 14th Floor'}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">{t.clients.city}</label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder={language === 'de' ? 'Berlin, 10115' : 'San Francisco, CA 94105'}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">{t.clients.country}</label>
                  <input
                    type="text"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    placeholder={language === 'de' ? 'Deutschland' : 'United States'}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">{t.clients.vatNumber}</label>
                  <input
                    type="text"
                    value={vatNumber}
                    onChange={(e) => setVatNumber(e.target.value)}
                    placeholder="DE123456789"
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">{t.clients.businessNumber}</label>
                  <input
                    type="text"
                    value={businessNumber}
                    onChange={(e) => setBusinessNumber(e.target.value)}
                    placeholder="HRB 98765"
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 font-mono"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block font-semibold text-slate-700 mb-1">{language === 'de' ? 'Interne Kundennotizen' : 'Internal Notes'}</label>
                  <textarea
                    rows={2}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder={language === 'de' ? 'Besondere Konditionen, Ansprechpartner, Anforderungen...' : 'Key account requirements, billing preferences, SLA terms...'}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsClientModalOpen(false)}
                  className="px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                >
                  {t.common.cancel}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md transition-all cursor-pointer"
                >
                  {t.common.save}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
