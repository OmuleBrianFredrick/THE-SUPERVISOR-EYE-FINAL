import nodemailer from "nodemailer";

let transporter: nodemailer.Transporter | null = null;

function getTransporter() {
  if (transporter) return transporter;

  const host = process.env.SMTP_HOST;
  const port = parseInt(process.env.SMTP_PORT || "587");
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    return null;
  }

  transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });

  return transporter;
}

export async function sendEmail(options: {
  to: string;
  subject: string;
  html: string;
}): Promise<void> {
  const t = getTransporter();
  if (!t) {
    console.log(`[email] SMTP not configured — skipping email to ${options.to}: ${options.subject}`);
    return;
  }

  const from = process.env.SMTP_FROM || process.env.SMTP_USER || "noreply@thesupervisor.app";

  try {
    await t.sendMail({ from, ...options });
    console.log(`[email] Sent to ${options.to}: ${options.subject}`);
  } catch (err) {
    console.error(`[email] Failed to send to ${options.to}:`, err);
  }
}

export function buildNotificationEmail(title: string, message: string, actionUrl?: string): string {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f8fafc; padding: 24px; border-radius: 12px;">
      <div style="background: linear-gradient(135deg, #1e3a5f 0%, #2563eb 100%); padding: 24px; border-radius: 8px; margin-bottom: 24px;">
        <h1 style="color: white; margin: 0; font-size: 20px;">🛡 THE SUPERVISOR</h1>
        <p style="color: rgba(255,255,255,0.8); margin: 4px 0 0; font-size: 13px;">Performance & Reporting Platform</p>
      </div>

      <div style="background: white; padding: 24px; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
        <h2 style="color: #1e293b; margin: 0 0 12px; font-size: 18px;">${title}</h2>
        <p style="color: #475569; line-height: 1.6; margin: 0 0 24px;">${message}</p>
        ${actionUrl ? `
          <a href="${actionUrl}" style="display: inline-block; background: #2563eb; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: 600; font-size: 14px;">
            View in App
          </a>
        ` : ""}
      </div>

      <p style="color: #94a3b8; font-size: 12px; text-align: center; margin: 16px 0 0;">
        You are receiving this because you have an active account on The Supervisor platform.
      </p>
    </div>
  `;
}
