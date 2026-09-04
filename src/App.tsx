import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Sidebar } from './components/layout/Sidebar';
import { TopNavbar } from './components/layout/TopNavbar';
import { DashboardView } from './components/dashboard/DashboardView';
import { InvoiceListView } from './components/invoices/InvoiceListView';
import { InvoiceBuilderView } from './components/invoices/InvoiceBuilderView';
import { ClientManagementView } from './components/clients/ClientManagementView';
import { ProductManagementView } from './components/products/ProductManagementView';
import { WindowTypesView } from './components/windows/WindowTypesView';
import { OffersManagementView } from './components/offers/OffersManagementView';
import { OfferBuilderView } from './components/offers/OfferBuilderView';
import { PaymentsView } from './components/payments/PaymentsView';
import { EmailHistoryView } from './components/email/EmailHistoryView';
import { SettingsView } from './components/settings/SettingsView';

const MainContent: React.FC = () => {
  const { currentTab, selectedInvoiceId, selectedOfferId } = useApp();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex font-sans antialiased selection:bg-blue-600 selection:text-white">
      {/* Sidebar Navigation */}
      <Sidebar
        mobileOpen={mobileMenuOpen}
        onCloseMobile={() => setMobileMenuOpen(false)}
      />

      {/* Main App Layout Container */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64 transition-all duration-300">
        {/* Sticky Top Navigation Bar */}
        <TopNavbar onToggleMobileMenu={() => setMobileMenuOpen(!mobileMenuOpen)} />

        {/* Dynamic Page Views */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 bg-[#F8FAFC] overflow-y-auto">
          {currentTab === 'dashboard' && <DashboardView />}
          {currentTab === 'invoices' && <InvoiceListView />}
          {currentTab === 'invoice_create' && <InvoiceBuilderView editInvoiceId={selectedInvoiceId} />}
          {(currentTab === 'clients' || currentTab === 'client_detail') && <ClientManagementView />}
          {currentTab === 'products' && <ProductManagementView />}
          {currentTab === 'windows' && <WindowTypesView />}
          {currentTab === 'offers' && <OffersManagementView />}
          {(currentTab === 'offer_create' || currentTab === 'offer_edit') && <OfferBuilderView editOfferId={selectedOfferId} />}
          {currentTab === 'payments' && <PaymentsView />}
          {currentTab === 'email_history' && <EmailHistoryView />}
          {currentTab === 'settings' && <SettingsView />}
        </main>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainContent />
    </AppProvider>
  );
}

