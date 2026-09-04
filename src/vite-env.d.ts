/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string;
  readonly VITE_SUPABASE_ANON_KEY: string;
  readonly VITE_APP_URL?: string;
  readonly GEMINI_API_KEY?: string;
  readonly BREVO_API_KEY?: string;
  readonly BREVO_SENDER_EMAIL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
