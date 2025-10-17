const config = require('../config');
const { cmd } = require('../command');

cmd({
    pattern: "pin",
    alias: ["pinn", "pinmsg"],
    desc: "Pin a message for 24 hours (Owner Only)",
    category: "group",
    react: "📌",
    filename: __filename
}, async (conn, mek, m, { from, isCreator, reply }) => {
    try {
        if (!isCreator) {
            return await reply("📛 *This is an owner command only!*");
        }

        if (!mek.message?.extendedTextMessage?.contextInfo?.stanzaId) {
            return await reply("❌ *Please reply to a message to pin!*");
        }

        // Get the message key from the quoted message
        const quotedMessage = mek.message.extendedTextMessage.contextInfo;
        
        const pinKey = {
            remoteJid: from,
            fromMe: false,
            id: quotedMessage.stanzaId,
            participant: quotedMessage.participant
        };

        // Pin the message for 24 hours (86400 seconds)
        await conn.sendMessage(
            from,
            {
                pin: {
                    type: 1, // 1 to pin, 0 to unpin
                    time: 86400, // 24 hours in seconds
                    key: pinKey
                }
            }
        );

        await reply("✅ *Message pinned successfully for 24 hours!*");
        await conn.sendMessage(from, { react: { text: '✅', key: m.key } });

    } catch (error) {
        console.error("Pin error:", error);
        await conn.sendMessage(from, { react: { text: '❌', key: m.key } });
        
        if (error.message.includes("not authorized")) {
            await reply("❌ *I need admin permissions to pin messages!*");
        } else {
            await reply("❌ *Failed to pin message! Make sure I'm admin and replied to a valid message.*");
        }
    }
});
