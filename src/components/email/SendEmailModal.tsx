import React, { useState, useEffect } from 'react';
import {
  X,
  Send,
  Mail,
  Paperclip,
  FileText,
  Radio,
  Eye,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useApp } from '../../context/AppContext';
import { Invoice, Offer, EmailTemplateKey } from '../../types';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { generateDocumentEmail } from '../../utils/emailTemplateGenerator';
import { generatePdfFromElement } from '../../utils/pdfGenerator';
import { InvoiceDocumentRenderer } from '../invoices/InvoiceTemplates';

interface SendEmailModalProps {
  invoice?: Invoice;
  offer?: Offer;
  isOpen: boolean;
  onClose: () => void;
  defaultTemplateKey?: EmailTemplateKey;
}

export const SendEmailModal: React.FC<SendEmailModalProps> = ({
  invoice,
  offer,
  isOpen,
  onClose,
  defaultTemplateKey = 'invoice_sent',
}) => {
  const { businessProfile, emailTemplates, sendEmail, brevoStatus, language } = useApp();

  const isDe = language === 'de';
  const doc = invoice || offer;
  const isOffer = !invoice && !!offer;

  const [selectedTemplateKey, setSelectedTemplateKey] = useState<EmailTemplateKey>(
    isOffer ? 'offer_sent' : defaultTemplateKey
  );
  const [recipientEmail, setRecipientEmail] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  // Helper for localized template defaults
  const getLocalizedTemplateDefaults = (key: EmailTemplateKey) => {
    const docNumber = invoice ? `${invoice.prefix || ''}${invoice.number}` : `${businessProfile.offerPrefix || 'OFF-'}${offer?.number}`;

    switch (key) {
      case 'offer_sent':
        return {
          name: isDe ? 'Angebot / Kostenvoranschlag gesendet' : 'Quotation / Offer Sent',
          subject: isDe
            ? `Angebot #${docNumber} von ${businessProfile.businessName}`
            : `Business Proposal & Quotation #${docNumber} from ${businessProfile.businessName}`,
          body: isDe
            ? `Hallo {client_name},\n\nwir freuen uns, Ihnen unser offizielles Angebot #{offer_number} für Ihr anstehendes Projekt zu übermitteln.\n\n• Angebotsnummer: #{offer_number}\n• Gesamtsumme: {total}\n• Gültig bis: {expiry_date}\n\nAnbei finden Sie das detaillierte Angebotsdokument als PDF. Bei Fragen oder Änderungswünschen stehen wir Ihnen jederzeit gerne zur Verfügung.\n\nMit freundlichen Grüßen,\n{business_name}`
            : `Hello {client_name},\n\nWe are excited to share our official proposal and quotation #{offer_number} for your upcoming project.\n\n• Offer Number: #{offer_number}\n• Total Estimate: {total}\n• Valid Until: {expiry_date}\n\nPlease find the detailed offer document attached as PDF. Feel free to contact us with any questions or revisions.\n\nBest regards,\n{business_name}`,
        };
      case 'offer_accepted':
        return {
          name: isDe ? 'Angebot angenommen Bestätigung' : 'Offer Accepted Confirmation',
          subject: isDe
            ? `Bestätigung: Angebot #${docNumber} angenommen`
            : `Confirmation: Proposal #${docNumber} Accepted`,
          body: isDe
            ? `Sehr geehrte(r) {client_name},\n\nvielen Dank für die Annahme des Angebots #{offer_number}! Wir freuen uns sehr auf die Zusammenarbeit mit Ihnen.\n\nWir erstellen in Kürze Ihre Auftragsunterlagen.\n\nMit freundlichen Grüßen,\n{business_name}`
            : `Dear {client_name},\n\nThank you for accepting Offer #{offer_number}! We are thrilled to start working together on this project.\n\nWe will generate your onboarding paperwork and initial milestone invoice shortly.\n\nBest regards,\n{business_name}`,
        };
      case 'invoice_sent':
        return {
          name: isDe ? 'Rechnung gesendet' : 'Invoice Sent (Standard)',
          subject: isDe
            ? `Rechnung #${docNumber} von ${businessProfile.businessName}`
            : `Invoice #${docNumber} from ${businessProfile.businessName}`,
          body: isDe
            ? `Sehr geehrte(r) {client_name},\n\nanbei übersenden wir Ihnen Ihre Rechnung #{invoice_number} über {total}.\n\n• Rechnungsnummer: #{invoice_number}\n• Offener Betrag: {amount_due}\n• Fälligkeitsdatum: {due_date}\n\nVielen Dank für Ihren Auftrag!\n\nMit freundlichen Grüßen,\n{business_name}`
            : `Dear {client_name},\n\nPlease find attached invoice #{invoice_number} for {total}.\n\n• Invoice Number: #{invoice_number}\n• Balance Due: {amount_due}\n• Payment Due Date: {due_date}\n\nThank you for your business!\n\nSincerely,\n{business_name}`,
        };
      case 'payment_reminder':
        return {
          name: isDe ? 'Zahlungserinnerung' : 'Payment Reminder (Upcoming)',
          subject: isDe
            ? `Erinnerung: Rechnung #${docNumber} ist demnächst fällig`
            : `Friendly Reminder: Invoice #${docNumber} is Due Soon`,
          body: isDe
            ? `Sehr geehrte(r) {client_name},\n\ndies ist eine freundliche Erinnerung, dass Ihre Rechnung #{invoice_number} über {amount_due} am {due_date} fällig ist.\n\nFalls Sie die Zahlung bereits geleistet haben, bitten wir Sie, diese Nachricht zu entschuldigen.\n\nMit freundlichen Grüßen,\n{business_name}`
            : `Dear {client_name},\n\nThis is a friendly reminder that Invoice #{invoice_number} for {amount_due} is scheduled for payment on {due_date}.\n\nIf you have already processed this payment, please disregard this note.\n\nBest regards,\n{business_name}`,
        };
      case 'invoice_overdue':
        return {
          name: isDe ? 'Mahnung (Überfällig)' : 'Invoice Overdue Notice',
          subject: isDe
            ? `MAHNUNG: Überfällige Rechnung #${docNumber}`
            : `URGENT: Invoice #${docNumber} is Overdue`,
          body: isDe
            ? `Sehr geehrte(r) {client_name},\n\nlaut unseren Unterlagen ist die Rechnung #{invoice_number} über {amount_due} (Fälligkeitsdatum: {due_date}) noch nicht beglichen.\n\nBitte begleichen Sie den offenen Betrag umgehend.\n\nMit freundlichen Grüßen,\n{business_name}`
            : `Dear {client_name},\n\nOur records indicate that Invoice #{invoice_number} for {amount_due}, which was due on {due_date}, remains unpaid.\n\nPlease arrange payment as soon as possible.\n\nSincerely,\n{business_name}`,
        };
      case 'payment_received':
        return {
          name: isDe ? 'Zahlungsbestätigung' : 'Payment Confirmation & Receipt',
          subject: isDe
            ? `Zahlungsbestätigung für Rechnung #${docNumber}`
            : `Payment Received: Thank you! (Invoice #${docNumber})`,
          body: isDe
            ? `Sehr geehrte(r) {client_name},\n\nwir haben Ihre Zahlung über {payment_amount} für die Rechnung #{invoice_number} dankend erhalten.\n\n• Restbetrag: {amount_due}\n• Status: {status}\n\nVielen Dank für Ihre zügige Überweisung!\n\nMit freundlichen Grüßen,\n{business_name}`
            : `Dear {client_name},\n\nWe have received your payment of {payment_amount} for Invoice #{invoice_number}.\n\n• Remaining Balance: {amount_due}\n• Payment Status: {status}\n\nThank you for your prompt payment!\n\nWarm regards,\n{business_name}`,
        };
      default:
        return {
          name: isDe ? 'Standard Vorlage' : 'Standard Template',
          subject: isDe ? `Dokument #${docNumber}` : `Document #${docNumber}`,
          body: isDe ? `Sehr geehrte(r) {client_name},\n\nanbei Ihr Dokument.` : `Dear {client_name},\n\nPlease find attached your document.`,
        };
    }
  };

  // Template replacer helper
  const populateTemplate = (tplKey: EmailTemplateKey) => {
    if (!doc) return;

    const tpl = emailTemplates.find((t) => t.key === tplKey);
    const defaults = getLocalizedTemplateDefaults(tplKey);

    const client = doc.clientSnapshot;
    const docNumber = invoice ? `${invoice.prefix || ''}${invoice.number}` : `${businessProfile.offerPrefix || 'OFF-'}${offer?.number}`;
    const totalFormatted = formatCurrency(doc.total, doc.currency);
    const amountDueFormatted = invoice ? formatCurrency(invoice.amountDue, invoice.currency) : totalFormatted;
    const issueDateFormatted = formatDate(doc.date);
    const dueDateFormatted = invoice ? formatDate(invoice.dueDate) : formatDate(offer?.expiryDate);

    let rawSubject = defaults.subject;
    let rawBody = defaults.body;

    // Use custom user-edited template subject/body if available and present
    if (tpl?.subject && (!isDe || !tpl.subject.includes('Invoice #'))) {
      rawSubject = tpl.subject;
    }
    if (tpl?.body && (!isDe || !tpl.body.includes('Dear '))) {
      rawBody = tpl.body;
    }

    let replacedSubject = rawSubject
      .replace(/{invoice_number}/g, docNumber)
      .replace(/{offer_number}/g, docNumber)
      .replace(/{business_name}/g, businessProfile.businessName)
      .replace(/{client_name}/g, client?.name || (isDe ? 'Kunde' : 'Client'))
      .replace(/{due_date}/g, dueDateFormatted);

    let replacedBody = rawBody
      .replace(/{client_name}/g, client?.name || (isDe ? 'Kunde' : 'Client'))
      .replace(/{business_name}/g, businessProfile.businessName)
      .replace(/{invoice_number}/g, docNumber)
      .replace(/{offer_number}/g, docNumber)
      .replace(/{total}/g, totalFormatted)
      .replace(/{amount_due}/g, amountDueFormatted)
      .replace(/{payment_amount}/g, invoice ? formatCurrency(invoice.amountPaid, invoice.currency) : totalFormatted)
      .replace(/{issue_date}/g, issueDateFormatted)
      .replace(/{due_date}/g, dueDateFormatted)
      .replace(/{expiry_date}/g, dueDateFormatted)
      .replace(/{status}/g, (invoice?.status || offer?.status || 'Active').toUpperCase())
      .replace(/{business_email}/g, businessProfile.email);

    setSubject(replacedSubject);
    setMessage(replacedBody);
  };

  useEffect(() => {
    if (doc && isOpen) {
      setRecipientEmail(doc.clientSnapshot?.email || '');
      setRecipientName(doc.clientSnapshot?.name || '');
      populateTemplate(selectedTemplateKey);
    }
  }, [doc, isOpen, selectedTemplateKey, language]);

  if (!isOpen || !doc) return null;

  const docNumber = invoice ? `${invoice.prefix || ''}${invoice.number}` : `${businessProfile.offerPrefix || 'OFF-'}${offer?.number}`;
  const attachmentName = `${invoice ? (isDe ? 'Rechnung' : 'Invoice') : (isDe ? 'Angebot' : 'Offer')}_${docNumber}.pdf`;
  const isBrevoActive = brevoStatus?.configured || (businessProfile.brevoApiKey && businessProfile.brevoApiKey.length > 5);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipientEmail) return;

    setIsSending(true);

    // Generate responsive HTML message in active language (German / English)
    const generated = generateDocumentEmail(doc, businessProfile, selectedTemplateKey, message, language);

    // Convert document element to Base64 PDF attachment using guaranteed target ID
    let pdfBase64: string | undefined;
    try {
      const blob = await generatePdfFromElement('email-pdf-render-target', attachmentName, false);
      if (blob) {
        const arrayBuffer = await blob.arrayBuffer();
        const bytes = new Uint8Array(arrayBuffer);
        let binary = '';
        const chunkSize = 8192;
        for (let i = 0; i < bytes.length; i += chunkSize) {
          binary += String.fromCharCode.apply(null, Array.from(bytes.subarray(i, i + chunkSize)));
        }
        pdfBase64 = btoa(binary);
      }
    } catch (pdfErr) {
      console.warn('PDF attachment conversion note:', pdfErr);
    }

    const success = await sendEmail(
      doc.id,
      docNumber,
      invoice ? 'invoice' : 'offer',
      recipientEmail,
      recipientName,
      subject || generated.subject,
      message || generated.textContent,
      selectedTemplateKey,
      attachmentName,
      {
        htmlContent: generated.htmlContent,
        pdfBase64,
      }
    );

    setIsSending(false);

    if (success) {
      try {
        confetti({
          particleCount: 70,
          spread: 60,
          origin: { y: 0.6 },
        });
      } catch (e) {
        // confetti fallback
      }
      onClose();
    }
  };

  const previewHtml = generateDocumentEmail(doc, businessProfile, selectedTemplateKey, message, language).htmlContent;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      {/* Off-screen Container for Guaranteed PDF Attachment Rendering */}
      <div style={{ position: 'fixed', left: '-9999px', top: '0px', width: '800px', backgroundColor: '#ffffff' }}>
        <div id="email-pdf-render-target">
          <InvoiceDocumentRenderer
            invoice={invoice}
            offer={offer}
            businessProfile={businessProfile}
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-4 sm:px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
              <Mail className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-sm sm:text-base font-bold text-slate-900 truncate">
                  {isDe
                    ? (isOffer ? 'Angebot per E-Mail senden' : 'Rechnung per E-Mail senden')
                    : (isOffer ? 'Send Quotation via Email' : 'Send Invoice via Email')}
                </h3>
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${
                  isBrevoActive ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                }`}>
                  <Radio className={`w-2.5 h-2.5 ${isBrevoActive ? 'text-emerald-500 animate-pulse' : 'text-amber-500'}`} />
                  {isBrevoActive ? 'Brevo Relay' : 'Email Gateway'}
                </span>
              </div>
              <p className="text-xs text-slate-500 truncate">
                {isDe ? 'Dokument' : 'Document'} #{docNumber} • {doc.clientSnapshot?.name}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200 cursor-pointer shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSend} className="p-4 sm:p-6 space-y-4 text-xs overflow-y-auto flex-1">
          {/* Email Template Selector */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1.5">
              {isDe ? 'E-Mail-Vorlage auswählen' : 'Select Email Template'}
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {emailTemplates
                .filter((t) => (isOffer ? t.key.startsWith('offer') : !t.key.startsWith('offer')))
                .map((tpl) => {
                  const defaults = getLocalizedTemplateDefaults(tpl.key);
                  return (
                    <button
                      type="button"
                      key={tpl.id}
                      onClick={() => setSelectedTemplateKey(tpl.key)}
                      className={`px-3 py-2.5 rounded-xl text-left border transition-all cursor-pointer ${
                        selectedTemplateKey === tpl.key
                          ? 'border-blue-600 bg-blue-50/70 text-blue-900 font-semibold shadow-xs'
                          : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <p className="font-medium text-xs leading-tight">{defaults.name}</p>
                    </button>
                  );
                })}
            </div>
          </div>

          {/* Recipient Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                {isDe ? 'Empfänger E-Mail' : 'Recipient Email'} <span className="text-rose-500">*</span>
              </label>
              <input
                type="email"
                required
                value={recipientEmail}
                onChange={(e) => setRecipientEmail(e.target.value)}
                placeholder="kunde@firma.de"
                className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none text-xs"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                {isDe ? 'Empfänger Name' : 'Recipient Name'}
              </label>
              <input
                type="text"
                value={recipientName}
                onChange={(e) => setRecipientName(e.target.value)}
                placeholder={isDe ? 'Kundenname' : 'Client Name'}
                className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none text-xs"
              />
            </div>
          </div>

          {/* Subject */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              {isDe ? 'E-Mail Betreff' : 'Email Subject'}
            </label>
            <input
              type="text"
              required
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none font-medium text-slate-900 text-xs"
            />
          </div>

          {/* Email Body */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block font-semibold text-slate-700">
                {isDe ? 'Nachrichteninhalt / E-Mail Anmerkung' : 'Message Content Note'}
              </label>
              <button
                type="button"
                onClick={() => setShowPreview(!showPreview)}
                className="text-[11px] text-blue-600 font-semibold hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Eye className="w-3 h-3" />
                <span>
                  {isDe
                    ? (showPreview ? 'HTML-Vorschau ausblenden' : 'HTML-Vorschau anzeigen')
                    : (showPreview ? 'Hide HTML Preview' : 'Show HTML Preview')}
                </span>
              </button>
            </div>
            <textarea
              rows={4}
              required
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none font-sans text-xs leading-relaxed"
            />
          </div>

          {/* Live Preview Toggle */}
          {showPreview && (
            <div className="border border-slate-200 rounded-xl overflow-hidden bg-slate-50 p-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block px-2 py-1">
                {isDe ? 'Generierte Empfänger-HTML-Vorschau' : 'Rendered Recipient HTML Preview'}
              </span>
              <div
                dangerouslySetInnerHTML={{ __html: previewHtml }}
                className="max-h-60 overflow-y-auto bg-white rounded-lg p-2 border border-slate-200"
              />
            </div>
          )}

          {/* Attachment Badge */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 p-3 rounded-xl bg-slate-50 border border-slate-200">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="p-2 rounded-lg bg-rose-100 text-rose-600 shrink-0">
                <FileText className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-slate-800 truncate">{attachmentName}</p>
                <p className="text-[10px] text-slate-500">
                  {isDe ? 'Enthält Zusammenfassung & Bankverbindung' : 'Includes summary breakdown & bank coordinates'}
                </p>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800 flex items-center gap-1 shrink-0">
              <Paperclip className="w-3 h-3" /> PDF Render
            </span>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3.5 border-t border-slate-200">
            <div className="text-[11px] text-slate-500 text-center sm:text-left order-2 sm:order-1">
              {isDe ? 'Absender:' : 'Sender:'} <strong className="text-slate-700 font-mono">{businessProfile.brevoSenderEmail || businessProfile.email}</strong>
            </div>

            <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center gap-2 order-1 sm:order-2">
              <button
                type="button"
                onClick={onClose}
                className="w-full sm:w-auto px-4 py-2.5 sm:py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer text-center"
              >
                {isDe ? 'Abbrechen' : 'Cancel'}
              </button>
              <button
                type="submit"
                disabled={isSending}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 sm:py-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs font-bold rounded-xl shadow-md transition-all cursor-pointer disabled:opacity-50 text-center whitespace-nowrap"
              >
                <Send className="w-4 h-4 shrink-0" />
                <span>
                  {isSending
                    ? (isDe ? 'Wird übertragen...' : 'Transmitting...')
                    : (isOffer ? (isDe ? 'Angebot jetzt senden' : 'Send Quotation Now') : (isDe ? 'Rechnung jetzt senden' : 'Send Invoice Now'))}
                </span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
