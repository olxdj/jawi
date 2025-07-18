const { cmd } = require('../command');

cmd({
    pattern: "unblock",
    desc: "Unblocks a person",
    category: "owner",
    react: "🔓",
    filename: __filename
},
async (conn, mek, m, {
    from, quoted, body, isCmd, command, args, q,
    isGroup, sender, senderNumber, botNumber2, botNumber,
    pushname, isMe, isOwner, isCreator, groupMetadata,
    groupName, participants, groupAdmins, isBotAdmins,
    isAdmins, reply, react
}) => {
    try {
        if (!isCreator) {
            return reply("🚫 *This command is only for the bot creator.*");
        }

        let jid;
        if (quoted) {
            jid = quoted.sender;
        } else if (m.mentionedJid.length > 0) {
            jid = m.mentionedJid[0];
        } else if (q && q.includes("@")) {
            jid = q.replace(/[@\s]/g, '') + "@s.whatsapp.net";
        } else {
            await react("❌");
            return reply("Please reply to a message or mention a user to unblock.");
        }

        await conn.updateBlockStatus(jid, "unblock");
        await react("✅");
        reply(`✅ Successfully unblocked @${jid.split("@")[0]}`, { mentions: [jid] });

    } catch (e) {
        console.log("Unblock error:", e);
        await react("❌");
        reply("❌ Failed to unblock the user.");
    }
});
cmd({
    pattern: "block",
    desc: "Blocks a person",
    category: "owner",
    react: "🚫",
    filename: __filename
},
async (conn, mek, m, {
    from, quoted, body, isCmd, command, args, q,
    isGroup, sender, senderNumber, botNumber2, botNumber,
    pushname, isMe, isOwner, isCreator, groupMetadata,
    groupName, participants, groupAdmins, isBotAdmins,
    isAdmins, reply, react
}) => {
    try {
        if (!isCreator) {
            return reply("🚫 *This command is only for the bot creator.*");
        }

        let jid;
        if (quoted) {
            jid = quoted.sender;
        } else if (m.mentionedJid.length > 0) {
            jid = m.mentionedJid[0];
        } else if (q && q.includes("@")) {
            jid = q.replace(/[@\s]/g, '') + "@s.whatsapp.net";
        } else {
            await react("❌");
            return reply("Please reply to a message or mention a user to block.");
        }

        await conn.updateBlockStatus(jid, "block");
        await react("✅");
        reply(`✅ Successfully blocked @${jid.split("@")[0]}`, { mentions: [jid] });

    } catch (e) {
        console.log("Block error:", e);
        await react("❌");
        reply("❌ Failed to block the user.");
    }
});
