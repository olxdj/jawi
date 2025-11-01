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
    desc: "Check bot's response time with progress bar",
    category: "main",
    react: "⚡",
    filename: __filename
},
async (conn, mek, m, { from, reply }) => {
    try {
        const start = new Date().getTime();

        const progressSteps = [
            "```[▱▱▱▱▱▱▱▱▱▱] 0%``` ",
            "```[▰▱▱▱▱▱▱▱▱▱] 10%``` ",
            "```[▰▰▰▱▱▱▱▱▱▱] 20%``` ",
            "```[▰▰▰▰▰▱▱▱▱▱] 30%``` ",
            "```[▰▰▰▰▰▰▰▱▱▱] 40%``` ",
            "```[▰▰▰▰▰▰▰▰▰▱] 50%``` ",
            "```[▰▰▰▰▰▰▰▰▰▰] 60%``` ",
            "```[▰▰▰▰▰▰▰▰▰▰▰▱▱▱] 70%``` ",
            "```[▰▰▰▰▰▰▰▰▰▰▰▰▰▱▱] 80%``` ",
            "```[▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▱] 90%``` ",
            "```[▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰] 100%``` "
        ];

        let currentText = '';
        const sentMessage = await conn.sendMessage(from, { text: currentText }, { quoted: mek });

        for (const step of progressSteps) {
            currentText = step;
            await sleep(500);
            const protocolMsg = {
                key: sentMessage.key,
                type: 0xe,
                editedMessage: { conversation: currentText }
            };
            await conn.relayMessage(from, { protocolMessage: protocolMsg }, {});
        }

        const end = new Date().getTime();
        const responseTime = (end - start) / 1000;

        // Text emojis for the final message
        const textEmojis = ['🔥', '⚡', '🚀', '💨', '🎯', '🎉', '🌟', '💥', '🕐', '💎', '🏆', '🎶', '🌠', '🌀', '🔱', '🛡️', '✨'];
        
        // Select random text emoji
        const textEmoji = textEmojis[Math.floor(Math.random() * textEmojis.length)];

        currentText = `> *ᴋʜᴀɴ-ᴍᴅ sᴘᴇᴇᴅ:* ${responseTime.toFixed(2)}ᴍs ${textEmoji}`;
        
        const finalMsg = {
            key: sentMessage.key,
            type: 0xe,
            editedMessage: { conversation: currentText }
        };
        await conn.relayMessage(from, { protocolMessage: finalMsg }, {});

    } catch (e) {
        console.error("Error in ping2 command:", e);
        reply(`❌ *Test Failed:* ${e.message}`);
    }
});
