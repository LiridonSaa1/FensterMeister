import {
  BusinessProfile,
  Client,
  Product,
  Invoice,
  Offer,
  PaymentRecord,
  EmailTemplate,
  EmailLog,
  ActivityLog,
} from '../types';
import { HOUSE_WINDOW_TYPES, convertWindowToProduct } from './houseWindowsData';

export const initialBusinessProfile: BusinessProfile = {
  businessName: 'FensterMeister GmbH',
  logo: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=300&q=80',
  businessAddress: 'Hauptstraße 100',
  city: 'Berlin, 10115',
  country: 'Germany',
  phone: '+49 30 12345678',
  email: 'info@fenstermeister.de',
  website: 'https://fenstermeister.de',
  businessRegistrationNumber: 'HRB-9843210',
  vatNumber: 'DE849302194',
  bankName: 'Deutsche Bank',
  iban: 'DE89370400440532013000',
  swiftBic: 'DEUTDEDBBER',
  defaultCurrency: 'EUR',
  defaultVatRate: 19,
  invoicePrefix: 'INV-2026-',
  nextInvoiceNumber: 1001,
  offerPrefix: 'OFF-2026-',
  nextOfferNumber: 1001,
  paymentTerms: 'Net 14 Days',
  defaultInvoiceNotes: 'Vielen Dank für Ihren Auftrag! Bitte geben Sie bei der Überweisung die Rechnungsnummer an.',
  defaultInvoiceFooter: 'FensterMeister GmbH • HRB 9843210 Berlin • info@fenstermeister.de',
  defaultTermsAndConditions: 'Zahlbar innerhalb von 14 Tagen nach Rechnungsstellung ohne Abzug. Die Ware bleibt bis zur vollständigen Bezahlung unser Eigentum.',
  defaultPaymentInstructions: 'Bankverbindung: Deutsche Bank | IBAN: DE89370400440532013000 | BIC: DEUTDEDBBER',
  signature: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="60" viewBox="0 0 200 60"><path d="M 20 40 Q 50 10 70 35 T 120 25 T 160 40 T 190 30" fill="none" stroke="%231e293b" stroke-width="2.5" stroke-linecap="round"/></svg>',
  signatureName: 'Liridon Saa',
  signatureTitle: 'Geschäftsführer / CEO',
  invoiceColors: '#2563eb', // Modern Royal Blue
  invoiceTemplate: 'modern',
  font: 'Inter',
  logoPosition: 'left',
  tableStyle: 'clean',
};

export const initialClients: Client[] = [];

export const initialProducts: Product[] = [
  {
    id: 'prod-001',
    name: 'Window Installation & Fitting',
    sku: 'SRV-WIN-INSTALL',
    description: 'Complete professional installation, weatherproofing, thermal sealing, perimeter foaming and alignment of house windows.',
    purchasePrice: 150,
    sellingPrice: 450,
    vatRate: 19,
    discount: 0,
    unit: 'service',
    stock: 999,
    category: 'Services',
    type: 'service',
    status: 'active',
    notes: 'Billed per window unit installed.',
    image: 'https://images.unsplash.com/photo-1503708998063-fb28b6dce510?auto=format&fit=crop&w=400&q=80',
    createdAt: '2026-01-05T10:00:00.000Z',
  },
  {
    id: 'prod-002',
    name: 'Triple Glazing Upgrade',
    sku: 'OPT-GLZ-TRIPLE',
    description: 'Argon-filled low-E triple pane glass unit for high acoustic and thermal insulation.',
    purchasePrice: 85,
    sellingPrice: 220,
    vatRate: 19,
    discount: 0,
    unit: 'sqm',
    stock: 500,
    category: 'Upgrades',
    type: 'product',
    status: 'active',
    image: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=400&q=80',
    createdAt: '2026-01-05T10:00:00.000Z',
  },
  // All 30 Architectural House Window Types loaded as first-class Products
  ...HOUSE_WINDOW_TYPES.map((spec) => convertWindowToProduct(spec)),
];

export const initialInvoices: Invoice[] = [];

export const initialOffers: Offer[] = [];

export const initialEmailTemplates: EmailTemplate[] = [
  {
    id: 'tpl-1',
    key: 'invoice_created',
    name: 'Invoice Created / Prepared',
    subject: 'New Invoice #{invoice_number} from {business_name}',
    body: `Dear {client_name},

We have created Invoice #{invoice_number} totaling {total} for your review.

Invoice Details:
• Invoice Number: #{invoice_number}
• Issue Date: {issue_date}
• Due Date: {due_date}
• Amount Due: {amount_due}

A copy of your invoice is attached to this email as a PDF. Please remit payment by the due date.

Best regards,
{business_name} Billing Team`,
    description: 'Sent when an invoice is initially prepared or generated.',
  },
  {
    id: 'tpl-2',
    key: 'invoice_sent',
    name: 'Invoice Sent (Standard Delivery)',
    subject: 'Invoice #{invoice_number} from {business_name} - Due {due_date}',
    body: `Hello {client_name},

Please find attached Invoice #{invoice_number} for {total}.

Summary of charges:
• Invoice: #{invoice_number}
• Total Amount: {total}
• Due Date: {due_date}

You can review the attached PDF for complete itemization and bank wire instructions.

Thank you for your business!
{business_name}`,
    description: 'Standard email template sent when delivering an invoice to a client.',
  },
  {
    id: 'tpl-3',
    key: 'payment_reminder',
    name: 'Payment Reminder (Approaching Due Date)',
    subject: 'Friendly Reminder: Invoice #{invoice_number} is due soon',
    body: `Hi {client_name},

This is a friendly reminder that Invoice #{invoice_number} in the amount of {amount_due} is scheduled for payment on {due_date}.

If you have already processed this payment, please disregard this notice. Otherwise, please find the invoice PDF attached for your convenience.

Thank you,
{business_name}`,
    description: 'Sent 3-5 days before an invoice reaches its due date.',
  },
  {
    id: 'tpl-4',
    key: 'invoice_overdue',
    name: 'Invoice Overdue Notice',
    subject: 'URGENT: Invoice #{invoice_number} is Overdue',
    body: `Dear {client_name},

Our records indicate that Invoice #{invoice_number} for {amount_due}, which was due on {due_date}, remains unpaid.

Please arrange payment as soon as possible to keep your account current and avoid service disruptions.

If there are any questions regarding this invoice, please reach out to {business_email}.

Sincerely,
Finance Department
{business_name}`,
    description: 'Sent when an invoice passes its due date without full payment.',
  },
  {
    id: 'tpl-5',
    key: 'payment_received',
    name: 'Payment Confirmation & Receipt',
    subject: 'Payment Received: Thank you! (Invoice #{invoice_number})',
    body: `Dear {client_name},

We have received your payment of {payment_amount} for Invoice #{invoice_number}.

• Remaining Balance: {amount_due}
• Payment Status: {status}

Thank you for your prompt payment! We truly appreciate doing business with you.

Warm regards,
{business_name}`,
    description: 'Sent immediately when a payment is logged against an invoice.',
  },
  {
    id: 'tpl-6',
    key: 'offer_sent',
    name: 'Quotation / Offer Sent',
    subject: 'Business Proposal & Quotation #{offer_number} from {business_name}',
    body: `Hello {client_name},

We are excited to share our official proposal and quotation #{offer_number} for your upcoming project.

• Offer Number: #{offer_number}
• Total Estimate: {total}
• Valid Until: {expiry_date}

Please find the detailed offer document attached. Feel free to contact us with any questions or revisions.

Best regards,
{business_name}`,
    description: 'Sent when sending an offer/quote to a prospective client.',
  },
  {
    id: 'tpl-7',
    key: 'offer_accepted',
    name: 'Offer Accepted Confirmation',
    subject: 'Confirmation: Proposal #{offer_number} Accepted',
    body: `Dear {client_name},

Thank you for accepting Offer #{offer_number}! We are thrilled to start working together on this project.

We will generate your onboarding paperwork and initial milestone invoice shortly.

Best regards,
{business_name}`,
    description: 'Sent to acknowledge that an offer has been accepted.',
  },
];

export const initialEmailLogs: EmailLog[] = [];

export const initialPayments: PaymentRecord[] = [];
