const { cmd } = require('../command');
const { isJidGroup, jidNormalizeUser } = require('@whiskeysockets/baileys');

// Promote command
cmd({
    pattern: "promote",
    alias: ["p", "makeadmin", "addadmin"],
    desc: "Promotes a member to group admin",
    category: "admin",
    react: "⬆️",
    filename: __filename
},
async(conn, mek, m, {
    from, reply, isGroup, isAdmins, isBotAdmins, groupMetadata
}) => {
    try {
        if (!isGroup) return reply("❌ This command can only be used in groups.");
        if (!isAdmins) return reply("❌ Only group admins can use this command.");
        if (!isBotAdmins) return reply("❌ I need to be an admin to use this command.");

        const botJid = conn.user.id;
        let targetJid;

        // Get target JID from quoted message or mentions
        if (m.quoted) {
            targetJid = jidNormalizeUser(m.quoted.sender);
        } else if (m.mentionedJid && m.mentionedJid.length > 0) {
            targetJid = jidNormalizeUser(m.mentionedJid[0]);
        } else {
            return reply("❌ Please reply to a message or mention a user to promote.");
        }

        // Check if trying to promote the bot itself
        if (targetJid === botJid) return reply("❌ I can't promote myself!");

        // Get updated group metadata
        const metadata = await conn.groupMetadata(from);
        
        // Check if user is already admin
        const participant = metadata.participants.find(p => p.id === targetJid);
        if (!participant) return reply("❌ User not found in this group.");
        if (participant.admin === 'admin') return reply("❌ This user is already an admin.");

        await conn.groupParticipantsUpdate(from, [targetJid], "promote");
        return reply(`✅ Successfully promoted @${targetJid.split('@')[0]} to admin!`, { mentions: [targetJid] });
    } catch (error) {
        console.error("Promote command error:", error);
        reply("❌ Failed to promote the member. Please try again.");
    }
});

// Demote command
cmd({
    pattern: "demote",
    alias: ["d", "dismiss", "removeadmin"],
    desc: "Demotes a group admin to a normal member",
    category: "admin",
    react: "⬇️",
    filename: __filename
},
async(conn, mek, m, {
    from, reply, isGroup, isAdmins, isBotAdmins, groupMetadata
}) => {
    try {
        if (!isGroup) return reply("❌ This command can only be used in groups.");
        if (!isAdmins) return reply("❌ Only group admins can use this command.");
        if (!isBotAdmins) return reply("❌ I need to be an admin to use this command.");

        const botJid = conn.user.id;
        let targetJid;

        // Get target JID from quoted message or mentions
        if (m.quoted) {
            targetJid = jidNormalizeUser(m.quoted.sender);
        } else if (m.mentionedJid && m.mentionedJid.length > 0) {
            targetJid = jidNormalizeUser(m.mentionedJid[0]);
        } else {
            return reply("❌ Please reply to a message or mention a user to demote.");
        }

        // Check if trying to demote the bot itself
        if (targetJid === botJid) return reply("❌ I can't demote myself!");

        // Get updated group metadata
        const metadata = await conn.groupMetadata(from);
        
        // Check if user is actually an admin
        const participant = metadata.participants.find(p => p.id === targetJid);
        if (!participant) return reply("❌ User not found in this group.");
        if (participant.admin !== 'admin') return reply("❌ This user is not an admin.");

        await conn.groupParticipantsUpdate(from, [targetJid], "demote");
        return reply(`✅ Successfully demoted @${targetJid.split('@')[0]} to member!`, { mentions: [targetJid] });
    } catch (error) {
        console.error("Demote command error:", error);
        reply("❌ Failed to demote the admin. Please try again.");
    }
});
