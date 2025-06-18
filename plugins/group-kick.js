const { cmd } = require('../command');

cmd({
    pattern: "remove",
    alias: ["kick", "k"],
    desc: "Removes a member from the group",
    category: "admin",
    react: "📦",
    filename: __filename
},
async (conn, mek, m, {
    from, q, isGroup, isBotAdmins, reply, quoted, senderNumber
}) => {
    if (!isGroup) return reply("❌ This command can only be used in groups.");
    if (!isBotAdmins) return reply("❌ I need to be an admin to use this command.");

    // Get bot owner's number from conn.user.id
    const botOwner = conn.user.id.split(":")[0];
    if (senderNumber !== botOwner) return reply("❌ Only the bot owner can use this command.");

    let number;

    if (m.quoted) {
        number = m.quoted.sender.split("@")[0];
    } else if (q && q.includes("@")) {
        number = q.replace(/[@\s]/g, '').replace(/:.*$/, ''); // remove @ and :lid
    } else {
        return reply("❌ Please reply to a message or mention a user to remove.");
    }

    const jid = number + "@s.whatsapp.net";

    try {
        // Prevent removing another admin
        const metadata = await conn.groupMetadata(from);
        const target = metadata.participants.find(p => p.id === jid);
        if (!target) return reply("❌ Target is not in the group.");

        if (target.admin) return reply("❌ Cannot remove a group admin.");

        await conn.groupParticipantsUpdate(from, [jid], "remove");
        reply(`✅ Successfully removed @${number}`, { mentions: [jid] });

    } catch (error) {
        console.error("❌ Remove command error:", error);
        reply("❌ Failed to remove the member. Make sure the user is in the group and I'm allowed to remove them.");
    }
});
