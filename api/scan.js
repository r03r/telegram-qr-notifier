const { Telegraf } = require('telegraf');
const { kv } = require('@vercel/kv');

const bot = new Telegraf(process.env.TELEGRAM_TOKEN);
const chatId = process.env.TELEGRAM_CHAT_ID;
const REDIRECT_URL = "https://www.facebook.com/people/Multi-Pro-Maintenance-Services/61588758281593/?sfnsn=wa&mibextid=RUbZ1f";

module.exports = async (req, res) => {
  // 1. Recolectar información del visitante
  const ip = req.headers["x-forwarded-for"] || req.socket?.remoteAddress || "Desconocida";
  const userAgent = req.headers["user-agent"] || "Desconocido";
  const referer = req.headers["referer"] || "Directo (QR)";
  const now = new Date().toLocaleString("es-ES", { timeZone: "Europe/Madrid" });

  // Detectar dispositivo de forma sencilla
  const isMobile = /mobile|android|iphone|ipad/i.test(userAgent);
  const device = isMobile ? "📱 Móvil" : "💻 Escritorio";

  try {
    // 2. Incrementar contador en la base de datos (Vercel KV)
    let count = 0;
    try {
      count = await kv.incr('qr_scans');
    } catch (kvError) {
      console.error('Error con Vercel KV:', kvError.message);
    }

    // 3. Enviar notificación detallada a Telegram
    if (chatId) {
      const message = `
🔔 *¡Nuevo Escaneo de QR!* (Visita #${count || '?'})

📅 *Fecha:* ${now}
🖥️ *Dispositivo:* ${device}
🌍 *IP:* ${ip}
🔗 *Origen:* ${referer}
📲 *Agente:* ${userAgent.substring(0, 100)}...
      `.trim();

      await bot.telegram.sendMessage(chatId, message, { parse_mode: 'Markdown' });
    }

    // 4. Redirigir al usuario a Facebook
    res.redirect(302, REDIRECT_URL);

  } catch (error) {
    console.error('Error procesando el escaneo:', error);
    // En caso de error, igual redirigimos para no perder al cliente
    res.redirect(302, REDIRECT_URL);
  }
};
