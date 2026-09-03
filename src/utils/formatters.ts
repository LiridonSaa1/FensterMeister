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
