const { cmd } = require("../command");

cmd({
  pattern: "kick",
  alias: ["k", "remove", "boot"],
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
    if (!isGroup) return reply("⚠️ This command only works in *groups*.");
    if (!isBotAdmins) return reply("❌ I must be *admin* to remove someone.");
    if (!isAdmins && !isCreator) return reply("🔐 Only *group admins* or *owner* can use this command.");

    // User extraction logic
    if (!m.quoted && (!m.mentionedJid || m.mentionedJid.length === 0)) {
      return reply("❓ You did not give me a user to remove!");
    }

    let users = m.mentionedJid[0]
      ? m.mentionedJid[0]
      : m.quoted
      ? m.quoted.sender
      : null;

    if (!users) return reply("⚠️ Couldn't determine target user.");

    // Prevent kicking the bot itself
    if (users === botNumber) return reply("❌ The bot cannot remove itself.");

    const ownerJid = conn.user.id.split(":")[0] + '@s.whatsapp.net';
    
    // Prevent kicking the owner
    if (users === ownerJid) return reply("👑 That's the *Owner's Number!* I can't remove that.");

    // Kick the user
    await conn.groupParticipantsUpdate(from, [users], "remove");

    reply(`*✅ Successfully removed from group.*`, { mentions: [users] });

  } catch (err) {
    console.error(err);
    reply("❌ Failed to remove user. Something went wrong.");
  }
});
