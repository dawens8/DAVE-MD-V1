const { cmd } = require('../command');
const warningDB = new Map(); // Kenbe nivo avètisman pa user
const antiTagStatus = new Map(); // Kenbe si anti-tag aktive nan chak group
const OWNER_NUMBER = '13058962443'; // Mete nimewo pwòp ou (san @s.whatsapp.net)

cmd({
  pattern: 'antitag',
  desc: 'Protect owner from being tagged in groups',
  category: 'group',
  react: '⚠️',
  fromMe: true, // Sèlman admin/owner ka itilize
  filename: __filename,
}, async (bot, m, text) => {
  try {
    const groupId = m.key.remoteJid;
    if (!groupId || !groupId.endsWith('@g.us')) return m.reply('This command works only in groups.');
    
    const arg = text.trim().toLowerCase();
    if (arg === 'on') {
      antiTagStatus.set(groupId, true);
      return m.reply('🛡️ *Anti-tag protection activated*');
    }
    if (arg === 'off') {
      antiTagStatus.set(groupId, false);
      return m.reply('❌ *Anti-tag protection deactivated*');
    }
    if (arg === 'status') {
      const status = antiTagStatus.get(groupId) ? 'ACTIVE ✅' : 'INACTIVE ❌';
      return m.reply(`🛡️ Anti-tag Status: ${status}`);
    }

    return m.reply(
      `🛡️ *Anti-tag Commands:*\n` +
      `• *${bot.prefix}antitag on* - Enable protection\n` +
      `• *${bot.prefix}antitag off* - Disable protection\n` +
      `• *${bot.prefix}antitag status* - Check current status`
    );
  } catch (e) {
    console.error(e);
    m.reply('❌ An error occurred while processing the command');
  }
});

// Handler pou mesaj ki gen mention (li ta dwe rele nan handler prensipal ou)
async function antiTagHandler(message, bot) {
  try {
    const groupId = message.key.remoteJid;
    if (!groupId || !groupId.endsWith('@g.us')) return;
    if (!antiTagStatus.get(groupId)) return; // Si pa aktive, pa fè anyen

    const contextInfo = message.message?.extendedTextMessage?.contextInfo;
    if (!contextInfo?.mentionedJid) return;

    const mentionedJids = contextInfo.mentionedJid;
    const ownerJid = OWNER_NUMBER + '@s.whatsapp.net';

    if (mentionedJids.includes(ownerJid)) {
      // Reponn nan gwoup la
      await bot.sendMessage(groupId, {
        text: `*DON'T FUCKING TAG MY OWNER!*\n@${message.key.participant.split('@')[0]}`,
        mentions: [message.key.participant]
      });

      // Avètisman + deplase si plis pase 3
      const warnings = warningDB.get(message.key.participant) || 0;
      warningDB.set(message.key.participant, warnings + 1);

      if (warnings + 1 >= 3) {
        await bot.groupParticipantsUpdate(groupId, [message.key.participant], 'remove');
      }
    }
  } catch (e) {
    console.error('Anti-tag Handler Error:', e);
  }
}

module.exports = { antiTagHandler };