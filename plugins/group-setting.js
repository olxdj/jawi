const { cmd } = require("../command");

// ============== UNIVERSAL PROTECTION LOGIC ==============
const protectBotAndOwner = (conn, targetJid, botNumber, reply) => {
    // Get clean bot JID (remove any server suffix)
    const cleanBotJid = conn.user.id.split(':')[0] + '@s.whatsapp.net';
    
    // Get clean owner JID from botNumber (remove any prefixes)
    const cleanOwnerJid = botNumber.includes('@') 
        ? botNumber.split('@')[0] + '@s.whatsapp.net'
        : botNumber + '@s.whatsapp.net';

    // Clean target JID
    const cleanTarget = targetJid.includes(':') 
        ? targetJid.split(':')[0] + '@s.whatsapp.net'
        : targetJid;

    // Compare numbers only (ignore any formatting differences)
    const targetNumber = cleanTarget.split('@')[0];
    const botNumberClean = cleanBotJid.split('@')[0];
    const ownerNumberClean = cleanOwnerJid.split('@')[0];

    if (targetNumber === botNumberClean) {
        reply("🤖 I can't modify myself!");
        return false;
    }
    if (targetNumber === ownerNumberClean) {
        reply("👑 I can't modify my owner!");
        return false;
    }
    return true;
};

// ==================== KICK COMMAND ====================
cmd({
  pattern: "kick",
  alias: ["k", "remove"],
  desc: "Remove user from group",
  category: "group",
  react: "👢",
  filename: __filename
}, async (conn, mek, m, { from, isBotAdmins, isAdmins, isGroup, quoted, reply, botNumber }) => {
  try {
    if (!isGroup) return reply("⚠️ Group only command");
    if (!isBotAdmins) return reply("❌ I need admin rights");
    if (!isAdmins) return reply("🔐 Admin-only command");

    const user = m.mentionedJid?.[0] || m.quoted?.sender;
    if (!user) return reply("❌ Mention/reply to user");

    if (!protectBotAndOwner(conn, user, botNumber, reply)) return;

    await conn.groupParticipantsUpdate(from, [user], "remove");
    reply(`🗑️ Removed @${user.split('@')[0]}`, { mentions: [user] });
  } catch (e) {
    console.error("Kick error:", e);
    reply("❌ Kick failed");
  }
});

// ==================== PROMOTE COMMAND ====================
cmd({
  pattern: "promote",
  alias: ["p", "admin"],
  desc: "Promote to admin",
  category: "group",
  react: "🔺",
  filename: __filename
}, async (conn, mek, m, { from, isBotAdmins, isAdmins, isGroup, quoted, reply, botNumber }) => {
  try {
    if (!isGroup) return reply("⚠️ Group only command");
    if (!isBotAdmins) return reply("❌ I need admin rights");
    if (!isAdmins) return reply("🔐 Admin-only command");

    const user = m.mentionedJid?.[0] || m.quoted?.sender;
    if (!user) return reply("❌ Mention/reply to user");

    if (!protectBotAndOwner(conn, user, botNumber, reply)) return;

    await conn.groupParticipantsUpdate(from, [user], "promote");
    reply(`⭐ Promoted @${user.split('@')[0]}`, { mentions: [user] });
  } catch (e) {
    console.error("Promote error:", e);
    reply("❌ Promotion failed");
  }
});

// ==================== DEMOTE COMMAND ====================
cmd({
  pattern: "demote",
  alias: ["d", "unadmin"],
  desc: "Demote admin",
  category: "group",
  react: "🔻",
  filename: __filename
}, async (conn, mek, m, { from, isBotAdmins, isAdmins, isGroup, quoted, reply, botNumber }) => {
  try {
    if (!isGroup) return reply("⚠️ Group only command");
    if (!isBotAdmins) return reply("❌ I need admin rights");
    if (!isAdmins) return reply("🔐 Admin-only command");

    const user = m.mentionedJid?.[0] || m.quoted?.sender;
    if (!user) return reply("❌ Mention/reply to user");

    if (!protectBotAndOwner(conn, user, botNumber, reply)) return;

    await conn.groupParticipantsUpdate(from, [user], "demote");
    reply(`🔻 Demoted @${user.split('@')[0]}`, { mentions: [user] });
  } catch (e) {
    console.error("Demote error:", e);
    reply("❌ Demotion failed");
  }
});const { cmd } = require("../command");

// ============== UNIVERSAL PROTECTION LOGIC ==============
const protectBotAndOwner = (conn, targetJid, botNumber, reply) => {
    // Get clean bot JID (remove any server suffix)
    const cleanBotJid = conn.user.id.split(':')[0] + '@s.whatsapp.net';
    
    // Get clean owner JID from botNumber (remove any prefixes)
    const cleanOwnerJid = botNumber.includes('@') 
        ? botNumber.split('@')[0] + '@s.whatsapp.net'
        : botNumber + '@s.whatsapp.net';

    // Clean target JID
    const cleanTarget = targetJid.includes(':') 
        ? targetJid.split(':')[0] + '@s.whatsapp.net'
        : targetJid;

    // Compare numbers only (ignore any formatting differences)
    const targetNumber = cleanTarget.split('@')[0];
    const botNumberClean = cleanBotJid.split('@')[0];
    const ownerNumberClean = cleanOwnerJid.split('@')[0];

    if (targetNumber === botNumberClean) {
        reply("🤖 I can't modify myself!");
        return false;
    }
    if (targetNumber === ownerNumberClean) {
        reply("👑 I can't modify my owner!");
        return false;
    }
    return true;
};

// ==================== KICK COMMAND ====================
cmd({
  pattern: "kick",
  alias: ["k", "remove"],
  desc: "Remove user from group",
  category: "group",
  react: "👢",
  filename: __filename
}, async (conn, mek, m, { from, isBotAdmins, isAdmins, isGroup, quoted, reply, botNumber }) => {
  try {
    if (!isGroup) return reply("⚠️ Group only command");
    if (!isBotAdmins) return reply("❌ I need admin rights");
    if (!isAdmins) return reply("🔐 Admin-only command");

    const user = m.mentionedJid?.[0] || m.quoted?.sender;
    if (!user) return reply("❌ Mention/reply to user");

    if (!protectBotAndOwner(conn, user, botNumber, reply)) return;

    await conn.groupParticipantsUpdate(from, [user], "remove");
    reply(`🗑️ Removed @${user.split('@')[0]}`, { mentions: [user] });
  } catch (e) {
    console.error("Kick error:", e);
    reply("❌ Kick failed");
  }
});

// ==================== PROMOTE COMMAND ====================
cmd({
  pattern: "promote",
  alias: ["p", "admin"],
  desc: "Promote to admin",
  category: "group",
  react: "🔺",
  filename: __filename
}, async (conn, mek, m, { from, isBotAdmins, isAdmins, isGroup, quoted, reply, botNumber }) => {
  try {
    if (!isGroup) return reply("⚠️ Group only command");
    if (!isBotAdmins) return reply("❌ I need admin rights");
    if (!isAdmins) return reply("🔐 Admin-only command");

    const user = m.mentionedJid?.[0] || m.quoted?.sender;
    if (!user) return reply("❌ Mention/reply to user");

    if (!protectBotAndOwner(conn, user, botNumber, reply)) return;

    await conn.groupParticipantsUpdate(from, [user], "promote");
    reply(`⭐ Promoted @${user.split('@')[0]}`, { mentions: [user] });
  } catch (e) {
    console.error("Promote error:", e);
    reply("❌ Promotion failed");
  }
});

// ==================== DEMOTE COMMAND ====================
cmd({
  pattern: "demote",
  alias: ["d", "unadmin"],
  desc: "Demote admin",
  category: "group",
  react: "🔻",
  filename: __filename
}, async (conn, mek, m, { from, isBotAdmins, isAdmins, isGroup, quoted, reply, botNumber }) => {
  try {
    if (!isGroup) return reply("⚠️ Group only command");
    if (!isBotAdmins) return reply("❌ I need admin rights");
    if (!isAdmins) return reply("🔐 Admin-only command");

    const user = m.mentionedJid?.[0] || m.quoted?.sender;
    if (!user) return reply("❌ Mention/reply to user");

    if (!protectBotAndOwner(conn, user, botNumber, reply)) return;

    await conn.groupParticipantsUpdate(from, [user], "demote");
    reply(`🔻 Demoted @${user.split('@')[0]}`, { mentions: [user] });
  } catch (e) {
    console.error("Demote error:", e);
    reply("❌ Demotion failed");
  }
});
