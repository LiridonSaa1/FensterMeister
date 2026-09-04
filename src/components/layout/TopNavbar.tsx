import React, { useState } from 'react';
import {
  Menu,
  Search,
  Plus,
  FileText,
  Users,
  FileSpreadsheet,
  Sparkles,
  LogOut,
  Settings,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { NavigationTab } from '../../types';

interface TopNavbarProps {
  onToggleMobileMenu: () => void;
}

export const TopNavbar: React.FC<TopNavbarProps> = ({ onToggleMobileMenu }) => {
  const { currentTab, setCurrentTab, invoices, clients, products, offers, businessProfile, setSelectedInvoiceId, setSelectedClientId, setSelectedOfferId, t, language, logout, currentUserEmail } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const getPageTitle = (tab: NavigationTab) => {
    switch (tab) {
      case 'dashboard':
        return { title: t.dashboard.title, subtitle: t.dashboard.subtitle };
      case 'invoices':
        return { title: t.invoices.title, subtitle: t.invoices.subtitle };
      case 'invoice_create':
        return { title: t.invoices.newInvoice, subtitle: language === 'de' ? 'Rechnung mit Echtzeitvorschau gestalten und ausstellen' : 'Design and issue customized invoices with live preview' };
      case 'invoice_edit':
        return { title: t.invoices.editInvoice, subtitle: language === 'de' ? 'Positionen, Rabatte und Zahlungsbedingungen anpassen' : 'Update invoice items, discounts, or terms' };
      case 'clients':
        return { title: t.clients.title, subtitle: t.clients.subtitle };
      case 'client_detail':
        return { title: t.clients.clientDetails, subtitle: language === 'de' ? 'Kundenstammdaten und Dokumentenhistorie' : 'Financial summary, invoice history and records' };
      case 'products':
        return { title: t.products.title, subtitle: t.products.subtitle };
      case 'offers':
        return { title: t.offers.title, subtitle: t.offers.subtitle };
      case 'offer_create':
        return { title: t.offers.newOffer, subtitle: language === 'de' ? 'Individuelles Angebot und Fensterkalkulation erstellen' : 'Create detailed pricing proposals for prospects' };
      case 'windows':
        return { title: t.windows.title, subtitle: t.windows.subtitle };
      case 'payments':
        return { title: t.payments.title, subtitle: t.payments.subtitle };
      case 'email_history':
        return { title: t.email.title, subtitle: t.email.subtitle };
      case 'settings':
        return { title: t.settings.title, subtitle: t.settings.subtitle };
      default:
        return { title: 'Apex Enterprise', subtitle: 'Management System' };
    }
  };

  const { title, subtitle } = getPageTitle(currentTab);

  // Quick search results
  const filteredInvoices = searchQuery.trim()
    ? invoices.filter(
        (i) =>
          i.number.toLowerCase().includes(searchQuery.toLowerCase()) ||
          i.clientSnapshot.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (i.clientSnapshot.companyName && i.clientSnapshot.companyName.toLowerCase().includes(searchQuery.toLowerCase()))
      ).slice(0, 3)
    : [];

  const filteredClients = searchQuery.trim()
    ? clients.filter(
        (c) =>
          c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (c.companyName && c.companyName.toLowerCase().includes(searchQuery.toLowerCase())) ||
          c.email.toLowerCase().includes(searchQuery.toLowerCase())
      ).slice(0, 3)
    : [];

  const filteredProducts = searchQuery.trim()
    ? products.filter(
        (p) =>
          p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.sku.toLowerCase().includes(searchQuery.toLowerCase())
      ).slice(0, 3)
    : [];

  const hasSearchResults = filteredInvoices.length > 0 || filteredClients.length > 0 || filteredProducts.length > 0;

  return (
    <header id="top-navbar" className="sticky top-0 z-30 h-16 bg-white border-b border-slate-200 px-4 sm:px-8 flex items-center justify-between gap-4">
      {/* Left side: Hamburger + Search Bar / Title */}
      <div className="flex items-center gap-4 flex-1">
        <button
          id="navbar-mobile-menu-btn"
          onClick={onToggleMobileMenu}
          className="p-2 rounded-lg text-slate-600 hover:bg-slate-100 lg:hidden cursor-pointer"
          aria-label="Open menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Search Bar - Clean Minimalism Rounded-Full Pill */}
        <div className="relative w-full max-w-sm">
          <div className="flex items-center bg-slate-100 rounded-full px-4 py-2 w-full">
            <Search className="w-4 h-4 text-slate-400 shrink-0" />
            <input
              id="navbar-global-search-input"
              type="text"
              placeholder={language === 'de' ? 'Suchen nach Rechnungen, Kunden, Artikeln...' : 'Search records, invoices or clients...'}
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setIsSearchOpen(true);
              }}
              onFocus={() => setIsSearchOpen(true)}
              className="bg-transparent border-none outline-none text-xs ml-2 w-full text-slate-900 placeholder:text-slate-400"
            />
          </div>

          {/* Quick Search Dropdown */}
          {isSearchOpen && searchQuery.trim() && (
            <div
              id="navbar-search-results"
              className="absolute left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl border border-slate-200 p-3 z-50 text-xs max-h-96 overflow-y-auto"
            >
              {hasSearchResults ? (
                <div className="space-y-3">
                  {filteredInvoices.length > 0 && (
                    <div>
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 py-1">{t.nav.invoices}</div>
                      {filteredInvoices.map((inv) => (
                        <button
                          key={inv.id}
                          onClick={() => {
                            setSelectedInvoiceId(inv.id);
                            setCurrentTab('invoices');
                            setIsSearchOpen(false);
                            setSearchQuery('');
                          }}
                          className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-blue-50 flex items-center justify-between cursor-pointer"
                        >
                          <div>
                            <span className="font-semibold text-slate-900">{inv.prefix}{inv.number}</span>
                            <span className="text-slate-500 ml-2">{inv.clientSnapshot.name}</span>
                          </div>
                          <span className="font-mono font-medium text-blue-600">${inv.total.toLocaleString()}</span>
                        </button>
                      ))}
                    </div>
                  )}

                  {filteredClients.length > 0 && (
                    <div>
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 py-1">{t.nav.clients}</div>
                      {filteredClients.map((cli) => (
                        <button
                          key={cli.id}
                          onClick={() => {
                            setSelectedClientId(cli.id);
                            setCurrentTab('client_detail');
                            setIsSearchOpen(false);
                            setSearchQuery('');
                          }}
                          className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-slate-100 flex items-center justify-between cursor-pointer"
                        >
                          <span className="font-medium text-slate-900">{cli.name}</span>
                          <span className="text-slate-500">{cli.companyName || cli.city}</span>
                        </button>
                      ))}
                    </div>
                  )}

                  {filteredProducts.length > 0 && (
                    <div>
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 py-1">{t.nav.products}</div>
                      {filteredProducts.map((prod) => (
                        <button
                          key={prod.id}
                          onClick={() => {
                            setCurrentTab('products');
                            setIsSearchOpen(false);
                            setSearchQuery('');
                          }}
                          className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-slate-100 flex items-center justify-between cursor-pointer"
                        >
                          <span className="font-medium text-slate-900">{prod.name}</span>
                          <span className="font-mono text-slate-600">${prod.sellingPrice}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-4 text-center text-slate-400 text-xs">{language === 'de' ? 'Keine passenden Datensätze gefunden' : 'No matching records found'}</div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Right Controls: Notifications & User Profile */}
      <div className="flex items-center gap-3 sm:gap-4">
        {/* Currency badge */}
        <div className="hidden md:flex items-center gap-1 px-2.5 py-1 bg-slate-100 text-slate-600 rounded-md text-xs font-medium">
          <span>{businessProfile.defaultCurrency}</span>
        </div>

        {/* Notification Bell with red alert dot */}
        <div className="relative cursor-pointer text-slate-500 hover:text-slate-700">
          <div className="w-2 h-2 bg-red-500 rounded-full absolute right-0 top-0 border-2 border-white" />
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
        </div>

        {/* User Profile Info & Avatar */}
        <div className="flex items-center gap-2.5 pl-2 border-l border-slate-200">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-bold text-slate-800">{businessProfile.contactPerson || 'FensterMeister Admin'}</p>
            <p className="text-[10px] text-slate-400 font-mono">{currentUserEmail || 'fenster@meister.com'}</p>
          </div>
          <div className="w-9 h-9 bg-slate-900 text-white rounded-full border-2 border-white shadow-sm flex items-center justify-center font-bold text-xs">
            FM
          </div>

          {/* Settings Quick Button */}
          <button
            onClick={() => setCurrentTab('settings')}
            className={`p-2 rounded-xl transition-colors cursor-pointer ${
              currentTab === 'settings' ? 'text-blue-600 bg-blue-50 font-bold' : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'
            }`}
            title={t.settings.title}
          >
            <Settings className="w-4 h-4" />
          </button>

          {/* Logout Button */}
          <button
            onClick={logout}
            className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
            title={language === 'de' ? 'Abmelden' : 'Logout'}
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
