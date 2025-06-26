const fs = require("fs");
const path = require("path");
const axios = require("axios");
const { cmd } = require("../command");
const config = require("../config");

const AUDIO_PATH = path.join(__dirname, "../assets/mention.json");

cmd({
  on: "body"
}, async (conn, m, { isGroup }) => {
  try {
    if (config.MENTION_REPLY !== 'true' || !isGroup) return;
    if (!m.mentionedJid || m.mentionedJid.length === 0) return;

    const botNumber = conn.user.id.split(":")[0] + "@s.whatsapp.net";
    if (!m.mentionedJid.includes(botNumber)) return;

    // Load voice clips
    let voiceClips = [];
    if (fs.existsSync(AUDIO_PATH)) {
      voiceClips = JSON.parse(fs.readFileSync(AUDIO_PATH, "utf-8"));
    }

    if (!voiceClips.length) return;

    // Pick a random clip
    const randomClip = voiceClips[Math.floor(Math.random() * voiceClips.length)];

    // Download thumbnail
    const thumbnailRes = await axios.get(config.MENU_IMAGE_URL || "https://files.catbox.moe/c836ws.png", {
      responseType: "arraybuffer"
    });
    const thumbnailBuffer = Buffer.from(thumbnailRes.data, "binary");

    // Force send as voice note regardless of extension
    await conn.sendMessage(m.chat, {
      audio: { url: randomClip },
      mimetype: "audio/mp4", // Send as PTT regardless of .mp3 or .mp4
      ptt: true,
      waveform: [90, 50, 10, 90, 20],
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
    console.error("❌ Error in mention auto-reply:", e);
  }
});
