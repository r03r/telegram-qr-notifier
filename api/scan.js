const { Telegraf } = require('telegraf');
const { kv } = require('@vercel/kv');

const bot = new Telegraf(process.env.TELEGRAM_TOKEN);
const chatId = process.env.TELEGRAM_CHAT_ID;

module.exports = async (req, res) => {
  try {
    // 1. Increment counter
    let count = 0;
    try {
      count = await kv.incr('qr_scans');
    } catch (kvError) {
      console.error('KV Error (check if Vercel KV is configured):', kvError.message);
      // Fallback if KV is not configured yet
    }

    // 2. Send Telegram notification
    if (chatId) {
      const message = `🚨 ¡Alguien escaneó tu código QR!\n\nTotal de escaneos: ${count || 'N/A'}\nFecha: ${new Date().toLocaleString()}`;
      await bot.telegram.sendMessage(chatId, message);
    } else {
      console.warn('TELEGRAM_CHAT_ID is not set.');
    }

    // 3. Response to the scanner
    res.setHeader('Content-Type', 'text/html');
    res.status(200).send(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>QR Scanned</title>
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <style>
            body { font-family: sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; background: #f0f2f5; }
            .card { background: white; padding: 2rem; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); text-align: center; }
            h1 { color: #0088cc; }
          </style>
        </head>
        <body>
          <div class="card">
            <h1>¡Gracias!</h1>
            <p>El código QR ha sido escaneado correctamente.</p>
          </div>
        </body>
      </html>
    `);
  } catch (error) {
    console.error('Scan handling error:', error);
    res.status(500).send('Error processing scan');
  }
};
