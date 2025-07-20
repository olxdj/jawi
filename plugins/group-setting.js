const { cmd } = require("../command");

// ==================== KICK COMMAND ====================
cmd({
    pattern: "kick",
    alias: ["k", "remove", "nital"],
    desc: "Remove a user from the group",
    category: "group",
    react: "💀",
    filename: __filename
}, async (conn, mek, m, {
    from,
    isCreator,
    isBotAdmins,
    isAdmins,
    isGroup,
    quoted,
    reply,
    botNumber
}) => {
    try {
        if (!isGroup) return reply("⚠️ This command only works in groups.");
        if (!isBotAdmins) return reply("❌ I must be admin to remove someone.");
        if (!isAdmins && !isCreator) return reply("🔐 Only group admins or owner can use this command.");

        if (!quoted) return reply("❌ Please reply to the message of the user you want to remove!");
        
        let user = quoted.sender;
        if (!user) return reply("⚠️ Couldn't determine target user.");
        
        // Protection checks
        if (user === botNumber) return reply("🤖 I can't kick myself!");
        const ownerJid = conn.user.id.split(":")[0] + '@s.whatsapp.net';
        if (user === ownerJid) return reply("👑 That's the owner! I can't remove them.");
        
        await conn.groupParticipantsUpdate(from, [user], "remove");
        reply(`*✅ Successfully removed from group.*`, { mentions: [user] });

    } catch (err) {
        console.error(err);
        reply("❌ Failed to remove user. Something went wrong.");
    }
});

// ==================== PROMOTE COMMAND ====================
cmd({
    pattern: "promote",
    alias: ["p", "giveadmin", "makeadmin"],
    desc: "Promote a user to admin",
    category: "group",
    react: "💀",
    filename: __filename
}, async (conn, mek, m, {
    from,
    isCreator,
    isBotAdmins,
    isAdmins,
    isGroup,
    quoted,
    reply,
    botNumber
}) => {
    try {
        if (!isGroup) return reply("⚠️ This command only works in groups.");
        if (!isBotAdmins) return reply("❌ I must be admin to promote someone.");
        if (!isAdmins && !isCreator) return reply("🔐 Only group admins or owner can use this command.");

        if (!quoted) return reply("❌ Please reply to the message of the user you want to promote!");
        
        let user = quoted.sender;
        if (!user) return reply("⚠️ Couldn't determine target user.");
        
        // Protection checks
        if (user === botNumber) return reply("🤖 I can't promote myself!");
        const ownerJid = conn.user.id.split(":")[0] + '@s.whatsapp.net';
        if (user === ownerJid) return reply("👑 Owner is already super admin!");
        
        await conn.groupParticipantsUpdate(from, [user], "promote");
        reply(`*✅ Successfully Promoted to Admin.*`, { mentions: [user] });

    } catch (err) {
        console.error(err);
        reply("❌ Failed to promote. Something went wrong.");
    }
});

// ==================== DEMOTE COMMAND ====================
cmd({
    pattern: "demote",
    alias: ["d", "dismiss", "removeadmin"],
    desc: "Demote a group admin",
    category: "group",
    react: "💀",
    filename: __filename
}, async (conn, mek, m, {
    from,
    isCreator,
    isBotAdmins,
    isAdmins,
    isGroup,
    quoted,
    reply,
    botNumber
}) => {
    try {
        if (!isGroup) return reply("⚠️ This command only works in groups.");
        if (!isBotAdmins) return reply("❌ I must be admin to demote someone.");
        if (!isAdmins && !isCreator) return reply("🔐 Only group admins or owner can use this command.");

        if (!quoted) return reply("❌ Please reply to the message of the user you want to demote!");
        
        let user = quoted.sender;
        if (!user) return reply("⚠️ Couldn't determine target user.");
        
        // Protection checks
        if (user === botNumber) return reply("🤖 I can't demote myself!");
        const ownerJid = conn.user.id.split(":")[0] + '@s.whatsapp.net';
        if (user === ownerJid) return reply("👑 I can't demote the owner!");
        
        await conn.groupParticipantsUpdate(from, [user], "demote");
        reply(`*✅ Admin Successfully demoted to a normal member.*`, { mentions: [user] });

    } catch (err) {
        console.error(err);
        reply("❌ Failed to demote. Something went wrong.");
    }
});
