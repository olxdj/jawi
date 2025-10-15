const { cmd } = require('../lib');

cmd({
    pattern: "del",
    desc: "Delete a message smartly (for everyone or self).",
    category: "group",
    react: "🗑️",
    filename: __filename,
},
async (conn, mek, m, { reply, isCreator, isAdmin, isBotAdmin }) => {
    try {
        if (!mek.quoted) return reply("⚠️ Reply to the message you want to delete.");

        const from = m.chat;
        const quoted = mek.quoted;
        const isGroup = from.endsWith("@g.us");

        // If in a group
        if (isGroup) {
            // Admins or bot owner can delete for everyone
            if (isAdmin || isCreator) {
                await conn.sendMessage(from, {
                    delete: {
                        remoteJid: from,
                        id: quoted.id,
                        participant: quoted.sender,
                    },
                });
            } else {
                // Delete only for self if not admin
                await conn.sendMessage(from, {
                    delete: {
                        remoteJid: from,
                        fromMe: true,
                        id: quoted.id,
                        participant: quoted.sender,
                    },
                });
            }
        } else {
            // In private chat, delete for everyone
            await conn.sendMessage(from, {
                delete: {
                    remoteJid: from,
                    id: quoted.id,
                    participant: quoted.sender,
                },
            });
        }

    } catch (e) {
        console.log("Delete Error:", e);
    }
});
