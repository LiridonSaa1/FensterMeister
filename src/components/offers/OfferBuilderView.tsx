import React, { useState } from 'react';
import {
  Plus,
  Trash2,
  MoveUp,
  MoveDown,
  Save,
  Eye,
  Building,
  UserPlus,
  DollarSign,
  Search,
  AppWindow,
  ArrowRight,
  Layers,
  Download,
  Printer,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useApp } from '../../context/AppContext';
import {
  Offer,
  InvoiceItem,
  Product,
  DiscountType,
  InvoiceTemplate,
  Invoice,
  LogoPosition,
  TableStyle,
} from '../../types';
import { calculateInvoiceTotals, formatCurrency, getLineItemImage } from '../../utils/formatters';
import { generatePdfFromElement, printElement } from '../../utils/pdfGenerator';
import { InvoiceDocumentRenderer } from '../invoices/InvoiceTemplates';
import { WindowSelectorModal } from '../windows/WindowSelectorModal';
import { WindowItemImage } from '../windows/WindowSvgIcons';

interface OfferBuilderViewProps {
  editOfferId?: string | null;
}

export const OfferBuilderView: React.FC<OfferBuilderViewProps> = ({ editOfferId }) => {
  const {
    businessProfile,
    clients,
    products,
    offers,
    createOffer,
    updateOffer,
    convertOfferToInvoice,
    addClient,
    setCurrentTab,
    setSelectedInvoiceId,
    t,
    language,
  } = useApp();

  const existingOffer = editOfferId ? offers.find((o) => o.id === editOfferId) : null;

  // Selected Client
  const [selectedClientId, setSelectedClientId] = useState<string>(
    existingOffer?.clientId || clients[0]?.id || ''
  );
  const [isNewClientModalOpen, setIsNewClientModalOpen] = useState(false);
  const [newClientName, setNewClientName] = useState('');
  const [newClientCompany, setNewClientCompany] = useState('');
  const [newClientEmail, setNewClientEmail] = useState('');
  const [newClientAddress, setNewClientAddress] = useState('');

  // Offer Details
  const [offerNumber, setOfferNumber] = useState<string>(
    existingOffer?.number || `10${offers.length + 1}`
  );
  const [offerDate, setOfferDate] = useState<string>(
    existingOffer?.date || new Date().toISOString().split('T')[0]
  );
  const [expiryDate, setExpiryDate] = useState<string>(
    existingOffer?.expiryDate || new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [currency, setCurrency] = useState<string>(
    existingOffer?.currency || businessProfile.defaultCurrency || 'EUR'
  );

  // Items State
  const [items, setItems] = useState<InvoiceItem[]>(
    existingOffer?.items || [
      {
        id: 'off-item-init-1',
        name: language === 'de' ? 'Fenster- und Türmontage Service' : 'Window Installation & Fitting Service',
        description: language === 'de' ? 'Fachgerechter Einbau nach RAL-Montagestandard inkl. Abdichtung.' : 'Professional window installation and thermal sealing.',
        quantity: 1,
        unit: language === 'de' ? 'Pauschal' : 'service',
        unitPrice: 120,
        discount: 0,
        discountType: 'percentage',
        vatRate: businessProfile.defaultVatRate || 20,
        total: 120,
        type: 'service',
      },
    ]
  );

  // Financial Extra Adjustments
  const [globalDiscount, setGlobalDiscount] = useState<number>(existingOffer?.discount || 0);
  const [globalDiscountType, setGlobalDiscountType] = useState<DiscountType>(
    existingOffer?.discountType || 'percentage'
  );
  const [shippingFee, setShippingFee] = useState<number>(existingOffer?.shippingFee || 0);

  // Custom Notes & Footers
  const [notes, setNotes] = useState<string>(
    existingOffer?.notes || (language === 'de'
      ? 'Dieses verbindliche Angebot ist 14 Kalendertage ab Ausstellungsdatum gültig.'
      : 'This formal offer is valid for 14 calendar days from issue date.')
  );
  const [termsAndConditions, setTermsAndConditions] = useState<string>(
    existingOffer?.termsAndConditions || (language === 'de'
      ? '50% Anzahlung bei Auftragserteilung, 50% nach Fertigstellung und Abnahme.'
      : '50% upfront deposit upon contract signing, 50% upon final acceptance.')
  );

  // Design Customization (inherited from businessProfile Settings or existing offer)
  const [template, setTemplate] = useState<InvoiceTemplate>(
    existingOffer?.template || businessProfile.invoiceTemplate || 'modern'
  );
  const [primaryColor, setPrimaryColor] = useState<string>(
    existingOffer?.primaryColor || businessProfile.invoiceColors || '#2563eb'
  );
  const [font, setFont] = useState<string>(
    existingOffer?.font || businessProfile.font || 'Plus Jakarta Sans'
  );
  const [logoPosition, setLogoPosition] = useState<LogoPosition>(
    existingOffer?.logoPosition || businessProfile.logoPosition || 'left'
  );
  const [tableStyle, setTableStyle] = useState<TableStyle>(
    existingOffer?.tableStyle || businessProfile.tableStyle || 'clean'
  );

  // UI view tabs
  const [activeTab, setActiveTab] = useState<'details' | 'notes'>('details');
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
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
    0
  );

  // Item modifications
  const handleItemChange = (index: number, field: keyof InvoiceItem, value: any) => {
    const updated = [...items];
    const item = { ...updated[index], [field]: value };

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
      id: `off-item-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      name: type === 'service' ? (language === 'de' ? 'Montage & Service' : 'Installation & Service') : (language === 'de' ? 'Fenster-Bauteil' : 'Window Element'),
      description: language === 'de' ? 'Spezifikationsposition' : 'Specification line item.',
      quantity: 1,
      unit: type === 'service' ? (language === 'de' ? 'Pauschal' : 'service') : (language === 'de' ? 'Stk' : 'pcs'),
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
      id: `off-item-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
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

  const handleQuickAddClient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClientName) return;

    const created = addClient({
      name: newClientName,
      companyName: newClientCompany,
      email: newClientEmail || 'client@example.com',
      phone: '',
      address: newClientAddress || 'City Center',
      city: language === 'de' ? 'Berlin' : 'Berlin',
      country: language === 'de' ? 'Deutschland' : 'Germany',
      type: newClientCompany ? 'business' : 'individual',
    });

    setSelectedClientId(created.id);
    setIsNewClientModalOpen(false);
    setNewClientName('');
    setNewClientCompany('');
    setNewClientEmail('');
  };

  // Build temporary Offer object for InvoiceDocumentRenderer preview & PDF download
  const previewOfferObject: Offer = {
    id: editOfferId || 'offer-preview',
    number: offerNumber,
    clientId: selectedClientId,
    clientSnapshot: currentClient,
    date: offerDate,
    expiryDate,
    items,
    currency,
    subtotal: totals.subtotal,
    discount: globalDiscount,
    discountType: globalDiscountType,
    discountAmount: totals.totalDiscount,
    vatTotal: totals.vatTotal,
    shippingFee,
    total: totals.grandTotal,
    status: existingOffer?.status || 'draft',
    notes,
    terms: termsAndConditions,
    termsAndConditions,
    template: template || businessProfile.invoiceTemplate || 'modern',
    primaryColor: primaryColor || businessProfile.invoiceColors || '#2563eb',
    font: font || businessProfile.font || 'Plus Jakarta Sans',
    logoPosition: logoPosition || businessProfile.logoPosition || 'left',
    tableStyle: tableStyle || businessProfile.tableStyle || 'clean',
    createdAt: existingOffer?.createdAt || new Date().toISOString(),
  };

  // Save offer handler
  const handleSaveOffer = (status: 'draft' | 'sent' = 'draft') => {
    const offerPayload: Omit<Offer, 'id' | 'createdAt'> = {
      number: offerNumber,
      clientId: selectedClientId,
      clientSnapshot: currentClient,
      date: offerDate,
      expiryDate,
      items,
      currency,
      subtotal: totals.subtotal,
      discount: globalDiscount,
      discountType: globalDiscountType,
      discountAmount: totals.totalDiscount,
      vatTotal: totals.vatTotal,
      shippingFee,
      total: totals.grandTotal,
      status: status === 'draft' ? 'draft' : 'sent',
      notes,
      terms: termsAndConditions,
      termsAndConditions,
      template,
      primaryColor,
      font,
      logoPosition,
      tableStyle,
    };

    if (editOfferId && existingOffer) {
      updateOffer(editOfferId, offerPayload);
    } else {
      createOffer(offerPayload);
    }

    setCurrentTab('offers');
  };

  const handleConvertToInvoiceClick = () => {
    if (!editOfferId) return;
    const newInvoice = convertOfferToInvoice(editOfferId);
    if (newInvoice) {
      try {
        confetti({ particleCount: 90, spread: 80, origin: { y: 0.6 } });
      } catch (e) {}
      setSelectedInvoiceId(newInvoice.id);
      setCurrentTab('invoice_create');
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-24">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-200">
              {language === 'de' ? 'Angebot-Konfigurator' : 'Offer Builder'}
            </span>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              {editOfferId ? `${language === 'de' ? 'Angebot' : 'Offer'} #${offerNumber}` : (language === 'de' ? 'Neues Angebot erstellen' : 'Create New Offer')}
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {language === 'de' ? 'Erstellen Sie ein verbindliches Fensterangebot mit 1-zu-1 Übernahme in Rechnungen' : 'Create architectural window offers with 1-to-1 conversion into active invoices'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          {editOfferId && (
            <button
              onClick={handleConvertToInvoiceClick}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer"
            >
              <ArrowRight className="w-4 h-4" />
              <span>{t.offers.convertToInvoice}</span>
            </button>
          )}

          <button
            onClick={() => setIsPreviewModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-all cursor-pointer"
          >
            <Eye className="w-4 h-4" />
            <span>{language === 'de' ? 'Vorschau PDF' : 'Live PDF'}</span>
          </button>

          <button
            onClick={() => handleSaveOffer('draft')}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>{language === 'de' ? 'Angebot speichern' : 'Save Offer'}</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Builder Controls (Left 7 Cols) & Live Preview / Summary (Right 5 Cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Form & Line Items */}
        <div className="lg:col-span-7 space-y-6">
          {/* Navigation Sub-Tabs */}
          <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
            {[
              { id: 'details', label: language === 'de' ? '1. Details & Positionen' : '1. Offer Items & Client' },
              { id: 'notes', label: language === 'de' ? '2. Bedingungen & Notizen' : '2. Notes & Conditions' },
            ].map((tb) => (
              <button
                key={tb.id}
                onClick={() => setActiveTab(tb.id as any)}
                className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                  activeTab === tb.id
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                {tb.label}
              </button>
            ))}
          </div>

          {activeTab === 'details' && (
            <>
              {/* Client & Metadata Card */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
                <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                  <span className="text-xs font-bold text-slate-900 flex items-center gap-2">
                    <Building className="w-4 h-4 text-blue-600" />
                    {t.offers.client}
                  </span>
                  <button
                    onClick={() => setIsNewClientModalOpen(true)}
                    className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>{language === 'de' ? 'Neuer Kunde' : 'New Client'}</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="sm:col-span-2">
                    <label className="block font-semibold text-slate-700 mb-1">{t.offers.client} *</label>
                    <select
                      value={selectedClientId}
                      onChange={(e) => setSelectedClientId(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    >
                      {clients.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name} {c.companyName ? `(${c.companyName})` : ''} - {c.email}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">{t.offers.offerNumber}</label>
                    <input
                      type="text"
                      value={offerNumber}
                      onChange={(e) => setOfferNumber(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">{t.offers.offerDate}</label>
                    <input
                      type="date"
                      value={offerDate}
                      onChange={(e) => setOfferDate(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">{t.offers.validUntil}</label>
                    <input
                      type="date"
                      value={expiryDate}
                      onChange={(e) => setExpiryDate(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">{language === 'de' ? 'Währung' : 'Currency'}</label>
                    <select
                      value={currency}
                      onChange={(e) => setCurrency(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold font-mono"
                    >
                      <option value="EUR">EUR (€)</option>
                      <option value="USD">USD ($)</option>
                      <option value="GBP">GBP (£)</option>
                      <option value="CHF">CHF (Fr.)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Line Items Card */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pb-3 border-b border-slate-100">
                  <span className="text-xs font-bold text-slate-900 flex items-center gap-2">
                    <Layers className="w-4 h-4 text-blue-600" />
                    {t.offers.scopeOfWork} ({items.length})
                  </span>

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      onClick={() => setIsWindowModalOpen(true)}
                      className="px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 text-xs font-bold rounded-lg transition-all flex items-center gap-1 cursor-pointer"
                    >
                      <AppWindow className="w-3.5 h-3.5" />
                      <span>{t.offers.addWindowPreset}</span>
                    </button>

                    <button
                      onClick={() => setIsProductPickerOpen(true)}
                      className="px-3 py-1.5 bg-slate-100 text-slate-800 hover:bg-slate-200 text-xs font-bold rounded-lg transition-all flex items-center gap-1 cursor-pointer"
                    >
                      <Search className="w-3.5 h-3.5" />
                      <span>{language === 'de' ? '+ Katalogprodukt' : '+ Catalog Item'}</span>
                    </button>
                  </div>
                </div>

                {/* Items Table */}
                <div className="space-y-3">
                  {items.map((item, index) => (
                    <div
                      key={item.id || index}
                        className="p-3.5 bg-slate-50/70 border border-slate-200/80 rounded-xl space-y-3 hover:bg-white transition-all shadow-2xs"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-3 flex-1">
                            <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 font-mono text-[10px] font-bold flex items-center justify-center shrink-0">
                              {index + 1}
                            </span>

                            {/* Product Image Thumbnail */}
                            <WindowItemImage item={item} className="w-10 h-10 rounded-lg shrink-0 shadow-2xs" />

                            <div className="flex-1">
                              {/* Product Select Dropdown */}
                              <select
                                value={item.productId || products.find((p) => p.name.toLowerCase() === item.name.toLowerCase())?.id || ''}
                                onChange={(e) => {
                                  const selectedId = e.target.value;
                                  if (!selectedId) return;
                                  const foundProduct = products.find((p) => p.id === selectedId);
                                  if (foundProduct) {
                                    const qty = Number(item.quantity) || 1;
                                    const base = qty * (Number(foundProduct.sellingPrice) || 0);
                                    let disc = 0;
                                    if (foundProduct.discount && foundProduct.discount > 0) {
                                      disc = base * (foundProduct.discount / 100);
                                    }
                                    const updated = [...items];
                                    updated[index] = {
                                      ...item,
                                      productId: foundProduct.id,
                                      name: foundProduct.name,
                                      description: foundProduct.description || item.description,
                                      unitPrice: foundProduct.sellingPrice,
                                      vatRate: foundProduct.vatRate ?? businessProfile.defaultVatRate ?? 20,
                                      unit: foundProduct.unit || item.unit,
                                      image: foundProduct.image || item.image,
                                      type: foundProduct.type || item.type,
                                      total: Math.max(0, base - disc),
                                    };
                                    setItems(updated);
                                  }
                                }}
                                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:ring-2 focus:ring-blue-500/20 cursor-pointer shadow-2xs"
                              >
                                <option value="">
                                  {item.name ? item.name : (language === 'de' ? '📦 Produkt wählen...' : '📦 Select Product...')}
                                </option>
                                {products.map((p) => (
                                  <option key={p.id} value={p.id}>
                                    {p.name} ({formatCurrency(p.sellingPrice, currency)})
                                  </option>
                                ))}
                              </select>
                            </div>
                          </div>

                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              type="button"
                              onClick={() => handleMoveItem(index, 'up')}
                              disabled={index === 0}
                              className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-30 cursor-pointer"
                            >
                              <MoveUp className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleMoveItem(index, 'down')}
                              disabled={index === items.length - 1}
                              className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-30 cursor-pointer"
                            >
                              <MoveDown className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteItem(index)}
                              disabled={items.length <= 1}
                              className="p-1 text-red-500 hover:text-red-700 disabled:opacity-30 cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                        <div>
                          <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">{language === 'de' ? 'Menge' : 'Qty'}</label>
                          <input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => handleItemChange(index, 'quantity', parseFloat(e.target.value) || 1)}
                            className="w-full px-2.5 py-1 bg-white border border-slate-300 rounded-lg font-mono font-bold"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">{language === 'de' ? 'Einzelpreis (Netto)' : 'Unit Price'}</label>
                          <input
                            type="number"
                            step="0.01"
                            value={item.unitPrice}
                            onChange={(e) => handleItemChange(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                            className="w-full px-2.5 py-1 bg-white border border-slate-300 rounded-lg font-mono font-bold"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">{language === 'de' ? 'MwSt %' : 'VAT %'}</label>
                          <select
                            value={item.vatRate ?? 20}
                            onChange={(e) => handleItemChange(index, 'vatRate', parseFloat(e.target.value) || 0)}
                            className="w-full px-2 py-1 bg-white border border-slate-300 rounded-lg text-xs"
                          >
                            <option value={0}>0%</option>
                            <option value={19}>19%</option>
                            <option value={20}>20%</option>
                            <option value={7}>7%</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">{language === 'de' ? 'Gesamt Zeile' : 'Row Total'}</label>
                          <div className="px-2.5 py-1 bg-slate-100 border border-slate-200 rounded-lg font-mono font-bold text-slate-900">
                            {formatCurrency(item.total, currency)}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => handleAddItem('custom')}
                  className="w-full py-2 border-2 border-dashed border-slate-200 hover:border-blue-400 hover:bg-blue-50/40 text-blue-600 font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>{t.offers.addLineItem}</span>
                </button>
              </div>
            </>
          )}

          {activeTab === 'notes' && (
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">{t.common.notes}</label>
                <textarea
                  rows={4}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder={language === 'de' ? 'Besondere Hinweise für den Kunden...' : 'Notes for customer...'}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">{language === 'de' ? 'Zahlungs- & Lieferbedingungen' : 'Terms & Conditions'}</label>
                <textarea
                  rows={4}
                  value={termsAndConditions}
                  onChange={(e) => setTermsAndConditions(e.target.value)}
                  placeholder={language === 'de' ? 'Gültigkeit, Lieferfristen...' : 'Validity, delivery terms...'}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                />
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Real-Time Summary Card */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-5 sticky top-6">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-3 flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-emerald-600" />
              {language === 'de' ? 'Zusammenfassung Angebot' : 'Offer Financial Summary'}
            </h3>

            <div className="space-y-3 font-mono text-xs">
              <div className="flex justify-between text-slate-600">
                <span>{language === 'de' ? 'Zwischensumme (Netto):' : 'Subtotal (Net):'}</span>
                <span className="font-semibold">{formatCurrency(totals.subtotal, currency)}</span>
              </div>

              <div className="flex justify-between text-slate-600">
                <span>{language === 'de' ? 'Gesamte MwSt.:' : 'Total VAT:'}</span>
                <span className="font-semibold text-amber-700">+{formatCurrency(totals.vatTotal, currency)}</span>
              </div>

              <div className="flex justify-between text-slate-900 font-bold text-base pt-3 border-t border-slate-200">
                <span>{t.offers.totalEstimated}:</span>
                <span className="text-blue-600">{formatCurrency(totals.grandTotal, currency)}</span>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 space-y-2">
              <button
                onClick={() => handleSaveOffer('draft')}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer"
              >
                {language === 'de' ? 'Angebot speichern' : 'Save Offer'}
              </button>

              {editOfferId && (
                <button
                  onClick={handleConvertToInvoiceClick}
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <ArrowRight className="w-4 h-4" />
                  <span>{t.offers.convertToInvoice}</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Catalog Product Picker Modal */}
      {isProductPickerOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-5 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-sm">{language === 'de' ? 'Produkt aus Katalog wählen' : 'Select Product from Catalog'}</h3>
              <button onClick={() => setIsProductPickerOpen(false)} className="text-slate-400 hover:text-slate-600 text-xs">✕</button>
            </div>

            <input
              type="text"
              placeholder={language === 'de' ? 'Fenster oder Service suchen...' : 'Search windows or services...'}
              value={productSearchQuery}
              onChange={(e) => setProductSearchQuery(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs"
            />

            <div className="max-h-64 overflow-y-auto divide-y divide-slate-100">
              {products
                .filter((p) => p.name.toLowerCase().includes(productSearchQuery.toLowerCase()))
                .map((p) => (
                  <button
                    key={p.id}
                    onClick={() => handleSelectProduct(p)}
                    className="w-full p-2.5 text-left hover:bg-slate-50 transition-colors flex justify-between items-center cursor-pointer"
                  >
                    <div>
                      <p className="font-bold text-xs text-slate-900">{p.name}</p>
                      <p className="text-[10px] text-slate-500">{p.category} • {p.unit}</p>
                    </div>
                    <span className="font-mono font-bold text-xs text-blue-600">{formatCurrency(p.sellingPrice, currency)}</span>
                  </button>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* Architectural Window Specs Modal */}
      {isWindowModalOpen && (
        <WindowSelectorModal
          isOpen={isWindowModalOpen}
          onClose={() => setIsWindowModalOpen(false)}
          onSelectItem={(windowItem) => {
            setItems([...items, windowItem]);
            setIsWindowModalOpen(false);
          }}
          currency={currency}
          defaultVatRate={businessProfile.defaultVatRate || 20}
        />
      )}

      {/* Live PDF Modal */}
      {isPreviewModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="p-4 bg-slate-900 text-white flex justify-between items-center">
              <span className="font-bold text-xs">{language === 'de' ? 'Vorschau Angebot PDF' : 'Offer PDF Live Document'}</span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => generatePdfFromElement('offer-pdf-element', `Offer_${offerNumber}.pdf`)}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>{language === 'de' ? 'PDF Herunterladen' : 'Download PDF'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => printElement('offer-pdf-element')}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>{language === 'de' ? 'Drucken' : 'Print'}</span>
                </button>
                <button onClick={() => setIsPreviewModalOpen(false)} className="text-slate-400 hover:text-white text-xs cursor-pointer ml-2">✕</button>
              </div>
            </div>
            <div className="flex-1 p-6 overflow-y-auto bg-slate-100">
              <div id="offer-pdf-element">
                <InvoiceDocumentRenderer offer={previewOfferObject} businessProfile={businessProfile} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quick Add Client Modal */}
      {isNewClientModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-sm">{language === 'de' ? 'Neuen Kunden hinzufügen' : 'Add New Client'}</h3>
              <button onClick={() => setIsNewClientModalOpen(false)} className="text-slate-400 hover:text-slate-600 text-xs cursor-pointer">✕</button>
            </div>

            <form onSubmit={handleQuickAddClient} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">{language === 'de' ? 'Vollständiger Name' : 'Full Name'} *</label>
                <input
                  type="text"
                  required
                  value={newClientName}
                  onChange={(e) => setNewClientName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">{language === 'de' ? 'Firmenname (optional)' : 'Company Name (optional)'}</label>
                <input
                  type="text"
                  value={newClientCompany}
                  onChange={(e) => setNewClientCompany(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">{language === 'de' ? 'E-Mail' : 'Email Address'}</label>
                <input
                  type="email"
                  value={newClientEmail}
                  onChange={(e) => setNewClientEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsNewClientModalOpen(false)}
                  className="px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                >
                  {t.common.cancel}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs cursor-pointer"
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
