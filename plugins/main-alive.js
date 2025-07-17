const { cmd } = require('../command');
const config = require('../config');
const { runtime } = require('../lib/functions');

cmd({
    pattern: "alive",
    alias: ["status", "a"],
    desc: "Check if bot is alive.",
    category: "misc",
    react: "✅",
    filename: __filename
},
async (conn, mek, m, { from, args, q, reply, react }) => {

    let aliveText = `✨ *${config.BOT_NAME} is Online!*

👑 Owner: ${config.OWNER_NAME}
⏱️ Uptime: ${runtime(process.uptime())}
🚀 Mode: ${config.MODE}
💠 Prefix: ${config.PREFIX}

💖 Powered by *JawadTechX*`;

    await conn.sendMessage(from, { text: aliveText, 
        contextInfo: {
            mentionedJid: [],
            forwardingScore: 999,
            isForwarded: true,
            forwardedNewsletterMessageInfo: {
                newsletterJid: '120363354023106228@newsletter',
                newsletterName: "JawadTechX",
                serverMessageId: 143
            }
        }
    }, { quoted: m });
});
