import React, { useState, useMemo } from 'react';
import {
  Package,
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  Tag,
  DollarSign,
  TrendingUp,
  Layers,
  Wrench,
  Boxes,
  Percent,
  X,
  Sparkles,
  AppWindow,
  ArrowRight,
  Eye,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  ArrowUpDown,
  RefreshCw,
  BarChart2,
  ShieldCheck,
  ChevronRight,
  Copy,
  Info,
  Check,
  FileText,
  SlidersHorizontal,
  FolderPlus,
  ArrowUpRight,
  Zap,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Product, ProductType, ProductStatus } from '../../types';
import { formatCurrency } from '../../utils/formatters';
import { HOUSE_WINDOW_TYPES, convertWindowToProduct, HouseWindowSpec } from '../../data/houseWindowsData';
import { WINDOW_SVG_COMPONENTS } from '../windows/WindowSvgIcons';
import { ConfirmModal } from '../common/ConfirmModal';

export const ProductManagementView: React.FC = () => {
  const {
    products,
    categories,
    addProduct,
    updateProduct,
    deleteProduct,
    businessProfile,
    setCurrentTab,
    setSelectedInvoiceId,
  } = useApp();

  const currency = businessProfile.defaultCurrency || 'USD';

  // Search & Filtering
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<'all' | 'product' | 'service' | 'windows'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'archived'>('all');
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const [sortBy, setSortBy] = useState<'name' | 'price_asc' | 'price_desc' | 'margin' | 'stock'>('name');

  // Modals & Drawers
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [activeTabInModal, setActiveTabInModal] = useState<'overview' | 'pricing' | 'inventory' | 'visuals'>('overview');

  // Quick Price & Stock Edit Modal
  const [quickEditProduct, setQuickEditProduct] = useState<Product | null>(null);
  const [quickSellingPrice, setQuickSellingPrice] = useState<number>(0);
  const [quickCostPrice, setQuickCostPrice] = useState<number>(0);
  const [quickStock, setQuickStock] = useState<number>(0);
  const [quickVatRate, setQuickVatRate] = useState<number>(20);
  const [quickDiscount, setQuickDiscount] = useState<number>(0);
  const [quickMarginTarget, setQuickMarginTarget] = useState<number>(45);

  // Bulk Price Update Modal
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [bulkAdjustmentPercent, setBulkAdjustmentPercent] = useState<number>(5);
  const [bulkCategoryTarget, setBulkCategoryTarget] = useState<string>('all');
  const [bulkAdjustmentType, setBulkAdjustmentType] = useState<'increase' | 'decrease' | 'set_vat'>('increase');
  const [bulkVatValue, setBulkVatValue] = useState<number>(20);

  // Detail Overview Inspector Drawer
  const [inspectingProduct, setInspectingProduct] = useState<Product | null>(null);

  // Custom Delete Confirm Modal State
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);

  // Form State for Full Product Editor
  const [formName, setFormName] = useState('');
  const [formSku, setFormSku] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formCategory, setFormCategory] = useState('Windows & Glazing');
  const [formSellingPrice, setFormSellingPrice] = useState<number>(450);
  const [formCostPrice, setFormCostPrice] = useState<number>(225);
  const [formWholesalePrice, setFormWholesalePrice] = useState<number>(380);
  const [formVatRate, setFormVatRate] = useState<number>(20);
  const [formUnit, setFormUnit] = useState('unit');
  const [formStock, setFormStock] = useState<number>(20);
  const [formMinStock, setFormMinStock] = useState<number>(5);
  const [formDiscount, setFormDiscount] = useState<number>(0);
  const [formType, setFormType] = useState<ProductType>('product');
  const [formStatus, setFormStatus] = useState<ProductStatus>('active');
  const [formImage, setFormImage] = useState('');
  const [formSvgKey, setFormSvgKey] = useState<string>('');
  const [formNotes, setFormNotes] = useState('');
  const [formSpecs, setFormSpecs] = useState<Array<{ key: string; value: string }>>([
    { key: 'U-Factor', value: '0.24' },
    { key: 'Dimensions', value: '36" × 48"' },
  ]);

  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  // Profit Margin & Markup calculations for form
  const formGrossProfit = Math.max(0, formSellingPrice - formCostPrice);
  const formMarginPercent = formSellingPrice > 0 ? ((formGrossProfit / formSellingPrice) * 100).toFixed(1) : '0';
  const formMarkupPercent = formCostPrice > 0 ? (((formSellingPrice - formCostPrice) / formCostPrice) * 100).toFixed(1) : '0';

  // Quick Edit Margin & Markup calculations
  const quickGrossProfit = Math.max(0, quickSellingPrice - quickCostPrice);
  const quickMarginPercent = quickSellingPrice > 0 ? ((quickGrossProfit / quickSellingPrice) * 100).toFixed(1) : '0';

  // Filtered & Sorted products list
  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => {
        const matchSearch =
          p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
          (p.notes && p.notes.toLowerCase().includes(searchQuery.toLowerCase()));

        const matchCategory = selectedCategory === 'all' || p.category === selectedCategory;

        let matchType = true;
        if (selectedType === 'windows') {
          matchType = p.category === 'Windows & Glazing' || !!p.svgKey || p.sku.startsWith('WIN-');
        } else if (selectedType !== 'all') {
          matchType = p.type === selectedType;
        }

        const matchStatus = statusFilter === 'all' || p.status === statusFilter;

        return matchSearch && matchCategory && matchType && matchStatus;
      })
      .sort((a, b) => {
        if (sortBy === 'name') return a.name.localeCompare(b.name);
        if (sortBy === 'price_asc') return a.sellingPrice - b.sellingPrice;
        if (sortBy === 'price_desc') return b.sellingPrice - a.sellingPrice;
        if (sortBy === 'stock') return b.stock - a.stock;
        if (sortBy === 'margin') {
          const marginA = a.sellingPrice > 0 ? (a.sellingPrice - (a.purchasePrice || 0)) / a.sellingPrice : 0;
          const marginB = b.sellingPrice > 0 ? (b.sellingPrice - (b.purchasePrice || 0)) / b.sellingPrice : 0;
          return marginB - marginA;
        }
        return 0;
      });
  }, [products, searchQuery, selectedCategory, selectedType, statusFilter, sortBy]);

  // Catalog Analytics
  const analytics = useMemo(() => {
    const totalItems = products.length;
    const windowItems = products.filter((p) => p.category === 'Windows & Glazing' || !!p.svgKey).length;
    const totalInventoryValue = products.reduce((acc, p) => acc + (p.sellingPrice * (p.stock || 0)), 0);
    const totalCostValue = products.reduce((acc, p) => acc + ((p.purchasePrice || 0) * (p.stock || 0)), 0);
    const lowStockItems = products.filter((p) => p.type === 'product' && p.stock <= (p.minStockAlert || 5)).length;

    const avgMargin = totalItems > 0
      ? products.reduce((acc, p) => {
          const m = p.sellingPrice > 0 ? ((p.sellingPrice - (p.purchasePrice || 0)) / p.sellingPrice) * 100 : 0;
          return acc + m;
        }, 0) / totalItems
      : 0;

    return {
      totalItems,
      windowItems,
      totalInventoryValue,
      totalCostValue,
      potentialProfit: totalInventoryValue - totalCostValue,
      avgMargin: avgMargin.toFixed(1),
      lowStockItems,
    };
  }, [products]);

  // Open Full Create Modal
  const handleOpenCreate = () => {
    setEditingProduct(null);
    setFormName('');
    setFormSku(`SKU-${Math.floor(1000 + Math.random() * 9000)}`);
    setFormDescription('');
    setFormCategory(categories[0] || 'Windows & Glazing');
    setFormSellingPrice(420);
    setFormCostPrice(230);
    setFormWholesalePrice(350);
    setFormVatRate(businessProfile.defaultVatRate || 20);
    setFormUnit('unit');
    setFormStock(20);
    setFormMinStock(5);
    setFormDiscount(0);
    setFormType('product');
    setFormStatus('active');
    setFormImage('');
    setFormSvgKey('');
    setFormNotes('Architectural grade specifications.');
    setFormSpecs([
      { key: 'U-Factor', value: '0.24' },
      { key: 'Material', value: 'Thermal Break Aluminum' },
      { key: 'Glazing', value: 'Double Low-E Argon' },
    ]);
    setActiveTabInModal('overview');
    setIsProductModalOpen(true);
  };

  // Open Full Edit Modal
  const handleOpenEdit = (p: Product) => {
    setEditingProduct(p);
    setFormName(p.name);
    setFormSku(p.sku);
    setFormDescription(p.description || '');
    setFormCategory(p.category);
    setFormSellingPrice(p.sellingPrice);
    setFormCostPrice(p.purchasePrice || 0);
    setFormWholesalePrice(p.wholesalePrice || Math.round(p.sellingPrice * 0.85));
    setFormVatRate(p.vatRate);
    setFormUnit(p.unit);
    setFormStock(p.stock);
    setFormMinStock(p.minStockAlert || 5);
    setFormDiscount(p.discount || 0);
    setFormType(p.type);
    setFormStatus(p.status);
    setFormImage(p.image || '');
    setFormSvgKey(p.svgKey || '');
    setFormNotes(p.notes || '');

    if (p.customSpecs && Object.keys(p.customSpecs).length > 0) {
      setFormSpecs(Object.entries(p.customSpecs).map(([key, value]) => ({ key, value })));
    } else {
      setFormSpecs([
        { key: 'U-Factor', value: '0.25' },
        { key: 'Glazing', value: 'Insulated Low-E' },
      ]);
    }

    setActiveTabInModal('overview');
    setIsProductModalOpen(true);
  };

  // Open Quick Price & Stock Editor
  const handleOpenQuickEdit = (p: Product, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setQuickEditProduct(p);
    setQuickSellingPrice(p.sellingPrice);
    setQuickCostPrice(p.purchasePrice || 0);
    setQuickStock(p.stock);
    setQuickVatRate(p.vatRate);
    setQuickDiscount(p.discount || 0);
    const m = p.sellingPrice > 0 ? (((p.sellingPrice - (p.purchasePrice || 0)) / p.sellingPrice) * 100) : 45;
    setQuickMarginTarget(Math.round(m));
  };

  // Save Quick Price & Stock changes
  const handleSaveQuickEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickEditProduct) return;

    updateProduct(quickEditProduct.id, {
      sellingPrice: Number(quickSellingPrice),
      purchasePrice: Number(quickCostPrice),
      stock: Number(quickStock),
      vatRate: Number(quickVatRate),
      discount: Number(quickDiscount),
    });

    showToast(`Updated price & stock for "${quickEditProduct.name}"`);
    setQuickEditProduct(null);
  };

  // Recalculate selling price from target margin % in Quick Edit
  const applyTargetMarginInQuickEdit = (margin: number) => {
    setQuickMarginTarget(margin);
    if (margin < 100 && quickCostPrice > 0) {
      const calculatedSell = quickCostPrice / (1 - margin / 100);
      setQuickSellingPrice(Math.round(calculatedSell));
    }
  };

  // Save Full Product Details & Overview
  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) return;

    const specsObj: Record<string, string> = {};
    formSpecs.forEach((spec) => {
      if (spec.key.trim() && spec.value.trim()) {
        specsObj[spec.key.trim()] = spec.value.trim();
      }
    });

    const productPayload = {
      name: formName.trim(),
      sku: formSku.trim() || `SKU-${Date.now().toString().slice(-4)}`,
      description: formDescription.trim(),
      category: formCategory,
      sellingPrice: Number(formSellingPrice),
      purchasePrice: Number(formCostPrice),
      wholesalePrice: Number(formWholesalePrice),
      vatRate: Number(formVatRate),
      unit: formUnit.trim() || 'unit',
      stock: Number(formStock),
      minStockAlert: Number(formMinStock),
      discount: Number(formDiscount),
      type: formType,
      status: formStatus,
      image: formImage.trim() || undefined,
      svgKey: formSvgKey || undefined,
      notes: formNotes.trim() || undefined,
      customSpecs: Object.keys(specsObj).length > 0 ? specsObj : undefined,
    };

    if (editingProduct) {
      updateProduct(editingProduct.id, productPayload);
      showToast(`Updated details & pricing for "${formName}"`);
      if (inspectingProduct?.id === editingProduct.id) {
        setInspectingProduct({ ...editingProduct, ...productPayload });
      }
    } else {
      addProduct(productPayload);
      showToast(`Added "${formName}" to products catalog`);
    }

    setIsProductModalOpen(false);
  };

  // Handle Bulk Price Update
  const handleApplyBulkUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    let updatedCount = 0;

    products.forEach((p) => {
      const isTargetCategory = bulkCategoryTarget === 'all' || p.category === bulkCategoryTarget;
      if (!isTargetCategory) return;

      if (bulkAdjustmentType === 'increase') {
        const factor = 1 + (bulkAdjustmentPercent / 100);
        updateProduct(p.id, {
          sellingPrice: Math.round(p.sellingPrice * factor),
        });
        updatedCount++;
      } else if (bulkAdjustmentType === 'decrease') {
        const factor = 1 - (bulkAdjustmentPercent / 100);
        updateProduct(p.id, {
          sellingPrice: Math.round(p.sellingPrice * factor),
        });
        updatedCount++;
      } else if (bulkAdjustmentType === 'set_vat') {
        updateProduct(p.id, {
          vatRate: bulkVatValue,
        });
        updatedCount++;
      }
    });

    showToast(`Bulk updated ${updatedCount} products in catalog!`);
    setIsBulkModalOpen(false);
  };

  // Helper to render product visual thumbnail (SVG for windows, Image, or Icon)
  const renderProductVisual = (p: Product, sizeClass: string = 'w-11 h-11') => {
    if (p.svgKey && WINDOW_SVG_COMPONENTS[p.svgKey]) {
      const WindowSvg = WINDOW_SVG_COMPONENTS[p.svgKey];
      return (
        <div className={`${sizeClass} rounded-xl bg-slate-50 p-1 border border-slate-200/90 shadow-2xs flex items-center justify-center shrink-0 overflow-hidden`}>
          <WindowSvg frameColor="#334155" glassColor="#E0F2FE" className="w-full h-full object-contain" />
        </div>
      );
    }

    // Try matching window ID from SKU
    if (p.sku.startsWith('WIN-')) {
      const potentialKey = p.sku.replace('WIN-', '').toLowerCase().replace(/-/g, '_');
      const foundSpec = HOUSE_WINDOW_TYPES.find((w) => w.id === potentialKey || p.sku.includes(w.id.toUpperCase()));
      if (foundSpec && WINDOW_SVG_COMPONENTS[foundSpec.svgKey]) {
        const WindowSvg = WINDOW_SVG_COMPONENTS[foundSpec.svgKey];
        return (
          <div className={`${sizeClass} rounded-xl bg-slate-50 p-1 border border-slate-200/90 shadow-2xs flex items-center justify-center shrink-0 overflow-hidden`}>
            <WindowSvg frameColor="#334155" glassColor="#E0F2FE" className="w-full h-full object-contain" />
          </div>
        );
      }
    }

    if (p.image) {
      return (
        <img
          src={p.image}
          alt={p.name}
          referrerPolicy="no-referrer"
          className={`${sizeClass} rounded-xl object-cover border border-slate-200 shadow-2xs shrink-0`}
        />
      );
    }

    return (
      <div className={`${sizeClass} rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center font-bold border border-slate-200 shadow-2xs shrink-0`}>
        {p.type === 'service' ? <Wrench className="w-4 h-4 text-blue-600" /> : <Package className="w-4 h-4 text-purple-600" />}
      </div>
    );
  };

  return (
    <div className="space-y-6 max-w-8xl mx-auto pb-16">
      {/* Toast Alert */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3.5 rounded-xl shadow-2xl flex items-center gap-3 border border-slate-700 animate-in fade-in slide-in-from-bottom-5">
          <Sparkles className="w-4 h-4 text-blue-400 shrink-0" />
          <span className="text-xs font-semibold">{toast}</span>
        </div>
      )}

      {/* Top Header & Action Toolbar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Products & House Windows Catalog</h2>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
              {products.length} Items Live
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Full control over product details, overview specifications, selling prices, margins, stock levels, and architectural house window types.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* House Window Studio Shortcut */}
          <button
            id="products-btn-window-studio"
            onClick={() => setCurrentTab('windows')}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-slate-800 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            <AppWindow className="w-4 h-4 text-blue-600" />
            <span>Window Types Catalog ({analytics.windowItems})</span>
          </button>

          {/* Bulk Price Adjuster Button */}
          <button
            onClick={() => setIsBulkModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl shadow-xs transition-colors cursor-pointer"
            title="Adjust prices across catalog by percentage"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-slate-600" />
            <span>Bulk Price Adjust</span>
          </button>

          {/* Add Item Button */}
          <button
            id="products-btn-add-new"
            onClick={handleOpenCreate}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Product</span>
          </button>
        </div>
      </div>

      {/* Catalog KPI strip */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500">Total Products</span>
            <Boxes className="w-4 h-4 text-slate-400" />
          </div>
          <p className="text-xl font-black text-slate-900 mt-1">{analytics.totalItems}</p>
          <div className="flex items-center gap-1.5 mt-1 text-[10px] text-slate-500 font-medium">
            <span>{categories.length} categories</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500">House Window Types</span>
            <AppWindow className="w-4 h-4 text-blue-500" />
          </div>
          <p className="text-xl font-black text-blue-600 mt-1">{analytics.windowItems}</p>
          <span className="text-[10px] text-blue-600/80 font-medium">All 30 architectural forms loaded</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500">Total Inventory Asset</span>
            <DollarSign className="w-4 h-4 text-purple-500" />
          </div>
          <p className="text-xl font-black text-slate-900 mt-1 font-mono">
            {formatCurrency(analytics.totalInventoryValue, currency)}
          </p>
          <span className="text-[10px] text-slate-400">Retail value on hand</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500">Avg Profit Margin</span>
            <TrendingUp className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-xl font-black text-emerald-600 mt-1">{analytics.avgMargin}%</p>
          <span className="text-[10px] text-emerald-700 font-medium">Healthy markup ratio</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500">Stock Alerts</span>
            <AlertTriangle className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-xl font-black text-slate-900 mt-1">
            {analytics.lowStockItems > 0 ? (
              <span className="text-amber-600">{analytics.lowStockItems} Low Stock</span>
            ) : (
              <span className="text-emerald-600 font-bold text-base">All Stock Healthy</span>
            )}
          </p>
          <span className="text-[10px] text-slate-400">Inventory monitored</span>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs space-y-3.5">
        <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-3">
          {/* Search box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by name, SKU, window mechanism, U-factor, keywords..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs">
            {/* Type selector */}
            <select
              value={selectedType}
              onChange={(e: any) => setSelectedType(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none font-medium text-slate-700"
            >
              <option value="all">All Product Types</option>
              <option value="windows">House Windows & Glazing</option>
              <option value="product">Physical Items</option>
              <option value="service">Services & Retainers</option>
            </select>

            {/* Category dropdown */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none font-medium text-slate-700"
            >
              <option value="all">All Categories ({categories.length})</option>
              {categories.map((catName) => (
                <option key={catName} value={catName}>
                  {catName}
                </option>
              ))}
            </select>

            {/* Sort order */}
            <select
              value={sortBy}
              onChange={(e: any) => setSortBy(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none font-medium text-slate-700"
            >
              <option value="name">Sort: Name (A-Z)</option>
              <option value="price_desc">Sort: Highest Price</option>
              <option value="price_asc">Sort: Lowest Price</option>
              <option value="margin">Sort: Highest Margin %</option>
              <option value="stock">Sort: Stock Quantity</option>
            </select>

            {/* View Mode Toggle */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
              <button
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  viewMode === 'table' ? 'bg-white text-blue-600 shadow-2xs' : 'text-slate-500'
                }`}
                title="Table View"
              >
                <Layers className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setViewMode('cards')}
                className={`p-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  viewMode === 'cards' ? 'bg-white text-blue-600 shadow-2xs' : 'text-slate-500'
                }`}
                title="Card Grid View"
              >
                <Boxes className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Quick Filter Tag Chips */}
        <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-100">
          <span className="text-[11px] text-slate-400 font-semibold mr-1">Filter Form:</span>
          {[
            { id: 'all', label: 'All Catalog' },
            { id: 'windows', label: '🪟 All 30 Window Types' },
            { id: 'service', label: '🛠️ Services' },
            { id: 'product', label: '📦 Physical Products' },
          ].map((chip) => (
            <button
              key={chip.id}
              onClick={() => setSelectedType(chip.id as any)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-colors cursor-pointer ${
                selectedType === chip.id
                  ? 'bg-blue-600 text-white shadow-2xs'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200/80'
              }`}
            >
              {chip.label}
            </button>
          ))}
        </div>
      </div>

      {/* Products Table View */}
      {viewMode === 'table' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead className="bg-slate-50/90 text-slate-600 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200">
                <tr>
                  <th className="py-3.5 px-4">Item & Specifications</th>
                  <th className="py-3.5 px-3">Category</th>
                  <th className="py-3.5 px-3">Type</th>
                  <th className="py-3.5 px-3 text-right">Cost Price</th>
                  <th className="py-3.5 px-3 text-right">Selling Price</th>
                  <th className="py-3.5 px-3 text-right">Margin / Markup</th>
                  <th className="py-3.5 px-3 text-center">Stock</th>
                  <th className="py-3.5 px-3 text-center">VAT</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredProducts.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-12 text-center text-slate-400">
                      <Package className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                      <p className="font-semibold text-slate-600">No matching products or windows found</p>
                      <p className="text-[11px] text-slate-400 mt-1">Try clearing search filters or add a new item.</p>
                    </td>
                  </tr>
                ) : (
                  filteredProducts.map((p) => {
                    const cost = p.purchasePrice || 0;
                    const gross = Math.max(0, p.sellingPrice - cost);
                    const margin = p.sellingPrice > 0 ? (((p.sellingPrice - cost) / p.sellingPrice) * 100).toFixed(0) : '0';
                    const markup = cost > 0 ? (((p.sellingPrice - cost) / cost) * 100).toFixed(0) : '0';
                    const isWindow = p.category === 'Windows & Glazing' || !!p.svgKey || p.sku.startsWith('WIN-');

                    return (
                      <tr
                        key={p.id}
                        onClick={() => setInspectingProduct(p)}
                        className="hover:bg-blue-50/40 transition-colors cursor-pointer group"
                      >
                        {/* Item & Visual */}
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            {renderProductVisual(p, 'w-11 h-11')}
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5">
                                <p className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors truncate">
                                  {p.name}
                                </p>
                                {isWindow && (
                                  <span className="px-1.5 py-0.2 rounded text-[9px] font-extrabold bg-blue-100 text-blue-800">
                                    Window
                                  </span>
                                )}
                              </div>
                              <p className="text-[11px] font-mono text-slate-400 mt-0.5">
                                {p.sku} • {p.unit}
                              </p>
                              {p.description && (
                                <p className="text-[10px] text-slate-500 line-clamp-1 max-w-sm mt-0.5">
                                  {p.description}
                                </p>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Category */}
                        <td className="py-3 px-3">
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-700">
                            {p.category}
                          </span>
                        </td>

                        {/* Type */}
                        <td className="py-3 px-3">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                              p.type === 'service'
                                ? 'bg-blue-50 text-blue-700'
                                : 'bg-purple-50 text-purple-700'
                            }`}
                          >
                            {p.type}
                          </span>
                        </td>

                        {/* Cost Price */}
                        <td className="py-3 px-3 text-right font-mono text-slate-500">
                          {formatCurrency(cost, currency)}
                        </td>

                        {/* Selling Price */}
                        <td className="py-3 px-3 text-right font-mono font-bold text-slate-900 text-sm">
                          {formatCurrency(p.sellingPrice, currency)}
                        </td>

                        {/* Margin & Markup */}
                        <td className="py-3 px-3 text-right">
                          <div className="font-bold text-emerald-600 text-xs">
                            {margin}% margin
                          </div>
                          <div className="text-[10px] text-slate-400 font-mono">
                            +{markup}% markup
                          </div>
                        </td>

                        {/* Stock */}
                        <td className="py-3 px-3 text-center">
                          {p.type === 'service' ? (
                            <span className="text-slate-400 font-mono text-[11px]">∞ Service</span>
                          ) : (
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold font-mono ${
                                p.stock <= (p.minStockAlert || 5)
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-emerald-50 text-emerald-700'
                              }`}
                            >
                              {p.stock} in stock
                            </span>
                          )}
                        </td>

                        {/* VAT */}
                        <td className="py-3 px-3 text-center text-slate-600 font-mono">
                          {p.vatRate}%
                        </td>

                        {/* Actions */}
                        <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-end gap-1">
                            {/* Quick Price Edit button */}
                            <button
                              onClick={(e) => handleOpenQuickEdit(p, e)}
                              className="px-2 py-1 text-[11px] font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors cursor-pointer flex items-center gap-1"
                              title="Quickly edit price & stock"
                            >
                              <DollarSign className="w-3 h-3" />
                              <span>Quick Price</span>
                            </button>

                            {/* Full Edit button */}
                            <button
                              onClick={() => handleOpenEdit(p)}
                              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg cursor-pointer"
                              title="Full Overview & Specs Editor"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>

                            {/* Delete button */}
                            <button
                              onClick={() => setProductToDelete(p)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer"
                              title="Delete Item"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Products Card Grid View */}
      {viewMode === 'cards' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredProducts.map((p) => {
            const cost = p.purchasePrice || 0;
            const margin = p.sellingPrice > 0 ? (((p.sellingPrice - cost) / p.sellingPrice) * 100).toFixed(0) : '0';
            const isWindow = p.category === 'Windows & Glazing' || !!p.svgKey || p.sku.startsWith('WIN-');

            return (
              <div
                key={p.id}
                onClick={() => setInspectingProduct(p)}
                className="bg-white rounded-2xl border border-slate-200/90 p-4.5 shadow-xs hover:shadow-md hover:border-blue-300 transition-all flex flex-col justify-between cursor-pointer group"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    {renderProductVisual(p, 'w-14 h-14')}
                    <div className="text-right">
                      <p className="text-base font-black text-slate-900 font-mono">
                        {formatCurrency(p.sellingPrice, currency)}
                      </p>
                      <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-full">
                        {margin}% margin
                      </span>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center gap-1.5">
                      <h4 className="font-bold text-slate-900 text-xs group-hover:text-blue-600 transition-colors line-clamp-1">
                        {p.name}
                      </h4>
                    </div>
                    <p className="text-[10px] font-mono text-slate-400 mt-0.5">
                      {p.sku} • {p.unit}
                    </p>
                    <p className="text-[11px] text-slate-500 line-clamp-2 mt-1.5 leading-relaxed">
                      {p.description || 'No detailed overview specifications provided.'}
                    </p>
                  </div>
                </div>

                <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-semibold bg-slate-100 text-slate-700">
                    {p.category}
                  </span>
                  <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={(e) => handleOpenQuickEdit(p, e)}
                      className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg cursor-pointer text-[11px] font-bold"
                      title="Quick Price"
                    >
                      <DollarSign className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleOpenEdit(p)}
                      className="p-1.5 text-slate-500 hover:bg-slate-100 rounded-lg cursor-pointer"
                      title="Edit Details"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* QUICK PRICE & STOCK EDIT MODAL */}
      {quickEditProduct && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-150">
            <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <DollarSign className="w-5 h-5 text-blue-600" />
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Quick Price & Stock Adjuster</h3>
                  <p className="text-[11px] text-slate-500 truncate max-w-xs">{quickEditProduct.name}</p>
                </div>
              </div>
              <button
                onClick={() => setQuickEditProduct(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveQuickEdit} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3.5">
                {/* Selling Price */}
                <div className="col-span-2 sm:col-span-1">
                  <label className="block font-bold text-slate-700 mb-1">
                    Selling Price ({currency}) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={quickSellingPrice}
                    onChange={(e) => setQuickSellingPrice(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-white border border-blue-400 rounded-xl focus:ring-2 focus:ring-blue-500 font-mono font-bold text-sm text-slate-900"
                  />
                </div>

                {/* Cost Price */}
                <div className="col-span-2 sm:col-span-1">
                  <label className="block font-bold text-slate-700 mb-1">
                    Cost / Purchase Price ({currency})
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={quickCostPrice}
                    onChange={(e) => setQuickCostPrice(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 font-mono text-slate-700"
                  />
                </div>

                {/* Profit Margin Recalculator */}
                <div className="col-span-2 bg-emerald-50/80 p-3 rounded-xl border border-emerald-200 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">
                      Live Profit Margin
                    </span>
                    <span className="text-base font-black text-emerald-700">{quickMarginPercent}%</span>
                    <span className="text-[10px] text-emerald-600 ml-2 font-mono">
                      (+{formatCurrency(quickGrossProfit, currency)} / unit)
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    <span className="text-[10px] text-slate-500 mr-1">Presets:</span>
                    {[35, 45, 55, 65].map((m) => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => applyTargetMarginInQuickEdit(m)}
                        className={`px-2 py-0.8 rounded-md text-[10px] font-bold transition-colors cursor-pointer ${
                          quickMarginTarget === m
                            ? 'bg-emerald-600 text-white shadow-2xs'
                            : 'bg-white text-emerald-800 border border-emerald-300 hover:bg-emerald-100'
                        }`}
                      >
                        {m}%
                      </button>
                    ))}
                  </div>
                </div>

                {/* Stock on Hand */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Stock on Hand</label>
                  <input
                    type="number"
                    min="0"
                    value={quickStock}
                    onChange={(e) => setQuickStock(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 font-mono font-bold"
                  />
                </div>

                {/* VAT Rate */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1">VAT Rate (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={quickVatRate}
                    onChange={(e) => setQuickVatRate(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 font-mono"
                  />
                </div>
              </div>

              {/* Total Stock Asset Value */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex justify-between items-center text-slate-600">
                <span className="text-[11px] font-medium">Batch Inventory Valuation:</span>
                <span className="font-bold font-mono text-slate-900">
                  {formatCurrency(quickSellingPrice * quickStock, currency)}
                </span>
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setQuickEditProduct(null)}
                  className="px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md transition-all cursor-pointer"
                >
                  Save Price & Stock
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* FULL PRODUCT DETAILS & OVERVIEW EDITOR MODAL */}
      {isProductModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <Package className="w-5 h-5 text-blue-600" />
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">
                    {editingProduct ? 'Edit Product Details & Overview' : 'Add New Product / House Window'}
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Configure overview specifications, pricing structures, margins, and architectural blueprints
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsProductModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Navigation Tabs */}
            <div className="flex border-b border-slate-200 bg-white px-6 shrink-0 gap-4 text-xs font-bold">
              {[
                { id: 'overview', label: '1. Overview & Specs' },
                { id: 'pricing', label: '2. Pricing & Margins' },
                { id: 'inventory', label: '3. Inventory & Units' },
                { id: 'visuals', label: '4. Visuals & Window Form' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTabInModal(tab.id as any)}
                  className={`py-3 border-b-2 transition-all cursor-pointer ${
                    activeTabInModal === tab.id
                      ? 'border-blue-600 text-blue-600 font-extrabold'
                      : 'border-transparent text-slate-500 hover:text-slate-900'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Form Content Scrollable Area */}
            <form onSubmit={handleSaveProduct} className="p-6 overflow-y-auto space-y-4 text-xs flex-1">
              {/* TAB 1: OVERVIEW & SPECS */}
              {activeTabInModal === 'overview' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Item Type *</label>
                      <select
                        value={formType}
                        onChange={(e: any) => setFormType(e.target.value)}
                        className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 font-medium"
                      >
                        <option value="product">Physical Product / Window Unit</option>
                        <option value="service">Service / Consultation / Labor</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">SKU / Catalog Code *</label>
                      <input
                        type="text"
                        required
                        value={formSku}
                        onChange={(e) => setFormSku(e.target.value)}
                        className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 font-mono font-bold"
                      />
                    </div>

                    <div className="col-span-2">
                      <label className="block font-bold text-slate-700 mb-1">Item / Window Name *</label>
                      <input
                        type="text"
                        required
                        value={formName}
                        onChange={(e) => setFormName(e.target.value)}
                        placeholder="e.g. Casement Window - Architectural Series"
                        className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 font-bold text-slate-900"
                      />
                    </div>

                    <div className="col-span-2">
                      <label className="block font-bold text-slate-700 mb-1">Detailed Overview & Description</label>
                      <textarea
                        rows={3}
                        value={formDescription}
                        onChange={(e) => setFormDescription(e.target.value)}
                        placeholder="Detailed technical overview, glass insulation package, opening mechanism, standard sizing..."
                        className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 leading-relaxed"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Category</label>
                      <input
                        type="text"
                        list="category-suggestions"
                        value={formCategory}
                        onChange={(e) => setFormCategory(e.target.value)}
                        placeholder="e.g. Windows & Glazing"
                        className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 font-medium"
                      />
                      <datalist id="category-suggestions">
                        {categories.map((c) => (
                          <option key={c} value={c} />
                        ))}
                        <option value="Windows & Glazing" />
                        <option value="Architectural Doors" />
                        <option value="Hardware" />
                        <option value="Installation & Labor" />
                        <option value="Consulting" />
                      </datalist>
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Status</label>
                      <select
                        value={formStatus}
                        onChange={(e: any) => setFormStatus(e.target.value)}
                        className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 font-medium"
                      >
                        <option value="active">Active in Catalog</option>
                        <option value="archived">Archived / Hidden</option>
                      </select>
                    </div>
                  </div>

                  {/* Dynamic Technical Specs Grid */}
                  <div className="pt-3 border-t border-slate-200">
                    <div className="flex items-center justify-between mb-2">
                      <label className="font-bold text-slate-700 block">Technical Specifications (Key - Value)</label>
                      <button
                        type="button"
                        onClick={() => setFormSpecs([...formSpecs, { key: '', value: '' }])}
                        className="text-[11px] font-bold text-blue-600 hover:text-blue-700 cursor-pointer flex items-center gap-1"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add Spec Field</span>
                      </button>
                    </div>

                    <div className="space-y-2">
                      {formSpecs.map((spec, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <input
                            type="text"
                            placeholder="Spec (e.g. U-Factor)"
                            value={spec.key}
                            onChange={(e) => {
                              const next = [...formSpecs];
                              next[idx].key = e.target.value;
                              setFormSpecs(next);
                            }}
                            className="w-1/3 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                          />
                          <input
                            type="text"
                            placeholder="Value (e.g. 0.24 W/m²K)"
                            value={spec.value}
                            onChange={(e) => {
                              const next = [...formSpecs];
                              next[idx].value = e.target.value;
                              setFormSpecs(next);
                            }}
                            className="flex-1 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                          />
                          <button
                            type="button"
                            onClick={() => setFormSpecs(formSpecs.filter((_, i) => i !== idx))}
                            className="p-1.5 text-slate-400 hover:text-rose-600 rounded-md cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: PRICING & MARGINS */}
              {activeTabInModal === 'pricing' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">
                        Retail Selling Price ({currency}) *
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        required
                        value={formSellingPrice}
                        onChange={(e) => setFormSellingPrice(parseFloat(e.target.value) || 0)}
                        className="w-full px-3 py-2.5 bg-white border border-blue-500 rounded-xl focus:ring-2 focus:ring-blue-500 font-mono font-bold text-sm"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">
                        Cost / Purchase Price ({currency})
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={formCostPrice}
                        onChange={(e) => setFormCostPrice(parseFloat(e.target.value) || 0)}
                        className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 font-mono text-slate-700"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">
                        Contractor / Wholesale Price ({currency})
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={formWholesalePrice}
                        onChange={(e) => setFormWholesalePrice(parseFloat(e.target.value) || 0)}
                        className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 font-mono"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">VAT / Tax Rate (%)</label>
                      <input
                        type="number"
                        step="0.1"
                        value={formVatRate}
                        onChange={(e) => setFormVatRate(parseFloat(e.target.value) || 0)}
                        className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 font-mono"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Default Discount (%)</label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={formDiscount}
                        onChange={(e) => setFormDiscount(parseFloat(e.target.value) || 0)}
                        className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 font-mono"
                      />
                    </div>
                  </div>

                  {/* Margin & Profitability Dashboard Card */}
                  <div className="p-4 bg-slate-900 text-white rounded-2xl space-y-3">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400 block">
                      Live Profitability Breakdown
                    </span>

                    <div className="grid grid-cols-3 gap-3 text-center">
                      <div className="bg-slate-800/80 p-3 rounded-xl">
                        <span className="text-[10px] text-slate-400 block">Gross Profit</span>
                        <p className="text-base font-bold font-mono text-emerald-400 mt-0.5">
                          {formatCurrency(formGrossProfit, currency)}
                        </p>
                      </div>

                      <div className="bg-slate-800/80 p-3 rounded-xl">
                        <span className="text-[10px] text-slate-400 block">Profit Margin</span>
                        <p className="text-base font-bold text-emerald-400 mt-0.5">{formMarginPercent}%</p>
                      </div>

                      <div className="bg-slate-800/80 p-3 rounded-xl">
                        <span className="text-[10px] text-slate-400 block">Cost Markup</span>
                        <p className="text-base font-bold text-blue-400 mt-0.5">+{formMarkupPercent}%</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: INVENTORY & UNITS */}
              {activeTabInModal === 'inventory' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Stock on Hand</label>
                      <input
                        type="number"
                        min="0"
                        value={formStock}
                        onChange={(e) => setFormStock(parseInt(e.target.value) || 0)}
                        className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 font-mono font-bold"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Low Stock Alert Level</label>
                      <input
                        type="number"
                        min="0"
                        value={formMinStock}
                        onChange={(e) => setFormMinStock(parseInt(e.target.value) || 0)}
                        className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 font-mono"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Unit of Measure</label>
                      <input
                        type="text"
                        value={formUnit}
                        onChange={(e) => setFormUnit(e.target.value)}
                        placeholder="e.g. unit, pcs, set, hours, m²"
                        className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div className="col-span-2">
                      <label className="block font-bold text-slate-700 mb-1">Internal Notes & Warehousing Reference</label>
                      <textarea
                        rows={2}
                        value={formNotes}
                        onChange={(e) => setFormNotes(e.target.value)}
                        placeholder="Aisle location, manufacturer warranty terms, reorder lead times..."
                        className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 4: VISUALS & WINDOW FORM */}
              {activeTabInModal === 'visuals' && (
                <div className="space-y-4">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Link Architectural Window Vector (30 Available Shapes)
                    </label>
                    <select
                      value={formSvgKey}
                      onChange={(e) => setFormSvgKey(e.target.value)}
                      className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 font-medium"
                    >
                      <option value="">No Window Vector (Use custom image or default icon)</option>
                      {HOUSE_WINDOW_TYPES.map((w) => (
                        <option key={w.id} value={w.svgKey}>
                          🪟 {w.name} ({w.category})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Custom Image URL (Optional)</label>
                    <input
                      type="url"
                      value={formImage}
                      onChange={(e) => setFormImage(e.target.value)}
                      placeholder="https://images.unsplash.com/..."
                      className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 font-mono"
                    />
                  </div>

                  {/* Live Preview Box */}
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex items-center gap-4">
                    <div className="w-24 h-24 bg-white rounded-xl border border-slate-200 p-1 flex items-center justify-center overflow-hidden">
                      {formSvgKey && WINDOW_SVG_COMPONENTS[formSvgKey] ? (
                        React.createElement(WINDOW_SVG_COMPONENTS[formSvgKey], {
                          frameColor: '#334155',
                          glassColor: '#E0F2FE',
                          className: 'w-full h-full object-contain',
                        })
                      ) : formImage ? (
                        <img
                          src={formImage}
                          alt="Preview"
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover rounded-lg"
                        />
                      ) : (
                        <Package className="w-8 h-8 text-slate-400" />
                      )}
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 text-sm">{formName || 'Item Title Preview'}</p>
                      <p className="text-[11px] font-mono text-slate-500">{formSku || 'SKU-0000'}</p>
                      <p className="text-[11px] text-emerald-600 font-bold mt-1">
                        {formatCurrency(formSellingPrice, currency)} ({formMarginPercent}% margin)
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Modal Action Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsProductModalOpen(false)}
                  className="px-4 py-2.5 font-semibold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>{editingProduct ? 'Save Changes' : 'Create Product'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* BULK PRICE & OVERVIEW ADJUSTER MODAL */}
      {isBulkModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-150">
            <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-5 h-5 text-blue-600" />
                <h3 className="text-base font-bold text-slate-900">Bulk Price & Tax Adjuster</h3>
              </div>
              <button
                onClick={() => setIsBulkModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleApplyBulkUpdate} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Target Category</label>
                <select
                  value={bulkCategoryTarget}
                  onChange={(e) => setBulkCategoryTarget(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl font-medium"
                >
                  <option value="all">Entire Catalog (All {products.length} items)</option>
                  {categories.map((c) => (
                    <option key={c} value={c}>
                      Category: {c}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Adjustment Action</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'increase', label: '📈 Increase Price %' },
                    { id: 'decrease', label: '📉 Decrease Price %' },
                    { id: 'set_vat', label: '🏷️ Set VAT Rate %' },
                  ].map((act) => (
                    <button
                      key={act.id}
                      type="button"
                      onClick={() => setBulkAdjustmentType(act.id as any)}
                      className={`p-2.5 rounded-xl border text-center font-bold text-[11px] transition-all cursor-pointer ${
                        bulkAdjustmentType === act.id
                          ? 'border-blue-600 bg-blue-50 text-blue-700 shadow-2xs'
                          : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      {act.label}
                    </button>
                  ))}
                </div>
              </div>

              {bulkAdjustmentType !== 'set_vat' ? (
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Percentage {bulkAdjustmentType === 'increase' ? 'Increase' : 'Discount'} (%)
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      step="0.5"
                      min="0.1"
                      max="100"
                      value={bulkAdjustmentPercent}
                      onChange={(e) => setBulkAdjustmentPercent(parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl font-mono font-bold"
                    />
                    <div className="flex gap-1 shrink-0">
                      {[3, 5, 8, 10].map((val) => (
                        <button
                          key={val}
                          type="button"
                          onClick={() => setBulkAdjustmentPercent(val)}
                          className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg font-bold text-[10px]"
                        >
                          {val}%
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div>
                  <label className="block font-bold text-slate-700 mb-1">New VAT Rate (%)</label>
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    max="100"
                    value={bulkVatValue}
                    onChange={(e) => setBulkVatValue(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl font-mono font-bold"
                  />
                </div>
              )}

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsBulkModalOpen(false)}
                  className="px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md transition-all cursor-pointer"
                >
                  Apply to Selected Products
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PRODUCT OVERVIEW & SPECS INSPECTOR DRAWER */}
      {inspectingProduct && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex justify-end"
          onClick={() => setInspectingProduct(null)}
        >
          <div
            className="bg-white w-full max-w-md h-full shadow-2xl flex flex-col justify-between overflow-y-auto animate-in slide-in-from-right duration-200 p-6 space-y-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="space-y-5">
              {/* Drawer Top Header */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  {renderProductVisual(inspectingProduct, 'w-14 h-14')}
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900 leading-tight">
                      {inspectingProduct.name}
                    </h3>
                    <p className="text-[11px] font-mono text-slate-400 mt-0.5">
                      {inspectingProduct.sku} • {inspectingProduct.unit}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setInspectingProduct(null)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Price & Margin Card */}
              <div className="bg-slate-900 text-white p-4 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-slate-400 font-medium">Selling Price</span>
                  <span className="text-xl font-black font-mono text-blue-400">
                    {formatCurrency(inspectingProduct.sellingPrice, currency)}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 block">Cost Price</span>
                    <span className="font-mono text-slate-200">
                      {formatCurrency(inspectingProduct.purchasePrice || 0, currency)}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Profit Margin</span>
                    <span className="font-bold text-emerald-400">
                      {(inspectingProduct.sellingPrice > 0
                        ? (((inspectingProduct.sellingPrice - (inspectingProduct.purchasePrice || 0)) / inspectingProduct.sellingPrice) * 100).toFixed(1)
                        : 0)}
                      %
                    </span>
                  </div>
                </div>
              </div>

              {/* Overview / Description */}
              <div>
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-1.5">
                  Overview & Details
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3.5 rounded-xl border border-slate-200/80">
                  {inspectingProduct.description || 'No detailed overview description specified.'}
                </p>
              </div>

              {/* Technical Specifications */}
              {inspectingProduct.customSpecs && Object.keys(inspectingProduct.customSpecs).length > 0 && (
                <div>
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-1.5">
                    Architectural Specifications
                  </h4>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.entries(inspectingProduct.customSpecs).map(([key, val]) => (
                      <div key={key} className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/70">
                        <span className="text-[10px] text-slate-400 block">{key}</span>
                        <span className="text-xs font-bold text-slate-800">{val}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Notes */}
              {inspectingProduct.notes && (
                <div>
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-1">
                    Notes & Thermal Ratings
                  </h4>
                  <p className="text-xs text-slate-500 font-mono bg-blue-50/50 p-2.5 rounded-xl border border-blue-100">
                    {inspectingProduct.notes}
                  </p>
                </div>
              )}
            </div>

            {/* Bottom Actions in Drawer */}
            <div className="pt-4 border-t border-slate-200 space-y-2">
              <button
                onClick={() => {
                  handleOpenEdit(inspectingProduct);
                  setInspectingProduct(null);
                }}
                className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Edit className="w-3.5 h-3.5" />
                <span>Edit Full Overview & Price</span>
              </button>

              <button
                onClick={() => {
                  setSelectedInvoiceId(null);
                  setCurrentTab('invoice_create');
                }}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-sm transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Create Invoice with this Item</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modern Custom Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={Boolean(productToDelete)}
        title="Remove Product"
        message={productToDelete ? `Are you sure you want to remove "${productToDelete.name}" from your catalog?` : ''}
        confirmText="Remove Product"
        cancelText="Cancel"
        variant="danger"
        onConfirm={() => {
          if (productToDelete) {
            deleteProduct(productToDelete.id);
            setProductToDelete(null);
          }
        }}
        onCancel={() => setProductToDelete(null)}
      />
    </div>
  );
};
