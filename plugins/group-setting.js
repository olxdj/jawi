const { cmd } = require("../command");

// ==================== KICK COMMAND ====================
cmd({
  pattern: "kick",
  alias: ["k", "remove", "boot"],
  desc: "Remove a user from the group",
  category: "group",
  react: "👢",
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
    // Basic validation
    if (!isGroup) return reply("⚠️ This command only works in groups.");
    if (!isBotAdmins) return reply("❌ I need admin rights to kick.");
    if (!isAdmins && !isCreator) return reply("🔐 Only admins can use this.");

    // Get target user (works for both mentions and replies)
    let user = m.mentionedJid?.[0] || m.quoted?.sender;
    if (!user) return reply("❌ Mention or reply to a user!");

    // Convert all JIDs to standard format
    const normalizeJid = (jid) => {
      return jid.includes(':') ? jid.split(':')[0] + '@s.whatsapp.net' : jid;
    };

    // Critical protection
    const botJid = normalizeJid(conn.user.id);
    const ownerJid = normalizeJid(botNumber);
    user = normalizeJid(user);

    if (user === botJid || user === ownerJid) {
      return reply("🚫 I can't modify myself or my owner!");
    }

    // Execute action
    await conn.groupParticipantsUpdate(from, [user], "remove");
    reply(`✅ Removed @${user.split('@')[0]}`, { mentions: [user] });

  } catch (error) {
    console.error("Kick error:", error);
    reply("❌ Failed to kick user");
  }
});

// ==================== PROMOTE COMMAND ====================
cmd({
  pattern: "promote",
  alias: ["p", "admin", "makeadmin"],
  desc: "Promote user to admin",
  category: "group",
  react: "🔺", 
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
    if (!isGroup) return reply("⚠️ Group only command");
    if (!isBotAdmins) return reply("❌ I need admin rights");
    if (!isAdmins && !isCreator) return reply("🔐 Admin-only command");

    let user = m.mentionedJid?.[0] || m.quoted?.sender;
    if (!user) return reply("❌ Mention or reply to a user!");

    // Normalize JIDs
    const normalizeJid = (jid) => {
      return jid.includes(':') ? jid.split(':')[0] + '@s.whatsapp.net' : jid;
    };

    const botJid = normalizeJid(conn.user.id);
    const ownerJid = normalizeJid(botNumber);
    user = normalizeJid(user);

    if (user === botJid || user === ownerJid) {
      return reply("🚫 I can't promote myself or my owner!");
    }

    await conn.groupParticipantsUpdate(from, [user], "promote");
    reply(`⭐ Promoted @${user.split('@')[0]}`, { mentions: [user] });

  } catch (error) {
    console.error("Promote error:", error);
    reply("❌ Promotion failed");
  }
});

// ==================== DEMOTE COMMAND ====================
cmd({
  pattern: "demote",
  alias: ["d", "removeadmin"],
  desc: "Demote group admin", 
  category: "group",
  react: "🔻",
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
    if (!isGroup) return reply("⚠️ Group only command");
    if (!isBotAdmins) return reply("❌ I need admin rights");
    if (!isAdmins && !isCreator) return reply("🔐 Admin-only command");

    let user = m.mentionedJid?.[0] || m.quoted?.sender;
    if (!user) return reply("❌ Mention or reply to a user!");

    // Normalize JIDs
    const normalizeJid = (jid) => {
      return jid.includes(':') ? jid.split(':')[0] + '@s.whatsapp.net' : jid;
    };

    const botJid = normalizeJid(conn.user.id);
    const ownerJid = normalizeJid(botNumber);
    user = normalizeJid(user);

    if (user === botJid || user === ownerJid) {
      return reply("🚫 I can't demote myself or my owner!");
    }

    await conn.groupParticipantsUpdate(from, [user], "demote");
    reply(`🔻 Demoted @${user.split('@')[0]}`, { mentions: [user] });

  } catch (error) {
    console.error("Demote error:", error);
    reply("❌ Demotion failed");
  }
});
