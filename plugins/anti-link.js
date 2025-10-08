const { cmd } = require('../command');
const config = require("../config");

// Anti-Link System with four modes: true, false, "warn", "delete"
const linkPatterns = [
  /https?:\/\/(?:chat\.whatsapp\.com|wa\.me)\/\S+/gi,
  /^https?:\/\/(www\.)?whatsapp\.com\/channel\/([a-zA-Z0-9_-]+)$/,
  /wa\.me\/\S+/gi,
  /https?:\/\/(?:t\.me|telegram\.me)\/\S+/gi,
  /https?:\/\/(?:www\.)?youtube\.com\/\S+/gi,
  /https?:\/\/youtu\.be\/\S+/gi,
  /https?:\/\/(?:www\.)?facebook\.com\/\S+/gi,
  /https?:\/\/fb\.me\/\S+/gi,
  /https?:\/\/(?:www\.)?instagram\.com\/\S+/gi,
  /https?:\/\/(?:www\.)?twitter\.com\/\S+/gi,
  /https?:\/\/(?:www\.)?tiktok\.com\/\S+/gi,
  /https?:\/\/(?:www\.)?linkedin\.com\/\S+/gi,
  /https?:\/\/(?:www\.)?snapchat\.com\/\S+/gi,
  /https?:\/\/(?:www\.)?pinterest\.com\/\S+/gi,
  /https?:\/\/(?:www\.)?reddit\.com\/\S+/gi,
  /https?:\/\/ngl\/\S+/gi,
  /https?:\/\/(?:www\.)?discord\.com\/\S+/gi,
  /https?:\/\/(?:www\.)?twitch\.tv\/\S+/gi,
  /https?:\/\/(?:www\.)?vimeo\.com\/\S+/gi,
  /https?:\/\/(?:www\.)?dailymotion\.com\/\S+/gi,
  /https?:\/\/(?:www\.)?medium\.com\/\S+/gi
];

cmd({
  'on': "body"
}, async (conn, m, store, {
  from,
  body,
  sender,
  isGroup,
  isAdmins,
  isBotAdmins,
  reply
}) => {
  try {
    // Initialize warnings if not exists
    if (!global.warnings) {
      global.warnings = {};
    }

    // Only act in groups where bot is admin and sender isn't admin
    if (!isGroup || isAdmins || !isBotAdmins) {
      return;
    }

    // Check if anti-link is disabled
    if (config.ANTI_LINK === 'false' || !config.ANTI_LINK) {
      return;
    }

    // Check if message contains any forbidden links
    const containsLink = linkPatterns.some(pattern => pattern.test(body));

    if (containsLink) {
      console.log(`Link detected from ${sender}: ${body}`);

      // Try to delete the message (regardless of mode)
      try {
        await conn.sendMessage(from, { 'delete': m.key }, { 'quoted': m });
        console.log(`Message deleted: ${m.key.id}`);
      } catch (error) {
        console.error("Failed to delete message:", error);
      }

      // MODE: "delete" - Delete links only, don't remove member
      if (config.ANTI_LINK === 'delete') {
        await conn.sendMessage(from, {
          'text': `⚠️ Links are not allowed in this group.\n@${sender.split('@')[0]}, your link has been deleted. 🚫`,
          'mentions': [sender]
        }, { 'quoted': m });
        return;
      }

      // MODE: true - Delete and kick immediately
      if (config.ANTI_LINK === 'true') {
        await conn.sendMessage(from, {
          'text': `⚠️ Links are not allowed in this group.\n@${sender.split('@')[0]} has been removed. 🚫`,
          'mentions': [sender]
        }, { 'quoted': m });

        await conn.groupParticipantsUpdate(from, [sender], "remove");
        return;
      }

      // MODE: "warn" - Warning system (3 warnings then kick)
      if (config.ANTI_LINK === 'warn') {
        // Update warning count for user
        global.warnings[sender] = (global.warnings[sender] || 0) + 1;
        const warningCount = global.warnings[sender];

        // Handle warnings
        if (warningCount < 3) {
          // Send warning message
          await conn.sendMessage(from, {
            text: `‎*⚠️LINKS ARE NOT ALLOWED⚠️*\n` +
                  `*╭────⬡ WARNING ⬡────*\n` +
                  `*├▢ USER :* @${sender.split('@')[0]}!\n` +
                  `*├▢ COUNT : ${warningCount}*\n` +
                  `*├▢ REASON : LINK SENDING*\n` +
                  `*├▢ WARN LIMIT : 3*\n` +
                  `*╰────────────────*`,
            mentions: [sender]
          });
        } else {
          // Remove user if they exceed warning limit
          await conn.sendMessage(from, {
            text: `@${sender.split('@')[0]} *HAS BEEN REMOVED - WARN LIMIT EXCEEDED!*`,
            mentions: [sender]
          });
          await conn.groupParticipantsUpdate(from, [sender], "remove");
          delete global.warnings[sender];
        }
      }
    }
  } catch (error) {
    console.error("Anti-link error:", error);
    reply("❌ An error occurred while processing the message.");
  }
});
