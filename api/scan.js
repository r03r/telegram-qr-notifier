const { Telegraf } = require('telegraf');
const { kv } = require('@vercel/kv');

const bot = new Telegraf(process.env.TELEGRAM_TOKEN);
const chatId = process.env.TELEGRAM_CHAT_ID;
const REDIRECT_URL = "https://www.facebook.com/people/Multi-Pro-Maintenance-Services/61588758281593/?sfnsn=wa&mibextid=RUbZ1f";

module.exports = async (req, res) => {
  const ip = req.headers["x-forwarded-for"] || req.socket?.remoteAddress || "Desconocida";
  const userAgent = req.headers["user-agent"] || "Desconocido";
  const referer = req.headers["referer"] || "Directo (QR)";
  const now = new Date().toLocaleString("es-ES", { timeZone: "Europe/Madrid" });
  const isMobile = /mobile|android|iphone|ipad/i.test(userAgent);
  const device = isMobile ? "📱 Móvil" : "💻 Escritorio";

  try {
    // 1. Contador y Notificación (se ejecutan rápido)
    let count = 0;
    try {
      count = await kv.incr('qr_scans');
    } catch (kvError) {
      console.error('KV Error:', kvError.message);
    }

    if (chatId) {
      const message = `
🔔 *¡Nuevo Escaneo!* (#${count || '?'})
🖥️ ${device} | 🌍 IP: ${ip}
📅 ${now}
      `.trim();
      // No esperamos a que Telegram responda para que la página cargue más rápido
      bot.telegram.sendMessage(chatId, message, { parse_mode: 'Markdown' }).catch(console.error);
    }

    // 2. Respuesta HTML con redirección múltiple
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
              .card { text-align: center; background: white; padding: 2rem; border-radius: 15px; box-shadow: 0 8px 30px rgba(0,0,0,0.1); max-width: 320px; width: 90%; }
              .logo { max-width: 150px; border-radius: 50%; margin-bottom: 1rem; }
              h1 { color: #1c1e21; font-size: 1.1rem; margin-bottom: 0.5rem; }
              p { color: #606770; font-size: 0.9rem; margin-bottom: 1.5rem; }
              .btn { display: inline-block; background: #1877f2; color: white; text-decoration: none; padding: 10px 20px; border-radius: 6px; font-weight: bold; font-size: 0.9rem; }
              .loader { border: 2px solid #f3f3f3; border-top: 2px solid #1877f2; border-radius: 50%; width: 16px; height: 16px; animation: spin 1s linear infinite; display: inline-block; vertical-align: middle; margin-right: 8px; }
              @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
          </style>
      </head>
      <body>
          <div class="card">
              <img src="/logo.png" alt="Logo" class="logo">
              <h1>Conectando...</h1>
              <p>Redirigiendo a nuestra página oficial en Facebook.</p>
              <a href="${REDIRECT_URL}" class="btn">
                  <div class="loader"></div> Ir ahora
              </a>
          </div>
          <script>
              setTimeout(() => { window.location.replace("${REDIRECT_URL}"); }, 1500);
          </script>
      </body>
      </html>
    `);

  } catch (error) {
    res.redirect(302, REDIRECT_URL);
  }
};
