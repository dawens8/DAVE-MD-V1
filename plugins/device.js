const { cmd } = require('../command');

cmd({
  pattern: 'device',
  desc: 'Detect device type of the replied user',
  category: 'dave',
  react: '📲',
  filename: __filename
}, async (client, message, { reply }) => {
  try {
    const quotedMsg = message.quoted;

    if (!quotedMsg || !quotedMsg.key || !quotedMsg.key.id) {
      return await reply('⚠️ Please reply to a user\'s message to detect their device.');
    }

    const msgId = quotedMsg.key.id;
    let deviceType = 'Unknown Device';

    if (msgId.startsWith('3EB0')) {
      deviceType = '📱 Android Device';
    } else if (msgId.startsWith('3EB1')) {
      deviceType = '📱 iOS Device (iPhone)';
    } else if (msgId.includes(':')) {
      deviceType = '💻 WhatsApp Web/Desktop';
    }

    await client.sendMessage(message.chat, {
      text: `✅ *That user is using:* ${deviceType}`,
      mentions: [quotedMsg.participant || quotedMsg.key.participant || quotedMsg.key.remoteJid],
    }, { quoted: message });

  } catch (err) {
    console.error(err);
    await reply(`❌ Error detecting device: ${err.message}`);
  }
});
