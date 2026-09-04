export type ClientType = 'individual' | 'business';

export interface Client {
  id: string;
  name: string;
  companyName?: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  country: string;
  vatNumber?: string;
  businessNumber?: string;
  notes?: string;
  type: ClientType;
  avatarUrl?: string;
  createdAt: string;
  updatedAt?: string;
}

export type ProductType = 'product' | 'service';
export type ProductStatus = 'active' | 'archived';

export interface Product {
  id: string;
  name: string;
  sku: string;
  description: string;
  image?: string;
  gallery?: string[];
  purchasePrice: number;
  sellingPrice: number;
  wholesalePrice?: number;
  vatRate: number; // percentage, e.g., 20 for 20%
  discount: number; // default discount
  unit: string; // 'pcs', 'hours', 'days', 'month', 'unit', 'service', 'license', etc.
  stock: number;
  minStockAlert?: number;
  category: string;
  type: ProductType;
  status: ProductStatus;
  notes?: string;
  svgKey?: string;
  customSpecs?: Record<string, string>;
  createdAt: string;
}

export type DiscountType = 'percentage' | 'fixed';

export interface InvoiceItem {
  id: string;
  productId?: string;
  type: 'product' | 'service' | 'custom';
  name: string;
  description?: string;
  sku?: string;
  image?: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  discount: number;
  discountType: DiscountType;
  vatRate: number;
  total: number;
}

export type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'unpaid' | 'overdue' | 'cancelled';

export type InvoiceTemplate = 'modern' | 'minimal' | 'professional' | 'corporate' | 'elegant';

export type LogoPosition = 'left' | 'center' | 'right';
export type TableStyle = 'clean' | 'striped' | 'bordered' | 'minimal';

export interface PaymentRecord {
  id: string;
  invoiceId: string;
  invoiceNumber: string;
  clientId: string;
  clientName: string;
  amount: number;
  date: string;
  method: 'bank_transfer' | 'credit_card' | 'cash' | 'paypal' | 'stripe' | 'other';
  reference?: string;
  notes?: string;
  createdAt: string;
}

export interface ActivityLog {
  id: string;
  type: 'invoice_created' | 'invoice_sent' | 'invoice_paid' | 'invoice_updated' | 'payment_received' | 'offer_created' | 'offer_sent' | 'offer_accepted' | 'offer_converted' | 'client_added' | 'client_updated' | 'product_added' | 'email_sent';
  title: string;
  description: string;
  timestamp: string;
  entityId?: string;
  entityType?: 'invoice' | 'offer' | 'client' | 'product' | 'payment';
  amount?: number;
}

export interface Invoice {
  id: string;
  number: string;
  prefix: string;
  clientId: string;
  clientSnapshot: Client;
  date: string; // YYYY-MM-DD
  dueDate: string; // YYYY-MM-DD
  items: InvoiceItem[];
  currency: string;
  paymentTerms: string; // e.g. "Net 15", "Net 30", "Due upon receipt"
  
  // Financial totals
  subtotal: number;
  globalDiscount: number;
  globalDiscountType: DiscountType;
  discountAmount: number;
  vatTotal: number;
  shippingFee: number;
  additionalCharges: number;
  additionalChargesLabel?: string;
  total: number;
  amountPaid: number;
  amountDue: number;
  
  status: InvoiceStatus;
  
  // Notes and messages
  notes?: string;
  paymentInstructions?: string;
  termsAndConditions?: string;
  customFooter?: string;
  customerMessage?: string;

  // Visual Customization overrides (or inherited from business settings)
  template: InvoiceTemplate;
  primaryColor: string;
  font: string; // 'Plus Jakarta Sans' | 'Cinzel' | 'Playfair Display' | 'Outfit' | 'Inter' | 'IBM Plex Mono'
  logoPosition: LogoPosition;
  tableStyle: TableStyle;
  showSignature: boolean;
  signatureImage?: string;

  createdAt: string;
  updatedAt?: string;
  sentAt?: string;
  paidAt?: string;
  
  payments: PaymentRecord[];
  history: ActivityLog[];
}

export type OfferStatus = 'draft' | 'sent' | 'viewed' | 'accepted' | 'rejected' | 'expired' | 'converted';

export interface Offer {
  id: string;
  number: string;
  clientId: string;
  clientSnapshot: Client;
  date: string;
  expiryDate: string;
  items: InvoiceItem[];
  currency: string;
  
  subtotal: number;
  discount: number;
  discountType: DiscountType;
  discountAmount: number;
  vatTotal: number;
  shippingFee: number;
  total: number;
  
  status: OfferStatus;
  notes?: string;
  terms?: string;
  termsAndConditions?: string;
  
  convertedInvoiceId?: string;
  convertedAt?: string;
  
  template?: InvoiceTemplate;
  primaryColor?: string;
  font?: string;
  logoPosition?: LogoPosition;
  tableStyle?: TableStyle;
  
  createdAt: string;
  updatedAt?: string;
}

export interface BusinessProfile {
  businessName: string;
  logo: string;
  businessAddress: string;
  city: string;
  country: string;
  phone: string;
  email: string;
  website: string;
  businessRegistrationNumber: string;
  vatNumber: string;
  bankName: string;
  iban: string;
  swiftBic: string;
  defaultCurrency: string;
  defaultVatRate: number;
  invoicePrefix: string;
  nextInvoiceNumber: number;
  offerPrefix: string;
  nextOfferNumber: number;
  paymentTerms: string;
  defaultInvoiceNotes: string;
  defaultInvoiceFooter: string;
  defaultTermsAndConditions: string;
  defaultPaymentInstructions: string;
  signature: string;
  signatureName: string;
  signatureTitle: string;
  
  // Design defaults
  invoiceColors: string; // Hex code
  invoiceTemplate: InvoiceTemplate;
  font: string;
  logoPosition: LogoPosition;
  tableStyle: TableStyle;

  postalCode?: string;
  defaultDueDays?: number;
  latePaymentFeePercent?: number;
  language?: 'en' | 'de';

  // Brevo Email Integration Settings
  brevoEnabled?: boolean;
  brevoApiKey?: string;
  brevoSenderEmail?: string;
  brevoSenderName?: string;
  brevoReplyTo?: string;
}

export interface BrevoAccountInfo {
  email?: string;
  firstName?: string;
  lastName?: string;
  companyName?: string;
  plan?: string;
  credits?: number;
  verified?: boolean;
}

export type EmailTemplateKey = 
  | 'invoice_created'
  | 'invoice_sent'
  | 'payment_reminder'
  | 'invoice_overdue'
  | 'payment_received'
  | 'offer_sent'
  | 'offer_accepted'
  | 'custom_notice';

export interface EmailTemplate {
  id: string;
  key: EmailTemplateKey;
  name: string;
  subject: string;
  body: string;
  description: string;
}

export interface EmailLog {
  id: string;
  entityId: string; // invoice or offer id
  entityNumber: string;
  entityType: 'invoice' | 'offer';
  recipient: string;
  recipientName: string;
  subject: string;
  message: string;
  htmlContent?: string;
  templateKey: EmailTemplateKey;
  sentAt: string;
  status: 'sent' | 'delivered' | 'failed';
  attachments: string[]; // filenames
  provider?: 'brevo' | 'smtp' | 'simulation';
  brevoMessageId?: string;
  deliveryError?: string;
}

export type NavigationTab = 
  | 'dashboard'
  | 'invoices'
  | 'invoice_create'
  | 'invoice_edit'
  | 'invoice_view'
  | 'clients'
  | 'client_detail'
  | 'products'
  | 'windows'
  | 'offers'
  | 'offer_create'
  | 'offer_edit'
  | 'payments'
  | 'settings'
  | 'email_history';
