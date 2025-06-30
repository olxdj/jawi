const { cmd } = require('../command');
const { isJidGroup } = require('@whiskeysockets/baileys');

cmd({
    pattern: "promote",
    alias: ["p", "dfm"],
    desc: "Promote a member to admin",
    category: "group",
    react: "⬆️",
    filename: __filename
},
async (conn, mek, m, { from, args, q, reply, react, isGroup, isBotAdmins, isAdmins, participants, metadata }) => {
    try {
        if (!isGroup) return reply("❌ This command only works in groups");
        if (!isBotAdmins) return reply("❌ I need to be an admin to use this command.");
        if (!isAdmins) return reply("❌ Only group admins can use this command.");

        const botOwner = conn.user.id.split(":")[0] + "@s.whatsapp.net";
        const quoted = m.quoted ? m.quoted.sender : null;
        const mentioned = m.mentionedJid && m.mentionedJid.length > 0 ? m.mentionedJid[0] : null;
        const target = quoted || mentioned || q;

        if (!target) return reply("❌ Please mention or reply to the user you want to promote");
        
        const targetJid = target.includes('@') ? target : target + '@s.whatsapp.net';
        
        // Check if trying to promote bot itself
        if (targetJid === botOwner) return reply("❌ I can't promote myself");
        
        // Check if user is already admin
        const isAlreadyAdmin = metadata.participants.find(p => p.id === targetJid)?.admin === 'admin';
        if (isAlreadyAdmin) return reply("❌ This user is already an admin");

        await conn.groupParticipantsUpdate(from, [targetJid], "promote");
        await react("✅");
        return reply(`🎉 Successfully promoted @${targetJid.split('@')[0]} to admin!`, { mentions: [targetJid] });

    } catch (e) {
        console.error("Error in promote command:", e);
        await react("❌");
        return reply("❌ Failed to promote user. Please try again later.");
    }
});

cmd({
    pattern: "demote",
    alias: ["d", "dismiss"],
    desc: "Demote an admin to member",
    category: "group",
    react: "⬇️",
    filename: __filename
},
async (conn, mek, m, { from, args, q, reply, react, isGroup, isBotAdmins, isAdmins, participants, metadata }) => {
    try {
        if (!isGroup) return reply("❌ This command only works in groups");
        if (!isBotAdmins) return reply("❌ I need to be an admin to use this command.");
        if (!isAdmins) return reply("❌ Only group admins can use this command.");

        const botOwner = conn.user.id.split(":")[0] + "@s.whatsapp.net";
        const quoted = m.quoted ? m.quoted.sender : null;
        const mentioned = m.mentionedJid && m.mentionedJid.length > 0 ? m.mentionedJid[0] : null;
        const target = quoted || mentioned || q;

        if (!target) return reply("❌ Please mention or reply to the admin you want to demote");
        
        const targetJid = target.includes('@') ? target : target + '@s.whatsapp.net';
        
        // Check if trying to demote bot itself
        if (targetJid === botOwner) return reply("❌ I can't demote myself");
        
        // Check if user is not admin
        const isAdmin = metadata.participants.find(p => p.id === targetJid)?.admin === 'admin';
        if (!isAdmin) return reply("❌ This user is not an admin");

        await conn.groupParticipantsUpdate(from, [targetJid], "demote");
        await react("✅");
        return reply(`⚠️ Successfully demoted @${targetJid.split('@')[0]} from admin!`, { mentions: [targetJid] });

    } catch (e) {
        console.error("Error in demote command:", e);
        await react("❌");
        return reply("❌ Failed to demote admin. Please try again later.");
    }
});
