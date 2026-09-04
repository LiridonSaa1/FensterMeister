import express, { Request, Response } from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';

dotenv.config();

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

// Body parser with 15MB limit for PDF attachment data
app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));

// Serve public static assets (favicon, images, etc.)
app.use(express.static(path.join(process.cwd(), 'public')));
app.get('/favicon.ico', (req: Request, res: Response) => {
  res.sendFile(path.join(process.cwd(), 'public', 'favicon.ico'));
});

// Health Check API
app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// BREVO INTEGRATION API ROUTES

// 1. Get Brevo Connection Status & Server Configuration
app.get('/api/brevo/status', async (req: Request, res: Response) => {
  const envKey = process.env.BREVO_API_KEY;
  const envSender = process.env.BREVO_SENDER_EMAIL;

  if (!envKey) {
    return res.json({
      configured: false,
      hasEnvKey: false,
      senderEmail: envSender || null,
      message: 'No Brevo API key found in server environment variables.',
    });
  }

  try {
    const response = await fetch('https://api.brevo.com/v3/account', {
      method: 'GET',
      headers: {
        'api-key': envKey,
        'accept': 'application/json',
      },
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      return res.json({
        configured: false,
        hasEnvKey: true,
        senderEmail: envSender || null,
        error: errData.message || `Brevo verification failed with HTTP ${response.status}`,
      });
    }

    const accountData = await response.json();
    return res.json({
      configured: true,
      hasEnvKey: true,
      senderEmail: envSender || accountData.email,
      account: {
        email: accountData.email,
        firstName: accountData.firstName,
        lastName: accountData.lastName,
        companyName: accountData.companyName,
        plan: accountData.plan?.[0]?.type || 'Free / Transactional',
        credits: accountData.plan?.[0]?.credits ?? null,
      },
    });
  } catch (error: any) {
    return res.status(500).json({
      configured: false,
      hasEnvKey: true,
      error: error.message || 'Network error connecting to Brevo API',
    });
  }
});

// 2. Verify any Brevo API Key (user entered or test)
app.post('/api/brevo/verify', async (req: Request, res: Response) => {
  const apiKey = req.body.apiKey || process.env.BREVO_API_KEY;

  if (!apiKey || typeof apiKey !== 'string' || apiKey.trim() === '') {
    return res.status(400).json({
      valid: false,
      message: 'Brevo API key is required.',
    });
  }

  try {
    const response = await fetch('https://api.brevo.com/v3/account', {
      method: 'GET',
      headers: {
        'api-key': apiKey.trim(),
        'accept': 'application/json',
      },
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      return res.status(response.status).json({
        valid: false,
        message: errData.message || `Invalid Brevo API Key (HTTP ${response.status})`,
      });
    }

    const account = await response.json();
    return res.json({
      valid: true,
      account: {
        email: account.email,
        firstName: account.firstName,
        lastName: account.lastName,
        companyName: account.companyName,
        plan: account.plan?.[0]?.type || 'Transactional',
        credits: account.plan?.[0]?.credits ?? null,
      },
      message: 'Brevo credentials verified successfully!',
    });
  } catch (error: any) {
    return res.status(500).json({
      valid: false,
      message: error.message || 'Error communicating with Brevo API endpoint.',
    });
  }
});

// 3. Send Transactional Email via Brevo API
app.post('/api/brevo/send', async (req: Request, res: Response) => {
  const {
    apiKey,
    sender,
    to,
    subject,
    htmlContent,
    textContent,
    replyTo,
    attachment,
  } = req.body;

  const keyToUse = apiKey || process.env.BREVO_API_KEY;

  if (!to || !Array.isArray(to) || to.length === 0 || !to[0].email) {
    return res.status(400).json({
      success: false,
      message: 'Recipient email ("to") is required.',
    });
  }

  if (!subject || (!htmlContent && !textContent)) {
    return res.status(400).json({
      success: false,
      message: 'Subject and email content (htmlContent or textContent) are required.',
    });
  }

  const senderObj = {
    name: sender?.name || 'Billing Department',
    email: sender?.email || process.env.BREVO_SENDER_EMAIL || 'billing@example.com',
  };

  // If no API key is provided, provide graceful simulation
  if (!keyToUse || keyToUse.trim() === '') {
    const simMessageId = `sim-brevo-${Date.now()}-${Math.random().toString(36).substr(2, 6)}@smtp.brevo-demo.local`;
    console.log(`[Brevo Simulation] Dispatched email to ${to[0].email}: "${subject}" (Simulated ID: ${simMessageId})`);
    return res.json({
      success: true,
      simulated: true,
      provider: 'simulation',
      messageId: simMessageId,
      message: 'Email processed successfully in simulation mode (Add Brevo API Key in Settings for live delivery).',
    });
  }

  try {
    const brevoPayload: any = {
      sender: senderObj,
      to,
      subject,
      htmlContent: htmlContent || `<p>${textContent}</p>`,
      textContent: textContent || undefined,
    };

    if (replyTo?.email) {
      brevoPayload.replyTo = replyTo;
    }

    if (attachment && Array.isArray(attachment) && attachment.length > 0) {
      brevoPayload.attachment = attachment.map((att: any) => ({
        content: (att.content || '').replace(/^data:application\/pdf;base64,/, ''),
        name: att.name || 'document.pdf',
      }));
    }

    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'api-key': keyToUse.trim(),
        'content-type': 'application/json',
        'accept': 'application/json',
      },
      body: JSON.stringify(brevoPayload),
    });

    const responseData = await response.json().catch(() => ({}));

    if (!response.ok) {
      console.error('[Brevo Error]', responseData);
      return res.status(response.status).json({
        success: false,
        provider: 'brevo',
        message: responseData.message || `Brevo returned HTTP ${response.status}`,
        details: responseData,
      });
    }

    return res.json({
      success: true,
      provider: 'brevo',
      messageId: responseData.messageId || `brevo-${Date.now()}`,
      message: 'Email successfully queued and delivered through Brevo SMTP relay!',
    });
  } catch (error: any) {
    console.error('[Brevo Server Exception]', error);
    return res.status(500).json({
      success: false,
      provider: 'brevo',
      message: error.message || 'Server error communicating with Brevo transactional API.',
    });
  }
});

// 4. Send Test Email via Brevo API
app.post('/api/brevo/test', async (req: Request, res: Response) => {
  const { apiKey, senderEmail, senderName, recipientEmail } = req.body;
  const keyToUse = apiKey || process.env.BREVO_API_KEY;
  const toEmail = recipientEmail || senderEmail || 'test@example.com';

  const testHtml = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; color: #1e293b; padding: 24px; margin: 0; }
          .card { max-width: 540px; margin: 0 auto; background: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); }
          .header { background: #2563eb; color: #ffffff; padding: 28px 24px; text-align: center; }
          .body { padding: 28px 24px; font-size: 14px; line-height: 1.6; }
          .badge { display: inline-block; background: #ecfdf5; color: #047857; font-weight: 700; font-size: 12px; padding: 4px 12px; border-radius: 9999px; margin-bottom: 16px; }
          .footer { background: #f1f5f9; padding: 16px 24px; font-size: 12px; color: #64748b; text-align: center; }
        </style>
      </head>
      <body>
        <div class="card">
          <div class="header">
            <h1 style="margin:0; font-size: 20px; font-weight: 800;">Brevo Connection Verified</h1>
            <p style="margin: 4px 0 0 0; opacity: 0.9; font-size: 13px;">Apex Invoice & Glazing Enterprise Platform</p>
          </div>
          <div class="body">
            <span class="badge">✓ SMTP Relay Active</span>
            <p>Hello,</p>
            <p>This is an automated test message confirming that your <strong>Brevo (Sendinblue)</strong> integration is successfully connected and transmitting transactional emails.</p>
            <p style="background: #f8fafc; padding: 12px 16px; border-radius: 8px; border: 1px solid #e2e8f0; font-size: 13px; font-family: monospace;">
              <strong>Sender:</strong> ${senderName || 'Apex Business'} &lt;${senderEmail || 'billing@example.com'}&gt;<br/>
              <strong>Recipient:</strong> ${toEmail}<br/>
              <strong>Timestamp:</strong> ${new Date().toISOString()}
            </p>
            <p style="margin-bottom:0;">You can now dispatch live invoices, quotations, and automated payment receipts to your clients with high deliverability.</p>
          </div>
          <div class="footer">
            Sent via Brevo Transactional Email Engine • Apex Business Systems
          </div>
        </div>
      </body>
    </html>
  `;

  if (!keyToUse || keyToUse.trim() === '') {
    return res.json({
      success: true,
      simulated: true,
      provider: 'simulation',
      messageId: `sim-test-${Date.now()}@brevo-demo.local`,
      message: `Test email simulated for ${toEmail}. Provide a valid Brevo API Key to send live emails.`,
    });
  }

  try {
    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'api-key': keyToUse.trim(),
        'content-type': 'application/json',
        'accept': 'application/json',
      },
      body: JSON.stringify({
        sender: {
          name: senderName || 'Apex Business Systems',
          email: senderEmail || process.env.BREVO_SENDER_EMAIL || 'test@example.com',
        },
        to: [{ email: toEmail, name: 'Brevo Administrator' }],
        subject: '✓ Brevo Transactional Email Integration Test Success',
        htmlContent: testHtml,
        textContent: `Brevo connection test successful for ${toEmail} at ${new Date().toISOString()}.`,
      }),
    });

    const responseData = await response.json().catch(() => ({}));

    if (!response.ok) {
      return res.status(response.status).json({
        success: false,
        provider: 'brevo',
        message: responseData.message || `Brevo test failed with status ${response.status}`,
      });
    }

    return res.json({
      success: true,
      provider: 'brevo',
      messageId: responseData.messageId,
      message: `Test email successfully sent via Brevo to ${toEmail}!`,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Error sending test email via Brevo.',
    });
  }
});

// Vite middleware setup
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
