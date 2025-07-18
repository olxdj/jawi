const { cmd } = require('../command');

cmd({
    pattern: "block",
    desc: "Blocks a person",
    category: "owner",
    react: "🚫",
    filename: __filename
},
async (client, message, { from, reply, q, react, isCreator }) => {
    try {
        if (!isCreator) {
            await react("❌");
            return client.sendMessage(from, {
                text: "*📛 This is an owner command.*"
            }, { quoted: message });
        }

        let jid;
        if (message.quoted) {
            jid = message.quoted.sender;
        } else if (message.mentionedJid.length > 0) {
            jid = message.mentionedJid[0];
        } else if (q && q.includes("@")) {
            jid = q.replace(/[@\s]/g, '') + "@s.whatsapp.net";
        } else {
            await react("❌");
            return reply("Please mention a user or reply to their message.");
        }

        // Check if trying to block self
        const botOwner = client.user.id.split(":")[0] + "@s.whatsapp.net";
        if (jid === botOwner) {
            await react("💔");
            return reply("I can't block myself!");
        }

        await client.updateBlockStatus(jid, "block");
        await react("✅");
        return reply(`Successfully blocked @${jid.split("@")[0]}`, { mentions: [jid] });
    } catch (error) {
        console.error("Block command error:", error);
        await react("❌");
        return reply(`Failed to block the user. Error: ${error.message}`);
    }
});

cmd({
    pattern: "unblock",
    desc: "Unblocks a person",
    category: "owner",
    react: "🔓",
    filename: __filename
},
async (client, message, { from, reply, q, react, isCreator }) => {
    try {
        if (!isCreator) {
            await react("❌");
            return client.sendMessage(from, {
                text: "*📛 This is an owner command.*"
            }, { quoted: message });
        }

        let jid;
        if (message.quoted) {
            jid = message.quoted.sender;
        } else if (message.mentionedJid.length > 0) {
            jid = message.mentionedJid[0];
        } else if (q && q.includes("@")) {
            jid = q.replace(/[@\s]/g, '') + "@s.whatsapp.net";
        } else {
            await react("❌");
            return reply("Please mention a user or reply to their message.");
        }

        await client.updateBlockStatus(jid, "unblock");
        await react("✅");
        return reply(`Successfully unblocked @${jid.split("@")[0]}`, { mentions: [jid] });
    } catch (error) {
        console.error("Unblock command error:", error);
        await react("❌");
        return reply(`Failed to unblock the user. Error: ${error.message}`);
    }
});
