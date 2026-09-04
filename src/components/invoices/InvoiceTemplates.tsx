import React from 'react';
import { Invoice, BusinessProfile, Offer } from '../../types';
import { formatCurrency, formatDate, getLineItemImage } from '../../utils/formatters';
import { WindowItemImage } from '../windows/WindowSvgIcons';

interface InvoiceTemplateProps {
  invoice?: Invoice;
  offer?: Offer;
  businessProfile: BusinessProfile;
  previewMode?: boolean;
}

export const InvoiceDocumentRenderer: React.FC<InvoiceTemplateProps> = ({
  invoice,
  offer,
  businessProfile,
  previewMode = false,
}) => {
  // Determine if we're rendering an invoice or an offer
  const isOffer = !invoice && !!offer;
  const doc = invoice || offer;
  if (!doc) return null;

  const template = doc.template || businessProfile.invoiceTemplate || 'modern';
  const primaryColor = doc.primaryColor || businessProfile.invoiceColors || '#2563eb';
  const currency = doc.currency || businessProfile.defaultCurrency || 'USD';
  const selectedFont = doc.font || businessProfile.font || 'Plus Jakarta Sans';
  const fontClass =
    selectedFont === 'Cinzel'
      ? 'font-cinzel'
      : selectedFont === 'Playfair Display'
      ? 'font-playfair'
      : selectedFont === 'Outfit'
      ? 'font-outfit'
      : selectedFont === 'IBM Plex Mono'
      ? 'font-mono-code'
      : selectedFont === 'Inter'
      ? 'font-inter'
      : selectedFont === 'Plus Jakarta Sans'
      ? 'font-jakarta'
      : '';

  const logoPosition = doc.logoPosition || businessProfile.logoPosition || 'left';
  const tableStyle = doc.tableStyle || businessProfile.tableStyle || 'clean';

  const client = doc.clientSnapshot;
  const items = doc.items || [];

  const subtotal = doc.subtotal || 0;
  const discountTotal = invoice ? invoice.discountAmount : offer?.discountAmount || 0;
  const vatTotal = doc.vatTotal || 0;
  const shipping = doc.shippingFee || 0;
  const additionalCharges = invoice?.additionalCharges || 0;
  const grandTotal = doc.total || 0;
  const amountPaid = invoice?.amountPaid || 0;
  const amountDue = invoice?.amountDue ?? grandTotal;

  const isDe = businessProfile.language === 'de';

  const docNumber = invoice ? `${invoice.prefix || ''}${invoice.number}` : `${businessProfile.offerPrefix || 'OFF-'}${offer?.number}`;
  const docTitle = invoice ? (isDe ? 'RECHNUNG' : 'INVOICE') : (isDe ? 'ANGEBOT / KOSTENVORANSCHLAG' : 'QUOTATION / OFFER');
  const docDate = formatDate(doc.date);
  const docDueDate = invoice ? formatDate(invoice.dueDate) : formatDate(offer?.expiryDate);
  const dueDateLabel = invoice ? (isDe ? 'Fälligkeitsdatum' : 'Due Date') : (isDe ? 'Gültig bis' : 'Valid Until');
  const issueDateLabel = isDe ? 'Ausstellungsdatum' : 'Issue Date';
  const termsLabel = isDe ? 'Zahlungsziel' : 'Terms';
  const billedToLabel = isOffer ? (isDe ? 'Angebot erstellt für' : 'Quotation Prepared For') : (isDe ? 'Rechnungsempfänger' : 'Billed To');
  const bankingLabel = isDe ? 'Zahlungsanweisungen & Bankverbindung' : 'Payment Instructions & Banking';
  const itemCol = isDe ? 'Artikel & Beschreibung' : 'Item & Description';
  const qtyCol = isDe ? 'Menge' : 'Qty';
  const priceCol = isDe ? 'Einzelpreis' : 'Unit Price';
  const discCol = isDe ? 'Rabatt' : 'Disc';
  const vatCol = isDe ? 'MwSt' : 'VAT';
  const amountCol = isDe ? 'Gesamtbetrag' : 'Amount';
  const subtotalLabel = isDe ? 'Zwischensumme' : 'Subtotal';
  const discountLabel = isDe ? 'Rabatt' : 'Discount';
  const vatTaxLabel = isDe ? 'MwSt / Steuer' : 'VAT / Tax Total';
  const shippingLabel = isDe ? 'Versand & Verpackung' : 'Shipping & Handling';
  const grandTotalLabel = isDe ? 'Gesamtsumme' : 'Grand Total';
  const amountPaidLabel = isDe ? 'Bereits bezahlt' : 'Amount Paid';
  const amountDueLabel = isDe ? 'Fälliger Betrag' : 'Amount Due';
  const notesLabel = isDe ? 'Hinweise / Anmerkungen' : 'Notes';
  const termsConditionsLabel = isDe ? 'Geschäftsbedingungen' : 'Terms & Conditions';
  const signatoryLabel = isDe ? 'Bevollmächtigter Unterzeichner' : 'Authorized Signatory';
  const bankTransferLabel = isDe ? 'Banküberweisung Details' : 'Bank Transfer Details';

  // Table style helpers
  const getTableClasses = () => {
    switch (tableStyle) {
      case 'striped':
        return 'divide-y divide-slate-200 [&_tbody_tr:nth-child(even)]:bg-slate-50/70';
      case 'bordered':
        return 'border border-slate-200 divide-y divide-slate-200 [&_td]:border-x [&_td]:border-slate-100 [&_th]:border-x [&_th]:border-slate-200';
      case 'minimal':
        return 'border-b border-slate-200 [&_th]:border-b [&_th]:border-slate-300';
      case 'clean':
      default:
        return 'divide-y divide-slate-100';
    }
  };

  // Status Badge
  const renderStatusBadge = () => {
    const status = invoice ? invoice.status : offer?.status;
    let colorClass = 'bg-slate-100 text-slate-700 border-slate-300';
    if (status === 'paid' || status === 'accepted') colorClass = 'bg-emerald-50 text-emerald-700 border-emerald-300';
    if (status === 'unpaid' || status === 'sent') colorClass = 'bg-blue-50 text-blue-700 border-blue-300';
    if (status === 'overdue' || status === 'rejected') colorClass = 'bg-rose-50 text-rose-700 border-rose-300';
    if (status === 'converted') colorClass = 'bg-purple-50 text-purple-700 border-purple-300';

    const getLocalizedStatus = (st?: string) => {
      if (!st) return '';
      if (!isDe) return st;
      switch (st) {
        case 'paid': return 'Bezahlt';
        case 'unpaid': return 'Offen';
        case 'overdue': return 'Überfällig';
        case 'draft': return 'Entwurf';
        case 'sent': return 'Gesendet';
        case 'accepted': return 'Angenommen';
        case 'rejected': return 'Abgelehnt';
        case 'converted': return 'Umgewandelt';
        default: return st;
      }
    };

    return (
      <span
        id="doc-status-badge"
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold tracking-wider uppercase border ${colorClass}`}
      >
        {getLocalizedStatus(status)}
      </span>
    );
  };

  const renderTemplate = () => {
    // 1. MODERN TEMPLATE
    if (template === 'modern') {
      return (
        <div
          className={`bg-white text-slate-800 p-8 sm:p-12 max-w-4xl mx-auto shadow-sm rounded-xl border border-slate-200/80 printable-invoice-container ${fontClass}`}
        >
        {/* Top Accent Bar */}
        <div className="h-2 rounded-t-xl mb-8 -mt-8 -mx-8 sm:-mt-12 sm:-mx-12" style={{ backgroundColor: primaryColor }} />

        {/* Header Header Info */}
        <div className="flex flex-col sm:flex-row justify-between items-start gap-6 pb-8 border-b border-slate-100">
          <div className={`flex flex-col ${logoPosition === 'right' ? 'sm:order-2 sm:items-end' : logoPosition === 'center' ? 'sm:items-center sm:w-full' : 'items-start'}`}>
            {businessProfile.logo ? (
              <img
                src={businessProfile.logo}
                alt={businessProfile.businessName}
                referrerPolicy="no-referrer"
                className="h-12 w-auto object-contain rounded-lg mb-3 shadow-xs"
              />
            ) : null}
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">{businessProfile.businessName}</h1>
            <div className="text-xs text-slate-500 mt-1.5 space-y-0.5 max-w-xs">
              <p>{businessProfile.businessAddress}, {businessProfile.city}</p>
              <p>{businessProfile.country} • Tel: {businessProfile.phone}</p>
              <p>Email: {businessProfile.email} • {businessProfile.website}</p>
              {businessProfile.vatNumber && <p>VAT Reg: <span className="font-mono text-slate-700">{businessProfile.vatNumber}</span></p>}
              {businessProfile.businessRegistrationNumber && <p>Business Reg: {businessProfile.businessRegistrationNumber}</p>}
            </div>
          </div>

          <div className={`flex flex-col sm:items-end text-left sm:text-right ${logoPosition === 'right' ? 'sm:order-1' : ''}`}>
            <div className="flex items-center gap-3 justify-end mb-2">
              <span className="text-xs font-bold tracking-widest text-slate-400 uppercase">Document</span>
              {renderStatusBadge()}
            </div>
            <h2 className="text-3xl font-extrabold tracking-tight" style={{ color: primaryColor }}>
              {docTitle}
            </h2>
            <p className="text-sm font-semibold font-mono text-slate-800 mt-1">#{docNumber}</p>

            <div className="mt-4 text-xs text-slate-600 space-y-1 bg-slate-50 p-3 rounded-lg border border-slate-100 min-w-[200px]">
              <div className="flex justify-between gap-4">
                <span className="text-slate-500">{issueDateLabel}:</span>
                <span className="font-medium text-slate-800">{docDate}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-slate-500">{dueDateLabel}:</span>
                <span className="font-semibold text-slate-900">{docDueDate}</span>
              </div>
              {invoice?.paymentTerms && (
                <div className="flex justify-between gap-4">
                  <span className="text-slate-500">{termsLabel}:</span>
                  <span className="text-slate-800">{invoice.paymentTerms}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Bill To & Client Info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 py-8 border-b border-slate-100">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-2">
              {billedToLabel}
            </span>
            <h3 className="text-base font-bold text-slate-900">{client.name}</h3>
            {client.companyName && <p className="text-sm font-semibold text-slate-700">{client.companyName}</p>}
            <div className="text-xs text-slate-500 mt-1 space-y-0.5">
              <p>{client.address}</p>
              <p>{client.city}, {client.country}</p>
              <p>Email: {client.email}</p>
              {client.phone && <p>{isDe ? 'Tel' : 'Phone'}: {client.phone}</p>}
              {client.vatNumber && <p>{isDe ? 'USt-IdNr.' : 'VAT'}: <span className="font-mono text-slate-700">{client.vatNumber}</span></p>}
            </div>
          </div>

          <div className="bg-slate-50/60 p-4 rounded-xl border border-slate-100 flex flex-col justify-between">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-2">
                {bankingLabel}
              </span>
              <p className="text-xs text-slate-700 font-medium">{businessProfile.bankName}</p>
              <p className="text-xs font-mono text-slate-600 mt-0.5">IBAN: {businessProfile.iban}</p>
              <p className="text-xs font-mono text-slate-600">SWIFT / BIC: {businessProfile.swiftBic}</p>
            </div>
            {invoice?.paymentInstructions && (
              <p className="text-[11px] text-slate-500 mt-2 italic border-t border-slate-200/60 pt-2">
                {invoice.paymentInstructions}
              </p>
            )}
          </div>
        </div>

        {/* Line Items Table */}
        <div className="py-6 overflow-x-auto">
          <table className={`w-full text-left border-collapse text-xs ${getTableClasses()}`}>
            <thead>
              <tr className="border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-3">{itemCol}</th>
                <th className="py-3 px-2 text-center w-16">{qtyCol}</th>
                <th className="py-3 px-2 text-right w-24">{priceCol}</th>
                <th className="py-3 px-2 text-right w-20">{discCol}</th>
                <th className="py-3 px-2 text-right w-16">{vatCol}</th>
                <th className="py-3 px-3 text-right w-28">{amountCol}</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, idx) => {
                const itemImg = getLineItemImage(item);
                return (
                  <tr key={item.id || idx} className="hover:bg-slate-50/40">
                    <td className="py-3 px-3">
                      <div className="flex items-start gap-2.5">
                        <WindowItemImage item={item} className="w-9 h-9 rounded-lg shrink-0 border border-slate-200" />
                        <div>
                          <p className="font-semibold text-slate-900">{item.name}</p>
                        {item.description && (
                          <p className="text-slate-500 text-[11px] mt-0.5 line-clamp-2">{item.description}</p>
                        )}
                        {item.sku && <span className="text-[10px] font-mono text-slate-400">SKU: {item.sku}</span>}
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-2 text-center font-medium text-slate-700">
                    {item.quantity} <span className="text-[10px] text-slate-400">{item.unit}</span>
                  </td>
                  <td className="py-3 px-2 text-right font-medium text-slate-700">
                    {formatCurrency(item.unitPrice, currency)}
                  </td>
                  <td className="py-3 px-2 text-right text-slate-500">
                    {item.discount > 0 ? (item.discountType === 'percentage' ? `${item.discount}%` : formatCurrency(item.discount, currency)) : '-'}
                  </td>
                  <td className="py-3 px-2 text-right text-slate-500">
                    {item.vatRate > 0 ? `${item.vatRate}%` : '0%'}
                  </td>
                  <td className="py-3 px-3 text-right font-semibold text-slate-900">
                    {formatCurrency(item.total, currency)}
                  </td>
                </tr>
              );
            })}
            </tbody>
          </table>
        </div>

        {/* Totals Calculation Breakdown */}
        <div className="flex flex-col sm:flex-row justify-between items-start gap-6 py-6 border-t border-slate-100">
          <div className="w-full sm:w-1/2 space-y-3 text-xs text-slate-600">
            {doc.notes && (
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                <span className="font-semibold text-slate-800 block mb-1">{notesLabel}:</span>
                <p className="whitespace-pre-line text-slate-600">{doc.notes}</p>
              </div>
            )}
            {(invoice?.termsAndConditions || offer?.terms) && (
              <div>
                <span className="font-semibold text-slate-700 block mb-0.5 text-[11px]">{termsConditionsLabel}:</span>
                <p className="text-[11px] text-slate-500">{invoice?.termsAndConditions || offer?.terms}</p>
              </div>
            )}
          </div>

          <div className="w-full sm:w-72 space-y-2 text-xs">
            <div className="flex justify-between py-1 border-b border-slate-100 text-slate-600">
              <span>{subtotalLabel}:</span>
              <span className="font-medium text-slate-800">{formatCurrency(subtotal, currency)}</span>
            </div>
            {discountTotal > 0 && (
              <div className="flex justify-between py-1 border-b border-slate-100 text-emerald-600">
                <span>{discountLabel}:</span>
                <span className="font-medium">-{formatCurrency(discountTotal, currency)}</span>
              </div>
            )}
            {vatTotal > 0 && (
              <div className="flex justify-between py-1 border-b border-slate-100 text-slate-600">
                <span>{vatTaxLabel}:</span>
                <span className="font-medium text-slate-800">{formatCurrency(vatTotal, currency)}</span>
              </div>
            )}
            {shipping > 0 && (
              <div className="flex justify-between py-1 border-b border-slate-100 text-slate-600">
                <span>{shippingLabel}:</span>
                <span className="font-medium text-slate-800">{formatCurrency(shipping, currency)}</span>
              </div>
            )}
            {additionalCharges > 0 && (
              <div className="flex justify-between py-1 border-b border-slate-100 text-slate-600">
                <span>{invoice?.additionalChargesLabel || (isDe ? 'Zusätzliche Gebühren' : 'Additional Charges')}:</span>
                <span className="font-medium text-slate-800">{formatCurrency(additionalCharges, currency)}</span>
              </div>
            )}

            <div
              className="flex justify-between py-2.5 px-3 rounded-lg text-sm font-bold text-white mt-2"
              style={{ backgroundColor: primaryColor }}
            >
              <span>{grandTotalLabel}:</span>
              <span>{formatCurrency(grandTotal, currency)}</span>
            </div>

            {invoice && (
              <div className="pt-2 space-y-1.5">
                <div className="flex justify-between text-xs text-slate-600">
                  <span>{amountPaidLabel}:</span>
                  <span className="font-medium text-emerald-600">{formatCurrency(amountPaid, currency)}</span>
                </div>
                <div className="flex justify-between text-xs font-bold text-slate-900 border-t border-slate-200 pt-1.5">
                  <span>{amountDueLabel}:</span>
                  <span className="text-sm" style={{ color: primaryColor }}>
                    {formatCurrency(amountDue, currency)}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Signature & Footer */}
        <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-end gap-6 text-xs text-slate-500">
          <div className="text-[11px] max-w-md">
            <p>{invoice?.customFooter || businessProfile.defaultInvoiceFooter}</p>
          </div>

          {(invoice?.showSignature || businessProfile.signature) && (
            <div className="flex flex-col items-center sm:items-end">
              <div className="h-14 w-40 flex items-center justify-center mb-1">
                {businessProfile.signature.startsWith('data:') || businessProfile.signature.startsWith('http') ? (
                  <img
                    src={businessProfile.signature}
                    alt="Authorized Signature"
                    referrerPolicy="no-referrer"
                    className="h-full object-contain"
                  />
                ) : (
                  <span className="font-playfair italic text-lg text-slate-700">{businessProfile.signature}</span>
                )}
              </div>
              <div className="border-t border-slate-300 w-48 text-center sm:text-right pt-1">
                <p className="font-semibold text-slate-800 text-[11px]">{businessProfile.signatureName || businessProfile.businessName}</p>
                <p className="text-[10px] text-slate-500">{businessProfile.signatureTitle || signatoryLabel}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // 2. MINIMAL TEMPLATE
  if (template === 'minimal') {
    return (
      <div
        id="invoice-printable-target"
        className={`bg-white text-slate-900 p-8 sm:p-12 max-w-4xl mx-auto rounded-none border border-slate-200 printable-invoice-container ${fontClass}`}
      >
        <div className="flex justify-between items-baseline border-b border-slate-900 pb-4 mb-8">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-950 uppercase">{businessProfile.businessName}</h1>
            <p className="text-xs text-slate-500">{businessProfile.city}, {businessProfile.country}</p>
          </div>
          <div className="text-right">
            <p className="text-xs uppercase font-mono tracking-wider text-slate-400">{docTitle}</p>
            <p className="text-lg font-bold font-mono">#{docNumber}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-xs mb-8 border-b border-slate-100 pb-6">
          <div>
            <span className="text-[10px] uppercase tracking-wider text-slate-400 block mb-1">{billedToLabel}</span>
            <p className="font-bold text-slate-900">{client.name}</p>
            {client.companyName && <p className="text-slate-600">{client.companyName}</p>}
            <p className="text-slate-500 mt-0.5">{client.email}</p>
          </div>
          <div>
            <span className="text-[10px] uppercase tracking-wider text-slate-400 block mb-1">{issueDateLabel}</span>
            <p className="font-medium text-slate-800">{docDate}</p>
          </div>
          <div>
            <span className="text-[10px] uppercase tracking-wider text-slate-400 block mb-1">{dueDateLabel}</span>
            <p className="font-medium text-slate-800">{docDueDate}</p>
          </div>
          <div className="text-right">
            <span className="text-[10px] uppercase tracking-wider text-slate-400 block mb-1">{isDe ? 'Status' : 'Status'}</span>
            <div>{renderStatusBadge()}</div>
          </div>
        </div>

        {/* Table */}
        <table className="w-full text-xs text-left mb-8">
          <thead>
            <tr className="border-b border-slate-300 text-slate-500 uppercase text-[10px] tracking-wider">
              <th className="py-2.5">{itemCol}</th>
              <th className="py-2.5 text-center w-16">{qtyCol}</th>
              <th className="py-2.5 text-right w-24">{priceCol}</th>
              <th className="py-2.5 text-right w-24">{amountCol}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
              {items.map((item, idx) => {
                const itemImg = getLineItemImage(item);
                return (
                  <tr key={idx}>
                    <td className="py-3 pr-4">
                      <div className="flex items-start gap-2.5">
                        <WindowItemImage item={item} className="w-9 h-9 rounded-lg shrink-0 border border-slate-200" />
                        <div>
                          <p className="font-medium text-slate-900">{item.name}</p>
                          {item.description && <p className="text-slate-500 text-[11px] mt-0.5">{item.description}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="py-3 text-center text-slate-600">{item.quantity} {item.unit}</td>
                    <td className="py-3 text-right text-slate-600">{formatCurrency(item.unitPrice, currency)}</td>
                    <td className="py-3 text-right font-medium text-slate-900">{formatCurrency(item.total, currency)}</td>
                  </tr>
                );
              })}
          </tbody>
        </table>

        {/* Summary */}
        <div className="flex justify-end border-t border-slate-900 pt-4">
          <div className="w-64 space-y-1.5 text-xs">
            <div className="flex justify-between text-slate-600">
              <span>{subtotalLabel}</span>
              <span>{formatCurrency(subtotal, currency)}</span>
            </div>
            {vatTotal > 0 && (
              <div className="flex justify-between text-slate-600">
                <span>{vatTaxLabel} ({businessProfile.defaultVatRate}%)</span>
                <span>{formatCurrency(vatTotal, currency)}</span>
              </div>
            )}
            <div className="flex justify-between text-base font-bold text-slate-950 border-t border-slate-200 pt-2 mt-2">
              <span>{grandTotalLabel}</span>
              <span>{formatCurrency(grandTotal, currency)}</span>
            </div>
            {invoice && (
              <div className="flex justify-between text-xs font-semibold text-slate-700 pt-1">
                <span>{amountDueLabel}</span>
                <span>{formatCurrency(amountDue, currency)}</span>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-12 pt-6 border-t border-slate-200 text-[11px] text-slate-500 flex justify-between">
          <div>
            <p className="font-mono">IBAN: {businessProfile.iban}</p>
            <p>SWIFT / BIC: {businessProfile.swiftBic}</p>
          </div>
          <div className="text-right">
            <p>{businessProfile.email}</p>
            <p>{businessProfile.website}</p>
          </div>
        </div>
      </div>
    );
  }

  // 3. PROFESSIONAL TEMPLATE
  if (template === 'professional') {
    return (
      <div
        id="invoice-printable-target"
        className={`bg-white text-slate-800 p-8 sm:p-12 max-w-4xl mx-auto rounded-lg border border-slate-200 shadow-sm printable-invoice-container ${fontClass}`}
      >
        <div className="flex justify-between items-start pb-6 border-b-2 border-slate-800">
          <div className="flex items-center gap-4">
            {businessProfile.logo && (
              <img
                src={businessProfile.logo}
                alt="Logo"
                referrerPolicy="no-referrer"
                className="h-14 w-auto object-contain"
              />
            )}
            <div>
              <h1 className="text-xl font-bold text-slate-900 uppercase tracking-tight">{businessProfile.businessName}</h1>
              <p className="text-xs text-slate-500">{businessProfile.businessAddress} • {businessProfile.city}</p>
              <p className="text-xs text-slate-500">{isDe ? 'USt-IdNr.' : 'VAT'}: {businessProfile.vatNumber || 'N/A'}</p>
            </div>
          </div>

          <div className="text-right bg-slate-900 text-white px-5 py-3 rounded">
            <p className="text-xs uppercase tracking-widest text-slate-300 font-semibold">{docTitle}</p>
            <p className="text-lg font-mono font-bold">#{docNumber}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-8 my-6 bg-slate-50 p-4 rounded border border-slate-200 text-xs">
          <div>
            <h4 className="font-bold text-slate-900 uppercase text-[11px] mb-1">{billedToLabel}:</h4>
            <p className="font-semibold text-slate-800">{client.name}</p>
            {client.companyName && <p className="text-slate-700">{client.companyName}</p>}
            <p className="text-slate-500">{client.address}, {client.city}, {client.country}</p>
            {client.vatNumber && <p className="text-slate-500 font-mono">{isDe ? 'USt-IdNr.' : 'VAT'}: {client.vatNumber}</p>}
          </div>
          <div className="space-y-1 text-right sm:text-left">
            <div className="flex justify-between">
              <span className="text-slate-500">{issueDateLabel}:</span>
              <span className="font-medium text-slate-800">{docDate}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">{dueDateLabel}:</span>
              <span className="font-bold text-slate-900">{docDueDate}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Status:</span>
              <div>{renderStatusBadge()}</div>
            </div>
          </div>
        </div>

        {/* Table */}
        <table className="w-full text-xs text-left border border-slate-200 mb-6">
          <thead className="bg-slate-800 text-white uppercase text-[10px]">
            <tr>
              <th className="py-2.5 px-3">{itemCol}</th>
              <th className="py-2.5 px-2 text-center w-16">{qtyCol}</th>
              <th className="py-2.5 px-3 text-right w-24">{priceCol}</th>
              <th className="py-2.5 px-2 text-right w-16">{vatCol}</th>
              <th className="py-2.5 px-3 text-right w-28">{amountCol}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {items.map((item, idx) => {
              return (
                <tr key={idx} className={idx % 2 === 1 ? 'bg-slate-50/70' : ''}>
                  <td className="py-2.5 px-3">
                    <div className="flex items-start gap-2.5">
                      <WindowItemImage item={item} className="w-9 h-9 rounded-lg shrink-0 border border-slate-200" />
                      <div>
                        <span className="font-bold text-slate-900">{item.name}</span>
                        {item.description && <p className="text-slate-500 text-[11px]">{item.description}</p>}
                      </div>
                    </div>
                  </td>
                  <td className="py-2.5 px-2 text-center">{item.quantity}</td>
                  <td className="py-2.5 px-3 text-right">{formatCurrency(item.unitPrice, currency)}</td>
                  <td className="py-2.5 px-2 text-right">{item.vatRate}%</td>
                  <td className="py-2.5 px-3 text-right font-semibold">{formatCurrency(item.total, currency)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* Bottom */}
        <div className="grid grid-cols-2 gap-8 items-start">
          <div className="text-xs text-slate-600 bg-slate-50 p-3 rounded border border-slate-200 space-y-1">
            <p className="font-bold text-slate-800">{bankTransferLabel}:</p>
            <p>{isDe ? 'Bank' : 'Bank'}: {businessProfile.bankName}</p>
            <p className="font-mono">IBAN: {businessProfile.iban}</p>
            <p className="font-mono">SWIFT / BIC: {businessProfile.swiftBic}</p>
          </div>

          <div className="space-y-1.5 text-xs text-right">
            <div className="flex justify-between text-slate-600">
              <span>{subtotalLabel}:</span>
              <span className="font-medium">{formatCurrency(subtotal, currency)}</span>
            </div>
            {vatTotal > 0 && (
              <div className="flex justify-between text-slate-600">
                <span>{vatTaxLabel}:</span>
                <span className="font-medium">{formatCurrency(vatTotal, currency)}</span>
              </div>
            )}
            <div className="flex justify-between text-sm font-bold text-slate-900 border-t-2 border-slate-800 pt-2">
              <span>{grandTotalLabel}:</span>
              <span>{formatCurrency(grandTotal, currency)}</span>
            </div>
            {invoice && (
              <div className="flex justify-between text-xs font-bold text-slate-800">
                <span>{amountDueLabel}:</span>
                <span className="text-slate-900">{formatCurrency(amountDue, currency)}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // 4. CORPORATE TEMPLATE
  if (template === 'corporate') {
    return (
      <div
        id="invoice-printable-target"
        className={`bg-white text-slate-800 max-w-4xl mx-auto rounded-xl border border-slate-200 overflow-hidden shadow-sm printable-invoice-container ${fontClass}`}
      >
        {/* Full colored Corporate Banner */}
        <div className="p-8 text-white flex justify-between items-center" style={{ backgroundColor: primaryColor }}>
          <div className="flex items-center gap-4">
            {businessProfile.logo && (
              <img
                src={businessProfile.logo}
                alt="Logo"
                referrerPolicy="no-referrer"
                className="h-12 w-auto object-contain bg-white/10 p-1.5 rounded"
              />
            )}
            <div>
              <h1 className="text-2xl font-bold tracking-tight">{businessProfile.businessName}</h1>
              <p className="text-xs text-white/80">{businessProfile.website} • {businessProfile.email}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs uppercase tracking-widest text-white/70 font-semibold">{docTitle}</p>
            <p className="text-2xl font-mono font-extrabold">#{docNumber}</p>
          </div>
        </div>

        <div className="p-8">
          <div className="grid grid-cols-2 gap-8 pb-6 border-b border-slate-200 text-xs">
            <div>
              <span className="text-[11px] font-bold uppercase text-slate-400 block mb-1">{billedToLabel}</span>
              <p className="text-sm font-bold text-slate-900">{client.name}</p>
              {client.companyName && <p className="font-semibold text-slate-700">{client.companyName}</p>}
              <p className="text-slate-500 mt-1">{client.address}</p>
              <p className="text-slate-500">{client.city}, {client.country}</p>
              <p className="text-slate-500">Email: {client.email}</p>
            </div>
            <div className="space-y-1 text-right">
              <p><span className="text-slate-400">{issueDateLabel}:</span> <span className="font-semibold text-slate-800">{docDate}</span></p>
              <p><span className="text-slate-400">{dueDateLabel}:</span> <span className="font-semibold text-slate-800">{docDueDate}</span></p>
              <div className="pt-2">{renderStatusBadge()}</div>
            </div>
          </div>

          <table className="w-full text-xs text-left my-6">
            <thead className="bg-slate-100 text-slate-700 uppercase font-bold text-[11px]">
              <tr>
                <th className="py-3 px-3">{itemCol}</th>
                <th className="py-3 px-2 text-center w-16">{qtyCol}</th>
                <th className="py-3 px-3 text-right w-24">{priceCol}</th>
                <th className="py-3 px-3 text-right w-28">{amountCol}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {items.map((item, idx) => {
                return (
                  <tr key={idx} className="hover:bg-slate-50">
                    <td className="py-3 px-3">
                      <div className="flex items-start gap-2.5">
                        <WindowItemImage item={item} className="w-9 h-9 rounded-lg shrink-0 border border-slate-200" />
                        <div>
                          <p className="font-bold text-slate-900">{item.name}</p>
                          {item.description && <p className="text-slate-500 text-[11px]">{item.description}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-2 text-center font-medium">{item.quantity}</td>
                    <td className="py-3 px-3 text-right">{formatCurrency(item.unitPrice, currency)}</td>
                    <td className="py-3 px-3 text-right font-bold text-slate-900">{formatCurrency(item.total, currency)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          <div className="flex justify-end pt-4 border-t border-slate-200">
            <div className="w-72 space-y-2 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>{subtotalLabel}:</span>
                <span>{formatCurrency(subtotal, currency)}</span>
              </div>
              {vatTotal > 0 && (
                <div className="flex justify-between text-slate-600">
                  <span>{vatTaxLabel} ({businessProfile.defaultVatRate}%):</span>
                  <span>{formatCurrency(vatTotal, currency)}</span>
                </div>
              )}
              <div className="flex justify-between text-base font-bold text-slate-900 pt-2 border-t border-slate-300">
                <span>{grandTotalLabel}:</span>
                <span>{formatCurrency(grandTotal, currency)}</span>
              </div>
              {invoice && (
                <div className="flex justify-between text-xs font-semibold text-slate-700">
                  <span>{amountDueLabel}:</span>
                  <span>{formatCurrency(amountDue, currency)}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 5. ELEGANT TEMPLATE
  return (
    <div
      id="invoice-printable-target"
      className={`bg-[#fdfcfb] text-slate-800 p-8 sm:p-14 max-w-4xl mx-auto rounded-lg border border-amber-900/10 shadow-sm printable-invoice-container font-playfair ${fontClass}`}
    >
      <div className="border-b-2 border-amber-900/20 pb-8 text-center">
        {businessProfile.logo && (
          <img
            src={businessProfile.logo}
            alt="Logo"
            referrerPolicy="no-referrer"
            className="h-16 w-auto mx-auto mb-3 object-contain"
          />
        )}
        <h1 className="text-2xl font-bold tracking-widest uppercase text-slate-900">{businessProfile.businessName}</h1>
        <p className="text-xs font-sans text-slate-500 mt-1">{businessProfile.businessAddress}, {businessProfile.city}, {businessProfile.country}</p>
      </div>

      <div className="flex justify-between items-center py-6 border-b border-amber-900/10">
        <div>
          <span className="text-[10px] uppercase font-sans tracking-widest text-slate-400 block mb-1">{billedToLabel}</span>
          <p className="text-base font-bold text-slate-900">{client.name}</p>
          {client.companyName && <p className="text-xs font-sans text-slate-600">{client.companyName}</p>}
        </div>
        <div className="text-right">
          <h2 className="text-xl font-bold tracking-widest uppercase" style={{ color: primaryColor }}>
            {docTitle}
          </h2>
          <p className="text-xs font-mono font-medium text-slate-700">#{docNumber}</p>
          <p className="text-xs font-sans text-slate-500 mt-0.5">{docDate}</p>
        </div>
      </div>

      <table className="w-full text-xs text-left my-8">
        <thead>
          <tr className="border-b-2 border-amber-900/20 text-slate-800 uppercase font-sans text-[10px] tracking-wider">
            <th className="py-2.5">{itemCol}</th>
            <th className="py-2.5 text-center w-16">{qtyCol}</th>
            <th className="py-2.5 text-right w-24">{priceCol}</th>
            <th className="py-2.5 text-right w-28">{amountCol}</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-amber-900/10">
          {items.map((item, idx) => {
            const itemImg = getLineItemImage(item);
            return (
              <tr key={idx}>
                <td className="py-3">
                  <div className="flex items-start gap-2.5">
                    <WindowItemImage item={item} className="w-9 h-9 rounded-lg shrink-0 border border-amber-900/20" />
                    <div>
                      <p className="font-semibold text-slate-900">{item.name}</p>
                    {item.description && <p className="text-slate-500 font-sans text-[11px]">{item.description}</p>}
                  </div>
                </div>
              </td>
              <td className="py-3 text-center font-sans">{item.quantity}</td>
              <td className="py-3 text-right font-sans">{formatCurrency(item.unitPrice, currency)}</td>
              <td className="py-3 text-right font-sans font-semibold text-slate-900">{formatCurrency(item.total, currency)}</td>
            </tr>
          );
        })}
        </tbody>
      </table>

      <div className="flex justify-end pt-4 border-t-2 border-amber-900/20">
        <div className="w-64 space-y-1.5 text-xs font-sans">
          <div className="flex justify-between text-slate-600">
            <span>{subtotalLabel}:</span>
            <span>{formatCurrency(subtotal, currency)}</span>
          </div>
          {vatTotal > 0 && (
            <div className="flex justify-between text-slate-600">
              <span>{vatTaxLabel}:</span>
              <span>{formatCurrency(vatTotal, currency)}</span>
            </div>
          )}
          <div className="flex justify-between text-base font-bold text-slate-900 pt-2 border-t border-slate-300">
            <span>{grandTotalLabel}:</span>
            <span>{formatCurrency(grandTotal, currency)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

return (
  <div id="invoice-printable-target" className="invoice-document-root w-full">
    {renderTemplate()}
  </div>
);
};
