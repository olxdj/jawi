// ===========================================
// 📤 Command: groupstatus
// 🧠 Description: Post a WhatsApp status inside a group visible to all members.
// 🧑‍💻 Developer: JawadTechX 🇵🇰
// ⚡ Based on: Baileys 
// ===========================================

const { cmd } = require('../command');
const baileys = require('@whiskeysockets/baileys');
const crypto = require('crypto'); // ✅ Correct import

cmd({
    pattern: "groupstatus",
    desc: "Post a WhatsApp group status (visible to all members).",
    category: "utility",
    react: "🪩",
    filename: __filename,
}, async (conn, mek, m, { from, quoted, args }) => {
    try {
        if (!m.isGroup)
            return await conn.sendMessage(from, { text: "❌ This command can only be used in groups." }, { quoted: mek });

        const text = args.join(" ");
        const q = quoted || m.quoted;

        if (!text && !q)
            return await conn.sendMessage(from, { text: "📌 Example:\n> .groupstatus Hello everyone!" }, { quoted: mek });

        // 🖼️ Prepare content (text or media)
        let content;
        if (q && (q.mtype === 'imageMessage' || q.mtype === 'videoMessage')) {
            const buffer = await q.download();
            content = {
                caption: text || '',
                [q.mtype === 'imageMessage' ? 'image' : 'video']: buffer
            };
        } else {
            content = { text: text };
        }

        // ⚙️ Generate message content
        const inside = await baileys.generateWAMessageContent(content, {
            upload: conn.waUploadToServer
        });

        // 🔒 Create message secret
        const messageSecret = crypto.randomBytes(32);

        // 🧱 Build group status message
        const mstatus = baileys.generateWAMessageFromContent(from, {
            messageContextInfo: { messageSecret },
            groupStatusMessageV2: {
                message: {
                    ...inside,
                    messageContextInfo: { messageSecret }
                }
            }
        }, {});

        // 🚀 Send status message
        await conn.relayMessage(from, mstatus.message, { messageId: mstatus.key.id });

        // ✅ Confirmation
        await conn.sendMessage(from, {
            text: `✅ *Group status posted successfully!*\n> Visible to all group members.`
        }, { quoted: mek });

    } catch (e) {
        console.error(e);
        await conn.sendMessage(from, { text: "❌ Failed to send group status.\n" + e.message }, { quoted: mek });
    }
});
