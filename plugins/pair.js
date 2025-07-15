const axios = require('axios');
const { sleep } = require('../lib/functions');
const { cmd } = require('../command');

cmd({
  pattern: 'pair',
  desc: 'Get WhatsApp pairing code from remote session server',
  category: 'main',
  react: '🔗',
  filename: __filename
}, async (bot, m, text) => {
  const q = text;

  if (!q) {
    return await m.reply("Please provide a valid WhatsApp number.\nExample: `.pair 91702395XXXX`");
  }

  const numbers = q.split(',')
    .map((v) => v.replace(/[^0-9]/g, ''))
    .filter((v) => v.length > 5 && v.length < 20);

  if (numbers.length === 0) {
    return await m.reply("Invalid number❌ Please use the correct format!");
  }

  for (const number of numbers) {
    const whatsappID = number + '@s.whatsapp.net';
    const exists = await bot.onWhatsApp(whatsappID);

    if (!exists[0]?.exists) {
      return await m.reply(`❌ That number is not registered on WhatsApp!`);
    }

    await m.reply("⏳ Wait a moment while we fetch your pairing code...");

    try {
      const response = await axios.get(`https://sessions-dave-md.onrender.com/code?number=${number}`);
      if (response.data && response.data.code) {
        const code = response.data.code;

        if (code === "Service Unavailable") throw new Error('Service Unavailable');

        await sleep(5000);
        await m.reply(
          `*🔹 Pair Code:*\n` +
          `\`\`\`${code}\`\`\`\n\n` +
          `🔹 *How to Link:* \n` +
          `1. Open WhatsApp on your phone.\n` +
          `2. Go to *Settings > Linked Devices*.\n` +
          `3. Tap *Link a Device* then *Link with Phone*.\n` +
          `4. Enter the pair code above.\n` +
          `5. Alternatively, tap the WhatsApp notification sent to your phone.\n\n` +
          `⏳ *Code expires in 2 minutes!*`
        );
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (apiError) {
      console.error('API Error:', apiError.message);
      const msg = apiError.message === 'Service Unavailable'
        ? "⚠️ Service is currently unavailable. Please try again later."
        : "❌ Failed to generate pairing code. Try again.";
      await m.reply(msg);
    }
  }
});
