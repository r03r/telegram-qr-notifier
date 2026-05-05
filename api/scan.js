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
    let count = 0;
    try {
      count = await kv.incr('qr_scans');
    } catch (kvError) {
      console.error('Error con Vercel KV:', kvError.message);
    }

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

    // Enviamos el HTML que muestra el logo y luego redirige
    res.setHeader('Content-Type', 'text/html');
    res.status(200).send(`
      <!DOCTYPE html>
      <html lang="es">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <meta http-equiv="refresh" content="2;url=${REDIRECT_URL}">
          <title>Redirigiendo a Multi-Pro...</title>
          <style>
              body { font-family: sans-serif; background: #f4f7f6; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; }
              .card { text-align: center; background: white; padding: 2.5rem; border-radius: 20px; box-shadow: 0 10px 25px rgba(0,0,0,0.1); max-width: 350px; }
              .logo { max-width: 180px; border-radius: 50%; margin-bottom: 1.5rem; box-shadow: 0 4px 10px rgba(0,0,0,0.1); }
              h1 { color: #2c3e50; font-size: 1.2rem; margin-bottom: 10px; }
              .loader { border: 3px solid #f3f3f3; border-top: 3px solid #3498db; border-radius: 50%; width: 20px; height: 20px; animation: spin 1s linear infinite; display: inline-block; margin-top: 10px; }
              @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
          </style>
      </head>
      <body>
          <div class="card">
              <img src="/logo.png" alt="Logo" class="logo">
              <h1>Conectando con Multi-Pro...</h1>
              <p>Espere un momento, le estamos redirigiendo.</p>
              <div class="loader"></div>
          </div>
          <script>
              setTimeout(() => { window.location.href = "${REDIRECT_URL}"; }, 2000);
          </script>
      </body>
      </html>
    `);

  } catch (error) {
    console.error('Error:', error);
    res.redirect(302, REDIRECT_URL);
  }
};
