const config = require('../config');
const { cmd, commands } = require('../command');

cmd({
    pattern: "ping",
    alias: ["speed","pong"],use: '.ping',
    desc: "Check bot's response time.",
    category: "main",
    react: "⚡",
    filename: __filename
},
async (conn, mek, m, { from, quoted, sender, reply }) => {
    try {
        const start = new Date().getTime();

        const reactionEmojis = ['🔥', '⚡', '🚀', '💨', '🎯', '🎉', '🌟', '💥', '🕐', '🔹'];
        const textEmojis = ['💎', '🏆', '⚡️', '🚀', '🎶', '🌠', '🌀', '🔱', '🛡️', '✨'];

        const reactionEmoji = reactionEmojis[Math.floor(Math.random() * reactionEmojis.length)];
        let textEmoji = textEmojis[Math.floor(Math.random() * textEmojis.length)];

        // Ensure reaction and text emojis are different
        while (textEmoji === reactionEmoji) {
            textEmoji = textEmojis[Math.floor(Math.random() * textEmojis.length)];
        }

        // Send reaction using conn.sendMessage()
        await conn.sendMessage(from, {
            react: { text: textEmoji, key: mek.key }
        });

        const end = new Date().getTime();
        const responseTime = (end - start) / 1000;

        const text = `> *KHAN-MD SPEED: ${responseTime.toFixed(2)}ms ${reactionEmoji}*`;

        await conn.sendMessage(from, {
            text,
            contextInfo: {
                mentionedJid: [sender],
                forwardingScore: 999,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: '120363354023106228@newsletter',
                    newsletterName: "JawadTechX",
                    serverMessageId: 143
                }
            }
        }, { quoted: mek });

    } catch (e) {
        console.error("Error in ping command:", e);
        reply(`An error occurred: ${e.message}`);
    }
});

cmd({
    pattern: "ping2",
    desc: "Check bot's response time.",
    category: "main",
    react: "⚡",
    filename: __filename
},
async (conn, mek, m, { from, reply }) => {
    try {
        const startTime = Date.now();

        // Send temporary message
        const sent = await conn.sendMessage(from, { text: '⚙️ *Testing Speed...*' });

        // Simulate short delay to make it natural
        await new Promise(resolve => setTimeout(resolve, 700));

        const endTime = Date.now();
        const ping = endTime - startTime;

        // Fancy ping display
        let speedText = `
*╭┈───〔 ⚡ Kʜᴀɴ-ᴍᴅ Pɪɴɢ 〕───⊷*
*├▢ 📶 Response:* ${ping} ms
*├▢ 🧠 Status:* ${ping <= 200 ? 'Ultra Fast 🚀' : ping <= 600 ? 'Normal ⚙️' : 'Slight Delay 🐢'}
*├▢ 💫 Mode:* Online & Stable
*╰───────────────⊷*
        `;

        await conn.sendMessage(from, { text: speedText.trim() }, { quoted: sent });

    } catch (e) {
        console.log(e);
        reply(`⚠️ Error: ${e.message}`);
    }
});
