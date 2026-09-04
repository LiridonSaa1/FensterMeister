import { getSupabaseClient, isSupabaseConfigured } from '../lib/supabase';
import { Client, Product, Invoice, Offer, PaymentRecord, ActivityLog, BusinessProfile } from '../types';

export const testSupabaseConnection = async (): Promise<{ connected: boolean; message: string }> => {
  if (!isSupabaseConfigured()) {
    return {
      connected: false,
      message: 'Supabase URL or Anon Key is missing or invalid.',
    };
  }

  const supabase = getSupabaseClient();
  if (!supabase) {
    return { connected: false, message: 'Could not instantiate Supabase client.' };
  }

  try {
    const { error } = await supabase.from('business_profile').select('id').limit(1);
    if (error) {
      // Table might not exist yet
      if (error.code === 'PGRST301' || error.message.includes('relation') || error.message.includes('does not exist')) {
        return {
          connected: true,
          message: 'Connected to Supabase! (Note: Remember to run supabase_schema.sql in your Supabase SQL Editor)',
        };
      }
      return { connected: false, message: `Supabase returned error: ${error.message}` };
    }
    return { connected: true, message: 'Successfully connected to Supabase database!' };
  } catch (err: any) {
    return { connected: false, message: err.message || 'Connection failed.' };
  }
};

// --- CLIENTS ---
export const fetchClientsFromSupabase = async (): Promise<Client[] | null> => {
  const supabase = getSupabaseClient();
  if (!supabase) return null;

  const { data, error } = await supabase.from('clients').select('*').order('created_at', { ascending: false });
  if (error || !data) return null;

  return data.map((item) => ({
    id: item.id,
    name: item.name,
    companyName: item.company_name || undefined,
    email: item.email,
    phone: item.phone || '',
    address: item.address || '',
    city: item.city || '',
    country: item.country || '',
    vatNumber: item.vat_number || undefined,
    businessNumber: item.business_number || undefined,
    notes: item.notes || undefined,
    type: item.type || 'individual',
    avatarUrl: item.avatar_url || undefined,
    createdAt: item.created_at,
    updatedAt: item.updated_at,
  }));
};

export const saveClientToSupabase = async (client: Client): Promise<boolean> => {
  const supabase = getSupabaseClient();
  if (!supabase) return false;

  const { error } = await supabase.from('clients').upsert({
    id: client.id,
    name: client.name,
    company_name: client.companyName,
    email: client.email,
    phone: client.phone,
    address: client.address,
    city: client.city,
    country: client.country,
    vat_number: client.vatNumber,
    business_number: client.businessNumber,
    notes: client.notes,
    type: client.type,
    avatar_url: client.avatarUrl,
    updated_at: new Date().toISOString(),
  });

  return !error;
};

export const deleteClientFromSupabase = async (id: string): Promise<boolean> => {
  const supabase = getSupabaseClient();
  if (!supabase) return false;

  const { error } = await supabase.from('clients').delete().eq('id', id);
  return !error;
};

// --- PRODUCTS ---
export const fetchProductsFromSupabase = async (): Promise<Product[] | null> => {
  const supabase = getSupabaseClient();
  if (!supabase) return null;

  const { data, error } = await supabase.from('products').select('*');
  if (error || !data) return null;

  return data.map((item) => ({
    id: item.id,
    name: item.name,
    sku: item.sku || '',
    description: item.description || '',
    image: item.image || undefined,
    gallery: item.gallery || [],
    purchasePrice: Number(item.purchase_price) || 0,
    sellingPrice: Number(item.selling_price) || 0,
    wholesalePrice: item.wholesale_price ? Number(item.wholesale_price) : undefined,
    vatRate: Number(item.vat_rate) || 19,
    discount: Number(item.discount) || 0,
    unit: item.unit || 'pcs',
    stock: Number(item.stock) || 0,
    minStockAlert: item.min_stock_alert ? Number(item.min_stock_alert) : undefined,
    category: item.category || 'Windows',
    type: item.type || 'product',
    status: item.status || 'active',
    notes: item.notes || undefined,
    svgKey: item.svg_key || undefined,
    customSpecs: item.custom_specs || undefined,
    createdAt: item.created_at,
  }));
};

export const saveProductToSupabase = async (product: Product): Promise<boolean> => {
  const supabase = getSupabaseClient();
  if (!supabase) return false;

  const { error } = await supabase.from('products').upsert({
    id: product.id,
    name: product.name,
    sku: product.sku,
    description: product.description,
    image: product.image,
    gallery: product.gallery,
    purchase_price: product.purchasePrice,
    selling_price: product.sellingPrice,
    wholesale_price: product.wholesalePrice,
    vat_rate: product.vatRate,
    discount: product.discount,
    unit: product.unit,
    stock: product.stock,
    min_stock_alert: product.minStockAlert,
    category: product.category,
    type: product.type,
    status: product.status,
    notes: product.notes,
    svg_key: product.svgKey,
    custom_specs: product.customSpecs,
  });

  return !error;
};

export const deleteProductFromSupabase = async (id: string): Promise<boolean> => {
  const supabase = getSupabaseClient();
  if (!supabase) return false;

  const { error } = await supabase.from('products').delete().eq('id', id);
  return !error;
};

// --- INVOICES ---
export const fetchInvoicesFromSupabase = async (): Promise<Invoice[] | null> => {
  const supabase = getSupabaseClient();
  if (!supabase) return null;

  const { data, error } = await supabase.from('invoices').select('*').order('created_at', { ascending: false });
  if (error || !data) return null;

  return data.map((item) => ({
    id: item.id,
    number: item.number,
    prefix: item.prefix || 'INV-',
    clientId: item.client_id || '',
    clientSnapshot: item.client_snapshot,
    date: item.date,
    dueDate: item.due_date,
    items: item.items || [],
    currency: item.currency || 'EUR',
    paymentTerms: item.payment_terms || 'Net 14',
    subtotal: Number(item.subtotal) || 0,
    globalDiscount: Number(item.global_discount) || 0,
    globalDiscountType: item.global_discount_type || 'percentage',
    discountAmount: Number(item.discount_amount) || 0,
    vatTotal: Number(item.vat_total) || 0,
    shippingFee: Number(item.shipping_fee) || 0,
    additionalCharges: Number(item.additional_charges) || 0,
    additionalChargesLabel: item.additional_charges_label || undefined,
    total: Number(item.total) || 0,
    amountPaid: Number(item.amount_paid) || 0,
    amountDue: Number(item.amount_due) || 0,
    status: item.status || 'draft',
    notes: item.notes || undefined,
    paymentInstructions: item.payment_instructions || undefined,
    termsAndConditions: item.terms_and_conditions || undefined,
    customFooter: item.custom_footer || undefined,
    customerMessage: item.customer_message || undefined,
    template: item.template || 'modern',
    primaryColor: item.primary_color || '#2563eb',
    font: item.font || 'Inter',
    logoPosition: item.logo_position || 'left',
    tableStyle: item.table_style || 'clean',
    showSignature: Boolean(item.show_signature),
    signatureImage: item.signature_image || undefined,
    createdAt: item.created_at,
    updatedAt: item.updated_at || undefined,
    sentAt: item.sent_at || undefined,
    paidAt: item.paid_at || undefined,
    payments: item.payments || [],
    history: item.history || [],
  }));
};

export const saveInvoiceToSupabase = async (invoice: Invoice): Promise<boolean> => {
  const supabase = getSupabaseClient();
  if (!supabase) return false;

  const { error } = await supabase.from('invoices').upsert({
    id: invoice.id,
    number: invoice.number,
    prefix: invoice.prefix,
    client_id: invoice.clientId || null,
    client_snapshot: invoice.clientSnapshot,
    date: invoice.date,
    due_date: invoice.dueDate,
    items: invoice.items,
    currency: invoice.currency,
    payment_terms: invoice.paymentTerms,
    subtotal: invoice.subtotal,
    global_discount: invoice.globalDiscount,
    global_discount_type: invoice.globalDiscountType,
    discount_amount: invoice.discountAmount,
    vat_total: invoice.vatTotal,
    shipping_fee: invoice.shippingFee,
    additional_charges: invoice.additionalCharges,
    additional_charges_label: invoice.additionalChargesLabel,
    total: invoice.total,
    amount_paid: invoice.amountPaid,
    amount_due: invoice.amountDue,
    status: invoice.status,
    notes: invoice.notes,
    payment_instructions: invoice.paymentInstructions,
    terms_and_conditions: invoice.termsAndConditions,
    custom_footer: invoice.customFooter,
    customer_message: invoice.customerMessage,
    template: invoice.template,
    primary_color: invoice.primaryColor,
    font: invoice.font,
    logo_position: invoice.logoPosition,
    table_style: invoice.tableStyle,
    show_signature: invoice.showSignature,
    signature_image: invoice.signatureImage,
    updated_at: new Date().toISOString(),
    sent_at: invoice.sentAt,
    paid_at: invoice.paidAt,
    payments: invoice.payments,
    history: invoice.history,
  });

  return !error;
};

export const deleteInvoiceFromSupabase = async (id: string): Promise<boolean> => {
  const supabase = getSupabaseClient();
  if (!supabase) return false;

  const { error } = await supabase.from('invoices').delete().eq('id', id);
  return !error;
};

// --- OFFERS ---
export const fetchOffersFromSupabase = async (): Promise<Offer[] | null> => {
  const supabase = getSupabaseClient();
  if (!supabase) return null;

  const { data, error } = await supabase.from('offers').select('*').order('created_at', { ascending: false });
  if (error || !data) return null;

  return data.map((item) => ({
    id: item.id,
    number: item.number,
    clientId: item.client_id || '',
    clientSnapshot: item.client_snapshot,
    date: item.date,
    expiryDate: item.expiry_date,
    items: item.items || [],
    currency: item.currency || 'EUR',
    subtotal: Number(item.subtotal) || 0,
    discount: Number(item.discount) || 0,
    discountType: item.discount_type || 'percentage',
    discountAmount: Number(item.discount_amount) || 0,
    vatTotal: Number(item.vat_total) || 0,
    shippingFee: Number(item.shipping_fee) || 0,
    total: Number(item.total) || 0,
    status: item.status || 'draft',
    notes: item.notes || undefined,
    terms: item.terms || undefined,
    convertedInvoiceId: item.converted_invoice_id || undefined,
    convertedAt: item.converted_at || undefined,
    template: item.template || 'modern',
    primaryColor: item.primary_color || '#2563eb',
    createdAt: item.created_at,
    updatedAt: item.updated_at || undefined,
  }));
};

export const saveOfferToSupabase = async (offer: Offer): Promise<boolean> => {
  const supabase = getSupabaseClient();
  if (!supabase) return false;

  const { error } = await supabase.from('offers').upsert({
    id: offer.id,
    number: offer.number,
    client_id: offer.clientId || null,
    client_snapshot: offer.clientSnapshot,
    date: offer.date,
    expiry_date: offer.expiryDate,
    items: offer.items,
    currency: offer.currency,
    subtotal: offer.subtotal,
    discount: offer.discount,
    discount_type: offer.discountType,
    discount_amount: offer.discountAmount,
    vat_total: offer.vatTotal,
    shipping_fee: offer.shippingFee,
    total: offer.total,
    status: offer.status,
    notes: offer.notes,
    terms: offer.terms,
    converted_invoice_id: offer.convertedInvoiceId,
    converted_at: offer.convertedAt,
    template: offer.template,
    primary_color: offer.primaryColor,
    updated_at: new Date().toISOString(),
  });

  return !error;
};

export const deleteOfferFromSupabase = async (id: string): Promise<boolean> => {
  const supabase = getSupabaseClient();
  if (!supabase) return false;

  const { error } = await supabase.from('offers').delete().eq('id', id);
  return !error;
};

// --- PAYMENTS ---
export const fetchPaymentsFromSupabase = async (): Promise<PaymentRecord[] | null> => {
  const supabase = getSupabaseClient();
  if (!supabase) return null;

  const { data, error } = await supabase.from('payments').select('*').order('created_at', { ascending: false });
  if (error || !data) return null;

  return data.map((item) => ({
    id: item.id,
    invoiceId: item.invoice_id,
    invoiceNumber: item.invoice_number,
    clientId: item.client_id || '',
    clientName: item.client_name,
    amount: Number(item.amount) || 0,
    date: item.date,
    method: item.method || 'bank_transfer',
    reference: item.reference || undefined,
    notes: item.notes || undefined,
    createdAt: item.created_at,
  }));
};

export const savePaymentToSupabase = async (payment: PaymentRecord): Promise<boolean> => {
  const supabase = getSupabaseClient();
  if (!supabase) return false;

  const { error } = await supabase.from('payments').upsert({
    id: payment.id,
    invoice_id: payment.invoiceId,
    invoice_number: payment.invoiceNumber,
    client_id: payment.clientId,
    client_name: payment.clientName,
    amount: payment.amount,
    date: payment.date,
    method: payment.method,
    reference: payment.reference,
    notes: payment.notes,
  });

  return !error;
};

// --- BUSINESS PROFILE ---
export const fetchBusinessProfileFromSupabase = async (): Promise<BusinessProfile | null> => {
  const supabase = getSupabaseClient();
  if (!supabase) return null;

  const { data, error } = await supabase.from('business_profile').select('data').eq('id', 'default').maybeSingle();
  if (error || !data) return null;

  return data.data as BusinessProfile;
};

export const saveBusinessProfileToSupabase = async (profile: BusinessProfile): Promise<boolean> => {
  const supabase = getSupabaseClient();
  if (!supabase) return false;

  const { error } = await supabase.from('business_profile').upsert({
    id: 'default',
    data: profile,
    updated_at: new Date().toISOString(),
  });

  return !error;
};
