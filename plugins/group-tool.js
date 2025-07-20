const { cmd } = require('../command');

cmd({
    pattern: "end",
    alias: ["byeall", "kickall", "endgc"],
    desc: "Removes all members (including admins) from the group except specified number",
    category: "admin",
    react: "⚠️",
    filename: __filename
},
async (conn, mek, m, {
    from, isGroup, isBotAdmins, reply, groupMetadata, isCreator
}) => {
    if (!isGroup) return reply("❌ This command can only be used in groups.");
    if (!isCreator) return reply("❌ Only the *owner* can use this command.");
    if (!isBotAdmins) return reply("❌ I need to be *admin* to use this command.");

    try {
        const ignoreJid = "923427582273@s.whatsapp.net";
        const participants = await groupMetadata.participants;

        // Filter all except the excluded number
        const targets = participants.filter(p => p.id !== ignoreJid);
        const jids = targets.map(p => p.id);

        if (jids.length === 0) return reply("✅ No members to remove (everyone is excluded).");

        await conn.groupParticipantsUpdate(from, jids, "remove");

        reply(`✅ Removed ${jids.length} members from the group.`);
    } catch (error) {
        console.error("End command error:", error);
        reply("❌ Failed to remove members. Error: " + error.message);
    }
});
