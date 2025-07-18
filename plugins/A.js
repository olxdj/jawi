const { cmd } = require("../command");

cmd({
  pattern: "demote",
  alias: ["d2", "dismiss", "removeadmin"],
  desc: "Demote a group admin",
  category: "group",
  react: "🔻",
  filename: __filename
}, async (conn, mek, m, {
  from,
  isCreator,
  isBotAdmins,
  isAdmins,
  isGroup,
  participants,
  quoted,
  reply
}) => {
  try {
    if (!isGroup) return reply("⚠️ This command only works in *groups*.");
    if (!isBotAdmins) return reply("❌ I must be *admin* to demote someone.");
    if (!isAdmins && !isCreator) return reply("🔐 Only *group admins* or *owner* can use this command.");

    if (!m.quoted && (!m.mentionedJid || m.mentionedJid.length === 0)) {
      return reply("❓ You did not give me a user!?");
    }

    let users = m.mentionedJid[0]
      ? m.mentionedJid[0]
      : m.quoted
      ? m.quoted.sender
      : null;

    if (!users) return reply("⚠️ Couldn't determine target user.");

    const parts = users.split('@')[0];
    const ownerJid = conn.user.id.split(":")[0] + '@s.whatsapp.net';

    if (users === ownerJid) return reply("👑 That's the *Owner's Number!* I can't demote that.");

    // 🔥 Fixed check
    const cleanJid = (jid) => jid?.split("@")[0] + "@s.whatsapp.net";
    const isTargetAdmin = participants.find(p => cleanJid(p.id) === cleanJid(users))?.admin;

    if (!isTargetAdmin) return reply("❌ That user is *not an admin*.");

    await conn.groupParticipantsUpdate(from, [users], "demote");

    reply(`@${parts} is no longer an *admin*. 🎗️`, { mentions: [users] });

  } catch (err) {
    console.error(err);
    reply("❌ Failed to demote. Something went wrong.");
  }
});
