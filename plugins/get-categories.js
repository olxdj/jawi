const { cmd, commands } = require('../command');
const config = require('../config');
const { runtime } = require('../lib/functions');

cmd({
    pattern: "categories",
    desc: "Show all available categories in the bot",
    category: "main",
    react: "📁",
    filename: __filename
},
async (conn, mek, m, { from, sender, pushname, reply }) => {
    try {
        // Collect all categories (handling both single and double quotes)
        const allCategories = [...new Set(
            Object.values(commands)
                .map(cmd => (cmd.category || '').trim().replace(/^['"]|['"]$/g, ''))
                .filter(cat => cat && cat.toLowerCase() !== 'undefined' && cat.trim() !== '')
        )];

        if (allCategories.length === 0) {
            return reply("❌ No categories found!");
        }

        // Format them in a stylish list
        let caption = `*╭┈───〔 ${config.BOT_NAME} Cᴀᴛᴇɢᴏʀɪᴇs 〕┈───⊷*\n`;
        caption += allCategories.map((cat, i) => `*├▢ ${i + 1}. ${cat.charAt(0).toUpperCase() + cat.slice(1)}*`).join('\n');
        caption += `\n*╰───────────────────⊷*\n`;
        caption += `> *Total:* ${allCategories.length} ᴄᴀᴛᴇɢᴏʀɪᴇs`;

        // Send image + caption
        await conn.sendMessage(from, {
            image: { url: config.MENU_IMAGE_URL || 'https://files.catbox.moe/7zfdcq.jpg' },
            caption: caption,
            contextInfo: {
                mentionedJid: [sender],
                forwardingScore: 999,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: '120363354023106228@newsletter',
                    newsletterName: config.BOT_NAME,
                    serverMessageId: 143
                }
            }
        }, { quoted: mek });

    } catch (e) {
        console.error(e);
        reply(`❌ Error:\n${e.message}`);
    }
});
