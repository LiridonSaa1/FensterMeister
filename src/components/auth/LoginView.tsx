import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, LogIn, AlertCircle, ShieldCheck } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const LoginView: React.FC = () => {
  const { login, language, setLanguage } = useApp();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isDe = language === 'de';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    setTimeout(() => {
      const res = login(email, password);
      setIsSubmitting(false);
      if (!res.success) {
        setError(res.error || (isDe ? 'Ungültige Anmeldedaten' : 'Invalid login credentials'));
      }
    }, 400);
  };

  const handleAutoFill = () => {
    setEmail('fenster@meister.com');
    setPassword('Drenica01');
    setError(null);
  };

  return (
    <div className="min-h-screen bg-slate-900 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/40 via-slate-900 to-slate-950 text-slate-100 flex flex-col justify-between p-4 sm:p-6 relative overflow-hidden font-sans">
      {/* Top Bar: Language Selector */}
      <div className="w-full max-w-5xl mx-auto flex items-center justify-between z-10">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-lg shadow-lg shadow-blue-600/30">
            F
          </div>
          <span className="font-bold text-lg text-white tracking-tight">
            FensterMeister <span className="text-blue-400 text-xs font-normal uppercase tracking-widest px-2 py-0.5 bg-blue-500/20 rounded-full border border-blue-500/30">ERP</span>
          </span>
        </div>

        {/* Quick Language Switcher */}
        <div className="flex items-center gap-1 bg-slate-800/80 border border-slate-700/60 rounded-xl p-1 text-xs">
          <button
            type="button"
            onClick={() => setLanguage('en')}
            className={`px-3 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
              language === 'en' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
            }`}
          >
            🇬🇧 EN
          </button>
          <button
            type="button"
            onClick={() => setLanguage('de')}
            className={`px-3 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
              language === 'de' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
            }`}
          >
            🇩🇪 DE
          </button>
        </div>
      </div>

      {/* Main Login Card */}
      <div className="w-full max-w-md mx-auto my-auto py-8 z-10">
        <div className="bg-white rounded-3xl p-6 sm:p-8 text-slate-900 shadow-2xl border border-slate-100 space-y-6">
          {/* Card Header */}
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 mx-auto flex items-center justify-center shadow-inner">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              {isDe ? 'Willkommen zurück' : 'Welcome Back'}
            </h1>
            <p className="text-xs text-slate-500 max-w-xs mx-auto">
              {isDe
                ? 'Melden Sie sich an, um auf Ihr Fenster- & Rechnungs-Management zuzugreifen.'
                : 'Sign in to access your FensterMeister ERP system.'}
            </p>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl text-xs flex items-center gap-2.5 animate-in fade-in duration-200">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
              <p className="font-semibold">{error}</p>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Field */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                {isDe ? 'E-Mail-Adresse' : 'Email Address'}
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="fenster@meister.com"
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-xs font-bold text-slate-700">
                  {isDe ? 'Passwort' : 'Password'}
                </label>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••"
                  className="w-full pl-10 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 px-4 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-600/25 transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
            >
              {isSubmitting ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  <span>{isDe ? 'Anmelden' : 'Sign In'}</span>
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Credentials Info Box */}
          <div className="pt-2 border-t border-slate-100">
            <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200/80 flex items-center justify-between text-[11px]">
              <div>
                <span className="font-bold text-slate-700 block">{isDe ? 'Zugangsdaten:' : 'Login Credentials:'}</span>
                <span className="text-slate-500 font-mono">fenster@meister.com</span>
              </div>
              <button
                type="button"
                onClick={handleAutoFill}
                className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold rounded-lg transition-colors cursor-pointer text-[10px]"
              >
                {isDe ? 'Ausfüllen' : 'Auto Fill'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Footer Copyright */}
      <div className="w-full max-w-5xl mx-auto text-center text-[11px] text-slate-400 z-10 py-2">
        © {new Date().getFullYear()} FensterMeister Pro. {isDe ? 'Alle Rechte vorbehalten.' : 'All rights reserved.'}
      </div>
    </div>
  );
};
