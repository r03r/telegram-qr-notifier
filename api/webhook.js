const { Telegraf } = require('telegraf');

const bot = new Telegraf(process.env.TELEGRAM_TOKEN);

// Get chat ID to configure the notifier
bot.start((ctx) => {
  ctx.reply(`¡Hola! Tu Chat ID es: ${ctx.from.id}\n\nGuarda este ID en tus variables de entorno como TELEGRAM_CHAT_ID.`);
});

module.exports = async (req, res) => {
  try {
    if (req.method === 'POST') {
      await bot.handleUpdate(req.body);
      res.status(200).send('OK');
    } else {
      res.status(200).send('Bot is running');
    }
  } catch (error) {
    console.error(error);
    res.status(500).send('Error');
  }
};
