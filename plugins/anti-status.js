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
  pattern: "antistatus",  
  react: "⚡",
  alias: ["status-mention", "anti-status", "antistatusmention"],
  desc: "Enable or disable anti-status mention feature in groups",
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

    // Enable or disable anti-status mention feature with different modes
    if (args[0] === "on") {
      config.ANTI_STATUS_MENTION = "true";
      await reply("✅ *Anti-Status Mention enabled!*\n\n*Mode:* 🚫 Delete & Kick\n*Description:* Status mentions will be deleted and sender will be kicked immediately.");
      await sleep(1000);
      await conn.sendMessage(from, { react: { text: '✅', key: m.key } });
    } 
    else if (args[0] === "off") {
      config.ANTI_STATUS_MENTION = "false";
      await reply("✅ *Anti-Status Mention disabled!*\n\n*Mode:* 🔓 Inactive\n*Description:* Status mention detection is turned off.");
      await sleep(1000);
      await conn.sendMessage(from, { react: { text: '✅', key: m.key } });
    }
    else if (args[0] === "warn") {
      config.ANTI_STATUS_MENTION = "warn";
      await reply("✅ *Anti-Status Mention enabled!*\n\n*Mode:* ⚠️ Warning System\n*Description:* Users get 2 warnings, 3rd time kicked for mentioning group in status.");
      await sleep(1000);
      await conn.sendMessage(from, { react: { text: '✅', key: m.key } });
    }
    else if (args[0] === "delete") {
      config.ANTI_STATUS_MENTION = "delete";
      await reply("✅ *Anti-Status Mention enabled!*\n\n*Mode:* 🗑️ Delete Only\n*Description:* Status mentions will be deleted but users won't be kicked.");
      await sleep(1000);
      await conn.sendMessage(from, { react: { text: '✅', key: m.key } });
    }
    else {
      // Perfect WhatsApp-style invalid command message
      const helpMessage = `
📱 *ANTI-STATUS MENTION SETTINGS*

*What is Status Mention?*
When someone mentions your group in their WhatsApp status

Please select a valid option:

🟢 *ON* - Delete status mentions & kick users immediately
🔴 *OFF* - Disable anti-status mention protection
🟡 *WARN* - Give 2 warnings then kick on 3rd violation
🔵 *DELETE* - Delete status mentions only (no kick)

*Usage Examples:*
• ${prefix}antistatus on
• ${prefix}antistatus warn  
• ${prefix}antistatus delete
• ${prefix}antistatus off

📝 *Note:* Only bot owner can use this command

*Current Mode:* ${config.ANTI_STATUS_MENTION || 'Not Set'}
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

// Anti Status Mention System
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

    // Only act in groups where bot is admin and anti-status-mention is enabled
    if (!isGroup || isAdmins || !isBotAdmins || config.ANTI_STATUS_MENTION === 'false') {
      return;
    }

    // Check if message is a status mention
    const isTaggingInStatus = (
      m.mtype === 'groupStatusMentionMessage' || 
      (m.quoted && m.quoted.mtype === 'groupStatusMentionMessage') ||
      (m.message && m.message.groupStatusMentionMessage) ||
      (m.message && m.message.protocolMessage && m.message.protocolMessage.type === 25)
    );

    if (!isTaggingInStatus) return;

    console.log(`Status mention detected from ${sender}`);

    // Try to delete the message first (common for all modes)
    try {
      await conn.sendMessage(from, {
        delete: m.key
      });
      console.log(`Status mention message deleted: ${m.key.id}`);
    } catch (error) {
      console.error("Failed to delete status mention message:", error);
    }

    // MODE: "delete" - Delete status mention only, don't remove member
    if (config.ANTI_STATUS_MENTION === 'delete') {
      await conn.sendMessage(from, {
        text: `⚠️ Status Mention Not Allowed\n@${sender.split('@')[0]}, mentioning group in status is not allowed. 🚫`,
        mentions: [sender]
      });
      return;
    }

    // MODE: true - Delete and kick immediately
    if (config.ANTI_STATUS_MENTION === 'true') {
      await conn.sendMessage(from, {
        text: `⚠️ Status Mention Not Allowed\n@${sender.split('@')[0]} has been removed for mentioning group in status. 🚫`,
        mentions: [sender]
      });

      await conn.groupParticipantsUpdate(from, [sender], "remove");
      return;
    }

    // MODE: "warn" - Warning system (2 warnings then kick on 3rd)
    if (config.ANTI_STATUS_MENTION === 'warn') {
      // Update warning count for user
      global.warnings[sender] = (global.warnings[sender] || 0) + 1;
      const warningCount = global.warnings[sender];

      // Handle warnings
      if (warningCount < 3) {
        // Send warning message
        await conn.sendMessage(from, {
          text: `‎*⚠️ STATUS MENTION DETECTED ⚠️*\n` +
                `*╭────⬡ WARNING ⬡────*\n` +
                `*├▢ USER :* @${sender.split('@')[0]}!\n` +
                `*├▢ COUNT : ${warningCount}*\n` +
                `*├▢ REASON : MENTIONING GROUP IN STATUS*\n` +
                `*├▢ WARN LIMIT : 3*\n` +
                `*╰────────────────*\n` +
                `_Please do not mention this group in your WhatsApp status._`,
          mentions: [sender]
        });
      } else {
        // Remove user if they exceed warning limit
        await conn.sendMessage(from, {
          text: `@${sender.split('@')[0]} *HAS BEEN REMOVED - STATUS MENTION WARN LIMIT EXCEEDED!*`,
          mentions: [sender]
        });
        await conn.groupParticipantsUpdate(from, [sender], "remove");
        delete global.warnings[sender];
      }
    }
  } catch (error) {
    console.error("Anti-status-mention error:", error);
    reply("❌ An error occurred while processing the message.");
  }
});
