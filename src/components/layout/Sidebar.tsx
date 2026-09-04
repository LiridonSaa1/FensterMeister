import React from 'react';
import {
  LayoutDashboard,
  FileText,
  Users,
  Package,
  FileSpreadsheet,
  CreditCard,
  Mail,
  Settings,
  Building2,
  ChevronRight,
  TrendingUp,
  AppWindow,
  LogOut,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { NavigationTab } from '../../types';

interface SidebarProps {
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ mobileOpen, onCloseMobile }) => {
  const { currentTab, setCurrentTab, businessProfile, setSelectedInvoiceId, setSelectedOfferId, t, language, setLanguage, logout } = useApp();

  const navItems: Array<{
    id: NavigationTab;
    label: string;
    icon: React.ReactNode;
  }> = [
    {
      id: 'dashboard',
      label: t.nav.dashboard,
      icon: <LayoutDashboard className="w-4 h-4" />,
    },
    {
      id: 'invoices',
      label: t.nav.invoices,
      icon: <FileText className="w-4 h-4" />,
    },
    {
      id: 'offers',
      label: t.nav.offers,
      icon: <FileSpreadsheet className="w-4 h-4" />,
    },
    {
      id: 'clients',
      label: t.nav.clients,
      icon: <Users className="w-4 h-4" />,
    },
    {
      id: 'products',
      label: t.nav.products,
      icon: <Package className="w-4 h-4" />,
    },
    {
      id: 'windows',
      label: t.nav.windows,
      icon: <AppWindow className="w-4 h-4" />,
    },
    {
      id: 'payments',
      label: t.nav.payments,
      icon: <CreditCard className="w-4 h-4" />,
    },
    {
      id: 'email_history',
      label: t.nav.emailHistory,
      icon: <Mail className="w-4 h-4" />,
    },
  ];

  const handleNavClick = (tab: NavigationTab) => {
    setCurrentTab(tab);
    if (tab === 'invoice_create') {
      setSelectedInvoiceId(null);
    }
    if (tab === 'offer_create') {
      setSelectedOfferId(null);
    }
    if (onCloseMobile) {
      onCloseMobile();
    }
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-40 lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      <aside
        id="app-sidebar"
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-slate-900 text-slate-200 flex flex-col transition-transform duration-200 ease-in-out lg:translate-x-0 border-r border-slate-800 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="p-6 mb-1">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center font-bold text-white text-base shadow-sm">
              {businessProfile.businessName ? businessProfile.businessName.charAt(0) : 'B'}
            </div>
            <div className="overflow-hidden">
              <span className="text-white font-semibold text-lg tracking-tight truncate block">
                {businessProfile.businessName || 'BizFlow Pro'}
              </span>
            </div>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 overflow-y-auto px-4 space-y-1">
          {navItems.map((item) => {
            const isActive = currentTab === item.id || (item.id === 'invoices' && currentTab === 'invoice_create');
            return (
              <button
                key={item.id}
                id={`sidebar-nav-${item.id}`}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-slate-800 text-white shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className={isActive ? 'text-blue-400' : 'text-slate-400'}>{item.icon}</span>
                  <span>{item.label}</span>
                </div>
              </button>
            );
          })}
        </nav>

        {/* Language & Logout Footer */}
        <div className="p-4 border-t border-slate-800 space-y-2">
          {/* Quick Language Switcher */}
          <div className="flex items-center justify-between bg-slate-800/80 rounded-lg p-1 text-[11px]">
            <button
              type="button"
              onClick={() => setLanguage('en')}
              className={`flex-1 flex items-center justify-center gap-1 py-1 rounded-md transition-colors cursor-pointer ${
                language === 'en' ? 'bg-blue-600 text-white font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>🇬🇧</span>
              <span>EN</span>
            </button>
            <button
              type="button"
              onClick={() => setLanguage('de')}
              className={`flex-1 flex items-center justify-center gap-1 py-1 rounded-md transition-colors cursor-pointer ${
                language === 'de' ? 'bg-blue-600 text-white font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>🇩🇪</span>
              <span>DE</span>
            </button>
          </div>

          <button
            type="button"
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-slate-800 hover:bg-rose-600/20 text-slate-300 hover:text-rose-400 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>{language === 'de' ? 'Abmelden' : 'Logout'}</span>
          </button>
        </div>
      </aside>
    </>
  );
};
