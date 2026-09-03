import React, { useState, useEffect } from 'react';
import {
  X,
  Send,
  Mail,
  Paperclip,
  CheckCircle2,
  FileText,
  Sparkles,
  Info,
  ShieldCheck,
  Radio,
  Eye,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useApp } from '../../context/AppContext';
import { Invoice, Offer, EmailTemplateKey } from '../../types';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { generateDocumentEmail } from '../../utils/emailTemplateGenerator';

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
  const { businessProfile, emailTemplates, sendEmail, brevoStatus } = useApp();

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

  // Template replacer helper
  const populateTemplate = (tplKey: EmailTemplateKey) => {
    if (!doc) return;

    const tpl = emailTemplates.find((t) => t.key === tplKey) || emailTemplates[0];
    const client = doc.clientSnapshot;
    const docNumber = invoice ? `${invoice.prefix || ''}${invoice.number}` : `${businessProfile.offerPrefix || 'OFF-'}${offer?.number}`;
    const totalFormatted = formatCurrency(doc.total, doc.currency);
    const amountDueFormatted = invoice ? formatCurrency(invoice.amountDue, invoice.currency) : totalFormatted;
    const issueDateFormatted = formatDate(doc.date);
    const dueDateFormatted = invoice ? formatDate(invoice.dueDate) : formatDate(offer?.expiryDate);

    let replacedSubject = (tpl?.subject || 'Invoice from {business_name}')
      .replace(/{invoice_number}/g, docNumber)
      .replace(/{offer_number}/g, docNumber)
      .replace(/{business_name}/g, businessProfile.businessName)
      .replace(/{client_name}/g, client?.name || 'Client')
      .replace(/{due_date}/g, dueDateFormatted);

    let replacedBody = (tpl?.body || 'Please find attached your document.')
      .replace(/{client_name}/g, client?.name || 'Client')
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
  }, [doc, isOpen, selectedTemplateKey]);

  if (!isOpen || !doc) return null;

  const docNumber = invoice ? `${invoice.prefix || ''}${invoice.number}` : `${businessProfile.offerPrefix || 'OFF-'}${offer?.number}`;
  const attachmentName = `${invoice ? 'Invoice' : 'Quotation'}_${docNumber}.pdf`;

  const isBrevoActive = brevoStatus?.configured || (businessProfile.brevoApiKey && businessProfile.brevoApiKey.length > 5);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipientEmail) return;

    setIsSending(true);

    // Generate responsive HTML message
    const generated = generateDocumentEmail(doc, businessProfile, selectedTemplateKey, message);

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

  const previewHtml = generateDocumentEmail(doc, businessProfile, selectedTemplateKey, message).htmlContent;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900">
                  Send {invoice ? 'Invoice' : 'Quotation'} via Email
                </h3>
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  isBrevoActive ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                }`}>
                  <Radio className={`w-2.5 h-2.5 ${isBrevoActive ? 'text-emerald-500 animate-pulse' : 'text-amber-500'}`} />
                  {isBrevoActive ? 'Brevo Relay' : 'Email Gateway'}
                </span>
              </div>
              <p className="text-xs text-slate-500">Document #{docNumber} • {doc.clientSnapshot?.name}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSend} className="p-6 space-y-4 text-xs overflow-y-auto flex-1">
          {/* Email Template Selector */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1.5">
              Select Email Template
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {emailTemplates
                .filter((t) => (isOffer ? t.key.startsWith('offer') : !t.key.startsWith('offer')))
                .map((tpl) => (
                  <button
                    type="button"
                    key={tpl.id}
                    onClick={() => setSelectedTemplateKey(tpl.key)}
                    className={`px-3 py-2 rounded-lg text-left border transition-all cursor-pointer ${
                      selectedTemplateKey === tpl.key
                        ? 'border-blue-600 bg-blue-50/70 text-blue-900 font-semibold'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <p className="font-medium text-[11px] truncate">{tpl.name}</p>
                  </button>
                ))}
            </div>
          </div>

          {/* Recipient Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Recipient Email <span className="text-rose-500">*</span>
              </label>
              <input
                type="email"
                required
                value={recipientEmail}
                onChange={(e) => setRecipientEmail(e.target.value)}
                placeholder="client@company.com"
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Recipient Name
              </label>
              <input
                type="text"
                value={recipientName}
                onChange={(e) => setRecipientName(e.target.value)}
                placeholder="Client Name"
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Subject */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Email Subject
            </label>
            <input
              type="text"
              required
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none font-medium text-slate-900"
            />
          </div>

          {/* Email Body */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block font-semibold text-slate-700">
                Message Content Note
              </label>
              <button
                type="button"
                onClick={() => setShowPreview(!showPreview)}
                className="text-[11px] text-blue-600 font-semibold hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Eye className="w-3 h-3" />
                <span>{showPreview ? 'Hide HTML Preview' : 'Show HTML Preview'}</span>
              </button>
            </div>
            <textarea
              rows={4}
              required
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none font-sans text-xs leading-relaxed"
            />
          </div>

          {/* Live Preview Toggle */}
          {showPreview && (
            <div className="border border-slate-200 rounded-xl overflow-hidden bg-slate-50 p-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block px-2 py-1">
                Rendered Recipient HTML Preview
              </span>
              <div
                dangerouslySetInnerHTML={{ __html: previewHtml }}
                className="max-h-60 overflow-y-auto bg-white rounded-lg p-2 border border-slate-200"
              />
            </div>
          )}

          {/* Attachment Badge */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-rose-100 text-rose-600">
                <FileText className="w-4 h-4" />
              </div>
              <div>
                <p className="font-semibold text-slate-800">{attachmentName}</p>
                <p className="text-[10px] text-slate-500">Includes summary breakdown & bank coordinates</p>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800 flex items-center gap-1">
              <Paperclip className="w-3 h-3" /> PDF Render
            </span>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-200">
            <div className="text-[11px] text-slate-500">
              Sender: <strong className="text-slate-700">{businessProfile.brevoSenderEmail || businessProfile.email}</strong>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSending}
                className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs font-bold rounded-xl shadow-md transition-all cursor-pointer disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                <span>{isSending ? 'Transmitting...' : `Send ${invoice ? 'Invoice' : 'Quotation'} Now`}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
