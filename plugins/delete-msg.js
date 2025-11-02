const { cmd } = require('../command');

cmd({
    pattern: "delete",
    alias: ["deluser", "delmsgs"],
    desc: "Delete recent messages from a mentioned or replied user.",
    category: "group",
    react: "🗑️",
    filename: __filename
},
async (conn, mek, m, { from, isGroup, reply, isBotAdmins, isAdmins, quoted, mentionByTag, args }) => {
    try {
        if (!isGroup) return await reply("❌ This command only works in groups.");
        if (!isBotAdmins) return await reply("⚠️ I need admin rights to delete messages.");
        if (!isAdmins) return await reply("❌ Only group admins can use this command.");

        // count argument
        let count = parseInt(args[0]) || 1;
        if (count < 1) count = 1;
        if (count > 50) count = 50;

        // target selection
        let target;
        if (quoted) {
            target = quoted.sender;
        } else if (mentionByTag && mentionByTag.length > 0) {
            target = mentionByTag[0];
        } else {
            return await reply("⚠️ Reply to a message or mention a user.\nExample: `.delete @user 5`");
        }

        // fetch group metadata
        const groupMetadata = await conn.groupMetadata(from);
        const participants = groupMetadata.participants.map(p => p.id);

        if (!participants.includes(target))
            return await reply("❌ The mentioned user is not in this group.");

        // fetch recent messages (up to 50)
        const msgs = await conn.getMessages(from, { limit: 50 }).catch(() => null);
        if (!msgs || msgs.length === 0)
            return await reply("⚠️ Unable to fetch recent messages.");

        let deleted = 0;

        // delete the replied message first if exists
        if (quoted) {
            try {
                await conn.sendMessage(from, {
                    delete: {
                        remoteJid: from,
                        id: quoted.id,
                        fromMe: false,
                        participant: quoted.sender
                    }
                });
                count--;
                deleted++;
            } catch {}
        }

        // delete other messages from target
        for (let i = msgs.length - 1; i >= 0 && deleted < count; i--) {
            const msg = msgs[i];
            const participant = msg.key.participant || msg.key.remoteJid;
            if (participant === target && msg.key.id !== quoted?.id) {
                try {
                    await conn.sendMessage(from, {
                        delete: {
                            remoteJid: from,
                            id: msg.key.id,
                            fromMe: false,
                            participant: participant
                        }
                    });
                    deleted++;
                    await new Promise(r => setTimeout(r, 300));
                } catch {}
            }
        }

        await reply(`✅ Deleted ${deleted} message(s) from @${target.split('@')[0]}`, { mentions: [target] });

    } catch (err) {
        console.error("Delete cmd error:", err);
        await reply("❌ Failed to delete messages. Maybe the messages are too old or I'm not admin.");
    }
});
