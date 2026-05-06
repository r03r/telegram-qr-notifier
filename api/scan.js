const { Telegraf } = require('telegraf');
const { kv } = require('@vercel/kv');

// Ahora el código lee de forma segura las variables que pusiste en Vercel
const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;
const REDIRECT_URL = "https://www.facebook.com/people/Multi-Pro-Maintenance-Services/61588758281593/?sfnsn=wa&mibextid=RUbZ1f";

const bot = new Telegraf(TELEGRAM_TOKEN);

module.exports = async (req, res) => {
  const ip = req.headers["x-forwarded-for"] || req.socket?.remoteAddress || "Desconocida";
  const userAgent = req.headers["user-agent"] || "Desconocido";
  const referer = req.headers["referer"] || "Directo (QR)";
  const now = new Date().toLocaleString("es-ES", { timeZone: "Europe/Madrid" });
  const isMobile = /mobile|android|iphone|ipad/i.test(userAgent);
  const device = isMobile ? "📱 Móvil" : "💻 Escritorio";

  try {
    // 1. Contador de visitas (Vercel KV)
    let count = 0;
    try {
      count = await kv.incr('qr_scans');
    } catch (kvError) {
      console.error('KV Error:', kvError.message);
    }

    // 2. Notificación a Telegram
    if (TELEGRAM_TOKEN && TELEGRAM_CHAT_ID) {
      const message = `
🔔 *¡Nuevo Escaneo de QR!*
━━━━━━━━━━━━━━━━━━
🔢 *Visita:* #${count || '?'}
🖥️ *Dispositivo:* ${device}
📅 *Fecha:* ${now}
🌍 *IP:* ${ip}
🔗 *Origen:* ${referer}
📲 *Agente:* ${userAgent.substring(0, 80)}...
━━━━━━━━━━━━━━━━━━
      `.trim();

      bot.telegram.sendMessage(TELEGRAM_CHAT_ID, message, { parse_mode: 'Markdown' }).catch(console.error);
    }

    // 3. Respuesta con el logo y redirección automática
    res.setHeader('Content-Type', 'text/html');
    res.status(200).send(`
      <!DOCTYPE html>
      <html lang="es">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <meta http-equiv="refresh" content="2;url=${REDIRECT_URL}">
          <title>Multi-Pro Maintenance Services</title>
          <style>
              body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #f0f2f5; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; }
              .card { text-align: center; background: white; padding: 2.5rem; border-radius: 20px; box-shadow: 0 12px 40px rgba(0,0,0,0.12); max-width: 320px; width: 90%; }
              .logo { max-width: 160px; border-radius: 50%; margin-bottom: 1.5rem; box-shadow: 0 4px 15px rgba(0,0,0,0.1); }
              h1 { color: #1c1e21; font-size: 1.3rem; margin-bottom: 8px; }
              p { color: #606770; font-size: 0.95rem; margin-bottom: 1.5rem; line-height: 1.4; }
              .btn { display: inline-block; background: #1877f2; color: white; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: bold; font-size: 1rem; transition: background 0.3s; }
              .btn:active { background: #145dbf; }
              .loader { border: 2px solid #f3f3f3; border-top: 2px solid #1877f2; border-radius: 50%; width: 16px; height: 16px; animation: spin 1s linear infinite; display: inline-block; vertical-align: middle; margin-right: 10px; }
              @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
          </style>
      </head>
      <body>
          <div class="card">
              <img src="/logo.png" alt="Logo" class="logo">
              <h1>¡Hola!</h1>
              <p>Te estamos conectando con nuestra página de Facebook.</p>
              <a href="${REDIRECT_URL}" class="btn">
                  <div class="loader"></div> Redirigiendo...
              </a>
          </div>
          <script>
              setTimeout(() => { window.location.replace("${REDIRECT_URL}"); }, 1800);
          </script>
      </body>
      </html>
    `);

  } catch (error) {
    console.error('Error general:', error);
    res.redirect(302, REDIRECT_URL);
  }
};
