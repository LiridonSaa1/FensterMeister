import React, { useState, useEffect } from 'react';
import {
  Plus,
  Trash2,
  MoveUp,
  MoveDown,
  Sparkles,
  Download,
  Printer,
  Send,
  Save,
  Eye,
  EyeOff,
  Palette,
  Layers,
  Building,
  UserPlus,
  DollarSign,
  Percent,
  Search,
  Check,
  RotateCcw,
  AppWindow,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import {
  Invoice,
  InvoiceItem,
  Client,
  Product,
  DiscountType,
  InvoiceTemplate,
  LogoPosition,
  TableStyle,
} from '../../types';
import { calculateInvoiceTotals, formatCurrency } from '../../utils/formatters';
import { InvoiceDocumentRenderer } from './InvoiceTemplates';
import { generatePdfFromElement, printElement } from '../../utils/pdfGenerator';
import { SendEmailModal } from '../email/SendEmailModal';
import { WindowSelectorModal } from '../windows/WindowSelectorModal';

interface InvoiceBuilderViewProps {
  editInvoiceId?: string | null;
}

export const InvoiceBuilderView: React.FC<InvoiceBuilderViewProps> = ({ editInvoiceId }) => {
  const {
    businessProfile,
    clients,
    products,
    invoices,
    createInvoice,
    updateInvoice,
    addClient,
    setCurrentTab,
    setSelectedInvoiceId,
    t,
    language,
  } = useApp();

  const existingInvoice = editInvoiceId ? invoices.find((i) => i.id === editInvoiceId) : null;

  // Selected Client
  const [selectedClientId, setSelectedClientId] = useState<string>(
    existingInvoice?.clientId || clients[0]?.id || ''
  );
  const [isNewClientModalOpen, setIsNewClientModalOpen] = useState(false);
  const [newClientName, setNewClientName] = useState('');
  const [newClientCompany, setNewClientCompany] = useState('');
  const [newClientEmail, setNewClientEmail] = useState('');
  const [newClientAddress, setNewClientAddress] = useState('');

  // Invoice Details
  const [invoicePrefix, setInvoicePrefix] = useState<string>(
    existingInvoice?.prefix || businessProfile.invoicePrefix || 'INV-2026-'
  );
  const [invoiceNumber, setInvoiceNumber] = useState<string>(
    existingInvoice?.number || `${businessProfile.nextInvoiceNumber || 1000}`
  );
  const [invoiceDate, setInvoiceDate] = useState<string>(
    existingInvoice?.date || new Date().toISOString().split('T')[0]
  );
  const [dueDate, setDueDate] = useState<string>(
    existingInvoice?.dueDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [currency, setCurrency] = useState<string>(
    existingInvoice?.currency || businessProfile.defaultCurrency || 'EUR'
  );
  const [paymentTerms, setPaymentTerms] = useState<string>(
    existingInvoice?.paymentTerms || businessProfile.paymentTerms || (language === 'de' ? 'Zahlbar innerhalb von 14 Tagen' : 'Net 30 Days')
  );

  // Items State
  const [items, setItems] = useState<InvoiceItem[]>(
    existingInvoice?.items || [
      {
        id: 'item-init-1',
        name: language === 'de' ? 'Softwareentwicklung & Beratung' : 'Enterprise Cloud Architecture Consultation',
        description: language === 'de' ? 'Strategische Konzeption und Implementierung.' : 'Multi-cloud strategy audit and containerized microservices topology.',
        quantity: 1,
        unit: language === 'de' ? 'Pauschal' : 'service',
        unitPrice: 1200,
        discount: 0,
        discountType: 'percentage',
        vatRate: businessProfile.defaultVatRate || 20,
        total: 1200,
        type: 'service',
      },
    ]
  );

  // Financial Extra Adjustments
  const [globalDiscount, setGlobalDiscount] = useState<number>(existingInvoice?.globalDiscount || 0);
  const [globalDiscountType, setGlobalDiscountType] = useState<DiscountType>(
    existingInvoice?.globalDiscountType || 'percentage'
  );
  const [shippingFee, setShippingFee] = useState<number>(existingInvoice?.shippingFee || 0);
  const [additionalCharges, setAdditionalCharges] = useState<number>(existingInvoice?.additionalCharges || 0);
  const [additionalChargesLabel, setAdditionalChargesLabel] = useState<string>(
    existingInvoice?.additionalChargesLabel || (language === 'de' ? 'Bearbeitungsgebühr' : 'Processing Fee')
  );

  // Custom Notes & Footers
  const [notes, setNotes] = useState<string>(
    existingInvoice?.notes || businessProfile.defaultInvoiceNotes
  );
  const [paymentInstructions, setPaymentInstructions] = useState<string>(
    existingInvoice?.paymentInstructions || businessProfile.defaultPaymentInstructions
  );
  const [termsAndConditions, setTermsAndConditions] = useState<string>(
    existingInvoice?.termsAndConditions || businessProfile.defaultTermsAndConditions
  );
  const [customFooter, setCustomFooter] = useState<string>(
    existingInvoice?.customFooter || businessProfile.defaultInvoiceFooter
  );
  const [customerMessage, setCustomerMessage] = useState<string>(
    existingInvoice?.customerMessage || ''
  );

  // Design Customization
  const [template, setTemplate] = useState<InvoiceTemplate>(
    existingInvoice?.template || businessProfile.invoiceTemplate || 'modern'
  );
  const [primaryColor, setPrimaryColor] = useState<string>(
    existingInvoice?.primaryColor || businessProfile.invoiceColors || '#2563eb'
  );
  const [font, setFont] = useState<string>(
    existingInvoice?.font || businessProfile.font || 'Plus Jakarta Sans'
  );
  const [tableStyle, setTableStyle] = useState<TableStyle>(
    existingInvoice?.tableStyle || businessProfile.tableStyle || 'clean'
  );
  const [logoPosition, setLogoPosition] = useState<LogoPosition>(
    existingInvoice?.logoPosition || businessProfile.logoPosition || 'left'
  );
  const [showSignature, setShowSignature] = useState<boolean>(
    existingInvoice?.showSignature ?? true
  );

  // UI view tabs
  const [activeTab, setActiveTab] = useState<'details' | 'design' | 'notes'>('details');
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [productSearchQuery, setProductSearchQuery] = useState('');
  const [isProductPickerOpen, setIsProductPickerOpen] = useState(false);
  const [isWindowModalOpen, setIsWindowModalOpen] = useState(false);

  // Current client snapshot
  const currentClient = clients.find((c) => c.id === selectedClientId) || clients[0] || {
    id: 'cli-temp',
    name: language === 'de' ? 'Standardkunde' : 'Walk-in Client',
    email: 'client@example.com',
    phone: '',
    address: 'Musterstraße 1',
    city: 'Berlin',
    country: 'Germany',
    type: 'business',
    createdAt: new Date().toISOString(),
  };

  // Recalculate totals reactively
  const totals = calculateInvoiceTotals(
    items,
    globalDiscount,
    globalDiscountType,
    shippingFee,
    additionalCharges
  );

  // Item modifications
  const handleItemChange = (index: number, field: keyof InvoiceItem, value: any) => {
    const updated = [...items];
    const item = { ...updated[index], [field]: value };

    // Recompute row total
    const base = (Number(item.quantity) || 0) * (Number(item.unitPrice) || 0);
    let disc = 0;
    if (item.discount > 0) {
      disc = item.discountType === 'percentage' ? base * (item.discount / 100) : item.discount;
    }
    item.total = Math.max(0, base - disc);
    updated[index] = item;
    setItems(updated);
  };

  const handleAddItem = (type: 'product' | 'service' | 'custom' = 'custom') => {
    const newItem: InvoiceItem = {
      id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      name: type === 'service' ? (language === 'de' ? 'Beratung & Dienstleistung' : 'Consulting & Engineering') : (language === 'de' ? 'Artikel / Position' : 'Hardware / Software Item'),
      description: language === 'de' ? 'Standardposition' : 'Standard unit deliverable.',
      quantity: 1,
      unit: type === 'service' ? (language === 'de' ? 'Std' : 'hours') : (language === 'de' ? 'Stk' : 'pcs'),
      unitPrice: 150,
      discount: 0,
      discountType: 'percentage',
      vatRate: businessProfile.defaultVatRate || 20,
      total: 150,
      type,
    };
    setItems([...items, newItem]);
  };

  const handleSelectProduct = (product: Product) => {
    const newItem: InvoiceItem = {
      id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      productId: product.id,
      name: product.name,
      description: product.description,
      sku: product.sku,
      image: product.image,
      quantity: 1,
      unit: product.unit || (language === 'de' ? 'Stk' : 'pcs'),
      unitPrice: product.sellingPrice,
      discount: product.discount || 0,
      discountType: 'percentage',
      vatRate: product.vatRate ?? businessProfile.defaultVatRate,
      total: product.sellingPrice * (1 - (product.discount || 0) / 100),
      type: product.type,
    };
    setItems([...items, newItem]);
    setIsProductPickerOpen(false);
  };

  const handleDeleteItem = (index: number) => {
    if (items.length <= 1) return;
    setItems(items.filter((_, idx) => idx !== index));
  };

  const handleMoveItem = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === items.length - 1) return;
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    const updated = [...items];
    const temp = updated[index];
    updated[index] = updated[targetIdx];
    updated[targetIdx] = temp;
    setItems(updated);
  };

  // Quick Client Creation
  const handleQuickAddClient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClientName) return;

    const created = addClient({
      name: newClientName,
      companyName: newClientCompany,
      email: newClientEmail || 'client@example.com',
      phone: '',
      address: newClientAddress || 'City Center',
      city: language === 'de' ? 'Berlin' : 'San Francisco',
      country: language === 'de' ? 'Deutschland' : 'United States',
      type: newClientCompany ? 'business' : 'individual',
    });

    setSelectedClientId(created.id);
    setIsNewClientModalOpen(false);
    setNewClientName('');
    setNewClientCompany('');
    setNewClientEmail('');
  };

  // Construct draft invoice object for real-time live preview
  const previewInvoiceObject: Invoice = {
    id: editInvoiceId || 'draft-preview',
    number: invoiceNumber,
    prefix: invoicePrefix,
    clientId: selectedClientId,
    clientSnapshot: currentClient,
    date: invoiceDate,
    dueDate,
    items,
    currency,
    paymentTerms,
    subtotal: totals.subtotal,
    globalDiscount,
    globalDiscountType,
    discountAmount: totals.totalDiscount,
    vatTotal: totals.vatTotal,
    shippingFee,
    additionalCharges,
    additionalChargesLabel,
    total: totals.grandTotal,
    amountPaid: existingInvoice?.amountPaid || 0,
    amountDue: Math.max(0, totals.grandTotal - (existingInvoice?.amountPaid || 0)),
    status: existingInvoice?.status || 'unpaid',
    notes,
    paymentInstructions,
    termsAndConditions,
    customFooter,
    customerMessage,
    template,
    primaryColor,
    font,
    logoPosition,
    tableStyle,
    showSignature,
    signatureImage: businessProfile.signature,
    createdAt: existingInvoice?.createdAt || new Date().toISOString(),
    payments: existingInvoice?.payments || [],
    history: existingInvoice?.history || [],
  };

  // Save invoice handler
  const handleSaveInvoice = (status: 'draft' | 'unpaid' = 'unpaid') => {
    if (editInvoiceId && existingInvoice) {
      updateInvoice(editInvoiceId, {
        number: invoiceNumber,
        prefix: invoicePrefix,
        clientId: selectedClientId,
        clientSnapshot: currentClient,
        date: invoiceDate,
        dueDate,
        items,
        currency,
        paymentTerms,
        subtotal: totals.subtotal,
        globalDiscount,
        globalDiscountType,
        discountAmount: totals.totalDiscount,
        vatTotal: totals.vatTotal,
        shippingFee,
        additionalCharges,
        additionalChargesLabel,
        total: totals.grandTotal,
        amountDue: Math.max(0, totals.grandTotal - (existingInvoice.amountPaid || 0)),
        status: status === 'draft' ? 'draft' : existingInvoice.status === 'draft' ? 'unpaid' : existingInvoice.status,
        notes,
        paymentInstructions,
        termsAndConditions,
        customFooter,
        customerMessage,
        template,
        primaryColor,
        font,
        logoPosition,
        tableStyle,
        showSignature,
      });
      setCurrentTab('invoices');
    } else {
      const created = createInvoice({
        number: invoiceNumber,
        prefix: invoicePrefix,
        clientId: selectedClientId,
        clientSnapshot: currentClient,
        date: invoiceDate,
        dueDate,
        items,
        currency,
        paymentTerms,
        subtotal: totals.subtotal,
        globalDiscount,
        globalDiscountType,
        discountAmount: totals.totalDiscount,
        vatTotal: totals.vatTotal,
        shippingFee,
        additionalCharges,
        additionalChargesLabel,
        total: totals.grandTotal,
        amountPaid: 0,
        amountDue: totals.grandTotal,
        status,
        notes,
        paymentInstructions,
        termsAndConditions,
        customFooter,
        customerMessage,
        template,
        primaryColor,
        font,
        logoPosition,
        tableStyle,
        showSignature,
        signatureImage: businessProfile.signature,
      });
      setSelectedInvoiceId(created.id);
      setCurrentTab('invoices');
    }
  };

  // PDF Export and Print
  const handleDownloadPdf = async () => {
    await generatePdfFromElement('invoice-printable-target', `Invoice_${invoicePrefix}${invoiceNumber}.pdf`, true);
  };

  const handlePrint = () => {
    printElement('invoice-printable-target');
  };

  const colorPresets = ['#2563eb', '#0d9488', '#7c3aed', '#e11d48', '#d97706', '#0f172a', '#059669'];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Top Action Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-blue-50 text-blue-700 border border-blue-200">
              {editInvoiceId ? (language === 'de' ? 'Rechnung bearbeiten' : 'Editing Invoice') : (language === 'de' ? 'Rechnungs-Editor' : 'New Invoice Builder')}
            </span>
            <span className="text-xs font-mono font-bold text-slate-700">
              #{invoicePrefix}{invoiceNumber}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {language === 'de' ? 'Live synchronisierter Rechnungsgenerator und Design-Editor' : 'Live synchronized invoice generator and design studio'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <button
            onClick={() => handleSaveInvoice('draft')}
            className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
          >
            {language === 'de' ? 'Entwurf speichern' : 'Save Draft'}
          </button>
          <button
            onClick={handleDownloadPdf}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>PDF</span>
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>{t.common.print}</span>
          </button>
          <button
            onClick={() => setIsEmailModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" />
            <span>{t.invoices.sendEmail}</span>
          </button>
          <button
            id="invoice-save-issue-btn"
            onClick={() => handleSaveInvoice('unpaid')}
            className="flex items-center gap-1.5 px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md transition-colors cursor-pointer"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{language === 'de' ? 'Rechnung speichern & ausstellen' : 'Save & Issue Invoice'}</span>
          </button>
        </div>
      </div>

      {/* Split Builder Grid: Left Controls (55%) + Right Live Preview (45%) */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: Controls & Item Configurator */}
        <div className="xl:col-span-6 space-y-6">
          {/* Sub Navigation Tabs */}
          <div className="flex border-b border-slate-200 bg-white p-1 rounded-xl border">
            <button
              onClick={() => setActiveTab('details')}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                activeTab === 'details' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {language === 'de' ? '1. Kunde & Positionen' : '1. Customer & Line Items'}
            </button>
            <button
              onClick={() => setActiveTab('design')}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                activeTab === 'design' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {language === 'de' ? '2. Vorlage & Design' : '2. Template & Styling'}
            </button>
            <button
              onClick={() => setActiveTab('notes')}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                activeTab === 'notes' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {language === 'de' ? '3. Notizen & Bankdaten' : '3. Notes & Banking'}
            </button>
          </div>

          {/* TAB 1: DETAILS */}
          {activeTab === 'details' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              {/* Client & Core Meta Card */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">{language === 'de' ? 'Kundeninformationen' : 'Client Information'}</h3>
                  <button
                    type="button"
                    onClick={() => setIsNewClientModalOpen(true)}
                    className="text-xs text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>{language === 'de' ? '+ Kunde schnell anlegen' : '+ Quick Add Client'}</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="sm:col-span-2">
                    <label className="block font-semibold text-slate-700 mb-1">{language === 'de' ? 'Kunde auswählen' : 'Select Client'}</label>
                    <select
                      id="invoice-client-select"
                      value={selectedClientId}
                      onChange={(e) => setSelectedClientId(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-none font-medium"
                    >
                      {clients.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name} {c.companyName ? `(${c.companyName})` : ''} - {c.email}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">{t.settings.invoicePrefix}</label>
                    <input
                      type="text"
                      value={invoicePrefix}
                      onChange={(e) => setInvoicePrefix(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">{t.invoices.invoiceNumber}</label>
                    <input
                      type="text"
                      value={invoiceNumber}
                      onChange={(e) => setInvoiceNumber(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 font-mono font-bold"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">{t.invoices.date}</label>
                    <input
                      type="date"
                      value={invoiceDate}
                      onChange={(e) => setInvoiceDate(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">{t.invoices.dueDate}</label>
                    <input
                      type="date"
                      value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">{t.settings.defaultCurrency}</label>
                    <select
                      value={currency}
                      onChange={(e) => setCurrency(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="EUR">EUR (€ - Euro)</option>
                      <option value="USD">USD ($ - US Dollar)</option>
                      <option value="CHF">CHF (Schweizer Franken)</option>
                      <option value="GBP">GBP (£ - British Pound)</option>
                      <option value="CAD">CAD ($ - Canadian Dollar)</option>
                      <option value="AUD">AUD ($ - Australian Dollar)</option>
                      <option value="JPY">JPY (¥ - Japanese Yen)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">{t.settings.paymentTerms}</label>
                    <input
                      type="text"
                      placeholder={language === 'de' ? 'z. B. Zahlbar in 14 Tagen netto' : 'e.g. Net 30 Days'}
                      value={paymentTerms}
                      onChange={(e) => setPaymentTerms(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Items Section */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">{t.invoices.items}</h3>
                    <p className="text-[11px] text-slate-400">{language === 'de' ? 'Artikel, Arbeitszeit oder Dienstleistungen verwalten' : 'Manage products, billable hours or custom charges'}</p>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Autocomplete Product Picker Button */}
                    <div className="relative">
                      <button
                        type="button"
                        id="invoice-btn-add-from-catalog"
                        onClick={() => setIsProductPickerOpen(!isProductPickerOpen)}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                      >
                        <Search className="w-3.5 h-3.5" />
                        <span>{language === 'de' ? 'Aus Katalog' : 'Add from Catalog'}</span>
                      </button>

                      {/* Product Picker Dropdown */}
                      {isProductPickerOpen && (
                        <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-slate-200 p-3 z-50 text-xs max-h-80 overflow-y-auto">
                          <div className="relative mb-2">
                            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                            <input
                              type="text"
                              placeholder={language === 'de' ? 'Artikel filtern...' : 'Filter products...'}
                              value={productSearchQuery}
                              onChange={(e) => setProductSearchQuery(e.target.value)}
                              className="w-full pl-8 pr-2 py-1 bg-slate-50 border border-slate-200 rounded text-xs focus:outline-none"
                            />
                          </div>

                          <div className="space-y-1">
                            {products
                              .filter((p) => p.name.toLowerCase().includes(productSearchQuery.toLowerCase()) || p.sku.toLowerCase().includes(productSearchQuery.toLowerCase()))
                              .map((p) => (
                                <button
                                  key={p.id}
                                  type="button"
                                  onClick={() => handleSelectProduct(p)}
                                  className="w-full text-left p-2 hover:bg-blue-50 rounded-lg flex items-center justify-between group cursor-pointer"
                                >
                                  <div>
                                    <p className="font-semibold text-slate-900 group-hover:text-blue-700">{p.name}</p>
                                    <p className="text-[10px] text-slate-400">{p.sku} • {p.unit}</p>
                                  </div>
                                  <span className="font-bold text-slate-800">{formatCurrency(p.sellingPrice, currency)}</span>
                                </button>
                              ))}
                          </div>
                        </div>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => setIsWindowModalOpen(true)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                    >
                      <AppWindow className="w-3.5 h-3.5" />
                      <span>{language === 'de' ? 'Fenster-Konfigurator' : 'House Window Types'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleAddItem('custom')}
                      className="flex items-center gap-1 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>{language === 'de' ? 'Eigene Position' : 'Custom Item'}</span>
                    </button>
                  </div>
                </div>

                {/* Items List */}
                <div className="space-y-3">
                  {items.map((item, idx) => (
                    <div
                      key={item.id || idx}
                      className="p-3.5 rounded-xl bg-slate-50/70 border border-slate-200/90 space-y-3 relative group text-xs hover:border-slate-300 transition-all"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 font-bold flex items-center justify-center text-[10px]">
                            {idx + 1}
                          </span>
                          <span className="font-semibold text-slate-700 uppercase tracking-wider text-[10px]">
                            {item.type}
                          </span>
                        </div>

                        {/* Reorder and Delete Controls */}
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            disabled={idx === 0}
                            onClick={() => handleMoveItem(idx, 'up')}
                            className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-200 disabled:opacity-30 cursor-pointer"
                            title="Move Up"
                          >
                            <MoveUp className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            disabled={idx === items.length - 1}
                            onClick={() => handleMoveItem(idx, 'down')}
                            className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-200 disabled:opacity-30 cursor-pointer"
                            title="Move Down"
                          >
                            <MoveDown className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteItem(idx)}
                            className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer ml-1"
                            title="Delete Item"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
                        <div className="sm:col-span-7">
                          <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">{language === 'de' ? 'Bezeichnung' : 'Item Name'}</label>
                          <input
                            type="text"
                            value={item.name}
                            onChange={(e) => handleItemChange(idx, 'name', e.target.value)}
                            placeholder={language === 'de' ? 'Dienstleistung oder Artikelbeschreibung' : 'Service or product description'}
                            className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-md font-medium text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
                          />
                        </div>

                        <div className="sm:col-span-2">
                          <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">{language === 'de' ? 'Menge' : 'Qty'}</label>
                          <input
                            type="number"
                            min="0.1"
                            step="any"
                            value={item.quantity}
                            onChange={(e) => handleItemChange(idx, 'quantity', parseFloat(e.target.value) || 0)}
                            className="w-full px-2 py-1.5 bg-white border border-slate-300 rounded-md text-center font-medium focus:outline-none"
                          />
                        </div>

                        <div className="sm:col-span-3">
                          <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">{language === 'de' ? 'Einzelpreis' : 'Unit Price'}</label>
                          <input
                            type="number"
                            step="any"
                            value={item.unitPrice}
                            onChange={(e) => handleItemChange(idx, 'unitPrice', parseFloat(e.target.value) || 0)}
                            className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-md text-right font-medium focus:outline-none font-mono"
                          />
                        </div>

                        <div className="sm:col-span-12">
                          <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">{language === 'de' ? 'Detailbeschreibung' : 'Detailed Description'}</label>
                          <textarea
                            rows={1}
                            value={item.description || ''}
                            onChange={(e) => handleItemChange(idx, 'description', e.target.value)}
                            placeholder={language === 'de' ? 'Optionale Details oder Spezifikationen' : 'Optional line item details or specifications'}
                            className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-md text-[11px] focus:outline-none"
                          />
                        </div>

                        <div className="sm:col-span-4">
                          <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">{language === 'de' ? 'Einheit' : 'Unit'}</label>
                          <input
                            type="text"
                            value={item.unit}
                            onChange={(e) => handleItemChange(idx, 'unit', e.target.value)}
                            placeholder={language === 'de' ? 'z. B. Std, Stk, Pauschal' : 'e.g. hours, pcs'}
                            className="w-full px-2.5 py-1 bg-white border border-slate-300 rounded-md text-xs focus:outline-none"
                          />
                        </div>

                        <div className="sm:col-span-4">
                          <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">{language === 'de' ? 'Rabatt' : 'Item Discount'}</label>
                          <div className="flex">
                            <input
                              type="number"
                              min="0"
                              value={item.discount}
                              onChange={(e) => handleItemChange(idx, 'discount', parseFloat(e.target.value) || 0)}
                              className="w-full px-2 py-1 bg-white border border-slate-300 rounded-l-md text-right text-xs focus:outline-none"
                            />
                            <select
                              value={item.discountType}
                              onChange={(e: any) => handleItemChange(idx, 'discountType', e.target.value)}
                              className="bg-slate-100 border-y border-r border-slate-300 rounded-r-md px-1 text-[11px]"
                            >
                              <option value="percentage">%</option>
                              <option value="fixed">{currency === 'EUR' ? '€' : '$'}</option>
                            </select>
                          </div>
                        </div>

                        <div className="sm:col-span-4">
                          <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">{t.settings.vatRate} %</label>
                          <input
                            type="number"
                            min="0"
                            value={item.vatRate}
                            onChange={(e) => handleItemChange(idx, 'vatRate', parseFloat(e.target.value) || 0)}
                            className="w-full px-2 py-1 bg-white border border-slate-300 rounded-md text-right text-xs focus:outline-none"
                          />
                        </div>
                      </div>

                      <div className="flex justify-end pt-1 border-t border-slate-200/60 font-semibold text-slate-800 text-xs">
                        <span>{language === 'de' ? 'Gesamtpreis Position' : 'Line Total'}: <strong className="font-mono text-slate-900">{formatCurrency(item.total, currency)}</strong></span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Additional Adjustments: Global discount, shipping, extra fee */}
                <div className="pt-4 border-t border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">{language === 'de' ? 'Gesamtrabatt' : 'Global Discount'}</label>
                    <div className="flex">
                      <input
                        type="number"
                        min="0"
                        value={globalDiscount}
                        onChange={(e) => setGlobalDiscount(parseFloat(e.target.value) || 0)}
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-l-lg text-right font-medium"
                      />
                      <select
                        value={globalDiscountType}
                        onChange={(e: any) => setGlobalDiscountType(e.target.value)}
                        className="bg-slate-100 border-y border-r border-slate-300 rounded-r-lg px-2 text-xs font-semibold"
                      >
                        <option value="percentage">%</option>
                        <option value="fixed">{currency === 'EUR' ? '€' : '$'}</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">{language === 'de' ? 'Versand- / Lieferkosten' : 'Shipping & Handling'}</label>
                    <input
                      type="number"
                      min="0"
                      value={shippingFee}
                      onChange={(e) => setShippingFee(parseFloat(e.target.value) || 0)}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-right font-medium font-mono"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">{language === 'de' ? 'Zusatzgebühr' : 'Additional Fee'}</label>
                    <input
                      type="number"
                      min="0"
                      value={additionalCharges}
                      onChange={(e) => setAdditionalCharges(parseFloat(e.target.value) || 0)}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-right font-medium font-mono"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: TEMPLATE & STYLING */}
          {activeTab === 'design' && (
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-6 animate-in fade-in duration-150 text-xs">
              <div>
                <label className="block font-bold text-slate-800 mb-2">{language === 'de' ? '1. Rechnungsvorlage wählen' : '1. Choose Invoice Template'}</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {[
                    { id: 'modern', name: language === 'de' ? 'Modern' : 'Modern', desc: language === 'de' ? 'Klare Farbakzente & abgerundete Karten' : 'Sleek colored accent & rounded cards' },
                    { id: 'minimal', name: language === 'de' ? 'Minimal' : 'Minimal', desc: language === 'de' ? 'Schweizer Monochromie mit starkem Kontrast' : 'Swiss monochrome high contrast' },
                    { id: 'professional', name: language === 'de' ? 'Professionell' : 'Professional', desc: language === 'de' ? 'Klassische Unternehmenstabelle' : 'Classic enterprise corporate table' },
                    { id: 'corporate', name: language === 'de' ? 'Corporate' : 'Corporate', desc: language === 'de' ? 'Vollflächiges Header-Branding' : 'Full-width header branding banner' },
                    { id: 'elegant', name: language === 'de' ? 'Elegant' : 'Elegant', desc: language === 'de' ? 'Luxuriöse Serif-Typografie' : 'Sophisticated luxury serif typography' },
                  ].map((tpl) => (
                    <button
                      type="button"
                      key={tpl.id}
                      onClick={() => setTemplate(tpl.id as InvoiceTemplate)}
                      className={`p-3 rounded-xl text-left border-2 transition-all cursor-pointer ${
                        template === tpl.id
                          ? 'border-blue-600 bg-blue-50/50 shadow-xs'
                          : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      <p className="font-bold text-slate-900">{tpl.name}</p>
                      <p className="text-[10px] text-slate-500 mt-0.5 leading-tight">{tpl.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-2">{language === 'de' ? '2. Primäre Akzentfarbe' : '2. Primary Accent Color'}</label>
                <div className="flex items-center gap-3">
                  {colorPresets.map((c) => (
                    <button
                      type="button"
                      key={c}
                      onClick={() => setPrimaryColor(c)}
                      className="w-8 h-8 rounded-full transition-transform hover:scale-110 flex items-center justify-center cursor-pointer shadow-xs"
                      style={{ backgroundColor: c }}
                    >
                      {primaryColor === c && <Check className="w-4 h-4 text-white" />}
                    </button>
                  ))}
                  <input
                    type="color"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="w-9 h-9 rounded-lg border border-slate-300 p-0.5 cursor-pointer"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-800 mb-1">{t.settings.fontFamily}</label>
                  <select
                    value={font}
                    onChange={(e) => setFont(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 font-medium"
                  >
                    <option value="Plus Jakarta Sans">Plus Jakarta Sans (Modern Clean)</option>
                    <option value="Outfit">Outfit (Geometric Contemporary)</option>
                    <option value="Inter">Inter (System Neutral)</option>
                    <option value="Playfair Display">Playfair Display (Luxury Editorial)</option>
                    <option value="Cinzel">Cinzel (Classical Elegant)</option>
                    <option value="IBM Plex Mono">IBM Plex Mono (Technical)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-1">{language === 'de' ? 'Tabellen-Design' : 'Table Border Style'}</label>
                  <select
                    value={tableStyle}
                    onChange={(e: any) => setTableStyle(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 font-medium"
                  >
                    <option value="clean">{language === 'de' ? 'Klar (Nur Trennlinien)' : 'Clean (Dividers only)'}</option>
                    <option value="striped">{language === 'de' ? 'Gestreift (Zebra-Zeilen)' : 'Striped (Zebra rows)'}</option>
                    <option value="bordered">{language === 'de' ? 'Umrahmt (Gittermuster)' : 'Bordered (Grid outline)'}</option>
                    <option value="minimal">{language === 'de' ? 'Minimal' : 'Minimal (Undecorated)'}</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-1">{t.settings.logoPosition}</label>
                  <select
                    value={logoPosition}
                    onChange={(e: any) => setLogoPosition(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 font-medium"
                  >
                    <option value="left">{language === 'de' ? 'Links ausgerichtet' : 'Left-aligned'}</option>
                    <option value="right">{language === 'de' ? 'Rechts ausgerichtet' : 'Right-aligned'}</option>
                    <option value="center">{language === 'de' ? 'Zentriert' : 'Centered'}</option>
                  </select>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <div>
                    <p className="font-bold text-slate-800">{language === 'de' ? 'Unterschrift anzeigen' : 'Show Authorized Signature'}</p>
                    <p className="text-[10px] text-slate-500">{language === 'de' ? 'Signaturblock in der Fußzeile darstellen' : 'Render signature block at footer'}</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={showSignature}
                    onChange={(e) => setShowSignature(e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded cursor-pointer"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: NOTES & BANKING */}
          {activeTab === 'notes' && (
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4 animate-in fade-in duration-150 text-xs">
              <div>
                <label className="block font-bold text-slate-800 mb-1">{t.settings.defaultNotes}</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder={language === 'de' ? 'Vielen Dank für Ihren Auftrag...' : 'Thank you for your business...'}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">{t.settings.defaultPaymentInstructions}</label>
                <textarea
                  rows={2}
                  value={paymentInstructions}
                  onChange={(e) => setPaymentInstructions(e.target.value)}
                  placeholder={language === 'de' ? 'Bankname, IBAN, BIC oder Zahlungshinweise...' : 'Bank name, IBAN, SWIFT or payment gateway instructions...'}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 font-mono text-[11px]"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">{t.settings.defaultTerms}</label>
                <textarea
                  rows={2}
                  value={termsAndConditions}
                  onChange={(e) => setTermsAndConditions(e.target.value)}
                  placeholder={language === 'de' ? 'Zahlungsfristen, Gewährleistung, Verzugszinsen...' : 'Payment due dates, warranty terms, interest rates on overdue balances...'}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">{t.settings.defaultFooter}</label>
                <input
                  type="text"
                  value={customFooter}
                  onChange={(e) => setCustomFooter(e.target.value)}
                  placeholder={language === 'de' ? 'Handelsregisternummer • info@unternehmen.de • USt-IdNr.' : 'Company Registration Number • info@company.com'}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: Live Real-Time Invoice Preview */}
        <div className="xl:col-span-6 sticky top-20">
          <div className="bg-slate-100/90 rounded-2xl p-4 border border-slate-200/80 shadow-inner">
            <div className="flex items-center justify-between mb-3 px-2">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">{language === 'de' ? 'Live Dokument-Vorschau' : 'Live Document Preview'}</span>
              </div>
              <span className="text-[11px] text-slate-500 font-medium capitalize">
                {language === 'de' ? 'Vorlage' : 'Template'}: <strong className="text-slate-800">{template}</strong>
              </span>
            </div>

            {/* Rendered Live Template */}
            <div className="overflow-x-auto max-h-[750px] overflow-y-auto rounded-xl shadow-lg border border-slate-300/60 bg-white">
              <InvoiceDocumentRenderer
                invoice={previewInvoiceObject}
                businessProfile={businessProfile}
                previewMode={true}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Add Client Modal */}
      {isNewClientModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md p-6 space-y-4 text-xs animate-in zoom-in-95 duration-150">
            <h3 className="text-base font-bold text-slate-900">{language === 'de' ? 'Kunde schnell anlegen' : 'Quick Add Client'}</h3>
            <form onSubmit={handleQuickAddClient} className="space-y-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">{language === 'de' ? 'Kontaktname *' : 'Contact Name *'}</label>
                <input
                  type="text"
                  required
                  value={newClientName}
                  onChange={(e) => setNewClientName(e.target.value)}
                  placeholder={language === 'de' ? 'z. B. Max Mustermann' : 'e.g. John Doe'}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">{language === 'de' ? 'Firmenname' : 'Company Name'}</label>
                <input
                  type="text"
                  value={newClientCompany}
                  onChange={(e) => setNewClientCompany(e.target.value)}
                  placeholder={language === 'de' ? 'z. B. Muster GmbH' : 'e.g. Acme Corp LLC'}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">{t.clients.email} *</label>
                <input
                  type="email"
                  required
                  value={newClientEmail}
                  onChange={(e) => setNewClientEmail(e.target.value)}
                  placeholder="kontakt@musterfirma.de"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">{t.clients.address}</label>
                <input
                  type="text"
                  value={newClientAddress}
                  onChange={(e) => setNewClientAddress(e.target.value)}
                  placeholder={language === 'de' ? 'Hauptstraße 10, 10115 Berlin' : '100 Mission St, San Francisco'}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsNewClientModalOpen(false)}
                  className="px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                >
                  {t.common.cancel}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs cursor-pointer"
                >
                  {language === 'de' ? 'Erstellen & Auswählen' : 'Create & Select'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Window Selector Modal */}
      {isWindowModalOpen && (
        <WindowSelectorModal
          isOpen={isWindowModalOpen}
          onClose={() => setIsWindowModalOpen(false)}
          onSelectItem={(windowItem) => setItems([...items, windowItem])}
          currency={currency}
          defaultVatRate={businessProfile.defaultVatRate || 20}
        />
      )}

      {/* Send Email Modal */}
      {isEmailModalOpen && (
        <SendEmailModal
          invoice={previewInvoiceObject}
          isOpen={isEmailModalOpen}
          onClose={() => setIsEmailModalOpen(false)}
        />
      )}
    </div>
  );
};
