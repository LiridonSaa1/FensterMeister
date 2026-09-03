import React, { useState } from 'react';
import {
  Save,
  Building,
  CreditCard,
  FileSpreadsheet,
  Palette,
  Check,
  RotateCcw,
  Upload,
  Mail,
  Zap,
  ShieldCheck,
  AlertCircle,
  Eye,
  EyeOff,
  Radio,
  ExternalLink,
  Send,
  Sparkles,
  Globe,
  Languages,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useApp } from '../../context/AppContext';
import { BusinessProfile, InvoiceTemplate } from '../../types';
import { verifyBrevoApiKey, sendBrevoTestEmail } from '../../services/brevoService';
import { Language } from '../../i18n/translations';

export const SettingsView: React.FC = () => {
  const { businessProfile, updateBusinessProfile, resetToSampleData, brevoStatus, refreshBrevoStatus, showToast, language, setLanguage, t } = useApp();

  const [formData, setFormData] = useState<BusinessProfile>({ ...businessProfile });
  const [activeTab, setActiveTab] = useState<'profile' | 'banking' | 'invoicing' | 'design' | 'email' | 'language'>('profile');
  const [savedSuccess, setSavedSuccess] = useState(false);
  
  // Brevo verification state
  const [showApiKey, setShowApiKey] = useState(false);
  const [isVerifyingKey, setIsVerifyingKey] = useState(false);
  const [verificationResult, setVerificationResult] = useState<{
    valid: boolean;
    message?: string;
    account?: any;
  } | null>(null);

  // Test email state
  const [testRecipient, setTestRecipient] = useState(formData.email || '');
  const [isSendingTest, setIsSendingTest] = useState(false);

  const handleChange = (field: keyof BusinessProfile, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleLanguageChange = (newLang: Language) => {
    setLanguage(newLang);
    handleChange('language', newLang);
    showToast(newLang === 'de' ? 'Sprache auf Deutsch umgestellt!' : 'Language switched to English!', 'success');
  };

  const handleSave = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    updateBusinessProfile(formData);
    if (formData.language && formData.language !== language) {
      setLanguage(formData.language);
    }
    refreshBrevoStatus();
    setSavedSuccess(true);
    try {
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
    } catch (err) {
      // fallback
    }
    setTimeout(() => setSavedSuccess(false), 3000);
    showToast(language === 'de' ? 'Einstellungen & Konfiguration gespeichert!' : 'Settings and Brevo configuration saved!', 'success');
  };

  const handleVerifyBrevo = async () => {
    setIsVerifyingKey(true);
    setVerificationResult(null);

    const res = await verifyBrevoApiKey(formData.brevoApiKey || '');
    setIsVerifyingKey(false);
    setVerificationResult(res);

    if (res.valid) {
      showToast(language === 'de' ? '✓ Brevo API-Schlüssel erfolgreich verifiziert!' : '✓ Brevo API Key verified successfully!', 'success');
      // Auto save verified key
      updateBusinessProfile({ ...formData, brevoApiKey: formData.brevoApiKey });
      refreshBrevoStatus();
    } else {
      showToast(language === 'de' ? `Verifizierung fehlgeschlagen: ${res.message || 'Ungültiger Schlüssel'}` : `Verification failed: ${res.message || 'Invalid key'}`, 'error');
    }
  };

  const handleSendTest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testRecipient) {
      showToast(language === 'de' ? 'Bitte Empfänger-E-Mail-Adresse angeben.' : 'Please specify a recipient email address.', 'error');
      return;
    }

    setIsSendingTest(true);
    const res = await sendBrevoTestEmail({
      apiKey: formData.brevoApiKey,
      senderEmail: formData.brevoSenderEmail || formData.email,
      senderName: formData.brevoSenderName || formData.businessName,
      recipientEmail: testRecipient,
    });
    setIsSendingTest(false);

    if (res.success) {
      showToast(res.message || (language === 'de' ? `Test-E-Mail erfolgreich an ${testRecipient} gesendet!` : `Test email successfully dispatched to ${testRecipient}!`), 'success');
      refreshBrevoStatus();
    } else {
      showToast(language === 'de' ? `Versand fehlgeschlagen: ${res.message}` : `Dispatch failed: ${res.message}`, 'error');
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">{t.settings.title}</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {t.settings.subtitle}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              if (confirm(language === 'de' ? 'Möchten Sie alle Daten auf die Standard-Beispieldaten zurücksetzen?' : 'Are you sure you want to reset all data back to clean sample data?')) {
                resetToSampleData();
              }
            }}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{language === 'de' ? 'Demo zurücksetzen' : 'Reset Demo Data'}</span>
          </button>

          <button
            id="settings-save-btn"
            onClick={handleSave}
            className="flex items-center gap-1.5 px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md transition-all cursor-pointer"
          >
            {savedSuccess ? <Check className="w-4 h-4 text-white" /> : <Save className="w-4 h-4" />}
            <span>{savedSuccess ? (language === 'de' ? 'Gespeichert!' : 'Changes Saved!') : t.settings.saveSettings}</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 bg-white p-1 rounded-xl border flex-wrap gap-1">
        <button
          onClick={() => setActiveTab('profile')}
          className={`flex-1 min-w-[120px] py-2.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
            activeTab === 'profile' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          {t.settings.tabs.company}
        </button>
        <button
          onClick={() => setActiveTab('banking')}
          className={`flex-1 min-w-[120px] py-2.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
            activeTab === 'banking' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          {t.settings.tabs.banking}
        </button>
        <button
          onClick={() => setActiveTab('invoicing')}
          className={`flex-1 min-w-[120px] py-2.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
            activeTab === 'invoicing' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          {t.settings.tabs.invoicing}
        </button>
        <button
          onClick={() => setActiveTab('design')}
          className={`flex-1 min-w-[120px] py-2.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
            activeTab === 'design' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          {t.settings.tabs.branding}
        </button>
        <button
          onClick={() => setActiveTab('email')}
          className={`flex-1 min-w-[140px] py-2.5 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
            activeTab === 'email' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Mail className="w-3.5 h-3.5" />
          <span>{t.settings.tabs.email}</span>
          {brevoStatus?.configured && (
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('language')}
          className={`flex-1 min-w-[140px] py-2.5 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
            activeTab === 'language' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Languages className="w-3.5 h-3.5" />
          <span>{t.settings.tabs.language}</span>
          <span className="text-[10px] px-1.5 py-0.2 bg-blue-100 text-blue-700 rounded-full font-extrabold uppercase">
            {language.toUpperCase()}
          </span>
        </button>
      </div>

      {/* Settings Form Body */}
      <form onSubmit={handleSave} className="space-y-6">
        {/* TAB 1: PROFILE */}
        {activeTab === 'profile' && (
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-5 text-xs animate-in fade-in duration-150">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">{t.settings.sections.businessIdentity}</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block font-semibold text-slate-700 mb-1">{t.settings.fields.businessName} *</label>
                <input
                  type="text"
                  required
                  value={formData.businessName}
                  onChange={(e) => handleChange('businessName', e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">{t.settings.fields.signatoryName}</label>
                <input
                  type="text"
                  value={formData.signatureName || ''}
                  onChange={(e) => handleChange('signatureName', e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">{t.settings.fields.businessEmail} *</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">{t.settings.fields.phone}</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">{t.settings.fields.website}</label>
                <input
                  type="text"
                  value={formData.website}
                  onChange={(e) => handleChange('website', e.target.value)}
                  placeholder="https://example.com"
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-semibold text-slate-700 mb-1">{t.settings.fields.address}</label>
                <input
                  type="text"
                  value={formData.businessAddress}
                  onChange={(e) => handleChange('businessAddress', e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">{t.settings.fields.city}</label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => handleChange('city', e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">{t.settings.fields.postalCode}</label>
                <input
                  type="text"
                  value={formData.postalCode || ''}
                  onChange={(e) => handleChange('postalCode', e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">{t.settings.fields.country}</label>
                <input
                  type="text"
                  value={formData.country}
                  onChange={(e) => handleChange('country', e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: BANKING & TAX */}
        {activeTab === 'banking' && (
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-5 text-xs animate-in fade-in duration-150">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">{t.settings.sections.bankingDetails}</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">{t.settings.fields.bankName}</label>
                <input
                  type="text"
                  value={formData.bankName}
                  onChange={(e) => handleChange('bankName', e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">{t.settings.fields.accountHolder}</label>
                <input
                  type="text"
                  value={formData.signatureName || formData.businessName}
                  onChange={(e) => handleChange('signatureName', e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">{t.settings.fields.iban}</label>
                <input
                  type="text"
                  value={formData.iban}
                  onChange={(e) => handleChange('iban', e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg font-mono focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">{t.settings.fields.swift}</label>
                <input
                  type="text"
                  value={formData.swiftBic}
                  onChange={(e) => handleChange('swiftBic', e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg font-mono focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">{t.settings.fields.vatNumber}</label>
                <input
                  type="text"
                  value={formData.vatNumber}
                  onChange={(e) => handleChange('vatNumber', e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg font-mono focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">{t.settings.fields.registrationNumber}</label>
                <input
                  type="text"
                  value={formData.businessRegistrationNumber}
                  onChange={(e) => handleChange('businessRegistrationNumber', e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg font-mono focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: INVOICE DEFAULTS */}
        {activeTab === 'invoicing' && (
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-5 text-xs animate-in fade-in duration-150">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">{t.settings.sections.invoiceDefaults}</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">{t.settings.fields.defaultCurrency}</label>
                <select
                  value={formData.defaultCurrency}
                  onChange={(e) => handleChange('defaultCurrency', e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 font-semibold"
                >
                  <option value="EUR">EUR (€ - Euro)</option>
                  <option value="USD">USD ($ - US Dollar)</option>
                  <option value="GBP">GBP (£ - British Pound)</option>
                  <option value="CHF">CHF (Schweizer Franken / Swiss Franc)</option>
                  <option value="CAD">CAD ($ - Canadian Dollar)</option>
                  <option value="AUD">AUD ($ - Australian Dollar)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">{t.settings.fields.defaultVatRate}</label>
                <input
                  type="number"
                  value={formData.defaultVatRate}
                  onChange={(e) => handleChange('defaultVatRate', parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">{t.settings.fields.invoicePrefix}</label>
                <input
                  type="text"
                  value={formData.invoicePrefix}
                  onChange={(e) => handleChange('invoicePrefix', e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg font-mono font-bold"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">{t.settings.fields.offerPrefix}</label>
                <input
                  type="text"
                  value={formData.offerPrefix}
                  onChange={(e) => handleChange('offerPrefix', e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg font-mono font-bold"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">{t.settings.fields.defaultDueDays}</label>
                <input
                  type="number"
                  value={formData.defaultDueDays || 14}
                  onChange={(e) => handleChange('defaultDueDays', parseInt(e.target.value) || 14)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">{t.settings.fields.latePaymentFee}</label>
                <input
                  type="number"
                  value={formData.latePaymentFeePercent || 1.5}
                  onChange={(e) => handleChange('latePaymentFeePercent', parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-semibold text-slate-700 mb-1">{t.settings.fields.paymentTerms}</label>
                <textarea
                  rows={3}
                  value={formData.paymentTerms}
                  onChange={(e) => handleChange('paymentTerms', e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg font-sans"
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: DESIGN & BRANDING */}
        {activeTab === 'design' && (
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-5 text-xs animate-in fade-in duration-150">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">{t.settings.sections.brandingDesign}</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">{t.settings.fields.invoiceTemplate}</label>
                <select
                  value={formData.invoiceTemplate}
                  onChange={(e: any) => handleChange('invoiceTemplate', e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="modern">{language === 'de' ? 'Modern (Akzentkarten & Badges)' : 'Modern (Accent cards & badges)'}</option>
                  <option value="minimal">{language === 'de' ? 'Minimal (Schweizer Typografie)' : 'Minimal (Swiss typography)'}</option>
                  <option value="professional">{language === 'de' ? 'Professional (Unternehmensstandard)' : 'Professional (Enterprise standard)'}</option>
                  <option value="corporate">{language === 'de' ? 'Corporate (Vollständiges Branding-Banner)' : 'Corporate (Full branding banner)'}</option>
                  <option value="elegant">{language === 'de' ? 'Elegant (Luxus-Serifen-Design)' : 'Elegant (Luxury serif presentation)'}</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">{t.settings.fields.brandColor}</label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={formData.invoiceColors}
                    onChange={(e) => handleChange('invoiceColors', e.target.value)}
                    className="w-10 h-10 rounded-lg border border-slate-300 p-0.5 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={formData.invoiceColors}
                    onChange={(e) => handleChange('invoiceColors', e.target.value)}
                    className="w-32 px-3 py-2 bg-white border border-slate-300 rounded-lg font-mono font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">{t.settings.fields.fontFamily}</label>
                <select
                  value={formData.font}
                  onChange={(e) => handleChange('font', e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 font-medium"
                >
                  <option value="Plus Jakarta Sans">Plus Jakarta Sans</option>
                  <option value="Outfit">Outfit</option>
                  <option value="Inter">Inter</option>
                  <option value="Playfair Display">Playfair Display</option>
                  <option value="Cinzel">Cinzel</option>
                  <option value="IBM Plex Mono">IBM Plex Mono</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">{t.settings.fields.tableStyle}</label>
                <select
                  value={formData.tableStyle}
                  onChange={(e: any) => handleChange('tableStyle', e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="clean">{language === 'de' ? 'Klar (Nur Trennlinien)' : 'Clean (Dividers only)'}</option>
                  <option value="striped">{language === 'de' ? 'Gestreift (Abwechselnd)' : 'Striped (Alternating)'}</option>
                  <option value="bordered">{language === 'de' ? 'Umrandet (Vollständiges Raster)' : 'Bordered (Complete grid)'}</option>
                  <option value="minimal">{language === 'de' ? 'Minimal' : 'Minimal'}</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: BREVO & EMAIL INTEGRATION */}
        {activeTab === 'email' && (
          <div className="space-y-6 text-xs animate-in fade-in duration-150">
            {/* Brevo Connection Banner */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black text-lg shadow-md shadow-blue-200">
                    B
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-slate-900">{t.settings.sections.brevoIntegration}</h3>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        formData.brevoApiKey
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {formData.brevoApiKey ? (language === 'de' ? 'Konfiguriert' : 'Configured') : (language === 'de' ? 'Kein Schlüssel' : 'No Key Set')}
                      </span>
                    </div>
                    <p className="text-slate-500 text-[11px] mt-0.5">
                      {language === 'de'
                        ? 'Versenden Sie echte Rechnungen, Angebote und Zahlungserinnerungen direkt an die E-Mail-Postfächer Ihrer Kunden mit 99,9% Zustellrate.'
                        : "Dispatch real invoices, quotations, and payment reminders directly to your clients' inboxes with 99.9% deliverability."}
                    </p>
                  </div>
                </div>

                <a
                  href="https://app.brevo.com/settings/keys/api"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1 text-[11px] font-bold text-blue-600 hover:text-blue-800 underline"
                >
                  <span>{language === 'de' ? 'Brevo API-Schlüssel holen' : 'Get Brevo API Key'}</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              {/* API Key Input */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <label className="block font-semibold text-slate-700">
                  {t.settings.fields.brevoApiKey} (v3) <span className="text-rose-500">*</span>
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <input
                      type={showApiKey ? 'text' : 'password'}
                      value={formData.brevoApiKey || ''}
                      onChange={(e) => handleChange('brevoApiKey', e.target.value)}
                      placeholder="xkeysib-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx-xxxxxxxx"
                      className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono text-xs focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowApiKey(!showApiKey)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={handleVerifyBrevo}
                    disabled={isVerifyingKey || !formData.brevoApiKey}
                    className="flex items-center gap-1.5 px-4 py-2.5 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-xl shadow-xs cursor-pointer disabled:opacity-50 transition-all shrink-0"
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>{isVerifyingKey ? (language === 'de' ? 'Wird geprüft...' : 'Verifying...') : (language === 'de' ? 'Schlüssel prüfen' : 'Verify Key')}</span>
                  </button>
                </div>
                <p className="text-[11px] text-slate-500">
                  {language === 'de'
                    ? 'Ihr Schlüssel wird sicher auf dem Workspace-Server gespeichert und niemals in öffentlichen Client-Skripten offengelegt.'
                    : 'Your key is securely stored in your workspace server and never exposed in public client scripts.'}
                </p>
              </div>

              {/* Verification Feedback */}
              {verificationResult && (
                <div className={`p-4 rounded-xl border ${
                  verificationResult.valid
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                    : 'bg-rose-50 border-rose-200 text-rose-900'
                }`}>
                  <div className="flex items-start gap-2.5">
                    {verificationResult.valid ? (
                      <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    )}
                    <div className="space-y-1">
                      <p className="font-bold">{verificationResult.message || (verificationResult.valid ? (language === 'de' ? 'API-Schlüssel gültig!' : 'API Key Valid!') : (language === 'de' ? 'Verifizierung fehlgeschlagen' : 'Verification Failed'))}</p>
                      {verificationResult.account && (
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px] mt-2 pt-2 border-t border-emerald-200/60 font-mono">
                          <div>
                            <span className="text-emerald-700">{language === 'de' ? 'Konto:' : 'Account:'}</span> {verificationResult.account.email}
                          </div>
                          <div>
                            <span className="text-emerald-700">{language === 'de' ? 'Unternehmen:' : 'Company:'}</span> {verificationResult.account.companyName}
                          </div>
                          <div>
                            <span className="text-emerald-700">{language === 'de' ? 'Tarif:' : 'Plan:'}</span> {verificationResult.account.planType}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Sender & Deliverability Configuration */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">{language === 'de' ? 'Absender-Identität & Weiterleitung' : 'Sender Identity & Routing'}</h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    {t.settings.fields.senderName}
                  </label>
                  <input
                    type="text"
                    value={formData.brevoSenderName || formData.businessName || ''}
                    onChange={(e) => handleChange('brevoSenderName', e.target.value)}
                    placeholder="e.g. Apex Windows Billing"
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">{language === 'de' ? 'Was Kunden im Postfach als Absendernamen sehen' : 'What clients see in their email inbox'}</span>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    {t.settings.fields.senderEmail} <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={formData.brevoSenderEmail || formData.email || ''}
                    onChange={(e) => handleChange('brevoSenderEmail', e.target.value)}
                    placeholder="billing@yourdomain.com"
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 font-mono"
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">{language === 'de' ? 'Muss in Ihrem Brevo-Konto als verifizierter Absender eingetragen sein' : 'Must be an authorized sender domain in your Brevo account'}</span>
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-semibold text-slate-700 mb-1">
                    {t.settings.fields.replyTo}
                  </label>
                  <input
                    type="email"
                    value={formData.brevoReplyTo || formData.email || ''}
                    onChange={(e) => handleChange('brevoReplyTo', e.target.value)}
                    placeholder="support@yourdomain.com"
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Test Email Dispatch Sandbox */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center">
                  <Zap className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">{language === 'de' ? 'Echte Test-E-Mail versenden' : 'Send Live Test Message'}</h3>
                  <p className="text-slate-500 text-[11px]">{language === 'de' ? 'Überprüfen Sie Posteingangszustellung, Formatierung und DKIM-Signaturen' : 'Verify your inbox reception, styling, and DKIM signatures'}</p>
                </div>
              </div>

              <div className="flex gap-2">
                <input
                  type="email"
                  value={testRecipient}
                  onChange={(e) => setTestRecipient(e.target.value)}
                  placeholder="recipient@example.com"
                  className="flex-1 px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="button"
                  onClick={handleSendTest}
                  disabled={isSendingTest || !testRecipient}
                  className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-xs cursor-pointer disabled:opacity-50 transition-all shrink-0"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isSendingTest ? (language === 'de' ? 'Wird gesendet...' : 'Sending...') : (language === 'de' ? 'Test senden' : 'Send Test')}</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 6: LANGUAGE & LOCALIZATION */}
        {activeTab === 'language' && (
          <div className="space-y-6 text-xs animate-in fade-in duration-150">
            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Globe className="w-4 h-4 text-blue-600" />
                    <span>{t.settings.sections.languageLocalization}</span>
                  </h3>
                  <p className="text-slate-500 text-[11px] mt-0.5">
                    {language === 'de'
                      ? 'Wählen Sie Ihre bevorzugte Arbeitssprache für das gesamte System (Oberfläche, Rechnungen, Angebote, Fensterkatalog und E-Mail-Vorlagen).'
                      : 'Select your preferred working language across the entire application interface, invoice generator, quotations, and emails.'}
                  </p>
                </div>
              </div>

              {/* Language Selection Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                {/* English Option Card */}
                <div
                  onClick={() => handleLanguageChange('en')}
                  className={`p-5 rounded-2xl border-2 transition-all cursor-pointer relative flex flex-col justify-between ${
                    language === 'en'
                      ? 'border-blue-600 bg-blue-50/50 shadow-md ring-2 ring-blue-600/10'
                      : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50'
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-3xl">🇬🇧</span>
                        <div>
                          <h4 className="font-bold text-sm text-slate-900">English (International / US)</h4>
                          <span className="text-[11px] text-slate-500">Global business standard</span>
                        </div>
                      </div>
                      {language === 'en' && (
                        <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-xs">
                          <Check className="w-3.5 h-3.5" />
                        </div>
                      )}
                    </div>

                    <p className="text-slate-600 text-xs leading-relaxed">
                      All navigation, invoice builders, window style specifications, payment ledgers, and Brevo email notices in English.
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-200/60 flex items-center justify-between text-[11px]">
                    <span className="font-semibold text-slate-500">Status:</span>
                    <span className={`font-bold ${language === 'en' ? 'text-blue-600' : 'text-slate-400'}`}>
                      {language === 'en' ? '✓ Currently Active' : 'Click to Activate'}
                    </span>
                  </div>
                </div>

                {/* German Option Card */}
                <div
                  onClick={() => handleLanguageChange('de')}
                  className={`p-5 rounded-2xl border-2 transition-all cursor-pointer relative flex flex-col justify-between ${
                    language === 'de'
                      ? 'border-blue-600 bg-blue-50/50 shadow-md ring-2 ring-blue-600/10'
                      : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50'
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-3xl">🇩🇪</span>
                        <div>
                          <h4 className="font-bold text-sm text-slate-900">Deutsch (DE / AT / CH)</h4>
                          <span className="text-[11px] text-slate-500">Vollständig übersetzt</span>
                        </div>
                      </div>
                      {language === 'de' && (
                        <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-xs">
                          <Check className="w-3.5 h-3.5" />
                        </div>
                      )}
                    </div>

                    <p className="text-slate-600 text-xs leading-relaxed">
                      Vollständige deutsche Übersetzung für Navigation, Rechnungsstellung, Fensterkatalog (30 Stile), E-Mail-Vorlagen und Mahnwesen.
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-200/60 flex items-center justify-between text-[11px]">
                    <span className="font-semibold text-slate-500">Status:</span>
                    <span className={`font-bold ${language === 'de' ? 'text-blue-600' : 'text-slate-400'}`}>
                      {language === 'de' ? '✓ Derzeit Aktiv' : 'Klicken zum Aktivieren'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Translation Coverage Highlights */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 space-y-3">
                <h4 className="font-bold text-slate-900 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>{language === 'de' ? 'Übersetzungsabdeckung im gesamten Projekt:' : 'Full Project Translation Scope:'}</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 text-[11px]">
                  <div className="flex items-center gap-2 p-2 bg-white rounded-lg border border-slate-200/60">
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{language === 'de' ? 'Rechnungen & Angebote' : 'Invoices & Quotations'}</span>
                  </div>
                  <div className="flex items-center gap-2 p-2 bg-white rounded-lg border border-slate-200/60">
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{language === 'de' ? '30 Haus-Fenstertypen' : '30 Window Engineering Styles'}</span>
                  </div>
                  <div className="flex items-center gap-2 p-2 bg-white rounded-lg border border-slate-200/60">
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{language === 'de' ? 'Brevo E-Mail & SMTP' : 'Brevo Email & SMTP'}</span>
                  </div>
                  <div className="flex items-center gap-2 p-2 bg-white rounded-lg border border-slate-200/60">
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{language === 'de' ? 'Zahlungseingang & Buchhaltung' : 'Payments & Revenue'}</span>
                  </div>
                  <div className="flex items-center gap-2 p-2 bg-white rounded-lg border border-slate-200/60">
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{language === 'de' ? 'Kundenstammdaten' : 'Client Directory'}</span>
                  </div>
                  <div className="flex items-center gap-2 p-2 bg-white rounded-lg border border-slate-200/60">
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{language === 'de' ? 'PDF-Druck & Berichte' : 'PDF Exports & Reporting'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </form>
    </div>
  );
};
