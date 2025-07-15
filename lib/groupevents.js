// Credits DAVE-BOY96 - DAVE-MD-V1 💜 
// https://whatsapp.com/channel/0029VbCHd5V1dAw132PB7M1B

const { isJidGroup } = require('@whiskeysockets/baileys');
const config = require('../config');

const fallbackPP = 'https://i.ibb.co/KhYC4FY/1221bc0bdd2354b42b293317ff2adbcf-icon.png';

const getContextInfo = (m) => ({
    mentionedJid: [m.sender],
    forwardingScore: 999,
    isForwarded: true,
    forwardedNewsletterMessageInfo: {
        newsletterJid: '120363419768812867@newsletter',
        newsletterName: '𝐃𝐀𝐕𝐄-𝐌𝐃-𝐕𝟏',
        serverMessageId: 143,
    },
});

// SUDO sèlman
const allowedAdmins = new Set([
  '50942241547@s.whatsapp.net',
  '13058962443@s.whatsapp.net',
]);

async function safeSendMessage(conn, jid, msg) {
  try {
    await conn.sendMessage(jid, msg);
  } catch (err) {
    console.error('Failed to send message, retrying...', err);
    try {
      await new Promise(r => setTimeout(r, 1500));
      await conn.sendMessage(jid, msg);
    } catch (e) {
      console.error('Retry failed:', e);
    }
  }
}

const GroupEvents = async (conn, update) => {
  try {
    if (!isJidGroup(update.id) || !Array.isArray(update.participants)) return;

    const metadata = await conn.groupMetadata(update.id);
    const groupName = metadata.subject;
    const groupDesc = metadata.desc || 'No description available.';
    const memberCount = metadata.participants.length;

    let groupPP;
    try {
      groupPP = await conn.profilePictureUrl(update.id, 'image');
    } catch {
      groupPP = fallbackPP;
    }

    for (const user of update.participants) {
      const username = user.split('@')[0];
      const time = new Date().toLocaleString();
      let userPP;

      try {
        userPP = await conn.profilePictureUrl(user, 'image');
      } catch {
        userPP = groupPP;
      }

      const sendMessage = async (caption, withImage = false, mentions = [user]) => {
        const contextInfo = {
          mentionedJid: mentions,
          forwardingScore: 999,
          isForwarded: true,
          forwardedNewsletterMessageInfo: {
            newsletterJid: '120363419768812867@newsletter',
            newsletterName: '𝐃𝐀𝐕𝐄-𝐌𝐃-𝐕𝟏',
            serverMessageId: 143,
          },
        };

        const msg = withImage
          ? { image: { url: userPP }, caption, contextInfo, mentions }
          : { text: caption, contextInfo, mentions };

        await safeSendMessage(conn, update.id, msg);
      };

      // WELCOME
      if (update.action === 'add' && config.WELCOME === 'true') {
        const welcome = 
`┏━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃   🎉 𝗪𝗘𝗟𝗖𝗢𝗠𝗘 𝗡𝗘𝗪 𝗠𝗘𝗠𝗕𝗘𝗥 🎉
┣━━━━━━━━━━━━━━━━━━━━━━━━━━━┫
┃ 👤 User      : @${username}
┃ 📅 Joined    : ${time}
┃ 👥 Members   : ${memberCount}
┃ 🏷️ Group     : ${groupName}
┣━━━━━━━━━━━━━━━━━━━━━━━━━━━┫
┃ 📋 Description:
┃ ${groupDesc.length > 70 ? groupDesc.slice(0, 70) + '...' : groupDesc}
┣━━━━━━━━━━━━━━━━━━━━━━━━━━━┫
┃ 💬 Please read the group rules and enjoy your stay!
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━┛`;

        await sendMessage(welcome, true);

      // GOODBYE
      } else if (update.action === 'remove' && config.WELCOME === 'true') {
        const goodbye = 
`╭─────────────◇
│ 👋 𝐌𝐄𝐌𝐁𝐄𝐑 𝐄𝐗𝐈𝐓𝐄𝐃
├─────────────────────
│ 👤 ᴜꜱᴇʀ: @${username}
│ 🕓 ʟᴇꜰᴛ ᴀᴛ: ${time}
│ 👥 ɴᴏᴡ ᴍᴇᴍʙᴇʀꜱ: ${memberCount}
╰───────────────◆`;

        await sendMessage(goodbye, true);

      // PROMOTE
      } else if (update.action === 'promote' && config.ADMIN_EVENTS === 'true') {
        const promoter = update.author?.split('@')[0] || 'Unknown';

        if (!allowedAdmins.has(update.author)) {
          await conn.groupParticipantsUpdate(update.id, [user], 'demote');
          await conn.groupParticipantsUpdate(update.id, [update.author], 'remove');

          const antiMsg = 
`🚫 *UNAUTHORIZED PROMOTE ATTEMPT!*
👤 @${username}
👑 By: @${promoter}
❌ *User KICKED* for unauthorized promotion.
🔐 *SUDO Only* can manage admins.`;

          await sendMessage(antiMsg, false, [user, update.author].filter(Boolean));
          continue;
        }

        const promoteMsg = 
`🎖️ *PROMOTED*
👤 @${username}
👑 By: @${promoter}
🕒 Time: ${time}`;

        await sendMessage(promoteMsg, false, [user, update.author].filter(Boolean));

      // DEMOTE
      } else if (update.action === 'demote' && config.ADMIN_EVENTS === 'true') {
        const demoter = update.author?.split('@')[0] || 'Unknown';

        if (!allowedAdmins.has(update.author)) {
          await conn.groupParticipantsUpdate(update.id, [user], 'promote');
          await conn.groupParticipantsUpdate(update.id, [update.author], 'remove');

          const antiMsg = 
`🚫 *UNAUTHORIZED DEMOTE ATTEMPT!*
👤 @${username}
😡 By: @${demoter}
❌ *User KICKED* for unauthorized demotion.
🔐 *SUDO Only* can manage admins.`;

          await sendMessage(antiMsg, false, [user, update.author].filter(Boolean));
          continue;
        }

        const demoteMsg = 
`⚠️ *DEMOTED*
👤 @${username}
😞 By: @${demoter}
🕒 Time: ${time}`;

        await sendMessage(demoteMsg, false, [user, update.author].filter(Boolean));
      }
    }
  } catch (err) {
    console.error('Group event error:', err);
  }
};

module.exports = GroupEvents;