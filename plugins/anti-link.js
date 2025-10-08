const { cmd, commands } = require('../command');
const config = require('../config');
const prefix = config.PREFIX;
const fs = require('fs');
const { getBuffer, getGroupAdmins, getRandom, h2k, isUrl, Json, sleep, fetchJson } = require('../lib/functions');
const { writeFileSync } = require('fs');
const path = require('path');
const os = require('os');
const { exec } = require('child_process');
const axios = require('axios');
const FormData = require('form-data');
const { setConfig, getConfig } = require("../lib/configdb");

cmd({
  pattern: "antilink",
  react: "🫟",
  alias: ["antilink"],
  desc: "Enable or disable anti-link feature in groups",
  category: "group",
  react: "🚫",
  filename: __filename
}, async (conn, mek, m, { from, l, quoted, body, isCmd, command, args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isCreator, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply }) => {
  try {
    // ⏳ React - processing
    await conn.sendMessage(from, { react: { text: '⏳', key: m.key } });
    
    // Small delay to ensure react is visible
    await sleep(500);

    // Check for creator permission
    if (!isCreator) {
      await reply('*📛 This is an owner command.*');
      await sleep(500);
      await conn.sendMessage(from, { react: { text: '❌', key: m.key } });
      return;
    }

    // Check for group
    if (!isGroup) {
      await reply('*This command can only be used in a group.*');
      await sleep(500);
      await conn.sendMessage(from, { react: { text: '❌', key: m.key } });
      return;
    }

    // Enable or disable anti-link feature with different modes
    if (args[0] === "on") {
      config.ANTI_LINK = "true";
      await reply("✅ *Anti-link enabled!*\n\n*Mode:* 🚫 Delete & Kick\n*Description:* Links will be deleted and sender will be kicked immediately.");
      await sleep(1000);
      await conn.sendMessage(from, { react: { text: '✅', key: m.key } });
    } 
    else if (args[0] === "off") {
      config.ANTI_LINK = "false";
      await reply("✅ *Anti-link disabled!*\n\n*Mode:* 🔓 Inactive\n*Description:* Link detection is turned off.");
      await sleep(1000);
      await conn.sendMessage(from, { react: { text: '✅', key: m.key } });
    }
    else if (args[0] === "warn") {
      config.ANTI_LINK = "warn";
      await reply("✅ *Anti-link enabled!*\n\n*Mode:* ⚠️ Warning System\n*Description:* Users get 3 warnings before being kicked.");
      await sleep(1000);
      await conn.sendMessage(from, { react: { text: '✅', key: m.key } });
    }
    else if (args[0] === "delete") {
      config.ANTI_LINK = "delete";
      await reply("✅ *Anti-link enabled!*\n\n*Mode:* 🗑️ Delete Only\n*Description:* Links will be deleted but users won't be kicked.");
      await sleep(1000);
      await conn.sendMessage(from, { react: { text: '✅', key: m.key } });
    }
    else {
      // Perfect WhatsApp-style invalid command message
      const helpMessage = `
🛡️ *ANTI-LINK SETTINGS*

Please select a valid option:

🟢 *ON* - Delete links & kick users immediately
🔴 *OFF* - Disable anti-link protection
🟡 *WARN* - Give 3 warnings then kick
🔵 *DELETE* - Delete links only (no kick)

*Usage Examples:*
• ${prefix}antilink on
• ${prefix}antilink warn  
• ${prefix}antilink delete
• ${prefix}antilink off

📝 *Note:* Only bot owner can use this command
      `.trim();
      
      await reply(helpMessage);
      await sleep(500);
      await conn.sendMessage(from, { react: { text: '❌', key: m.key } });
    }
  } catch (error) {
    await reply(`*❌ An error occurred while processing your request.*\n\n_Error:_ ${error.message}`);
    await sleep(500);
    await conn.sendMessage(from, { react: { text: '❌', key: m.key } });
  }
});

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
