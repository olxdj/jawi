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
    // Basic checks
    if (!isGroup) return reply("⚠️ This command only works in groups.");
    if (!isBotAdmins) return reply("❌ I must be admin to remove someone.");
    if (!isAdmins && !isCreator) return reply("🔐 Only group admins or owner can use this command.");

    // User extraction
    if (!m.quoted && (!m.mentionedJid || m.mentionedJid.length === 0)) {
      return reply("❓ Mention or reply to a user!");
    }

    const user = m.mentionedJid?.[0] || m.quoted?.sender;
    if (!user) return reply("⚠️ Couldn't determine user.");

    // Self-protection (works for both mentions and replies)
    const botJid = conn.user.id.includes(':') 
      ? conn.user.id.split(':')[0] + '@s.whatsapp.net' 
      : conn.user.id;
      
    if (user === botJid || user === botNumber) {
      return reply("🤖 I can't kick myself!");
    }

    // Owner protection
    const ownerJid = botNumber.includes(':') 
      ? botNumber.split(':')[0] + '@s.whatsapp.net'
      : botNumber;
    if (user === ownerJid) return reply("👑 Can't remove my owner!");

    // Execute kick
    await conn.groupParticipantsUpdate(from, [user], "remove");
    reply(`✅ Removed @${user.split('@')[0]}`, { mentions: [user] });

  } catch (err) {
    console.error(err);
    reply("❌ Kick failed. I may lack permissions.");
  }
});

// ==================== PROMOTE COMMAND ====================
cmd({
  pattern: "promote",
  alias: ["p", "giveadmin", "makeadmin"],
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

    // User extraction
    if (!m.quoted && (!m.mentionedJid || m.mentionedJid.length === 0)) {
      return reply("❓ Mention or reply to a user!");
    }

    const user = m.mentionedJid?.[0] || m.quoted?.sender;
    if (!user) return reply("⚠️ Invalid user");

    // Self-protection
    const botJid = conn.user.id.includes(':') 
      ? conn.user.id.split(':')[0] + '@s.whatsapp.net' 
      : conn.user.id;
    if (user === botJid || user === botNumber) {
      return reply("🤖 I can't promote myself!");
    }

    // Owner check
    const ownerJid = botNumber.includes(':') 
      ? botNumber.split(':')[0] + '@s.whatsapp.net'
      : botNumber;
    if (user === ownerJid) return reply("👑 Owner is already super admin!");

    await conn.groupParticipantsUpdate(from, [user], "promote");
    reply(`⭐ Promoted @${user.split('@')[0]}`, { mentions: [user] });

  } catch (err) {
    console.error(err);
    reply("❌ Promotion failed");
  }
});

// ==================== DEMOTE COMMAND ====================
cmd({
  pattern: "demote",
  alias: ["d", "dismiss", "removeadmin"],
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

    // User extraction
    if (!m.quoted && (!m.mentionedJid || m.mentionedJid.length === 0)) {
      return reply("❓ Mention or reply to a user!");
    }

    const user = m.mentionedJid?.[0] || m.quoted?.sender;
    if (!user) return reply("⚠️ Invalid user");

    // Self-protection
    const botJid = conn.user.id.includes(':') 
      ? conn.user.id.split(':')[0] + '@s.whatsapp.net' 
      : conn.user.id;
    if (user === botJid || user === botNumber) {
      return reply("🤖 I can't demote myself!");
    }

    // Owner protection
    const ownerJid = botNumber.includes(':') 
      ? botNumber.split(':')[0] + '@s.whatsapp.net'
      : botNumber;
    if (user === ownerJid) return reply("👑 Can't demote my owner!");

    await conn.groupParticipantsUpdate(from, [user], "demote");
    reply(`🔻 Demoted @${user.split('@')[0]}`, { mentions: [user] });

  } catch (err) {
    console.error(err);
    reply("❌ Demotion failed");
  }
});
