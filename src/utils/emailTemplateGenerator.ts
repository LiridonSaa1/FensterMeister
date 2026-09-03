import { BusinessProfile, Invoice, Offer, EmailTemplateKey } from '../types';
import { formatCurrency, formatDate } from './formatters';

export interface GeneratedEmail {
  subject: string;
  htmlContent: string;
  textContent: string;
}

export function generateDocumentEmail(
  doc: Invoice | Offer,
  business: BusinessProfile,
  templateKey: EmailTemplateKey = 'invoice_sent',
  customMessage?: string
): GeneratedEmail {
  const isInvoice = 'dueDate' in doc;
  const isOffer = !isInvoice;
  const invoice = isInvoice ? (doc as Invoice) : undefined;
  const offer = isOffer ? (doc as Offer) : undefined;

  const docTypeLabel = isInvoice ? 'Invoice' : 'Quotation Proposal';
  const docNumber = isInvoice
    ? `${invoice?.prefix || ''}${invoice?.number}`
    : `${business.offerPrefix || 'OFF-'}${offer?.number}`;

  const client = doc.clientSnapshot;
  const currency = doc.currency || business.defaultCurrency || 'USD';
  const totalFormatted = formatCurrency(doc.total, currency);
  const amountDueFormatted = invoice
    ? formatCurrency(invoice.amountDue, currency)
    : totalFormatted;
  const issueDate = formatDate(doc.date);
  const dueDate = invoice ? formatDate(invoice.dueDate) : formatDate(offer?.expiryDate);

  // Subject line generation
  let subject = '';
  switch (templateKey) {
    case 'invoice_sent':
      subject = `Invoice #${docNumber} from ${business.businessName}`;
      break;
    case 'payment_reminder':
      subject = `Friendly Reminder: Invoice #${docNumber} is Due Soon`;
      break;
    case 'invoice_overdue':
      subject = `URGENT: Overdue Notice for Invoice #${docNumber}`;
      break;
    case 'payment_received':
      subject = `Payment Confirmation & Receipt for Invoice #${docNumber}`;
      break;
    case 'offer_sent':
      subject = `Quotation & Proposal #${docNumber} from ${business.businessName}`;
      break;
    case 'offer_accepted':
      subject = `Quotation #${docNumber} Accepted - Next Steps`;
      break;
    default:
      subject = `${docTypeLabel} #${docNumber} from ${business.businessName}`;
  }

  // Items rows
  const itemRowsHtml = doc.items
    .map(
      (item) => `
      <tr>
        <td style="padding: 10px 12px; border-bottom: 1px solid #f1f5f9; font-size: 13px; color: #334155;">
          <strong>${item.name}</strong>
          ${item.description ? `<br/><span style="font-size: 11px; color: #64748b;">${item.description}</span>` : ''}
        </td>
        <td style="padding: 10px 12px; border-bottom: 1px solid #f1f5f9; font-size: 13px; color: #334155; text-align: center;">
          ${item.quantity} ${item.unit || 'pcs'}
        </td>
        <td style="padding: 10px 12px; border-bottom: 1px solid #f1f5f9; font-size: 13px; color: #334155; text-align: right;">
          ${formatCurrency(item.unitPrice, currency)}
        </td>
        <td style="padding: 10px 12px; border-bottom: 1px solid #f1f5f9; font-size: 13px; font-weight: 600; color: #0f172a; text-align: right;">
          ${formatCurrency(item.total, currency)}
        </td>
      </tr>
    `
    )
    .join('');

  // Primary color
  const primaryColor = business.invoiceColors || '#2563eb';

  // HTML Content
  const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
  <style>
    body { margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b; }
    .wrapper { width: 100%; max-width: 620px; margin: 24px auto; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); }
    .header { background-color: ${primaryColor}; color: #ffffff; padding: 32px 28px; text-align: left; }
    .content { padding: 32px 28px; }
    .highlight-card { background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 18px 20px; margin-bottom: 24px; }
    .table { width: 100%; border-collapse: collapse; margin-top: 16px; }
    .footer { background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 20px 28px; font-size: 12px; color: #64748b; text-align: center; }
  </style>
</head>
<body>
  <div class="wrapper">
    <!-- Header -->
    <div class="header">
      <table style="width: 100%;">
        <tr>
          <td>
            <h1 style="margin: 0; font-size: 22px; font-weight: 800; letter-spacing: -0.5px;">${business.businessName}</h1>
            <p style="margin: 4px 0 0 0; font-size: 13px; opacity: 0.9;">${docTypeLabel} #${docNumber}</p>
          </td>
          <td style="text-align: right; vertical-align: top;">
            <span style="display: inline-block; background: rgba(255,255,255,0.2); padding: 4px 12px; border-radius: 9999px; font-size: 11px; font-weight: 700; text-transform: uppercase;">
              ${doc.status}
            </span>
          </td>
        </tr>
      </table>
    </div>

    <!-- Body -->
    <div class="content">
      <p style="font-size: 14px; margin-top: 0; color: #334155;">
        Dear <strong>${client.name}</strong>${client.companyName ? ` (${client.companyName})` : ''},
      </p>

      ${
        customMessage
          ? `<div style="font-size: 13.5px; line-height: 1.6; color: #334155; margin-bottom: 20px; white-space: pre-line;">${customMessage}</div>`
          : `<p style="font-size: 13.5px; line-height: 1.6; color: #334155; margin-bottom: 20px;">
              Please find attached your ${docTypeLabel.toLowerCase()} <strong>#${docNumber}</strong> from <strong>${business.businessName}</strong>.
            </p>`
      }

      <!-- Highlight Card -->
      <div class="highlight-card">
        <table style="width: 100%;">
          <tr>
            <td style="font-size: 12px; color: #64748b;">Amount Due:</td>
            <td style="text-align: right; font-size: 20px; font-weight: 800; color: ${primaryColor};">
              ${amountDueFormatted}
            </td>
          </tr>
          <tr>
            <td style="font-size: 12px; color: #64748b; padding-top: 6px;">Due Date:</td>
            <td style="text-align: right; font-size: 13px; font-weight: 600; color: #334155; padding-top: 6px;">
              ${dueDate}
            </td>
          </tr>
          <tr>
            <td style="font-size: 12px; color: #64748b; padding-top: 4px;">Issue Date:</td>
            <td style="text-align: right; font-size: 13px; color: #64748b; padding-top: 4px;">
              ${issueDate}
            </td>
          </tr>
        </table>
      </div>

      <!-- Line Items Overview -->
      <h3 style="font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px; color: #64748b; margin-bottom: 8px;">
        Document Summary (${doc.items.length} item${doc.items.length === 1 ? '' : 's'})
      </h3>
      <table class="table">
        <thead>
          <tr style="background-color: #f1f5f9; text-align: left; font-size: 11px; text-transform: uppercase; color: #475569;">
            <th style="padding: 8px 12px;">Item / Description</th>
            <th style="padding: 8px 12px; text-align: center;">Qty</th>
            <th style="padding: 8px 12px; text-align: right;">Rate</th>
            <th style="padding: 8px 12px; text-align: right;">Total</th>
          </tr>
        </thead>
        <tbody>
          ${itemRowsHtml}
        </tbody>
        <tfoot>
          <tr>
            <td colspan="3" style="padding: 10px 12px; text-align: right; font-size: 12px; color: #64748b;">Subtotal:</td>
            <td style="padding: 10px 12px; text-align: right; font-size: 13px; font-weight: 600; color: #1e293b;">${formatCurrency(doc.subtotal, currency)}</td>
          </tr>
          ${
            doc.vatTotal > 0
              ? `<tr>
                  <td colspan="3" style="padding: 4px 12px; text-align: right; font-size: 12px; color: #64748b;">VAT / Tax:</td>
                  <td style="padding: 4px 12px; text-align: right; font-size: 13px; color: #1e293b;">${formatCurrency(doc.vatTotal, currency)}</td>
                </tr>`
              : ''
          }
          <tr>
            <td colspan="3" style="padding: 10px 12px; text-align: right; font-size: 14px; font-weight: 700; color: #0f172a; border-top: 1px solid #e2e8f0;">Total:</td>
            <td style="padding: 10px 12px; text-align: right; font-size: 16px; font-weight: 800; color: ${primaryColor}; border-top: 1px solid #e2e8f0;">${totalFormatted}</td>
          </tr>
        </tfoot>
      </table>

      <!-- Payment Coordinates (if available) -->
      ${
        business.iban || business.bankName
          ? `
        <div style="margin-top: 24px; padding: 16px 18px; background-color: #f8fafc; border: 1px dashed #cbd5e1; border-radius: 12px; font-size: 12px;">
          <strong style="color: #0f172a; display: block; margin-bottom: 6px;">Remittance & Bank Coordinates:</strong>
          ${business.bankName ? `<div>Bank Name: <strong>${business.bankName}</strong></div>` : ''}
          ${business.iban ? `<div>IBAN: <strong>${business.iban}</strong></div>` : ''}
          ${business.swiftBic ? `<div>SWIFT / BIC: <strong>${business.swiftBic}</strong></div>` : ''}
        </div>
      `
          : ''
      }
    </div>

    <!-- Footer -->
    <div class="footer">
      <p style="margin: 0 0 4px 0;"><strong>${business.businessName}</strong></p>
      <p style="margin: 0; opacity: 0.8;">
        ${business.businessAddress ? `${business.businessAddress}, ` : ''}${business.city ? `${business.city}, ` : ''}${business.country || ''}
      </p>
      <p style="margin: 4px 0 0 0; opacity: 0.8;">
        Email: ${business.email} ${business.phone ? `• Tel: ${business.phone}` : ''}
      </p>
    </div>
  </div>
</body>
</html>
  `;

  // Text content version
  const textContent = `
${business.businessName}
${docTypeLabel} #${docNumber}
==================================================

Dear ${client.name},

${customMessage || `Please find attached your ${docTypeLabel.toLowerCase()} #${docNumber}.`}

SUMMARY:
- Total Amount: ${totalFormatted}
- Amount Due: ${amountDueFormatted}
- Issue Date: ${issueDate}
- Due Date: ${dueDate}

BANK DETAILS:
Bank: ${business.bankName || 'N/A'}
IBAN: ${business.iban || 'N/A'}
SWIFT/BIC: ${business.swiftBic || 'N/A'}

Contact: ${business.email} | ${business.phone}
==================================================
`;

  return {
    subject,
    htmlContent,
    textContent,
  };
}
