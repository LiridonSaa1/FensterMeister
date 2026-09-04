import React from 'react';
import {
  DollarSign,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileEdit,
  Users,
  Package,
  FileSpreadsheet,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  CreditCard,
  ChevronRight,
  Plus,
  Send,
  Eye,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { useApp } from '../../context/AppContext';
import { formatCurrency, formatDate } from '../../utils/formatters';

export const DashboardView: React.FC = () => {
  const {
    invoices,
    clients,
    products,
    offers,
    payments,
    activityLogs,
    businessProfile,
    setCurrentTab,
    setSelectedInvoiceId,
    setSelectedClientId,
    t,
    language,
  } = useApp();

  const currency = businessProfile.defaultCurrency || 'EUR';

  // 1. Metric Calculations
  const totalRevenue = invoices.reduce((acc, inv) => acc + (inv.amountPaid || 0), 0);
  const totalInvoiced = invoices.reduce((acc, inv) => acc + inv.total, 0);
  const paidInvoices = invoices.filter((i) => i.status === 'paid');
  const unpaidInvoices = invoices.filter((i) => i.status === 'unpaid');
  const overdueInvoices = invoices.filter((i) => i.status === 'overdue');
  const draftInvoices = invoices.filter((i) => i.status === 'draft');

  const totalPaidAmount = paidInvoices.reduce((acc, i) => acc + i.total, 0);
  const totalUnpaidAmount = unpaidInvoices.reduce((acc, i) => acc + i.amountDue, 0);
  const totalOverdueAmount = overdueInvoices.reduce((acc, i) => acc + i.amountDue, 0);

  // Revenue this month vs this year
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth();

  const revenueThisYear = payments.reduce((acc, p) => {
    const pDate = new Date(p.date);
    return pDate.getFullYear() === currentYear ? acc + p.amount : acc;
  }, 0);

  const revenueThisMonth = payments.reduce((acc, p) => {
    const pDate = new Date(p.date);
    return pDate.getFullYear() === currentYear && pDate.getMonth() === currentMonth ? acc + p.amount : acc;
  }, 0);

  // 2. Charts Data
  // Monthly Revenue Trend (Last 8 months)
  const monthlyRevenueData = [
    { month: language === 'de' ? 'Jan' : 'Jan', revenue: 14200, target: 12000, collected: 13800 },
    { month: language === 'de' ? 'Feb' : 'Feb', revenue: 18500, target: 15000, collected: 17200 },
    { month: language === 'de' ? 'Mär' : 'Mar', revenue: 22400, target: 18000, collected: 21900 },
    { month: language === 'de' ? 'Apr' : 'Apr', revenue: 19800, target: 20000, collected: 19100 },
    { month: language === 'de' ? 'Mai' : 'May', revenue: 26500, target: 22000, collected: 25800 },
    { month: language === 'de' ? 'Jun' : 'Jun', revenue: 31200, target: 25000, collected: 29400 },
    { month: language === 'de' ? 'Jul' : 'Jul', revenue: 28900, target: 28000, collected: 27500 },
    { month: language === 'de' ? 'Aug' : 'Aug', revenue: 35600, target: 30000, collected: 32800 },
  ];

  // Invoice Status Distribution Data for Pie Chart
  const statusPieData = [
    { name: t.status.paid, value: paidInvoices.length || 1, color: '#10b981' },
    { name: t.status.unpaid, value: unpaidInvoices.length || 1, color: '#3b82f6' },
    { name: t.status.overdue, value: overdueInvoices.length || 1, color: '#ef4444' },
    { name: t.status.draft, value: draftInvoices.length || 1, color: '#94a3b8' },
  ];

  // Monthly Income Comparison
  const monthlyIncomeData = [
    { name: 'Q1 Total', invoiced: 55100, received: 52900 },
    { name: 'Q2 Total', invoiced: 77500, received: 74300 },
    { name: 'Q3 (Current)', invoiced: 64500, received: 60300 },
  ];

  // Recent lists
  const recentInvoices = invoices.slice(0, 5);
  const recentClients = clients.slice(0, 4);
  const recentPayments = payments.slice(0, 4);
  const recentActivity = activityLogs.slice(0, 6);

  return (
    <div className="p-8 space-y-6 max-w-8xl mx-auto">
      {/* Top Header Row with Title & Primary Action */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">{t.dashboard.title}</h1>
          <p className="text-xs text-slate-500 mt-0.5">{t.dashboard.subtitle}</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            id="dashboard-btn-create-offer"
            onClick={() => setCurrentTab('offers')}
            className="px-4 py-2 border border-slate-200 text-slate-700 bg-white hover:bg-slate-50 rounded-lg text-sm font-semibold transition-colors cursor-pointer"
          >
            {t.dashboard.newQuotation}
          </button>
          <button
            id="dashboard-btn-create-invoice"
            onClick={() => {
              setSelectedInvoiceId(null);
              setCurrentTab('invoice_create');
            }}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all cursor-pointer"
          >
            {t.dashboard.createInvoice}
          </button>
        </div>
      </div>

      {/* 4 Metric KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Revenue */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-slate-400 text-xs font-medium uppercase tracking-wider mb-1">{t.dashboard.totalRevenue}</p>
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-bold text-slate-900">{formatCurrency(totalRevenue, currency)}</h3>
            <span className="text-emerald-500 text-xs font-bold">+12.5%</span>
          </div>
          <div className="w-full bg-slate-100 h-1 rounded-full mt-3">
            <div className="bg-emerald-500 w-3/4 h-full rounded-full" />
          </div>
        </div>

        {/* Paid Invoices */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-slate-400 text-xs font-medium uppercase tracking-wider mb-1">{t.dashboard.paidInvoices}</p>
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-bold text-slate-900">{paidInvoices.length}</h3>
            <span className="text-emerald-500 text-xs font-bold">
              {invoices.length > 0 ? Math.round((paidInvoices.length / invoices.length) * 100) : 0}% {language === 'de' ? 'Quote' : 'Rate'}
            </span>
          </div>
          <div className="w-full bg-slate-100 h-1 rounded-full mt-3">
            <div
              className="bg-blue-500 h-full rounded-full"
              style={{ width: `${invoices.length > 0 ? Math.round((paidInvoices.length / invoices.length) * 100) : 0}%` }}
            />
          </div>
        </div>

        {/* Unpaid (Due) */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-slate-400 text-xs font-medium uppercase tracking-wider mb-1">{t.dashboard.unpaidDue}</p>
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-bold text-slate-900">{formatCurrency(totalUnpaidAmount, currency)}</h3>
            <span className="text-amber-500 text-xs font-bold">{unpaidInvoices.length} {language === 'de' ? 'Offen' : 'Active'}</span>
          </div>
          <div className="w-full bg-slate-100 h-1 rounded-full mt-3">
            <div className="bg-amber-400 w-1/4 h-full rounded-full" />
          </div>
        </div>

        {/* Overdue */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-slate-400 text-xs font-medium uppercase tracking-wider mb-1">{t.dashboard.overdue}</p>
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-bold text-slate-900">{formatCurrency(totalOverdueAmount, currency)}</h3>
            <span className={`text-xs font-bold ${overdueInvoices.length > 0 ? 'text-red-500' : 'text-slate-400'}`}>
              {overdueInvoices.length > 0 ? (language === 'de' ? 'Dringend' : 'Critical') : (language === 'de' ? 'Keine' : 'None')}
            </span>
          </div>
          <div className="w-full bg-slate-100 h-1 rounded-full mt-3">
            <div
              className="bg-red-500 h-full rounded-full"
              style={{ width: overdueInvoices.length > 0 ? '25%' : '0%' }}
            />
          </div>
        </div>
      </div>

      {/* Charts & Activity Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Analysis (Last 6-8 Months) */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 flex flex-col shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h4 className="font-bold text-slate-700">{t.dashboard.revenueAnalysis}</h4>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 font-medium">{language === 'de' ? 'Intervall:' : 'Interval:'}</span>
              <select className="text-xs bg-slate-50 border-slate-200 border rounded-md px-2.5 py-1 text-slate-700 outline-none">
                <option>{language === 'de' ? 'Monatlich' : 'Monthly'}</option>
                <option>{language === 'de' ? 'Quartalsweise' : 'Quarterly'}</option>
              </select>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyRevenueData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="colorCollected" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v / 1000}k`} />
                <Tooltip
                  formatter={(value: any) => [`${formatCurrency(Number(value), currency)}`, '']}
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', color: '#fff', fontSize: '12px', border: 'none' }}
                />
                <Area type="monotone" dataKey="revenue" name={language === 'de' ? 'Fakturiertes Volumen' : 'Invoiced Revenue'} stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorRevenue)" />
                <Area type="monotone" dataKey="collected" name={language === 'de' ? 'Zahlungseingang' : 'Cash Collected'} stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorCollected)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-bold text-slate-700">{t.dashboard.recentActivity}</h4>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{language === 'de' ? 'Live' : 'Live'}</span>
            </div>
            <div className="space-y-4">
              {recentActivity.slice(0, 4).map((act, index) => {
                const barColors = ['bg-emerald-500', 'bg-blue-500', 'bg-amber-500', 'bg-purple-500'];
                const barColor = barColors[index % barColors.length];
                return (
                  <div key={act.id} className="flex gap-3">
                    <div className={`w-1 ${barColor} rounded-full h-10 shrink-0`} />
                    <div className="flex-1 overflow-hidden">
                      <p className="text-sm font-semibold text-slate-800 truncate">{act.title}</p>
                      <p className="text-xs text-slate-500 truncate">{act.description}</p>
                      <p className="text-[10px] text-slate-400 mt-1 uppercase font-medium">
                        {new Date(act.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          <button
            onClick={() => setCurrentTab('email_history')}
            className="w-full mt-4 py-2 text-center text-xs font-semibold text-blue-600 hover:text-blue-700 bg-blue-50/50 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
          >
            {t.dashboard.viewNotificationLogs}
          </button>
        </div>
      </div>

      {/* Recent Invoices Clean Minimalism Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h4 className="font-bold text-slate-700">{t.dashboard.recentInvoices}</h4>
          <button
            onClick={() => setCurrentTab('invoices')}
            className="text-xs text-blue-600 font-bold hover:underline cursor-pointer"
          >
            {t.common.viewAll}
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-[10px] text-slate-400 uppercase tracking-widest font-bold">
              <tr>
                <th className="px-6 py-3">{language === 'de' ? 'Rechnung #' : 'Invoice #'}</th>
                <th className="px-6 py-3">{t.invoices.client}</th>
                <th className="px-6 py-3">{t.invoices.date}</th>
                <th className="px-6 py-3">{t.invoices.amount}</th>
                <th className="px-6 py-3">{t.invoices.status}</th>
                <th className="px-6 py-3 text-right">{t.common.actions}</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {recentInvoices.map((inv) => (
                <tr
                  key={inv.id}
                  onClick={() => {
                    setSelectedInvoiceId(inv.id);
                    setCurrentTab('invoices');
                  }}
                  className="border-b border-slate-50 hover:bg-slate-50/50 cursor-pointer transition-colors"
                >
                  <td className="px-6 py-4 font-bold text-slate-800">{inv.prefix}{inv.number}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2.5">
                      <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded flex items-center justify-center text-[10px] font-bold shrink-0">
                        {inv.clientSnapshot.name.charAt(0)}
                      </div>
                      <span className="font-medium text-slate-900 truncate max-w-[160px]">
                        {inv.clientSnapshot.companyName || inv.clientSnapshot.name}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-500 text-xs">{formatDate(inv.issueDate)}</td>
                  <td className="px-6 py-4 font-semibold text-slate-900">
                    {formatCurrency(inv.total, inv.currency)}
                  </td>
                  <td className="px-6 py-4">
                    {inv.status === 'paid' && (
                      <span className="bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded text-[11px] font-bold uppercase">
                        {t.status.paid}
                      </span>
                    )}
                    {inv.status === 'unpaid' && (
                      <span className="bg-amber-100 text-amber-700 px-2 py-0.5 rounded text-[11px] font-bold uppercase">
                        {t.status.unpaid}
                      </span>
                    )}
                    {inv.status === 'overdue' && (
                      <span className="bg-red-100 text-red-700 px-2 py-0.5 rounded text-[11px] font-bold uppercase">
                        {t.status.overdue}
                      </span>
                    )}
                    {inv.status === 'draft' && (
                      <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[11px] font-bold uppercase">
                        {t.status.draft}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedInvoiceId(inv.id);
                        setCurrentTab('invoices');
                      }}
                      className="p-1 text-slate-400 hover:text-blue-600 rounded cursor-pointer transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Payments & Clients Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Recent Payments Received */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-800">{t.dashboard.recentPayments}</h3>
            <button
              onClick={() => setCurrentTab('payments')}
              className="text-xs font-bold text-blue-600 hover:underline cursor-pointer"
            >
              {t.common.viewAll}
            </button>
          </div>

          <div className="space-y-3">
            {recentPayments.map((p) => (
              <div key={p.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-900">{p.clientName}</p>
                    <p className="text-[11px] text-slate-500">{p.invoiceNumber} • {p.method.replace('_', ' ')}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-bold font-mono text-emerald-600">+{formatCurrency(p.amount, currency)}</span>
                  <p className="text-[10px] text-slate-400">{formatDate(p.date)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Clients */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-800">{t.dashboard.recentClients}</h3>
            <button
              onClick={() => setCurrentTab('clients')}
              className="text-xs font-bold text-blue-600 hover:underline cursor-pointer"
            >
              {language === 'de' ? 'Kunden verwalten' : 'Manage Clients'}
            </button>
          </div>

          <div className="space-y-3">
            {recentClients.map((cli) => (
              <div
                key={cli.id}
                onClick={() => {
                  setSelectedClientId(cli.id);
                  setCurrentTab('client_detail');
                }}
                className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 border border-slate-100 text-xs cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-3">
                  {cli.avatarUrl ? (
                    <img
                      src={cli.avatarUrl}
                      alt={cli.name}
                      referrerPolicy="no-referrer"
                      className="w-8 h-8 rounded-full object-cover border border-slate-200"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center font-bold">
                      {cli.name.charAt(0)}
                    </div>
                  )}
                  <div>
                    <p className="font-bold text-slate-900">{cli.name}</p>
                    <p className="text-[11px] text-slate-500">{cli.companyName || cli.city}</p>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700 uppercase">
                  {cli.type}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
