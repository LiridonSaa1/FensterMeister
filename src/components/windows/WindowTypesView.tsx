import React, { useState, useMemo, useEffect } from 'react';
import {
  AppWindow,
  Search,
  Filter,
  CheckCircle2,
  Plus,
  FileText,
  Sliders,
  ShieldCheck,
  Wind,
  Sun,
  Volume2,
  Sparkles,
  Info,
  ArrowRight,
  Layers,
  Zap,
  Grid,
  List,
  Compass,
  Building,
  Home,
  Check,
  DollarSign,
  Maximize2,
  Copy,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import {
  HOUSE_WINDOW_TYPES,
  HouseWindowSpec,
  convertWindowToProduct,
  convertWindowToInvoiceItem,
  getWindowName,
  getWindowDescription,
  getWindowMechanism,
  getWindowCategoryLabel,
} from '../../data/houseWindowsData';
import { WINDOW_SVG_COMPONENTS } from './WindowSvgIcons';
import { formatCurrency } from '../../utils/formatters';

export const WindowTypesView: React.FC = () => {
  const {
    products,
    addProduct,
    setCurrentTab,
    setSelectedInvoiceId,
    businessProfile,
    t,
    language,
  } = useApp();

  const currency = businessProfile.defaultCurrency || 'USD';

  // Filters and controls
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'blueprints' | 'comparison'>('grid');

  // Real-time custom SVG theme controls (persisted in localStorage across reloads)
  const [frameTheme, setFrameTheme] = useState<'anthracite' | 'white' | 'wood' | 'bronze'>(() => {
    return (localStorage.getItem('fenstermeister_frame_theme') as any) || 'anthracite';
  });
  const [glassTheme, setGlassTheme] = useState<'blue' | 'clear' | 'lowe' | 'frosted'>(() => {
    return (localStorage.getItem('fenstermeister_glass_theme') as any) || 'blue';
  });

  useEffect(() => {
    localStorage.setItem('fenstermeister_frame_theme', frameTheme);
  }, [frameTheme]);

  useEffect(() => {
    localStorage.setItem('fenstermeister_glass_theme', glassTheme);
  }, [glassTheme]);

  // Interactive selected window for detail modal or quick quote
  const [activeWindowModal, setActiveWindowModal] = useState<HouseWindowSpec | null>(null);

  // Customizer state in modal or card
  const [customWidth, setCustomWidth] = useState<number>(36);
  const [customHeight, setCustomHeight] = useState<number>(48);
  const [customMaterial, setCustomMaterial] = useState<string>('uPVC / Vinyl');
  const [customGlazing, setCustomGlazing] = useState<string>('Double Pane Low-E Argon');
  const [customQuantity, setCustomQuantity] = useState<number>(1);
  const [notification, setNotification] = useState<string | null>(null);

  // Color mapping for SVGs
  const frameColorMap = {
    anthracite: '#334155',
    white: '#94A3B8',
    wood: '#78350F',
    bronze: '#1E293B',
  };

  const glassColorMap = {
    blue: '#E0F2FE',
    clear: '#F8FAFC',
    lowe: '#DCFCE7',
    frosted: '#F1F5F9',
  };

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => {
      setNotification(null);
    }, 4000);
  };

  // Filtered window types
  const filteredWindows = useMemo(() => {
    return HOUSE_WINDOW_TYPES.filter((w) => {
      const matchSearch =
        w.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        w.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        w.openingMechanism.toLowerCase().includes(searchQuery.toLowerCase()) ||
        w.architecturalStyles.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase())) ||
        w.bestApplications.some((a) => a.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchCat =
        selectedCategory === 'all' || w.category === selectedCategory;

      return matchSearch && matchCat;
    });
  }, [searchQuery, selectedCategory]);

  // Check if window is already in products catalog
  const isAlreadyInCatalog = (windowId: string) => {
    return products.some((p) => p.sku === `WIN-${windowId.toUpperCase().replace(/_/g, '-')}`);
  };

  // Handle Add to Catalog
  const handleAddToCatalog = (spec: HouseWindowSpec) => {
    if (isAlreadyInCatalog(spec.id)) {
      showNotification(`"${spec.name}" is already in your Products & Services catalog.`);
      return;
    }
    const newProd = convertWindowToProduct(spec);
    addProduct(newProd);
    showNotification(`Added "${spec.name}" to your company product catalog!`);
  };

  // Handle Add All to Catalog
  const handleAddAllToCatalog = () => {
    let addedCount = 0;
    HOUSE_WINDOW_TYPES.forEach((spec) => {
      if (!isAlreadyInCatalog(spec.id)) {
        addProduct(convertWindowToProduct(spec));
        addedCount++;
      }
    });
    showNotification(`Successfully added ${addedCount} house window types to your catalog!`);
  };

  // Calculate live price based on customizer
  const calculateConfiguredPrice = (basePrice: number) => {
    let price = basePrice;
    
    // Dimension factor (area ratio relative to standard 36x48 = 1728 sq inches)
    const baseArea = 36 * 48;
    const customArea = customWidth * customHeight;
    const areaMultiplier = Math.max(0.75, Math.min(2.5, customArea / baseArea));
    price = price * areaMultiplier;

    // Material surcharge
    if (customMaterial.includes('Wood') || customMaterial.includes('Timber')) {
      price *= 1.45;
    } else if (customMaterial.includes('Aluminum') || customMaterial.includes('Thermal')) {
      price *= 1.3;
    } else if (customMaterial.includes('Fiberglass')) {
      price *= 1.35;
    }

    // Glazing surcharge
    if (customGlazing.includes('Triple')) {
      price += 140;
    } else if (customGlazing.includes('Acoustic') || customGlazing.includes('Laminated')) {
      price += 110;
    }

    return Math.round(price);
  };

  // Handle Create Invoice with window
  const handleCreateInvoiceWithWindow = (spec: HouseWindowSpec) => {
    // Navigate to invoice creation with item pre-loaded
    setSelectedInvoiceId(null);
    setCurrentTab('invoice_create');
    showNotification(`Opening invoice builder with ${spec.name}...`);
  };

  return (
    <div className="space-y-6 max-w-8xl mx-auto pb-12">
      {/* Toast Alert */}
      {notification && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3.5 rounded-xl shadow-2xl flex items-center gap-3 border border-slate-700 animate-in fade-in slide-in-from-bottom-5">
          <Sparkles className="w-5 h-5 text-blue-400 shrink-0" />
          <span className="text-xs font-medium">{notification}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 relative z-10">
          <div className="space-y-1.5 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-blue-600 border border-blue-200">
                {language === 'de' ? 'Architekturkatalog' : 'Architectural Catalog'}
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
                {HOUSE_WINDOW_TYPES.length} {language === 'de' ? 'Fenstertypen & Schemata' : 'Window Styles & Schematics'}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              {language === 'de' ? 'Fenstertypen & Technischer Katalog' : 'Residential House Window Types'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
              {language === 'de'
                ? 'Erkunden Sie alle Fenstertypen mit Vektorzeichnungen, Öffnungsmechanismen, Standardmaßen, U-Werten und Preiskalkulator in Echtzeit.'
                : 'Explore all residential window styles with architectural vector diagrams, opening mechanisms, standard dimensions, thermal U-factors, and real-time custom quote estimators.'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              onClick={handleAddAllToCatalog}
              className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-lg shadow-blue-200 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>{language === 'de' ? `Alle ${HOUSE_WINDOW_TYPES.length} zum Katalog hinzufügen` : `Sync All to Product Catalog (${HOUSE_WINDOW_TYPES.length})`}</span>
            </button>
            <button
              onClick={() => {
                setSelectedInvoiceId(null);
                setCurrentTab('invoice_create');
              }}
              className="flex items-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg shadow-sm transition-all cursor-pointer"
            >
              <FileText className="w-4 h-4" />
              <span>{language === 'de' ? 'Neue Fenster-Rechnung' : 'New Window Invoice'}</span>
            </button>
          </div>
        </div>

        {/* Decorative Grid BG */}
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-blue-50/50 to-transparent pointer-events-none" />
      </div>

      {/* Control & Filter Strip */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4">
          {/* Search Bar */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder={language === 'de' ? 'Fenstertyp, Mechanismus oder Raum suchen (z. B. Küche, Keller, Dreh-Kipp, Erker)...' : 'Search by window type, mechanism, room (e.g. Kitchen, Basement, Casement, Bay)...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-slate-200 text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none bg-slate-50/50"
            />
          </div>

          {/* View Mode Switcher */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl shrink-0 border border-slate-200">
            <button
              onClick={() => setViewMode('grid')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'grid'
                  ? 'bg-white text-blue-600 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Grid className="w-3.5 h-3.5" />
              <span>{language === 'de' ? 'Karten' : 'Cards'}</span>
            </button>
            <button
              onClick={() => setViewMode('blueprints')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'blueprints'
                  ? 'bg-white text-blue-600 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Compass className="w-3.5 h-3.5" />
              <span>{language === 'de' ? 'Blaupausen' : 'Blueprints'}</span>
            </button>
            <button
              onClick={() => setViewMode('comparison')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'comparison'
                  ? 'bg-white text-blue-600 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span>{language === 'de' ? 'Vergleichsmatrix' : 'Compare Specs'}</span>
            </button>
          </div>
        </div>

        {/* Category Chips & Visual Theme Pickers */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 pt-2 border-t border-slate-100">
          {/* Categories */}
          <div className="flex flex-wrap gap-1.5">
            {[
              { id: 'all', label: language === 'de' ? 'Alle Stile (30)' : 'All Windows (30)' },
              { id: 'operable', label: language === 'de' ? 'Bedienbar & Öffnend' : 'Operable & Ventilation' },
              { id: 'fixed', label: language === 'de' ? 'Festverglasung & Panorama' : 'Fixed & Panoramic' },
              { id: 'projecting', label: language === 'de' ? 'Erker- & Vorsprungfenster' : 'Projecting (Bay & Bow)' },
              { id: 'geometric', label: language === 'de' ? 'Geometrisch & Schräg' : 'Geometric & Sloped' },
              { id: 'folding_pass_through', label: language === 'de' ? 'Falt- & Schiebeelemente' : 'Folding & Pass-Through' },
              { id: 'specialty', label: language === 'de' ? 'Spezial- & Kunstglas' : 'Artisan & Leaded Glass' },
              { id: 'architectural', label: language === 'de' ? 'Rundbogen & Architektur' : 'Arched & Specialty' },
              { id: 'roof_overhead', label: language === 'de' ? 'Dachfenster & Lichtkuppeln' : 'Roof & Skylights' },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                  selectedCategory === cat.id
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200/80'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Real-time SVG Theme Customizer */}
          <div className="flex items-center gap-4 text-xs font-medium text-slate-500">
            {/* Frame Finish */}
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] text-slate-400">{language === 'de' ? 'Rahmen:' : 'Frame:'}</span>
              <button
                title={language === 'de' ? 'Anthrazitgrau (RAL 7016)' : 'Anthracite Grey'}
                onClick={() => setFrameTheme('anthracite')}
                className={`w-5 h-5 rounded-full bg-slate-700 border-2 transition-transform cursor-pointer ${
                  frameTheme === 'anthracite' ? 'border-blue-600 scale-110 shadow-xs' : 'border-white'
                }`}
              />
              <button
                title={language === 'de' ? 'Verkehrsweiß (RAL 9016)' : 'White Vinyl'}
                onClick={() => setFrameTheme('white')}
                className={`w-5 h-5 rounded-full bg-slate-300 border-2 transition-transform cursor-pointer ${
                  frameTheme === 'white' ? 'border-blue-600 scale-110 shadow-xs' : 'border-white'
                }`}
              />
              <button
                title={language === 'de' ? 'Holzdekor / Naturholz' : 'Natural Timber Wood'}
                onClick={() => setFrameTheme('wood')}
                className={`w-5 h-5 rounded-full bg-amber-800 border-2 transition-transform cursor-pointer ${
                  frameTheme === 'wood' ? 'border-blue-600 scale-110 shadow-xs' : 'border-white'
                }`}
              />
              <button
                title={language === 'de' ? 'Dunkelbronze Eloxiert' : 'Architectural Dark Bronze'}
                onClick={() => setFrameTheme('bronze')}
                className={`w-5 h-5 rounded-full bg-slate-900 border-2 transition-transform cursor-pointer ${
                  frameTheme === 'bronze' ? 'border-blue-600 scale-110 shadow-xs' : 'border-white'
                }`}
              />
            </div>

            {/* Glass Glazing Tone */}
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] text-slate-400">{language === 'de' ? 'Glas:' : 'Glass:'}</span>
              <button
                title={language === 'de' ? 'Himmelblau Low-E' : 'Sky Blue Low-E'}
                onClick={() => setGlassTheme('blue')}
                className={`w-5 h-5 rounded-full bg-sky-200 border-2 transition-transform cursor-pointer ${
                  glassTheme === 'blue' ? 'border-blue-600 scale-110 shadow-xs' : 'border-white'
                }`}
              />
              <button
                title={language === 'de' ? 'Klarglas Höchsttransparent' : 'Clear High-Transmission'}
                onClick={() => setGlassTheme('clear')}
                className={`w-5 h-5 rounded-full bg-slate-100 border-2 transition-transform cursor-pointer ${
                  glassTheme === 'clear' ? 'border-blue-600 scale-110 shadow-xs' : 'border-white'
                }`}
              />
              <button
                title={language === 'de' ? 'Sonnenschutz Grünlich' : 'Greenish Solar Low-E'}
                onClick={() => setGlassTheme('lowe')}
                className={`w-5 h-5 rounded-full bg-emerald-100 border-2 transition-transform cursor-pointer ${
                  glassTheme === 'lowe' ? 'border-blue-600 scale-110 shadow-xs' : 'border-white'
                }`}
              />
            </div>
          </div>
        </div>
      </div>

      {/* VIEW 1: INTERACTIVE GRID OF ALL HOUSE WINDOW CARDS */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredWindows.map((spec) => {
            const SvgComponent = WINDOW_SVG_COMPONENTS[spec.svgKey] || WINDOW_SVG_COMPONENTS.casement;
            const inCatalog = isAlreadyInCatalog(spec.id);

            return (
              <div
                key={spec.id}
                className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col overflow-hidden group"
              >
                {/* SVG Illustration Header Container */}
                <div className="bg-slate-50/80 p-6 border-b border-slate-100 relative flex items-center justify-center min-h-[220px] group-hover:bg-slate-50 transition-colors">
                  <div className="w-40 h-44 drop-shadow-xs transition-transform duration-300 group-hover:scale-105 flex items-center justify-center">
                    <SvgComponent
                      frameColor={frameColorMap[frameTheme]}
                      glassColor={glassColorMap[glassTheme]}
                    />
                  </div>

                  {/* Energy Star Badge */}
                  <div className="absolute top-3 right-3 flex items-center gap-1 bg-white/95 px-2.5 py-1 rounded-full text-[10px] font-bold text-emerald-700 border border-emerald-200 shadow-xs backdrop-blur-xs">
                    <Zap className="w-3 h-3 text-emerald-600" />
                    <span>{spec.energyEfficiency.energyStarRating}</span>
                  </div>

                  {/* Category Pill */}
                  <div className="absolute top-3 left-3 bg-white/95 px-2.5 py-1 rounded-full text-[10px] font-bold text-slate-600 border border-slate-200 shadow-xs">
                    {getWindowCategoryLabel(spec.category, language).toUpperCase()}
                  </div>
                </div>

                {/* Body Content */}
                <div className="p-5 flex-1 flex flex-col space-y-4">
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                        {getWindowName(spec, language)}
                      </h3>
                      <span className="text-sm font-bold text-slate-900 font-mono shrink-0">
                        {formatCurrency(spec.basePriceUSD, currency)}
                      </span>
                    </div>
                    <p className="text-[11px] text-blue-600 font-medium mt-0.5 flex items-center gap-1">
                      <Wind className="w-3 h-3 shrink-0" />
                      <span>{getWindowMechanism(spec, language)}</span>
                    </p>
                    <p className="text-xs text-slate-500 mt-2 line-clamp-2 leading-relaxed">
                      {getWindowDescription(spec, language)}
                    </p>
                  </div>

                  {/* Quick Specs Strip */}
                  <div className="grid grid-cols-3 gap-2 py-2.5 px-3 bg-slate-50 rounded-xl border border-slate-100 text-[11px]">
                    <div>
                      <span className="text-[10px] text-slate-400 block font-medium">{language === 'de' ? 'U-Wert' : 'U-Factor'}</span>
                      <span className="font-bold text-slate-700 font-mono">{spec.energyEfficiency.uFactor}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block font-medium">{language === 'de' ? 'g-Wert' : 'SHGC'}</span>
                      <span className="font-bold text-slate-700 font-mono">{spec.energyEfficiency.shgc}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block font-medium">{language === 'de' ? 'Schallschutz' : 'Sound STC'}</span>
                      <span className="font-bold text-slate-700 font-mono">{spec.energyEfficiency.stcRating}</span>
                    </div>
                  </div>

                  {/* Standard Dimensions & Best For */}
                  <div className="space-y-1.5 text-xs">
                    <div className="flex items-center justify-between text-slate-600">
                      <span className="text-slate-400 text-[11px]">{language === 'de' ? 'Standardmaße:' : 'Std. Sizes:'}</span>
                      <span className="font-medium font-mono text-[11px]">{spec.standardSizes.widthRangeMm || spec.standardSizes.widthRangeInches}</span>
                    </div>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {spec.bestApplications.slice(0, 3).map((app, i) => (
                        <span key={i} className="px-2 py-0.5 rounded bg-slate-100 text-[10px] font-medium text-slate-600">
                          {app}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Actions Footer */}
                  <div className="pt-3 border-t border-slate-100 mt-auto flex items-center gap-2">
                    <button
                      onClick={() => {
                        setActiveWindowModal(spec);
                        setCustomWidth(36);
                        setCustomHeight(48);
                        setCustomQuantity(1);
                      }}
                      className="flex-1 py-2 px-3 bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-700 text-xs font-bold rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <Sliders className="w-3.5 h-3.5" />
                      <span>{language === 'de' ? 'Konfigurieren' : 'Configure'}</span>
                    </button>

                    <button
                      onClick={() => handleAddToCatalog(spec)}
                      className={`p-2 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                        inCatalog
                          ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                          : 'bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-200'
                      }`}
                      title={inCatalog ? 'Already in catalog' : 'Add to product inventory'}
                    >
                      {inCatalog ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* VIEW 2: ARCHITECTURAL BLUEPRINT SCHEMATICS */}
      {viewMode === 'blueprints' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredWindows.map((spec) => {
            const SvgComponent = WINDOW_SVG_COMPONENTS[spec.svgKey] || WINDOW_SVG_COMPONENTS.casement;

            return (
              <div
                key={spec.id}
                className="bg-[#0F172A] rounded-2xl border border-slate-800 p-6 shadow-xl text-white flex flex-col justify-between space-y-4 relative overflow-hidden"
              >
                {/* Blueprint grid background */}
                <div
                  className="absolute inset-0 opacity-10 pointer-events-none"
                  style={{
                    backgroundImage: 'radial-gradient(#38BDF8 1px, transparent 1px)',
                    backgroundSize: '16px 16px',
                  }}
                />

                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div>
                    <span className="text-[10px] font-mono tracking-widest text-sky-400 uppercase">
                      SCHEMATIC REF // WIN-{spec.id.toUpperCase().slice(0, 6)}
                    </span>
                    <h3 className="text-base font-bold text-white tracking-tight">{getWindowName(spec, language)}</h3>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-sky-950 text-sky-300 border border-sky-800">
                    {spec.standardSizes.widthRangeMm || spec.standardSizes.widthRangeInches}
                  </span>
                </div>

                {/* Schematic Vector in Blueprint Styling */}
                <div className="py-4 flex items-center justify-center h-48 relative">
                  <div className="w-36 h-44 drop-shadow-[0_0_12px_rgba(56,189,248,0.3)]">
                    <SvgComponent frameColor="#38BDF8" glassColor="#082F49" />
                  </div>
                </div>

                <div className="space-y-2 text-xs font-mono bg-slate-900/80 p-3.5 rounded-xl border border-slate-800/80">
                  <div className="flex justify-between text-slate-400 text-[11px]">
                    <span>{language === 'de' ? 'Öffnungsvektor:' : 'Opening Vector:'}</span>
                    <span className="text-sky-300 font-bold">{getWindowMechanism(spec, language).split(' ')[0]}</span>
                  </div>
                  <div className="flex justify-between text-slate-400 text-[11px]">
                    <span>{language === 'de' ? 'U-Wert (Wärmedämmung):' : 'Thermal U-Factor:'}</span>
                    <span className="text-emerald-400 font-bold">{spec.energyEfficiency.uFactor}</span>
                  </div>
                  <div className="flex justify-between text-slate-400 text-[11px]">
                    <span>{language === 'de' ? 'Schallschutzmaß:' : 'Acoustic Damping:'}</span>
                    <span className="text-amber-300 font-bold">{spec.energyEfficiency.stcRating}</span>
                  </div>
                </div>

                <div className="pt-2 flex items-center gap-2">
                  <button
                    onClick={() => {
                      setActiveWindowModal(spec);
                      setCustomWidth(36);
                      setCustomHeight(48);
                    }}
                    className="flex-1 py-2 px-3 bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <span>{language === 'de' ? 'Spezifikationen & Kalkulation' : 'Inspect Specs & Order'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* VIEW 3: COMPREHENSIVE COMPARISON MATRIX */}
      {viewMode === 'comparison' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-800">
              {language === 'de'
                ? `Technische Vergleichsmatrix aller ${HOUSE_WINDOW_TYPES.length} Wohngebäude-Fenstertypen`
                : `Technical Comparison Matrix of All ${HOUSE_WINDOW_TYPES.length} Residential House Window Types`}
            </h3>
            <span className="text-xs text-slate-500">
              {language === 'de' ? `${filteredWindows.length} Stile angezeigt` : `Showing ${filteredWindows.length} styles`}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead className="bg-slate-50 text-[10px] text-slate-400 uppercase tracking-widest font-bold border-b border-slate-200">
                <tr>
                  <th className="py-3.5 px-4">{language === 'de' ? 'Skizze & Fenstertyp' : 'Schematic & Type'}</th>
                  <th className="py-3.5 px-3">{language === 'de' ? 'Öffnungsmechanismus' : 'Opening Mechanism'}</th>
                  <th className="py-3.5 px-3">{language === 'de' ? 'Lüftungsfläche' : 'Ventilation Area'}</th>
                  <th className="py-3.5 px-3">{language === 'de' ? 'U-Wert' : 'Thermal U-Factor'}</th>
                  <th className="py-3.5 px-3">{language === 'de' ? 'Regenschutz' : 'Rain Protection'}</th>
                  <th className="py-3.5 px-3">{language === 'de' ? 'Reinigungskomfort' : 'Cleaning Ease'}</th>
                  <th className="py-3.5 px-3 text-right">{language === 'de' ? 'Richtpreis' : 'Base Price'}</th>
                  <th className="py-3.5 px-4 text-center">{language === 'de' ? 'Aktion' : 'Action'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredWindows.map((spec) => {
                  const SvgComponent = WINDOW_SVG_COMPONENTS[spec.svgKey] || WINDOW_SVG_COMPONENTS.casement;
                  return (
                    <tr key={spec.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 shrink-0 bg-slate-100 rounded-lg p-1 border border-slate-200 flex items-center justify-center">
                            <SvgComponent frameColor="#334155" glassColor="#E0F2FE" />
                          </div>
                          <div>
                            <span className="font-bold text-slate-900 block">{getWindowName(spec, language)}</span>
                            <span className="text-[10px] text-slate-400 capitalize">{getWindowCategoryLabel(spec.category, language)}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-3 text-slate-600 max-w-[200px] truncate">
                        {getWindowMechanism(spec, language)}
                      </td>
                      <td className="py-3 px-3">
                        <span className="font-mono font-bold text-slate-800">
                          {spec.category === 'fixed'
                            ? (language === 'de' ? '0% (Panorama)' : '0% (Panoramic)')
                            : spec.id === 'casement' || spec.id === 'jalousie'
                            ? (language === 'de' ? '100% Voll' : '100% Full')
                            : (language === 'de' ? '50% Flügel' : '50% Sash')}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <span className="font-mono font-bold text-emerald-700">
                          {spec.energyEfficiency.uFactor}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <span
                          className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold ${
                            spec.id === 'awning' || spec.id === 'jalousie'
                              ? 'bg-emerald-100 text-emerald-800'
                              : spec.category === 'fixed'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {spec.id === 'awning'
                            ? (language === 'de' ? 'Exzellent (Regengeschützt)' : 'Excellent (Open in Rain)')
                            : spec.category === 'fixed'
                            ? (language === 'de' ? 'Vollständig Versiegelt' : 'Complete Sealed')
                            : (language === 'de' ? 'Standard' : 'Standard')}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-slate-600">
                        {spec.id === 'double_hung' || spec.id === 'tilt_and_turn'
                          ? (language === 'de' ? 'Einfache Innenreinigung' : 'Easy Interior Tilt')
                          : (language === 'de' ? 'Außenzugang' : 'Exterior Access')}
                      </td>
                      <td className="py-3 px-3 text-right font-mono font-bold text-slate-900">
                        {formatCurrency(spec.basePriceUSD, currency)}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => {
                            setActiveWindowModal(spec);
                            setCustomWidth(36);
                            setCustomHeight(48);
                          }}
                          className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 font-bold rounded-lg text-xs cursor-pointer transition-colors"
                        >
                          {language === 'de' ? 'Kalkulieren' : 'Quote'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* DETAIL & CUSTOMIZER MODAL */}
      {activeWindowModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-4xl w-full border border-slate-200 shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95">
            {/* Modal Header */}
            <div className="p-6 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-600/30 border border-blue-400/40 flex items-center justify-center text-blue-400">
                  <AppWindow className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold tracking-tight">{getWindowName(activeWindowModal, language)}</h2>
                  <p className="text-xs text-slate-400">
                    {language === 'de'
                      ? 'Technische Spezifikationen & Preiskalkulator in Echtzeit'
                      : 'Architectural Specifications & Live Dimension Price Estimator'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setActiveWindowModal(null)}
                className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center text-xs font-bold transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Modal Grid */}
            <div className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Column: Big SVG Diagram */}
              <div className="lg:col-span-5 bg-slate-50 p-6 rounded-2xl border border-slate-200 flex flex-col items-center justify-center space-y-4">
                <div className="w-48 h-56 flex items-center justify-center drop-shadow-md">
                  {(() => {
                    const ModalSvg =
                      WINDOW_SVG_COMPONENTS[activeWindowModal.svgKey] ||
                      WINDOW_SVG_COMPONENTS.casement;
                    return (
                      <ModalSvg
                        frameColor={frameColorMap[frameTheme]}
                        glassColor={glassColorMap[glassTheme]}
                      />
                    );
                  })()}
                </div>

                <div className="w-full text-center space-y-1">
                  <span className="text-xs font-bold text-slate-800">{getWindowName(activeWindowModal, language)}</span>
                  <p className="text-[11px] text-slate-500">{getWindowMechanism(activeWindowModal, language)}</p>
                </div>

                {/* Energy Star Pill */}
                <div className="w-full bg-white p-3 rounded-xl border border-slate-200/80 text-xs space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-slate-400">{language === 'de' ? 'Energieklasse:' : 'Energy Rating:'}</span>
                    <span className="font-bold text-emerald-600">{activeWindowModal.energyEfficiency.energyStarRating}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">{language === 'de' ? 'U-Wert (Wärmeschutz):' : 'U-Factor (Thermal):'}</span>
                    <span className="font-mono font-bold text-slate-800">{activeWindowModal.energyEfficiency.uFactor}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">{language === 'de' ? 'Schallschutzmaß:' : 'Acoustic STC:'}</span>
                    <span className="font-mono font-bold text-slate-800">{activeWindowModal.energyEfficiency.stcRating}</span>
                  </div>
                </div>
              </div>

              {/* Right Column: Customizer & Quotation Builder */}
              <div className="lg:col-span-7 space-y-5">
                {/* Description & Key Pros */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">{language === 'de' ? 'Übersicht' : 'Overview'}</h4>
                  <p className="text-xs text-slate-600 leading-relaxed">{getWindowDescription(activeWindowModal, language)}</p>
                  
                  <div className="space-y-1 pt-2">
                    {activeWindowModal.pros.map((pro, i) => (
                      <div key={i} className="flex items-start gap-2 text-xs text-slate-700">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{pro}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Interactive Customizer Controls */}
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3.5">
                  <h4 className="text-xs font-bold text-slate-800 flex items-center justify-between">
                    <span>{language === 'de' ? 'Maße & Materialien konfigurieren' : 'Configure Dimensions & Materials'}</span>
                    <span className="text-[11px] text-blue-600 font-mono">{language === 'de' ? 'Live Preiskalkulator' : 'Live Price Calculator'}</span>
                  </h4>

                  {/* Dimensions Input */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        {language === 'de' ? 'Breite (mm/Zoll):' : 'Width (Inches):'}
                      </label>
                      <input
                        type="number"
                        min="12"
                        max="144"
                        value={customWidth}
                        onChange={(e) => setCustomWidth(Number(e.target.value))}
                        className="w-full px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-mono font-bold focus:ring-2 focus:ring-blue-600 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        {language === 'de' ? 'Höhe (mm/Zoll):' : 'Height (Inches):'}
                      </label>
                      <input
                        type="number"
                        min="12"
                        max="144"
                        value={customHeight}
                        onChange={(e) => setCustomHeight(Number(e.target.value))}
                        className="w-full px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-mono font-bold focus:ring-2 focus:ring-blue-600 focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Material & Glazing Selectors */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        {language === 'de' ? 'Rahmenmaterial:' : 'Frame Material:'}
                      </label>
                      <select
                        value={customMaterial}
                        onChange={(e) => setCustomMaterial(e.target.value)}
                        className="w-full px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-medium focus:ring-2 focus:ring-blue-600 focus:outline-none"
                      >
                        {activeWindowModal.defaultMaterials.map((mat, i) => (
                          <option key={i} value={mat}>
                            {mat}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        {language === 'de' ? 'Verglasungspaket:' : 'Glazing Glass Package:'}
                      </label>
                      <select
                        value={customGlazing}
                        onChange={(e) => setCustomGlazing(e.target.value)}
                        className="w-full px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-medium focus:ring-2 focus:ring-blue-600 focus:outline-none"
                      >
                        {activeWindowModal.defaultGlazing.map((glz, i) => (
                          <option key={i} value={glz}>
                            {glz}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Quantity & Calculated Unit Price */}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-200">
                    <div className="flex items-center gap-2">
                      <label className="text-[11px] font-semibold text-slate-600">{language === 'de' ? 'Menge:' : 'Quantity:'}</label>
                      <input
                        type="number"
                        min="1"
                        max="100"
                        value={customQuantity}
                        onChange={(e) => setCustomQuantity(Math.max(1, Number(e.target.value)))}
                        className="w-16 px-2 py-1 rounded-lg border border-slate-200 bg-white text-xs font-mono font-bold text-center focus:ring-2 focus:ring-blue-600 focus:outline-none"
                      />
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 block font-medium">{language === 'de' ? 'Geschätzter Gesamtpreis' : 'Estimated Total'}</span>
                      <span className="text-lg font-bold text-emerald-600 font-mono">
                        {formatCurrency(
                          calculateConfiguredPrice(activeWindowModal.basePriceUSD) * customQuantity,
                          currency
                        )}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Modal Footer Actions */}
                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <button
                    onClick={() => {
                      const unitPrice = calculateConfiguredPrice(activeWindowModal.basePriceUSD);
                      const prod = convertWindowToProduct(activeWindowModal, unitPrice);
                      prod.name = `${getWindowName(activeWindowModal, language)} (${customWidth}"W × ${customHeight}"H) - ${customMaterial}`;
                      addProduct(prod);
                      showNotification(language === 'de' ? `Fenster ${getWindowName(activeWindowModal, language)} zum Produktkatalog hinzugefügt!` : `Added customized ${activeWindowModal.name} to product catalog!`);
                      setActiveWindowModal(null);
                    }}
                    className="flex-1 py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-md shadow-blue-200 transition-colors cursor-pointer flex items-center justify-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    <span>{language === 'de' ? 'Im Produktkatalog speichern' : 'Save to Product Catalog'}</span>
                  </button>

                  <button
                    onClick={() => {
                      setActiveWindowModal(null);
                      handleCreateInvoiceWithWindow(activeWindowModal);
                    }}
                    className="py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors cursor-pointer flex items-center justify-center gap-2"
                  >
                    <FileText className="w-4 h-4" />
                    <span>{language === 'de' ? 'Jetzt Rechnung erstellen' : 'Create Invoice Now'}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
