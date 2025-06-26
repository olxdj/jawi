const fs = require('fs');
const path = require('path');
const config = require('../config');
const { cmd } = require('../command');
const axios = require('axios');

const AUDIO_PATH = path.join(__dirname, '../assets/mention.json');

cmd({
  on: "body"
}, async (conn, m, { isGroup }) => {
  try {
    if (config.MENTION_REPLY !== 'true' || !isGroup) return;
    if (!m.mentionedJid || m.mentionedJid.length === 0) return;

    const botNumber = conn.user.id.split(":")[0] + '@s.whatsapp.net';
    if (!m.mentionedJid.includes(botNumber)) return;

    // Load from mention.json
    let voiceClips = [];
    if (fs.existsSync(AUDIO_PATH)) {
      voiceClips = JSON.parse(fs.readFileSync(AUDIO_PATH, 'utf-8'));
    }

    if (!voiceClips.length) return;

    const randomClip = voiceClips[Math.floor(Math.random() * voiceClips.length)];

    // Get thumbnail image
    const thumbnailRes = await axios.get(config.MENU_IMAGE_URL || "https://files.catbox.moe/c836ws.png", {
      responseType: 'arraybuffer'
    });
    const thumbnailBuffer = Buffer.from(thumbnailRes.data, 'binary');

    await conn.sendMessage(m.chat, {
      audio: { url: randomClip },
      mimetype: 'audio/mp4', // force it as voice note
      ptt: true,
      waveform: [99, 0, 99, 0, 99],
      contextInfo: {
        forwardingScore: 999,
        isForwarded: true,
        externalAdReply: {
          title: config.BOT_NAME || "KHAN-MD 🥀",
          body: config.DESCRIPTION || "POWERED BY JAWAD TECHX 🤌💗",
          mediaType: 1,
          renderLargerThumbnail: false,
          thumbnail: thumbnailBuffer,
          mediaUrl: "https://files.catbox.moe/l2t3e0.jpg",
          sourceUrl: "https://wa.me/message/INB2QVGXHQREO1",
          showAdAttribution: true
        }
      }
    }, { quoted: m });

  } catch (e) {
    console.error("Mention Handler Error:", e);
    const ownerJid = conn.user.id.split(":")[0] + "@s.whatsapp.net";
    await conn.sendMessage(ownerJid, {
      text: `*Bot Error in Mention Handler:*\n${e.message}`
    });
  }
});
