const config = require('../config');
const { cmd } = require('../command');
const axios = require('axios');

cmd({
  on: "body"
}, async (conn, m, { isGroup }) => {
  try {
    if (config.MENTION_REPLY !== 'true' || !isGroup) return;
    if (!m.mentionedJid || m.mentionedJid.length === 0) return;

    const voiceClips = [
    "https://cdn.ironman.my.id/i/7p5plg.mp4",
    "https://cdn.ironman.my.id/i/l4dyvg.mp4",
    "https://cdn.ironman.my.id/i/4z93dg.mp4",
    "https://cdn.ironman.my.id/i/m9gwk0.mp4",
    "https://cdn.ironman.my.id/i/gr1jjc.mp4",
    "https://cdn.ironman.my.id/i/lbr8of.mp4",
    "https://cdn.ironman.my.id/i/0z95mz.mp4",
    "https://cdn.ironman.my.id/i/rldpwy.mp4",
    "https://cdn.ironman.my.id/i/lz2z87.mp4",
    "https://cdn.ironman.my.id/i/gg5jct.mp4",
    "https://cdn.ironman.my.id/i/0gup65.mp4",
    "https://cdn.ironman.my.id/i/8mrocq.mp4",
    "https://cdn.ironman.my.id/i/xf29k2.mp4",
    "https://cdn.ironman.my.id/i/aof4z4.mp4",
    "https://cdn.ironman.my.id/i/1ulm61.mp4",
    "https://cdn.ironman.my.id/i/88x93o.mp4",
    "https://files.catbox.moe/bat4dt.mp3",
    "https://files.catbox.moe/nugg7o.mp3",
    "https://files.catbox.moe/fcqzmk.mp3",
    "https://files.catbox.moe/tqzlfl.mp3",
    "https://files.catbox.moe/w94n86.mp3",
    "https://files.catbox.moe/cuk967.mp3",
    "https://files.catbox.moe/7ajubx.mp3",
    "https://files.catbox.moe/2fi10f.mp3",
    "https://files.catbox.moe/78isfb.mp3",
    "https://files.catbox.moe/lcrt4a.mp3"
    ];

    const randomClip = voiceClips[Math.floor(Math.random() * voiceClips.length)];
    const botNumber = conn.user.id.split(":")[0] + '@s.whatsapp.net';

    if (m.mentionedJid.includes(botNumber)) {
      const thumbnailRes = await axios.get(config.MENU_IMAGE_URL || "https://files.catbox.moe/c836ws.png", {
        responseType: 'arraybuffer'
      });
      const thumbnailBuffer = Buffer.from(thumbnailRes.data, 'binary');

      await conn.sendMessage(m.chat, {
        audio: { url: randomClip },
        mimetype: 'audio/mp4',
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
            mediaUrl: "https://files.catbox.moe/l2t3e0.jpg", // Static image URL
            sourceUrl: "https://wa.me/message/INB2QVGXHQREO1",
            showAdAttribution: true
          }
        }
      }, { quoted: m });
    }
  } catch (e) {
    console.error(e);
    const ownerJid = conn.user.id.split(":")[0] + "@s.whatsapp.net";
    await conn.sendMessage(ownerJid, {
      text: `*Bot Error in Mention Handler:*\n${e.message}`
    });
  }
});

cmd({
  pattern: "me",
  category: "fun",
  desc: "Sends a random voice/audio message",
  filename: __filename
}, async (conn, m) => {
  const voiceClips = [
    // Your old & new audio/video URLs
    "https://cdn.ironman.my.id/i/7p5plg.mp4",
    "https://cdn.ironman.my.id/i/l4dyvg.mp4",
    "https://cdn.ironman.my.id/i/4z93dg.mp4",
    "https://cdn.ironman.my.id/i/m9gwk0.mp4",
    "https://cdn.ironman.my.id/i/gr1jjc.mp4",
    "https://cdn.ironman.my.id/i/lbr8of.mp4",
    "https://cdn.ironman.my.id/i/0z95mz.mp4",
    "https://cdn.ironman.my.id/i/rldpwy.mp4",
    "https://cdn.ironman.my.id/i/lz2z87.mp4",
    "https://cdn.ironman.my.id/i/gg5jct.mp4",

    "https://cdn.ironman.my.id/i/0gup65.mp4",
    "https://cdn.ironman.my.id/i/8mrocq.mp4",
    "https://cdn.ironman.my.id/i/xf29k2.mp4",
    "https://cdn.ironman.my.id/i/aof4z4.mp4",
    "https://cdn.ironman.my.id/i/1ulm61.mp4",
    "https://cdn.ironman.my.id/i/88x93o.mp4",

    "https://files.catbox.moe/bat4dt.mp3",
    "https://files.catbox.moe/nugg7o.mp3",
    "https://files.catbox.moe/fcqzmk.mp3",
    "https://files.catbox.moe/tqzlfl.mp3",
    "https://files.catbox.moe/w94n86.mp3",
    "https://files.catbox.moe/cuk967.mp3",
    "https://files.catbox.moe/7ajubx.mp3",
    "https://files.catbox.moe/2fi10f.mp3",
    "https://files.catbox.moe/78isfb.mp3",
    "https://files.catbox.moe/lcrt4a.mp3"
  ];

  const selected = voiceClips[Math.floor(Math.random() * voiceClips.length)];

  const thumbnailRes = await axios.get(config.MENU_IMAGE_URL || "https://files.catbox.moe/c836ws.png", {
    responseType: 'arraybuffer'
  });
  const thumbnailBuffer = Buffer.from(thumbnailRes.data, 'binary');

  await conn.sendMessage(m.chat, {
    audio: { url: selected },
    mimetype: 'audio/mp4',
    ptt: true,
    contextInfo: {
      forwardingScore: 999,
      isForwarded: true,
      externalAdReply: {
        title: config.BOT_NAME || "KHAN-MD 🥀",
        body: config.DESCRIPTION || "POWERED BY JAWAD TECHX 🤌💗",
        mediaType: 1,
        thumbnail: thumbnailBuffer,
        sourceUrl: "https://wa.me/message/INB2QVGXHQREO1"
      }
    }
  }, { quoted: m });
});
