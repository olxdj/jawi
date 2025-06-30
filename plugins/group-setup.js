const { cmd } = require('../command');

cmd({
    pattern: "promote",
    alias: ["p", "makeadmin"],
    desc: "Promotes a member to group admin",
    category: "admin",
    react: "⬆️",
    filename: __filename
},
async(conn, mek, m, {
    from, l, quoted, body, isCmd, command, args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isCreator, isDev, isAdmins, reply
}) => {
    try {
        // Check if the command is used in a group
        if (!isGroup) return reply("❌ This command can only be used in groups.");

        // Check if the user is an admin
        if (!isAdmins) return reply("❌ Only group admins can use this command.");

        // Check if the bot is an admin
        if (!isBotAdmins) return reply("❌ I need to be an admin to use this command.");

        let jid;
        if (m.quoted) {
            jid = m.quoted.sender; // Use the full JID from quoted message
        } else if (q) {
            // Extract JID from mention or plain number
            const number = q.replace(/[^0-9]/g, '');
            if (!number) return reply("❌ Please provide a valid number or reply to a message.");
            jid = number + "@s.whatsapp.net";
        } else {
            return reply("❌ Please reply to a message or mention a user to promote.");
        }

        // Validate JID format
        if (!jid.includes('@s.whatsapp.net')) {
            jid = jid.split('@')[0] + '@s.whatsapp.net';
        }

        // Prevent promoting the bot itself
        if (jid === conn.user.id.split(':')[0] + '@s.whatsapp.net' || 
            jid === botNumber + '@s.whatsapp.net') {
            return reply("❌ The bot cannot promote itself.");
        }

        // Check if user is already admin
        if (groupAdmins.includes(jid)) {
            return reply(`❌ @${jid.split('@')[0]} is already an admin.`, { mentions: [jid] });
        }

        await conn.groupParticipantsUpdate(from, [jid], "promote");
        reply(`✅ Successfully promoted @${jid.split('@')[0]} to admin.`, { mentions: [jid] });

    } catch (error) {
        console.error("Promote command error:", error);
        reply("❌ Failed to promote the member. Error: " + error.message);
    }
});

cmd({
    pattern: "demote",
    alias: ["d", "dismiss", "removeadmin"],
    desc: "Demotes a group admin to a normal member",
    category: "admin",
    react: "⬇️",
    filename: __filename
},
async(conn, mek, m, {
    from, l, quoted, body, isCmd, command, args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isCreator, isDev, isAdmins, reply
}) => {
    try {
        // Check if the command is used in a group
        if (!isGroup) return reply("❌ This command can only be used in groups.");

        // Check if the user is an admin
        if (!isAdmins) return reply("❌ Only group admins can use this command.");

        // Check if the bot is an admin
        if (!isBotAdmins) return reply("❌ I need to be an admin to use this command.");

        let jid;
        if (m.quoted) {
            jid = m.quoted.sender; // Use the full JID from quoted message
        } else if (q) {
            // Extract JID from mention or plain number
            const number = q.replace(/[^0-9]/g, '');
            if (!number) return reply("❌ Please provide a valid number or reply to a message.");
            jid = number + "@s.whatsapp.net";
        } else {
            return reply("❌ Please reply to a message or mention a user to demote.");
        }

        // Validate JID format
        if (!jid.includes('@s.whatsapp.net')) {
            jid = jid.split('@')[0] + '@s.whatsapp.net';
        }

        // Prevent demoting the bot itself
        if (jid === conn.user.id.split(':')[0] + '@s.whatsapp.net' || 
            jid === botNumber + '@s.whatsapp.net') {
            return reply("❌ The bot cannot demote itself.");
        }

        // Check if user is not an admin
        if (!groupAdmins.includes(jid)) {
            return reply(`❌ @${jid.split('@')[0]} is not an admin.`, { mentions: [jid] });
        }

        await conn.groupParticipantsUpdate(from, [jid], "demote");
        reply(`✅ Successfully demoted @${jid.split('@')[0]} to a normal member.`, { mentions: [jid] });

    } catch (error) {
        console.error("Demote command error:", error);
        reply("❌ Failed to demote the member. Error: " + error.message);
    }
});
