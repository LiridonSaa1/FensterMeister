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
  paymentTerms: 'Zahlbar innerhalb von 14 Tagen',
  defaultInvoiceNotes: 'Vielen Dank für Ihren Auftrag! Bitte geben Sie bei der Überweisung die Rechnungsnummer an.',
  defaultInvoiceFooter: 'FensterMeister GmbH • HRB 9843210 Berlin • info@fenstermeister.de',
  defaultTermsAndConditions: 'Zahlbar innerhalb von 14 Tagen nach Rechnungsstellung ohne Abzug. Die Ware bleibt bis zur vollständigen Bezahlung unser Eigentum.',
  defaultPaymentInstructions: 'Bankverbindung: Deutsche Bank | IBAN: DE89370400440532013000 | BIC: DEUTDEDBBER',
  signature: '',
  signatureName: 'Liridon Saa',
  signatureTitle: 'Geschäftsführer / CEO',
  invoiceColors: '#2563eb', // Modern Royal Blue
  invoiceTemplate: 'modern',
  font: 'Inter',
  logoPosition: 'left',
  tableStyle: 'clean',
  language: 'de',
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
    name: 'Rechnung erstellt / vorbereitet',
    subject: 'Neue Rechnung #{invoice_number} von {business_name}',
    body: `Sehr geehrte(r) {client_name},

wir haben die Rechnung #{invoice_number} über {total} für Sie vorbereitet.

Rechnungsdetails:
• Rechnungsnummer: #{invoice_number}
• Ausstellungsdatum: {issue_date}
• Fälligkeitsdatum: {due_date}
• Offener Betrag: {amount_due}

Anbei erhalten Sie Ihre Rechnung als PDF-Dokument. Bitte begleichen Sie den Betrag bis zum Fälligkeitsdatum.

Mit freundlichen Grüßen,
{business_name}`,
    description: 'Wird gesendet, wenn eine Rechnung erstellt oder vorbereitet wird.',
  },
  {
    id: 'tpl-2',
    key: 'invoice_sent',
    name: 'Rechnung gesendet (Standard)',
    subject: 'Rechnung #{invoice_number} von {business_name}',
    body: `Sehr geehrte(r) {client_name},

anbei übersenden wir Ihnen Ihre Rechnung #{invoice_number} über {total}.

• Rechnungsnummer: #{invoice_number}
• Offener Betrag: {amount_due}
• Fälligkeitsdatum: {due_date}

Vielen Dank für Ihren Auftrag!

Mit freundlichen Grüßen,
{business_name}`,
    description: 'Standard-E-Mail-Vorlage beim Versenden einer Rechnung an den Kunden.',
  },
  {
    id: 'tpl-3',
    key: 'payment_reminder',
    name: 'Zahlungserinnerung',
    subject: 'Erinnerung: Rechnung #{invoice_number} ist demnächst fällig',
    body: `Sehr geehrte(r) {client_name},

dies ist eine freundliche Erinnerung, dass Ihre Rechnung #{invoice_number} über {amount_due} am {due_date} fällig ist.

Falls Sie die Zahlung bereits geleistet haben, bitten wir Sie, diese Nachricht zu entschuldigen. Anbei finden Sie die Rechnung als PDF.

Mit freundlichen Grüßen,
{business_name}`,
    description: 'Wird vor dem Fälligkeitsdatum der Rechnung gesendet.',
  },
  {
    id: 'tpl-4',
    key: 'invoice_overdue',
    name: 'Mahnung / Überfällige Rechnung',
    subject: 'MAHNUNG: Überfällige Rechnung #{invoice_number}',
    body: `Sehr geehrte(r) {client_name},

laut unseren Unterlagen ist die Rechnung #{invoice_number} über {amount_due} (Fälligkeitsdatum: {due_date}) noch nicht beglichen.

Bitte begleichen Sie den offenen Betrag umgehend.

Bei Fragen wenden Sie sich bitte an {business_email}.

Mit freundlichen Grüßen,
{business_name}`,
    description: 'Wird gesendet, wenn eine Rechnung das Fälligkeitsdatum überschritten hat.',
  },
  {
    id: 'tpl-5',
    key: 'payment_received',
    name: 'Zahlungsbestätigung & Quittung',
    subject: 'Zahlungsbestätigung für Rechnung #{invoice_number}',
    body: `Sehr geehrte(r) {client_name},

wir haben Ihre Zahlung über {payment_amount} für die Rechnung #{invoice_number} dankend erhalten.

• Restbetrag: {amount_due}
• Status: {status}

Vielen Dank für Ihre zügige Überweisung!

Mit freundlichen Grüßen,
{business_name}`,
    description: 'Wird gesendet, wenn eine Zahlung für eine Rechnung erfasst wird.',
  },
  {
    id: 'tpl-6',
    key: 'offer_sent',
    name: 'Angebot / Kostenvoranschlag gesendet',
    subject: 'Angebot #{offer_number} von {business_name}',
    body: `Hallo {client_name},

wir freuen uns, Ihnen unser offizielles Angebot #{offer_number} für Ihr anstehendes Projekt zu übermitteln.

• Angebotsnummer: #{offer_number}
• Gesamtsumme: {total}
• Gültig bis: {expiry_date}

Anbei finden Sie das detaillierte Angebotsdokument als PDF. Bei Fragen oder Änderungswünschen stehen wir Ihnen jederzeit gerne zur Verfügung.

Mit freundlichen Grüßen,
{business_name}`,
    description: 'Wird gesendet, wenn ein Angebot an einen Kunden übermittelt wird.',
  },
  {
    id: 'tpl-7',
    key: 'offer_accepted',
    name: 'Angebot angenommen Bestätigung',
    subject: 'Bestätigung: Angebot #{offer_number} angenommen',
    body: `Sehr geehrte(r) {client_name},

vielen Dank für die Annahme des Angebots #{offer_number}! Wir freuen uns sehr auf die Zusammenarbeit mit Ihnen.

Wir erstellen in Kürze Ihre Auftragsunterlagen.

Mit freundlichen Grüßen,
{business_name}`,
    description: 'Wird gesendet, wenn ein Angebot vom Kunden angenommen wurde.',
  },
];

export const initialEmailLogs: EmailLog[] = [];

export const initialPayments: PaymentRecord[] = [];
