import React, { useState } from 'react';
import {
  AppWindow,
  Search,
  CheckCircle2,
  Plus,
  Sliders,
  Wind,
  Zap,
  X,
} from 'lucide-react';
import {
  HOUSE_WINDOW_TYPES,
  HouseWindowSpec,
  convertWindowToInvoiceItem,
} from '../../data/houseWindowsData';
import { WINDOW_SVG_COMPONENTS } from './WindowSvgIcons';
import { InvoiceItem } from '../../types';
import { formatCurrency } from '../../utils/formatters';

interface WindowSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectItem: (item: InvoiceItem) => void;
  currency?: string;
  defaultVatRate?: number;
}

export const WindowSelectorModal: React.FC<WindowSelectorModalProps> = ({
  isOpen,
  onClose,
  onSelectItem,
  currency = 'USD',
  defaultVatRate = 20,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpec, setSelectedSpec] = useState<HouseWindowSpec>(HOUSE_WINDOW_TYPES[0]);
  const [widthInches, setWidthInches] = useState<number>(36);
  const [heightInches, setHeightInches] = useState<number>(48);
  const [quantity, setQuantity] = useState<number>(1);
  const [selectedMaterial, setSelectedMaterial] = useState<string>(
    HOUSE_WINDOW_TYPES[0].defaultMaterials[0]
  );
  const [selectedGlazing, setSelectedGlazing] = useState<string>(
    HOUSE_WINDOW_TYPES[0].defaultGlazing[0]
  );

  if (!isOpen) return null;

  const filteredWindows = HOUSE_WINDOW_TYPES.filter(
    (w) =>
      w.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      w.openingMechanism.toLowerCase().includes(searchQuery.toLowerCase()) ||
      w.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const calculateCustomPrice = (spec: HouseWindowSpec) => {
    let price = spec.basePriceUSD;
    const baseArea = 36 * 48;
    const currentArea = widthInches * heightInches;
    const areaMultiplier = Math.max(0.75, Math.min(2.5, currentArea / baseArea));
    price = price * areaMultiplier;

    if (selectedMaterial.includes('Wood') || selectedMaterial.includes('Timber')) {
      price *= 1.45;
    } else if (selectedMaterial.includes('Aluminum')) {
      price *= 1.3;
    } else if (selectedMaterial.includes('Fiberglass')) {
      price *= 1.35;
    }

    if (selectedGlazing.includes('Triple')) {
      price += 140;
    } else if (selectedGlazing.includes('Acoustic')) {
      price += 110;
    }

    return Math.round(price);
  };

  const handleSelectWindowType = (spec: HouseWindowSpec) => {
    setSelectedSpec(spec);
    setSelectedMaterial(spec.defaultMaterials[0]);
    setSelectedGlazing(spec.defaultGlazing[0]);
  };

  const handleInsertLineItem = () => {
    const unitPrice = calculateCustomPrice(selectedSpec);
    const lineItem = convertWindowToInvoiceItem(selectedSpec, {
      quantity,
      material: selectedMaterial,
      glazing: selectedGlazing,
      widthInches,
      heightInches,
      customUnitPrice: unitPrice,
      vatRate: defaultVatRate,
    });

    onSelectItem(lineItem);
    onClose();
  };

  const SelectedSvg =
    WINDOW_SVG_COMPONENTS[selectedSpec.svgKey] || WINDOW_SVG_COMPONENTS.casement;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-4xl w-full border border-slate-200 shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="p-5 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600/30 border border-blue-400/40 flex items-center justify-center text-blue-400">
              <AppWindow className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold">House Window Architectural Catalog</h3>
              <p className="text-xs text-slate-400">Select any residential window style to configure and add to your line items</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center text-xs font-bold transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Layout */}
        <div className="grid grid-cols-1 md:grid-cols-12 max-h-[75vh]">
          {/* Left Column: Window Type List */}
          <div className="md:col-span-5 p-4 border-r border-slate-200 flex flex-col space-y-3 overflow-y-auto max-h-[75vh]">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search window styles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-slate-200 text-xs bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            <div className="space-y-1.5 overflow-y-auto flex-1 pr-1">
              {filteredWindows.map((spec) => {
                const ItemSvg = WINDOW_SVG_COMPONENTS[spec.svgKey] || WINDOW_SVG_COMPONENTS.casement;
                const isSelected = selectedSpec.id === spec.id;

                return (
                  <button
                    key={spec.id}
                    onClick={() => handleSelectWindowType(spec)}
                    className={`w-full p-2.5 rounded-xl border text-left flex items-center gap-3 transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-blue-50 border-blue-300 shadow-xs'
                        : 'bg-white hover:bg-slate-50 border-slate-200/80'
                    }`}
                  >
                    <div className="w-9 h-9 shrink-0 bg-slate-100 rounded-lg p-0.5 border border-slate-200 flex items-center justify-center">
                      <ItemSvg frameColor="#334155" glassColor="#E0F2FE" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className={`text-xs font-bold truncate ${isSelected ? 'text-blue-700' : 'text-slate-800'}`}>
                          {spec.name}
                        </span>
                        <span className="text-[11px] font-mono font-bold text-slate-900 shrink-0 ml-1">
                          {formatCurrency(spec.basePriceUSD, currency)}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400 block truncate">
                        {spec.openingMechanism}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Column: Customizer & Preview */}
          <div className="md:col-span-7 p-6 flex flex-col justify-between space-y-5 overflow-y-auto max-h-[75vh]">
            <div className="space-y-4">
              {/* Top Banner with SVG */}
              <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div className="w-20 h-24 shrink-0 flex items-center justify-center">
                  <SelectedSvg frameColor="#334155" glassColor="#E0F2FE" />
                </div>
                <div className="space-y-1">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-700 uppercase">
                    {selectedSpec.category}
                  </span>
                  <h4 className="text-sm font-bold text-slate-900">{selectedSpec.name}</h4>
                  <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">
                    {selectedSpec.description}
                  </p>
                </div>
              </div>

              {/* Dimension Settings */}
              <div className="grid grid-cols-2 gap-3 bg-slate-50/50 p-3.5 rounded-xl border border-slate-200">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Width (Inches):
                  </label>
                  <input
                    type="number"
                    min="12"
                    max="144"
                    value={widthInches}
                    onChange={(e) => setWidthInches(Number(e.target.value))}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-mono font-bold focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Height (Inches):
                  </label>
                  <input
                    type="number"
                    min="12"
                    max="144"
                    value={heightInches}
                    onChange={(e) => setHeightInches(Number(e.target.value))}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-mono font-bold focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                </div>
              </div>

              {/* Material & Glazing */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Frame Material:
                  </label>
                  <select
                    value={selectedMaterial}
                    onChange={(e) => setSelectedMaterial(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  >
                    {selectedSpec.defaultMaterials.map((m, i) => (
                      <option key={i} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Glazing Package:
                  </label>
                  <select
                    value={selectedGlazing}
                    onChange={(e) => setSelectedGlazing(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  >
                    {selectedSpec.defaultGlazing.map((g, i) => (
                      <option key={i} value={g}>
                        {g}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Quantity */}
              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center gap-2">
                  <label className="text-xs font-semibold text-slate-700">Quantity:</label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))}
                    className="w-16 px-2 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-mono font-bold text-center focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                </div>

                <div className="text-right">
                  <span className="text-[10px] text-slate-400 block font-medium">Unit Price:</span>
                  <span className="text-base font-bold text-slate-900 font-mono">
                    {formatCurrency(calculateCustomPrice(selectedSpec), currency)}
                  </span>
                </div>
              </div>
            </div>

            {/* Total & Insert Button */}
            <div className="pt-4 border-t border-slate-200 flex items-center justify-between gap-4">
              <div>
                <span className="text-[10px] text-slate-400 block font-medium">Line Total:</span>
                <span className="text-lg font-bold text-emerald-600 font-mono">
                  {formatCurrency(calculateCustomPrice(selectedSpec) * quantity, currency)}
                </span>
              </div>

              <button
                onClick={handleInsertLineItem}
                className="py-2.5 px-5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-md shadow-blue-200 transition-colors cursor-pointer flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                <span>Insert Into Line Items</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
