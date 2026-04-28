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

export function buildContactInquiryEmail(data: {
  name: string; email: string; organization?: string; phone?: string; message: string;
}): string {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f8fafc; padding: 24px; border-radius: 12px;">
      <div style="background: linear-gradient(135deg, #0f172a 0%, #1e40af 100%); padding: 24px; border-radius: 8px; margin-bottom: 24px;">
        <h1 style="color: white; margin: 0; font-size: 20px;">🛡 THE SUPERVISOR</h1>
        <p style="color: rgba(255,255,255,0.7); margin: 4px 0 0; font-size: 13px;">New Contact Inquiry Received</p>
      </div>
      <div style="background: white; padding: 24px; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
        <h2 style="color: #1e293b; margin: 0 0 20px; font-size: 18px;">📬 New Inquiry from ${data.name}</h2>
        <table style="width: 100%; border-collapse: collapse;">
          <tr style="border-bottom: 1px solid #f1f5f9;">
            <td style="padding: 10px 0; color: #64748b; font-size: 13px; font-weight: 600; width: 140px;">Full Name</td>
            <td style="padding: 10px 0; color: #1e293b; font-size: 14px;">${data.name}</td>
          </tr>
          <tr style="border-bottom: 1px solid #f1f5f9;">
            <td style="padding: 10px 0; color: #64748b; font-size: 13px; font-weight: 600;">Email Address</td>
            <td style="padding: 10px 0; font-size: 14px;"><a href="mailto:${data.email}" style="color: #2563eb;">${data.email}</a></td>
          </tr>
          ${data.organization ? `
          <tr style="border-bottom: 1px solid #f1f5f9;">
            <td style="padding: 10px 0; color: #64748b; font-size: 13px; font-weight: 600;">Organization</td>
            <td style="padding: 10px 0; color: #1e293b; font-size: 14px;">${data.organization}</td>
          </tr>` : ""}
          ${data.phone ? `
          <tr style="border-bottom: 1px solid #f1f5f9;">
            <td style="padding: 10px 0; color: #64748b; font-size: 13px; font-weight: 600;">Phone</td>
            <td style="padding: 10px 0; color: #1e293b; font-size: 14px;">${data.phone}</td>
          </tr>` : ""}
        </table>
        <div style="margin-top: 20px; padding: 16px; background: #f8fafc; border-radius: 8px; border-left: 4px solid #2563eb;">
          <p style="color: #64748b; font-size: 13px; font-weight: 600; margin: 0 0 8px;">Message</p>
          <p style="color: #1e293b; font-size: 14px; line-height: 1.6; margin: 0;">${data.message}</p>
        </div>
        <p style="margin: 20px 0 0; color: #94a3b8; font-size: 12px;">
          Received: ${new Date().toLocaleString("en-GB", { dateStyle: "full", timeStyle: "short" })}
        </p>
      </div>
      <p style="color: #94a3b8; font-size: 12px; text-align: center; margin: 16px 0 0;">
        Reply directly to <a href="mailto:${data.email}" style="color: #2563eb;">${data.email}</a> to respond to this inquiry.
      </p>
    </div>
  `;
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
