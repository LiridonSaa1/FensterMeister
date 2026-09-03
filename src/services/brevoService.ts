export interface BrevoSender {
  name: string;
  email: string;
}

export interface BrevoRecipient {
  email: string;
  name?: string;
}

export interface BrevoAttachment {
  content: string; // Base64 encoded string
  name: string;
}

export interface SendBrevoEmailParams {
  apiKey?: string;
  sender: BrevoSender;
  to: BrevoRecipient[];
  subject: string;
  htmlContent: string;
  textContent?: string;
  replyTo?: { email: string; name?: string };
  attachment?: BrevoAttachment[];
}

export interface BrevoSendResult {
  success: boolean;
  provider: 'brevo' | 'smtp' | 'simulation';
  messageId?: string;
  message: string;
  error?: string;
  simulated?: boolean;
}

export interface BrevoStatusResult {
  configured: boolean;
  hasEnvKey: boolean;
  senderEmail?: string | null;
  account?: {
    email: string;
    firstName?: string;
    lastName?: string;
    companyName?: string;
    plan?: string;
    credits?: number | null;
  };
  error?: string;
}

/**
 * Fetch Brevo server status & configured credentials
 */
export async function checkBrevoServerStatus(): Promise<BrevoStatusResult> {
  try {
    const res = await fetch('/api/brevo/status');
    if (!res.ok) {
      return { configured: false, hasEnvKey: false, error: `HTTP ${res.status}` };
    }
    return await res.json();
  } catch (err: any) {
    console.warn('Brevo status check failed:', err);
    return { configured: false, hasEnvKey: false, error: err.message };
  }
}

/**
 * Verify a user-provided Brevo API key
 */
export async function verifyBrevoApiKey(apiKey: string): Promise<{
  valid: boolean;
  account?: any;
  message?: string;
}> {
  try {
    const res = await fetch('/api/brevo/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ apiKey }),
    });

    const data = await res.json();
    if (!res.ok) {
      return { valid: false, message: data.message || `Verification failed (HTTP ${res.status})` };
    }
    return data;
  } catch (err: any) {
    return { valid: false, message: err.message || 'Network error verifying key' };
  }
}

/**
 * Send an email through the Brevo backend endpoint
 */
export async function sendBrevoEmail(params: SendBrevoEmailParams): Promise<BrevoSendResult> {
  try {
    const res = await fetch('/api/brevo/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });

    const data = await res.json();
    if (!res.ok) {
      return {
        success: false,
        provider: 'brevo',
        message: data.message || `Failed to send via Brevo (HTTP ${res.status})`,
        error: data.message,
      };
    }

    return {
      success: true,
      provider: data.provider || 'brevo',
      messageId: data.messageId,
      message: data.message || 'Email sent successfully via Brevo',
      simulated: data.simulated || false,
    };
  } catch (err: any) {
    return {
      success: false,
      provider: 'brevo',
      message: err.message || 'Network error dispatching email to Brevo proxy',
      error: err.message,
    };
  }
}

/**
 * Send a quick test email to verify credentials
 */
export async function sendBrevoTestEmail(params: {
  apiKey?: string;
  senderEmail: string;
  senderName: string;
  recipientEmail: string;
}): Promise<BrevoSendResult> {
  try {
    const res = await fetch('/api/brevo/test', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });

    const data = await res.json();
    if (!res.ok) {
      return {
        success: false,
        provider: 'brevo',
        message: data.message || `Test failed (HTTP ${res.status})`,
        error: data.message,
      };
    }

    return {
      success: true,
      provider: data.provider || 'brevo',
      messageId: data.messageId,
      message: data.message || 'Test email dispatched successfully',
      simulated: data.simulated || false,
    };
  } catch (err: any) {
    return {
      success: false,
      provider: 'brevo',
      message: err.message || 'Network error dispatching test email',
      error: err.message,
    };
  }
}
