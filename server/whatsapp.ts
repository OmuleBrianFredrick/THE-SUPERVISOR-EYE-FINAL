// Minimal WhatsApp notifications scaffold.
// If WHATSAPP_API_TOKEN + WHATSAPP_PHONE_NUMBER_ID are set, sends real WhatsApp Cloud API messages.
// Otherwise it logs and returns false so callers can fall back gracefully.

export async function sendWhatsApp(to: string, message: string): Promise<boolean> {
  const token = process.env.WHATSAPP_API_TOKEN;
  const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  if (!token || !phoneId) {
    console.log(`[whatsapp:skip] (no token configured) to=${to} msg="${message.slice(0, 60)}"`);
    return false;
  }
  try {
    const cleanTo = to.replace(/[^\d]/g, "");
    const res = await fetch(`https://graph.facebook.com/v20.0/${phoneId}/messages`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to: cleanTo,
        type: "text",
        text: { body: message },
      }),
    });
    if (!res.ok) {
      console.error("[whatsapp] failed", res.status, await res.text());
      return false;
    }
    return true;
  } catch (err) {
    console.error("[whatsapp] error", err);
    return false;
  }
}

export function whatsappEnabled(): boolean {
  return !!(process.env.WHATSAPP_API_TOKEN && process.env.WHATSAPP_PHONE_NUMBER_ID);
}
