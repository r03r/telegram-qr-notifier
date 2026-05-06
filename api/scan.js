const { Telegraf } = require('telegraf');
const { kv } = require('@vercel/kv');

const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

// Configuración de URLs
const FB_PAGE_ID = "61588758281593";
const FB_WEB_URL = "https://www.facebook.com/people/Multi-Pro-Maintenance-Services/61588758281593/?sfnsn=wa&mibextid=RUbZ1f";

const bot = new Telegraf(TELEGRAM_TOKEN);

module.exports = async (req, res) => {
  const userAgent = req.headers["user-agent"] || "";
  const ip = req.headers["x-forwarded-for"] || req.socket?.remoteAddress || "Desconocida";
  const now = new Date().toLocaleString("es-ES", { timeZone: "Europe/Madrid" });
  
  const isIos = /iPhone|iPad|iPod/i.test(userAgent);
  const isAndroid = /Android/i.test(userAgent);
  const device = (isIos || isAndroid) ? "📱 Móvil" : "💻 Escritorio";

  try {
    let count = 0;
    try { count = await kv.incr('qr_scans'); } catch (e) {}

    if (TELEGRAM_TOKEN && TELEGRAM_CHAT_ID) {
      const message = `🔔 *¡Nuevo Escaneo!* (#${count || '?'})\n🖥️ ${device}\n📅 ${now}\n🌍 IP: ${ip}`.trim();
      bot.telegram.sendMessage(TELEGRAM_CHAT_ID, message, { parse_mode: 'Markdown' }).catch(console.error);
    }

    // Definir el enlace profundo según el sistema operativo
    let appUrl = FB_WEB_URL;
    if (isIos) {
      appUrl = `fb://page/?id=${FB_PAGE_ID}`;
    } else if (isAndroid) {
      appUrl = `fb://page/${FB_PAGE_ID}`;
    }

    res.setHeader('Content-Type', 'text/html');
    res.status(200).send(`
      <!DOCTYPE html>
      <html lang="es">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Multi-Pro Maintenance Services</title>
          <style>
              body { font-family: -apple-system, sans-serif; background: #f0f2f5; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; }
              .card { text-align: center; background: white; padding: 2.5rem; border-radius: 20px; box-shadow: 0 10px 30px rgba(0,0,0,0.1); max-width: 320px; width: 85%; }
              .logo { max-width: 150px; border-radius: 50%; margin-bottom: 1.5rem; }
              .btn { display: block; background: #1877f2; color: white; text-decoration: none; padding: 12px; border-radius: 8px; font-weight: bold; margin-top: 20px; }
          </style>
      </head>
      <body>
          <div class="card">
              <img src="/logo.png" alt="Logo" class="logo">
              <h2>Abriendo Facebook...</h2>
              <p>Estamos conectándote con nuestra página oficial.</p>
              <a href="${FB_WEB_URL}" class="btn">Abrir manualmente</a>
          </div>
          <script>
              // Intentar abrir la App
              window.location.href = "${appUrl}";
              
              // Si no se abre la app, después de 1 segundo redirigir a la web
              setTimeout(function() {
                  window.location.href = "${FB_WEB_URL}";
              }, 1200);
          </script>
      </body>
      </html>
    `);
  } catch (error) {
    res.redirect(302, FB_WEB_URL);
  }
};
