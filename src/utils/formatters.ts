import Papa from 'papaparse';
import { Client, InvoiceItem, DiscountType } from '../types';

export const formatCurrency = (
  amount: number,
  currencyCode: string = 'USD',
  locale: string = 'en-US'
): string => {
  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currencyCode || 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount || 0);
  } catch {
    return `${currencyCode} ${(amount || 0).toFixed(2)}`;
  }
};

export const formatDate = (dateString: string | undefined): string => {
  if (!dateString) return '';
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return dateString;
  }
};

export const formatDateTime = (dateString: string | undefined): string => {
  if (!dateString) return '';
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return d.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return dateString;
  }
};

export interface InvoiceCalculations {
  subtotal: number;
  itemDiscountsTotal: number;
  globalDiscountAmount: number;
  totalDiscount: number;
  taxableAmount: number;
  vatTotal: number;
  shippingFee: number;
  additionalCharges: number;
  grandTotal: number;
}

export const calculateItemTotal = (item: InvoiceItem): number => {
  const base = item.quantity * item.unitPrice;
  let discountVal = 0;
  if (item.discount > 0) {
    if (item.discountType === 'percentage') {
      discountVal = base * (item.discount / 100);
    } else {
      discountVal = item.discount;
    }
  }
  const afterDiscount = Math.max(0, base - discountVal);
  return afterDiscount;
};

export const calculateInvoiceTotals = (
  items: InvoiceItem[],
  globalDiscount: number = 0,
  globalDiscountType: DiscountType = 'percentage',
  shippingFee: number = 0,
  additionalCharges: number = 0
): InvoiceCalculations => {
  let subtotal = 0;
  let itemDiscountsTotal = 0;
  let vatTotal = 0;

  items.forEach((item) => {
    const itemBase = item.quantity * item.unitPrice;
    let itemDisc = 0;
    if (item.discount > 0) {
      if (item.discountType === 'percentage') {
        itemDisc = itemBase * (item.discount / 100);
      } else {
        itemDisc = item.discount;
      }
    }
    const itemNet = Math.max(0, itemBase - itemDisc);
    subtotal += itemBase;
    itemDiscountsTotal += itemDisc;

    if (item.vatRate > 0) {
      vatTotal += itemNet * (item.vatRate / 100);
    }
  });

  const netAfterItemDiscounts = Math.max(0, subtotal - itemDiscountsTotal);
  
  let globalDiscountAmount = 0;
  if (globalDiscount > 0) {
    if (globalDiscountType === 'percentage') {
      globalDiscountAmount = netAfterItemDiscounts * (globalDiscount / 100);
    } else {
      globalDiscountAmount = globalDiscount;
    }
  }

  const taxableAmount = Math.max(0, netAfterItemDiscounts - globalDiscountAmount);
  const grandTotal = taxableAmount + vatTotal + (shippingFee || 0) + (additionalCharges || 0);

  return {
    subtotal,
    itemDiscountsTotal,
    globalDiscountAmount,
    totalDiscount: itemDiscountsTotal + globalDiscountAmount,
    taxableAmount,
    vatTotal,
    shippingFee: shippingFee || 0,
    additionalCharges: additionalCharges || 0,
    grandTotal,
  };
};

export const exportClientsToCSV = (clients: Client[]) => {
  const data = clients.map((c) => ({
    Name: c.name,
    Company: c.companyName || '',
    Email: c.email,
    Phone: c.phone,
    Type: c.type,
    Address: c.address,
    City: c.city,
    Country: c.country,
    'VAT Number': c.vatNumber || '',
    'Business Registration': c.businessNumber || '',
    Notes: c.notes || '',
    'Created At': c.createdAt,
  }));

  const csv = Papa.unparse(data);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `clients_export_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const DEFAULT_WINDOW_IMAGES: Record<string, string> = {
  casement: 'https://images.unsplash.com/photo-1503708998063-fb28b6dce510?auto=format&fit=crop&w=400&q=80',
  double_hung: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=400&q=80',
  single_hung: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=400&q=80',
  sliding: 'https://images.unsplash.com/photo-1600565193348-f74bd3c7ccdf?auto=format&fit=crop&w=400&q=80',
  bay: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=400&q=80',
  bow: 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=400&q=80',
  awning: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=400&q=80',
  hopper: 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=400&q=80',
  picture: 'https://images.unsplash.com/photo-1600573472591-ee6b68d14c68?auto=format&fit=crop&w=400&q=80',
  arch_top: 'https://images.unsplash.com/photo-1600585152220-90363fe7e115?auto=format&fit=crop&w=400&q=80',
  tilt_turn: 'https://images.unsplash.com/photo-1503708998063-fb28b6dce510?auto=format&fit=crop&w=400&q=80',
  roof_skylight: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=400&q=80',
  louvered: 'https://images.unsplash.com/photo-1600565193348-f74bd3c7ccdf?auto=format&fit=crop&w=400&q=80',
  transom: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=400&q=80',
  garden: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=400&q=80',
  french_casement: 'https://images.unsplash.com/photo-1503708998063-fb28b6dce510?auto=format&fit=crop&w=400&q=80',
  dormer: 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=400&q=80',
  bifold: 'https://images.unsplash.com/photo-1600565193348-f74bd3c7ccdf?auto=format&fit=crop&w=400&q=80',
  pivot: 'https://images.unsplash.com/photo-1503708998063-fb28b6dce510?auto=format&fit=crop&w=400&q=80',
  installation: 'https://images.unsplash.com/photo-1503708998063-fb28b6dce510?auto=format&fit=crop&w=400&q=80',
  default: 'https://images.unsplash.com/photo-1503708998063-fb28b6dce510?auto=format&fit=crop&w=400&q=80',
};

export const getLineItemImage = (item: Partial<InvoiceItem>): string => {
  if (item.image && item.image.trim().length > 0) {
    return item.image;
  }
  const nameLower = (item.name || '').toLowerCase();
  if (nameLower.includes('skylight') || nameLower.includes('roof')) return DEFAULT_WINDOW_IMAGES.roof_skylight;
  if (nameLower.includes('casement')) return DEFAULT_WINDOW_IMAGES.casement;
  if (nameLower.includes('double-hung') || nameLower.includes('double hung')) return DEFAULT_WINDOW_IMAGES.double_hung;
  if (nameLower.includes('single-hung') || nameLower.includes('single hung')) return DEFAULT_WINDOW_IMAGES.single_hung;
  if (nameLower.includes('sliding') || nameLower.includes('glider')) return DEFAULT_WINDOW_IMAGES.sliding;
  if (nameLower.includes('bay')) return DEFAULT_WINDOW_IMAGES.bay;
  if (nameLower.includes('bow')) return DEFAULT_WINDOW_IMAGES.bow;
  if (nameLower.includes('awning')) return DEFAULT_WINDOW_IMAGES.awning;
  if (nameLower.includes('picture')) return DEFAULT_WINDOW_IMAGES.picture;
  if (nameLower.includes('arch')) return DEFAULT_WINDOW_IMAGES.arch_top;
  if (nameLower.includes('tilt')) return DEFAULT_WINDOW_IMAGES.tilt_turn;
  if (nameLower.includes('garden')) return DEFAULT_WINDOW_IMAGES.garden;
  if (nameLower.includes('french')) return DEFAULT_WINDOW_IMAGES.french_casement;
  if (nameLower.includes('dormer')) return DEFAULT_WINDOW_IMAGES.dormer;
  if (nameLower.includes('bifold') || nameLower.includes('folding')) return DEFAULT_WINDOW_IMAGES.bifold;
  if (nameLower.includes('pivot')) return DEFAULT_WINDOW_IMAGES.pivot;
  if (nameLower.includes('installation') || nameLower.includes('montage') || nameLower.includes('fitting') || nameLower.includes('service')) return DEFAULT_WINDOW_IMAGES.installation;
  
  return DEFAULT_WINDOW_IMAGES.default;
};
