const config = require('../config');
const ownerNumbers = [config.OWNER_NUMBER]; 
const os = require('os');
const moment = require('moment-timezone');
const { cmd, commands } = require('../command');

function toSmallCaps(str) {
  const smallCaps = {
    A: 'ᴀ', B: 'ʙ', C: 'ᴄ', D: 'ᴅ', E: 'ᴇ', F: 'ғ', G: 'ɢ', H: 'ʜ',
    I: 'ɪ', J: 'ᴊ', K: 'ᴋ', L: 'ʟ', M: 'ᴍ', N: 'ɴ', O: 'ᴏ', P: 'ᴘ',
    Q: 'ǫ', R: 'ʀ', S: 's', T: 'ᴛ', U: 'ᴜ', V: 'ᴠ', W: 'ᴡ', X: 'x',
    Y: 'ʏ', Z: 'ᴢ'
  };
  return str.toUpperCase().split('').map(c => smallCaps[c] || c).join('');
}

cmd({
  pattern: "menu",
  alias: ["allmenu", "Mdave", "🍷"],
  desc: "Show all bot commands (Owner Only)",
  category: "menu",
  react: "🍷",
  filename: __filename
}, async (conn, mek, m, { from, reply }) => {
  try {
    const sender = m.sender || mek?.key?.participant || mek?.key?.remoteJid;
    const cleanSender = sender.split('@')[0];

    // 🔐 Only owner can use this
    if (!ownerNumbers.includes(cleanSender)) {
      return await reply("🚫 *Owner Only😡!*\nThis menu is restricted to bot owner(s) only fuck you brh😤.");
    }

    const stages = [
      '⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜  0%',
      '🟩⬜⬜⬜⬜⬜⬜⬜⬜⬜  10%',
      '🟩🟩⬜⬜⬜⬜⬜⬜⬜⬜  25%',
      '🟩🟩🟩🟩⬜⬜⬜⬜⬜⬜  50%',
      '🟩🟩🟩🟩🟩🟩⬜⬜⬜⬜  75%',
      '🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩  100%'
    ];
    let loadingMsg = await conn.sendMessage(from, { text: `🖤 Loading...\n${stages[0]}` }, { quoted: mek });

    for (let i = 1; i < stages.length; i++) {
      await new Promise(r => setTimeout(r, 300));
      await conn.sendMessage(from, {
        edit: loadingMsg.key,
        text: `🖤 𝐋𝐨𝐚𝐝𝐢𝐧𝐠...\n${stages[i]}`
      });
    }

    await new Promise(r => setTimeout(r, 400));
    await conn.sendMessage(from, {
      edit: loadingMsg.key,
      text: `✅ 𝐋𝐨𝐚𝐝𝐢𝐧𝐠 𝐜𝐨𝐦𝐩𝐥𝐞𝐭𝐞...! 𝐏𝐫𝐞𝐩𝐚𝐫𝐢𝐧𝐠 𝐦𝐞𝐧𝐮...`
    });

    const date = moment().tz("America/Port-au-Prince").format("dddd, DD MMMM YYYY");
    const uptime = () => {
      const sec = process.uptime();
      const h = Math.floor(sec / 3600), m = Math.floor((sec % 3600) / 60), s = Math.floor(sec % 60);
      return `${h}h ${m}m ${s}s`;
    };

    const ramUsage = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(1);
    const totalRam = (os.totalmem() / 1024 / 1024).toFixed(1);
    const hostName = os.hostname();
    const totalCommands = commands.length;
    const usedPrefix = config.PREFIX || ".";

    let menuText = `
╭━━━〔 ⚡️ 𝐃𝐀𝐕𝐄-𝐌𝐃-𝐕𝟏 ⚡️ 〕━━━╮
│ 👤 *User*       : @${cleanSender}
│ ⏱️ *Uptime*     : ${uptime()}
│ ⚙️ *Mode*       : ${config.MODE || "public"}
│ 💠 *Prefix*     : [${usedPrefix}]
│ 📦 *Plugins*    : ${totalCommands}
│ 🛠️ *RAM*        : ${ramUsage}MB / ${totalRam}MB
│ 🖥️ *Host*       : ${hostName}
│ 👑 *Developer*  : 𝐃𝐀𝐕𝐄 𝐁𝐎𝐘 🇭🇹
│ 📆 *Date*       : ${date}
╰━━━━━━━━━━━━━━━━━━━━━━━╯

╔═════════════════════════════╗
║   😍 𝐖𝐄𝐋𝐂𝐎𝐌𝐄 𝐓𝐎 𝐃𝐀𝐕𝐄-𝐌𝐃-𝐕𝟏 🖤   ║
╚═════════════════════════════╝
`;

    const categoryMap = {};
    for (let c of commands) {
      if (!c.category) continue;
      if (!categoryMap[c.category]) categoryMap[c.category] = [];
      categoryMap[c.category].push(c);
    }

    const keys = Object.keys(categoryMap).sort();

    for (let k of keys) {
      menuText += `\n\n╔═══❖ *${k.toUpperCase()} MENU* ❖═══╗`;
      const cmds = categoryMap[k]
        .filter(c => c.pattern)
        .sort((a, b) => a.pattern.localeCompare(b.pattern));
      cmds.forEach((cmd) => {
        const usage = cmd.pattern.split('|')[0];
        menuText += `║ ➤ ${usedPrefix}${usage}\n`;
      });
      menuText += `╚════════════════════╝`;
    }

    menuText += `\n\n🔋 𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐛𝐲 𝐃𝐀𝐕𝐄 𝐁𝐎𝐘 🇭🇹`;

    const mediaOptions = [
      { type: 'video', url: 'https://files.catbox.moe/q9cbhm.mp4' },
      { type: 'video', url: 'https://files.catbox.moe/c7e8am.mp4' },
      { type: 'video', url: 'https://files.catbox.moe/t0gsrv.mp4' },
      { type: 'video', url: 'https://files.catbox.moe/m296z6.mp4' },
      { type: 'image', url: config.MENU_IMAGE_URL || 'https://files.catbox.moe/a7wgu7.png' }
    ];

    const selected = mediaOptions[Math.floor(Math.random() * mediaOptions.length)];

    const msgOptions = {
      caption: menuText,
      contextInfo: {
        mentionedJid: [sender],
        forwardingScore: 999,
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
          newsletterJid: config.newsletterJid || '120363419768812867@newsletter',
          newsletterName: '𝐃𝐀𝐕𝐄-𝐌𝐃-𝐕𝟏',
          serverMessageId: 143
        }
      }
    };

    if (selected.type === 'video') {
      await conn.sendMessage(from, {
        video: { url: selected.url },
        ...msgOptions
      }, { quoted: mek });
    } else {
      await conn.sendMessage(from, {
        image: { url: selected.url },
        ...msgOptions
      }, { quoted: mek });
    }

    const audioOptions = [
      'https://files.catbox.moe/edfe85.mp4',
      'https://files.catbox.moe/vq3odo.mp4',
      'https://files.catbox.moe/ts7ws8.mp4',
      'https://files.catbox.moe/3cj1e3.mp4',
      'https://files.catbox.moe/5k3q8p.mp4',
      'https://files.catbox.moe/czk8mu.mp4'
    ];

    const randomAudio = audioOptions[Math.floor(Math.random() * audioOptions.length)];

    try {
      await conn.sendMessage(from, {
        audio: { url: randomAudio },
        mimetype: 'audio/mp4',
        ptt: true
      }, { quoted: mek });
    } catch (e) {
      console.error('⚠️ Audio send failed:', e.message);
    }

  } catch (e) {
    console.error('❌ Menu error:', e.message);
    await reply(`❌ Menu Error: ${e.message}`);
  }
});