export const LUMEN_PHONE = "0502945414";
export const LUMEN_PHONE_DISPLAY = "0502945414";
export const LUMEN_EMAIL = "info@lumen.app";

const phoneE164 = `966${LUMEN_PHONE.replace(/^0/, "")}`;

/** اتصال هاتفي */
export const LUMEN_TEL_URL = `tel:+${phoneE164}`;

/** رابط واتساب (سعودي +966) */
export const LUMEN_WHATSAPP_URL = `https://wa.me/${phoneE164}`;

export const LUMEN_MAILTO_URL = `mailto:${LUMEN_EMAIL}`;
