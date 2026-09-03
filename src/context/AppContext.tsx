import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
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
  NavigationTab,
  InvoiceItem,
} from '../types';
import {
  initialBusinessProfile,
  initialClients,
  initialProducts,
  initialInvoices,
  initialOffers,
  initialEmailTemplates,
  initialEmailLogs,
  initialPayments,
} from '../data/initialData';
import {
  BrevoStatusResult,
  checkBrevoServerStatus,
  sendBrevoEmail,
} from '../services/brevoService';
import { generateDocumentEmail } from '../utils/emailTemplateGenerator';
import { Language, Translations, translations } from '../i18n/translations';

interface AppContextType {
  // Localization
  language: Language;
  setLanguage: (lang: Language) => void;
  t: Translations;

  // Navigation
  currentTab: NavigationTab;
  setCurrentTab: (tab: NavigationTab) => void;
  selectedInvoiceId: string | null;
  setSelectedInvoiceId: (id: string | null) => void;
  selectedClientId: string | null;
  setSelectedClientId: (id: string | null) => void;
  selectedOfferId: string | null;
  setSelectedOfferId: (id: string | null) => void;

  // Business Profile
  businessProfile: BusinessProfile;
  updateBusinessProfile: (profile: Partial<BusinessProfile>) => void;

  // Clients
  clients: Client[];
  addClient: (client: Omit<Client, 'id' | 'createdAt'>) => Client;
  updateClient: (id: string, client: Partial<Client>) => void;
  deleteClient: (id: string) => boolean;
  getClientById: (id: string) => Client | undefined;
  importClients: (clients: Array<Partial<Client>>) => number;

  // Products & Services
  products: Product[];
  addProduct: (product: Omit<Product, 'id' | 'createdAt'>) => Product;
  updateProduct: (id: string, product: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  categories: string[];

  // Invoices
  invoices: Invoice[];
  createInvoice: (invoice: Omit<Invoice, 'id' | 'createdAt' | 'payments' | 'history'>) => Invoice;
  updateInvoice: (id: string, invoice: Partial<Invoice>) => void;
  deleteInvoice: (id: string) => void;
  duplicateInvoice: (id: string) => Invoice | null;
  getInvoiceById: (id: string) => Invoice | undefined;
  updateInvoiceStatus: (id: string, status: Invoice['status']) => void;

  // Offers / Quotations
  offers: Offer[];
  createOffer: (offer: Omit<Offer, 'id' | 'createdAt'>) => Offer;
  updateOffer: (id: string, offer: Partial<Offer>) => void;
  deleteOffer: (id: string) => void;
  getOfferById: (id: string) => Offer | undefined;
  convertOfferToInvoice: (offerId: string) => Invoice | null;

  // Payments
  payments: PaymentRecord[];
  recordPayment: (payment: Omit<PaymentRecord, 'id' | 'createdAt'>) => PaymentRecord;

  // Email Templates & History
  emailTemplates: EmailTemplate[];
  updateEmailTemplate: (id: string, template: Partial<EmailTemplate>) => void;
  emailLogs: EmailLog[];
  deleteEmailLog: (id: string) => void;
  clearAllEmailLogs: () => void;
  resendEmailLog: (logId: string) => Promise<boolean>;
  brevoStatus: BrevoStatusResult | null;
  refreshBrevoStatus: () => Promise<void>;
  sendEmail: (
    entityId: string,
    entityNumber: string,
    entityType: 'invoice' | 'offer',
    recipient: string,
    recipientName: string,
    subject: string,
    message: string,
    templateKey: EmailTemplate['key'],
    attachmentName: string,
    options?: {
      htmlContent?: string;
      pdfBase64?: string;
    }
  ) => Promise<boolean>;

  // Activity Log
  activityLogs: ActivityLog[];
  addActivityLog: (log: Omit<ActivityLog, 'id' | 'timestamp'>) => void;

  // System Helpers
  resetToSampleData: () => void;
  exportAllData: () => string;
  importAllData: (jsonData: string) => boolean;
  toastMessage: { text: string; type: 'success' | 'error' | 'info' } | null;
  showToast: (text: string, type?: 'success' | 'error' | 'info') => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'apex_invoice_mgmt_v1';

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Navigation State
  const [currentTab, setCurrentTab] = useState<NavigationTab>('dashboard');
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string | null>(null);
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [selectedOfferId, setSelectedOfferId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);

  const showToast = (text: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // State initialization with localStorage fallback
  const loadStoredData = () => {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error('Error loading stored state:', e);
    }
    return null;
  };

  const storedData = loadStoredData();

  const [businessProfile, setBusinessProfile] = useState<BusinessProfile>(
    storedData?.businessProfile || initialBusinessProfile
  );

  const [language, setLanguageState] = useState<Language>(() => {
    return (storedData?.businessProfile?.language as Language) || (initialBusinessProfile.language as Language) || 'en';
  });

  const setLanguage = useCallback((newLang: Language) => {
    setLanguageState(newLang);
    setBusinessProfile((prev) => ({ ...prev, language: newLang }));
  }, []);

  const t = translations[language] || translations.en;
  const [clients, setClients] = useState<Client[]>(
    storedData?.clients || initialClients
  );
  const [products, setProducts] = useState<Product[]>(() => {
    if (!storedData?.products) return initialProducts;
    const existingIds = new Set(storedData.products.map((p: Product) => p.id));
    const missing = initialProducts.filter((p) => !existingIds.has(p.id));
    return [...storedData.products, ...missing];
  });
  const [invoices, setInvoices] = useState<Invoice[]>(
    storedData?.invoices || initialInvoices
  );
  const [offers, setOffers] = useState<Offer[]>(
    storedData?.offers || initialOffers
  );
  const [emailTemplates, setEmailTemplates] = useState<EmailTemplate[]>(
    storedData?.emailTemplates || initialEmailTemplates
  );
  const [emailLogs, setEmailLogs] = useState<EmailLog[]>(
    storedData?.emailLogs || initialEmailLogs
  );
  const [payments, setPayments] = useState<PaymentRecord[]>(
    storedData?.payments || initialPayments
  );
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>(
    storedData?.activityLogs || [
      {
        id: 'init-act-1',
        type: 'invoice_created',
        title: 'System Initialized',
        description: 'Apex Business Engine initialized with enterprise modules.',
        timestamp: new Date().toISOString(),
      },
    ]
  );

  // Sync state to local storage
  useEffect(() => {
    try {
      const stateToPersist = {
        businessProfile,
        clients,
        products,
        invoices,
        offers,
        emailTemplates,
        emailLogs,
        payments,
        activityLogs,
      };
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(stateToPersist));
    } catch (e) {
      console.error('Error saving state:', e);
    }
  }, [businessProfile, clients, products, invoices, offers, emailTemplates, emailLogs, payments, activityLogs]);

  // Activity Log Helper
  const addActivityLog = (log: Omit<ActivityLog, 'id' | 'timestamp'>) => {
    const newLog: ActivityLog = {
      ...log,
      id: `act-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      timestamp: new Date().toISOString(),
    };
    setActivityLogs((prev) => [newLog, ...prev]);
  };

  // Business Profile Actions
  const updateBusinessProfile = (profile: Partial<BusinessProfile>) => {
    setBusinessProfile((prev) => ({ ...prev, ...profile }));
    showToast('Business profile updated successfully!');
  };

  // Client Actions
  const addClient = (clientData: Omit<Client, 'id' | 'createdAt'>): Client => {
    const newClient: Client = {
      ...clientData,
      id: `cli-${Date.now().toString().slice(-4)}`,
      createdAt: new Date().toISOString(),
    };
    setClients((prev) => [newClient, ...prev]);
    addActivityLog({
      type: 'client_added',
      title: 'New Client Added',
      description: `Client "${newClient.name}" (${newClient.companyName || 'Individual'}) was added.`,
      entityId: newClient.id,
      entityType: 'client',
    });
    showToast(`Client ${newClient.name} added successfully!`);
    return newClient;
  };

  const updateClient = (id: string, updatedData: Partial<Client>) => {
    setClients((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...updatedData, updatedAt: new Date().toISOString() } : c))
    );
    // Also update snapshot on draft/unpaid invoices if applicable
    setInvoices((prev) =>
      prev.map((inv) =>
        inv.clientId === id && inv.status === 'draft'
          ? { ...inv, clientSnapshot: { ...inv.clientSnapshot, ...updatedData } }
          : inv
      )
    );
    showToast('Client details updated.');
  };

  const deleteClient = (id: string): boolean => {
    // Check if client has invoices
    const hasInvoices = invoices.some((i) => i.clientId === id);
    if (hasInvoices) {
      showToast('Cannot delete client with existing invoices. Archive or remove invoices first.', 'error');
      return false;
    }
    setClients((prev) => prev.filter((c) => c.id !== id));
    showToast('Client removed successfully.');
    return true;
  };

  const getClientById = (id: string) => clients.find((c) => c.id === id);

  const importClients = (imported: Array<Partial<Client>>): number => {
    let count = 0;
    const newClients: Client[] = [];
    imported.forEach((raw) => {
      if (raw.name || raw.companyName) {
        newClients.push({
          id: `cli-${Date.now().toString().slice(-4)}-${count}`,
          name: raw.name || raw.companyName || 'New Client',
          companyName: raw.companyName || '',
          email: raw.email || 'client@example.com',
          phone: raw.phone || '',
          address: raw.address || '',
          city: raw.city || '',
          country: raw.country || 'United States',
          vatNumber: raw.vatNumber || '',
          businessNumber: raw.businessNumber || '',
          notes: raw.notes || 'Imported from CSV/Excel',
          type: raw.type === 'individual' ? 'individual' : 'business',
          createdAt: new Date().toISOString(),
        });
        count++;
      }
    });

    if (newClients.length > 0) {
      setClients((prev) => [...newClients, ...prev]);
      showToast(`Successfully imported ${count} client(s).`);
    }
    return count;
  };

  // Product Actions
  const addProduct = (prodData: Omit<Product, 'id' | 'createdAt'>): Product => {
    const newProd: Product = {
      ...prodData,
      id: `prod-${Date.now().toString().slice(-4)}`,
      createdAt: new Date().toISOString(),
    };
    setProducts((prev) => [newProd, ...prev]);
    addActivityLog({
      type: 'product_added',
      title: 'New Product/Service Added',
      description: `Item "${newProd.name}" (${newProd.sku}) added to catalog.`,
      entityId: newProd.id,
      entityType: 'product',
    });
    showToast(`Added ${newProd.name} to products catalog.`);
    return newProd;
  };

  const updateProduct = (id: string, updatedData: Partial<Product>) => {
    setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, ...updatedData } : p)));
    showToast('Product updated successfully.');
  };

  const deleteProduct = (id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
    showToast('Product removed.');
  };

  const categories = Array.from(new Set(products.map((p) => p.category))).filter(Boolean);

  // Invoice Actions
  const createInvoice = (invoiceData: Omit<Invoice, 'id' | 'createdAt' | 'payments' | 'history'>): Invoice => {
    const nextNum = businessProfile.nextInvoiceNumber || 1000;
    const invNumber = invoiceData.number || `${nextNum}`;
    const newId = `inv-${Date.now().toString().slice(-5)}`;

    const newInvoice: Invoice = {
      ...invoiceData,
      id: newId,
      number: invNumber,
      createdAt: new Date().toISOString(),
      payments: [],
      history: [
        {
          id: `act-${Date.now()}`,
          type: 'invoice_created',
          title: 'Invoice Created',
          description: `Invoice ${invoiceData.prefix}${invNumber} for ${invoiceData.clientSnapshot.name || 'Client'} created.`,
          timestamp: new Date().toISOString(),
          entityId: newId,
          entityType: 'invoice',
          amount: invoiceData.total,
        },
      ],
    };

    setInvoices((prev) => [newInvoice, ...prev]);

    // Increment next invoice number in profile
    setBusinessProfile((prev) => ({
      ...prev,
      nextInvoiceNumber: nextNum + 1,
    }));

    addActivityLog({
      type: 'invoice_created',
      title: 'Invoice Created',
      description: `Created invoice ${newInvoice.prefix}${newInvoice.number} totaling $${newInvoice.total.toLocaleString()}.`,
      entityId: newInvoice.id,
      entityType: 'invoice',
      amount: newInvoice.total,
    });

    showToast(`Invoice #${newInvoice.prefix}${newInvoice.number} created successfully!`);
    return newInvoice;
  };

  const updateInvoice = (id: string, updatedData: Partial<Invoice>) => {
    setInvoices((prev) =>
      prev.map((inv) => {
        if (inv.id === id) {
          const updated = { ...inv, ...updatedData, updatedAt: new Date().toISOString() };
          return updated;
        }
        return inv;
      })
    );
    showToast('Invoice saved.');
  };

  const deleteInvoice = (id: string) => {
    setInvoices((prev) => prev.filter((i) => i.id !== id));
    showToast('Invoice deleted.');
  };

  const duplicateInvoice = (id: string): Invoice | null => {
    const original = invoices.find((i) => i.id === id);
    if (!original) return null;

    const nextNum = businessProfile.nextInvoiceNumber || 1000;
    const newInvoice: Invoice = {
      ...original,
      id: `inv-${Date.now().toString().slice(-5)}`,
      number: `${nextNum}`,
      status: 'draft',
      amountPaid: 0,
      amountDue: original.total,
      date: new Date().toISOString().split('T')[0],
      createdAt: new Date().toISOString(),
      payments: [],
      history: [
        {
          id: `act-${Date.now()}`,
          type: 'invoice_created',
          title: 'Invoice Duplicated',
          description: `Duplicated from ${original.prefix}${original.number}`,
          timestamp: new Date().toISOString(),
        },
      ],
    };

    setInvoices((prev) => [newInvoice, ...prev]);
    setBusinessProfile((prev) => ({
      ...prev,
      nextInvoiceNumber: nextNum + 1,
    }));

    showToast(`Duplicated into new draft invoice #${newInvoice.prefix}${newInvoice.number}`);
    return newInvoice;
  };

  const getInvoiceById = (id: string) => invoices.find((i) => i.id === id);

  const updateInvoiceStatus = (id: string, status: Invoice['status']) => {
    setInvoices((prev) =>
      prev.map((inv) => {
        if (inv.id === id) {
          return {
            ...inv,
            status,
            paidAt: status === 'paid' ? new Date().toISOString() : inv.paidAt,
          };
        }
        return inv;
      })
    );
    showToast(`Invoice status updated to ${status}.`);
  };

  // Offer Actions
  const createOffer = (offerData: Omit<Offer, 'id' | 'createdAt'>): Offer => {
    const nextNum = businessProfile.nextOfferNumber || 1000;
    const offNumber = offerData.number || `${nextNum}`;
    const newId = `off-${Date.now().toString().slice(-5)}`;

    const newOffer: Offer = {
      ...offerData,
      id: newId,
      number: offNumber,
      createdAt: new Date().toISOString(),
    };

    setOffers((prev) => [newOffer, ...prev]);
    setBusinessProfile((prev) => ({
      ...prev,
      nextOfferNumber: nextNum + 1,
    }));

    addActivityLog({
      type: 'offer_created',
      title: 'Quotation Created',
      description: `Quotation #${offerData.number} for ${offerData.clientSnapshot.name} ($${offerData.total.toLocaleString()}) created.`,
      entityId: newId,
      entityType: 'offer',
      amount: offerData.total,
    });

    showToast(`Quotation #${businessProfile.offerPrefix}${newOffer.number} created.`);
    return newOffer;
  };

  const updateOffer = (id: string, updatedData: Partial<Offer>) => {
    setOffers((prev) => prev.map((o) => (o.id === id ? { ...o, ...updatedData, updatedAt: new Date().toISOString() } : o)));
    showToast('Offer updated successfully.');
  };

  const deleteOffer = (id: string) => {
    setOffers((prev) => prev.filter((o) => o.id !== id));
    showToast('Offer removed.');
  };

  const getOfferById = (id: string) => offers.find((o) => o.id === id);

  // Convert Offer to Invoice
  const convertOfferToInvoice = (offerId: string): Invoice | null => {
    const offer = offers.find((o) => o.id === offerId);
    if (!offer) {
      showToast('Offer not found.', 'error');
      return null;
    }

    const nextNum = businessProfile.nextInvoiceNumber || 1000;
    const invNumber = `${nextNum}`;
    const invId = `inv-${Date.now().toString().slice(-5)}`;

    // Create full invoice from offer details
    const newInvoice: Invoice = {
      id: invId,
      number: invNumber,
      prefix: businessProfile.invoicePrefix || 'INV-2026-',
      clientId: offer.clientId,
      clientSnapshot: offer.clientSnapshot,
      date: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      items: offer.items.map((it) => ({ ...it, id: `inv-item-${Date.now()}-${Math.random().toString(36).substr(2, 4)}` })),
      currency: offer.currency || businessProfile.defaultCurrency || 'USD',
      paymentTerms: businessProfile.paymentTerms || 'Net 30 Days',
      subtotal: offer.subtotal,
      globalDiscount: offer.discount || 0,
      globalDiscountType: offer.discountType || 'percentage',
      discountAmount: offer.discountAmount || 0,
      vatTotal: offer.vatTotal,
      shippingFee: offer.shippingFee || 0,
      additionalCharges: 0,
      total: offer.total,
      amountPaid: 0,
      amountDue: offer.total,
      status: 'unpaid',
      notes: offer.notes || businessProfile.defaultInvoiceNotes,
      paymentInstructions: businessProfile.defaultPaymentInstructions,
      termsAndConditions: offer.terms || businessProfile.defaultTermsAndConditions,
      customFooter: businessProfile.defaultInvoiceFooter,
      template: offer.template || businessProfile.invoiceTemplate || 'modern',
      primaryColor: offer.primaryColor || businessProfile.invoiceColors || '#2563eb',
      font: businessProfile.font || 'Plus Jakarta Sans',
      logoPosition: businessProfile.logoPosition || 'left',
      tableStyle: businessProfile.tableStyle || 'clean',
      showSignature: true,
      signatureImage: businessProfile.signature,
      createdAt: new Date().toISOString(),
      payments: [],
      history: [
        {
          id: `act-${Date.now()}`,
          type: 'offer_converted',
          title: 'Converted from Offer',
          description: `Generated from Quotation #${businessProfile.offerPrefix}${offer.number}.`,
          timestamp: new Date().toISOString(),
          entityId: invId,
          entityType: 'invoice',
          amount: offer.total,
        },
      ],
    };

    // Update Offer Status
    setOffers((prev) =>
      prev.map((o) =>
        o.id === offerId
          ? {
              ...o,
              status: 'converted',
              convertedInvoiceId: invId,
              convertedAt: new Date().toISOString(),
            }
          : o
      )
    );

    // Save new invoice
    setInvoices((prev) => [newInvoice, ...prev]);

    // Increment invoice sequence
    setBusinessProfile((prev) => ({
      ...prev,
      nextInvoiceNumber: nextNum + 1,
    }));

    addActivityLog({
      type: 'offer_converted',
      title: 'Offer Converted to Invoice',
      description: `Offer #${businessProfile.offerPrefix}${offer.number} converted to Invoice #${newInvoice.prefix}${newInvoice.number}.`,
      entityId: newInvoice.id,
      entityType: 'invoice',
      amount: newInvoice.total,
    });

    showToast(`Quotation #${offer.number} converted to Invoice #${newInvoice.prefix}${newInvoice.number}!`, 'success');
    return newInvoice;
  };

  // Payment Recording
  const recordPayment = (paymentData: Omit<PaymentRecord, 'id' | 'createdAt'>): PaymentRecord => {
    const newPayment: PaymentRecord = {
      ...paymentData,
      id: `pay-${Date.now().toString().slice(-5)}`,
      createdAt: new Date().toISOString(),
    };

    setPayments((prev) => [newPayment, ...prev]);

    // Update target invoice paid amount & status
    setInvoices((prev) =>
      prev.map((inv) => {
        if (inv.id === paymentData.invoiceId) {
          const updatedPaid = (inv.amountPaid || 0) + paymentData.amount;
          const updatedDue = Math.max(0, inv.total - updatedPaid);
          const newStatus: Invoice['status'] = updatedDue <= 0.01 ? 'paid' : 'unpaid';

          return {
            ...inv,
            amountPaid: updatedPaid,
            amountDue: updatedDue,
            status: newStatus,
            paidAt: newStatus === 'paid' ? new Date().toISOString() : inv.paidAt,
            payments: [newPayment, ...(inv.payments || [])],
            history: [
              {
                id: `act-${Date.now()}`,
                type: 'payment_received',
                title: 'Payment Logged',
                description: `Payment of $${paymentData.amount.toLocaleString()} recorded via ${paymentData.method.replace('_', ' ')}.`,
                timestamp: new Date().toISOString(),
                entityId: newPayment.id,
                entityType: 'payment',
                amount: paymentData.amount,
              },
              ...inv.history,
            ],
          };
        }
        return inv;
      })
    );

    addActivityLog({
      type: 'payment_received',
      title: 'Payment Recorded',
      description: `Payment of $${paymentData.amount.toLocaleString()} received from ${paymentData.clientName} for invoice ${paymentData.invoiceNumber}.`,
      entityId: paymentData.invoiceId,
      entityType: 'payment',
      amount: paymentData.amount,
    });

    showToast(`Payment of $${paymentData.amount.toLocaleString()} recorded successfully!`);
    return newPayment;
  };

  // Brevo Status State
  const [brevoStatus, setBrevoStatus] = useState<BrevoStatusResult | null>(null);

  const refreshBrevoStatus = useCallback(async () => {
    try {
      const status = await checkBrevoServerStatus();
      setBrevoStatus(status);
    } catch (e) {
      console.warn('Failed to load Brevo server status:', e);
    }
  }, []);

  useEffect(() => {
    refreshBrevoStatus();
  }, [refreshBrevoStatus]);

  // Email Templates & Sending
  const updateEmailTemplate = (id: string, updated: Partial<EmailTemplate>) => {
    setEmailTemplates((prev) => prev.map((t) => (t.id === id ? { ...t, ...updated } : t)));
    showToast('Email template updated.');
  };

  const deleteEmailLog = (id: string) => {
    setEmailLogs((prev) => prev.filter((l) => l.id !== id));
    showToast('Email log record removed.');
  };

  const clearAllEmailLogs = () => {
    setEmailLogs([]);
    showToast('All email logs cleared.');
  };

  const sendEmail = async (
    entityId: string,
    entityNumber: string,
    entityType: 'invoice' | 'offer',
    recipient: string,
    recipientName: string,
    subject: string,
    message: string,
    templateKey: EmailTemplate['key'],
    attachmentName: string,
    options?: {
      htmlContent?: string;
      pdfBase64?: string;
    }
  ): Promise<boolean> => {
    // Generate full HTML content if not provided
    let finalHtml = options?.htmlContent;
    let finalSubject = subject;
    let finalText = message;

    if (!finalHtml) {
      const targetDoc = entityType === 'invoice' 
        ? invoices.find((i) => i.id === entityId)
        : offers.find((o) => o.id === entityId);

      if (targetDoc) {
        const generated = generateDocumentEmail(targetDoc, businessProfile, templateKey, message);
        finalHtml = generated.htmlContent;
        if (!finalSubject) finalSubject = generated.subject;
        if (!finalText) finalText = generated.textContent;
      } else {
        finalHtml = `<div style="font-family: sans-serif; padding: 20px; color: #1e293b;">
          <h2>${subject}</h2>
          <p style="white-space: pre-line;">${message}</p>
          <hr style="margin: 20px 0; border: 0; border-top: 1px solid #e2e8f0;" />
          <p style="font-size: 12px; color: #64748b;">Dispatched from ${businessProfile.businessName} &lt;${businessProfile.email}&gt;</p>
        </div>`;
      }
    }

    const attachmentsList = attachmentName ? [attachmentName] : [];
    const brevoAttachments = options?.pdfBase64 && attachmentName
      ? [{ content: options.pdfBase64, name: attachmentName }]
      : undefined;

    // Dispatch via Brevo Service
    const senderEmail = businessProfile.brevoSenderEmail || businessProfile.email || 'billing@example.com';
    const senderName = businessProfile.brevoSenderName || businessProfile.businessName || 'Billing Department';

    const brevoResult = await sendBrevoEmail({
      apiKey: businessProfile.brevoApiKey,
      sender: { name: senderName, email: senderEmail },
      to: [{ email: recipient, name: recipientName }],
      subject: finalSubject,
      htmlContent: finalHtml,
      textContent: finalText,
      replyTo: businessProfile.brevoReplyTo ? { email: businessProfile.brevoReplyTo } : { email: businessProfile.email },
      attachment: brevoAttachments,
    });

    const isSuccess = brevoResult.success;
    const providerUsed = brevoResult.provider || (brevoResult.simulated ? 'simulation' : 'brevo');

    const newLog: EmailLog = {
      id: `elog-${Date.now().toString().slice(-5)}`,
      entityId,
      entityNumber,
      entityType,
      recipient,
      recipientName,
      subject: finalSubject,
      message: finalText,
      htmlContent: finalHtml,
      templateKey,
      sentAt: new Date().toISOString(),
      status: isSuccess ? 'delivered' : 'failed',
      attachments: attachmentsList,
      provider: providerUsed,
      brevoMessageId: brevoResult.messageId,
      deliveryError: isSuccess ? undefined : brevoResult.error || brevoResult.message,
    };

    setEmailLogs((prev) => [newLog, ...prev]);

    // Update entity status if draft
    if (entityType === 'invoice' && isSuccess) {
      setInvoices((prev) =>
        prev.map((inv) => {
          if (inv.id === entityId) {
            const nextStatus = inv.status === 'draft' ? 'unpaid' : inv.status;
            return {
              ...inv,
              status: nextStatus,
              sentAt: new Date().toISOString(),
              history: [
                {
                  id: `act-${Date.now()}`,
                  type: 'email_sent',
                  title: `Email Dispatched (${providerUsed === 'brevo' ? 'Brevo SMTP' : 'Email Engine'})`,
                  description: `Email "${finalSubject}" dispatched to ${recipient}. ${brevoResult.messageId ? `Message ID: ${brevoResult.messageId}` : ''}`,
                  timestamp: new Date().toISOString(),
                  entityId: newLog.id,
                },
                ...inv.history,
              ],
            };
          }
          return inv;
        })
      );
    } else if (entityType === 'offer' && isSuccess) {
      setOffers((prev) =>
        prev.map((off) => (off.id === entityId && off.status === 'draft' ? { ...off, status: 'sent' } : off))
      );
    }

    addActivityLog({
      type: 'email_sent',
      title: `${entityType === 'invoice' ? 'Invoice' : 'Quotation'} Dispatched (${providerUsed === 'brevo' ? 'Brevo' : 'Email'})`,
      description: `Document ${entityNumber} dispatched to ${recipient}.${brevoResult.simulated ? ' (Simulation Mode)' : ''}`,
      entityId,
      entityType,
    });

    if (isSuccess) {
      if (providerUsed === 'brevo' && !brevoResult.simulated) {
        showToast(`✓ Email delivered via Brevo to ${recipient}!`, 'success');
      } else {
        showToast(`Email dispatched to ${recipient}!`, 'success');
      }
      return true;
    } else {
      showToast(`Failed to send email: ${brevoResult.message}`, 'error');
      return false;
    }
  };

  const resendEmailLog = async (logId: string): Promise<boolean> => {
    const log = emailLogs.find((l) => l.id === logId);
    if (!log) {
      showToast('Email log record not found.', 'error');
      return false;
    }

    return await sendEmail(
      log.entityId,
      log.entityNumber,
      log.entityType,
      log.recipient,
      log.recipientName,
      log.subject,
      log.message,
      log.templateKey,
      log.attachments?.[0] || '',
      { htmlContent: log.htmlContent }
    );
  };

  // System actions
  const resetToSampleData = () => {
    setBusinessProfile(initialBusinessProfile);
    setClients(initialClients);
    setProducts(initialProducts);
    setInvoices(initialInvoices);
    setOffers(initialOffers);
    setEmailTemplates(initialEmailTemplates);
    setEmailLogs(initialEmailLogs);
    setPayments(initialPayments);
    setActivityLogs([
      {
        id: `act-${Date.now()}`,
        type: 'invoice_created',
        title: 'System Data Reset',
        description: 'Demo business records restored.',
        timestamp: new Date().toISOString(),
      },
    ]);
    localStorage.removeItem(LOCAL_STORAGE_KEY);
    showToast('Reset system to default sample business data.');
  };

  const exportAllData = (): string => {
    const data = {
      businessProfile,
      clients,
      products,
      invoices,
      offers,
      emailTemplates,
      emailLogs,
      payments,
      activityLogs,
      exportedAt: new Date().toISOString(),
    };
    return JSON.stringify(data, null, 2);
  };

  const importAllData = (jsonData: string): boolean => {
    try {
      const parsed = JSON.parse(jsonData);
      if (parsed.businessProfile) setBusinessProfile(parsed.businessProfile);
      if (parsed.clients) setClients(parsed.clients);
      if (parsed.products) setProducts(parsed.products);
      if (parsed.invoices) setInvoices(parsed.invoices);
      if (parsed.offers) setOffers(parsed.offers);
      if (parsed.emailTemplates) setEmailTemplates(parsed.emailTemplates);
      if (parsed.emailLogs) setEmailLogs(parsed.emailLogs);
      if (parsed.payments) setPayments(parsed.payments);
      if (parsed.activityLogs) setActivityLogs(parsed.activityLogs);
      showToast('All system data restored successfully!');
      return true;
    } catch (e) {
      console.error('Failed to parse backup:', e);
      showToast('Invalid backup JSON format.', 'error');
      return false;
    }
  };

  return (
    <AppContext.Provider
      value={{
        language,
        setLanguage,
        t,
        currentTab,
        setCurrentTab,
        selectedInvoiceId,
        setSelectedInvoiceId,
        selectedClientId,
        setSelectedClientId,
        selectedOfferId,
        setSelectedOfferId,
        businessProfile,
        updateBusinessProfile,
        clients,
        addClient,
        updateClient,
        deleteClient,
        getClientById,
        importClients,
        products,
        addProduct,
        updateProduct,
        deleteProduct,
        categories,
        invoices,
        createInvoice,
        updateInvoice,
        deleteInvoice,
        duplicateInvoice,
        getInvoiceById,
        updateInvoiceStatus,
        offers,
        createOffer,
        updateOffer,
        deleteOffer,
        getOfferById,
        convertOfferToInvoice,
        payments,
        recordPayment,
        emailTemplates,
        updateEmailTemplate,
        emailLogs,
        deleteEmailLog,
        clearAllEmailLogs,
        resendEmailLog,
        brevoStatus,
        refreshBrevoStatus,
        sendEmail,
        activityLogs,
        addActivityLog,
        resetToSampleData,
        exportAllData,
        importAllData,
        toastMessage,
        showToast,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
