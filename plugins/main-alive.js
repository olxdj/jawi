const { cmd } = require('../command');
const axios = require('axios');
const config = require('../config');

cmd({
    pattern: "alive",
    alias: ["status", "online", "x", "me"],
    desc: "Check bot is alive or not",
    category: "main",
    react: "⚡",
    filename: __filename
},
async (conn, mek, m, { from, reply }) => {
    try {
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
        const rClip = voiceClips[Math.floor(Math.random() * voiceClips.length)];

        // Load thumbnail
        const thumbnailRes = await axios.get(config.MENU_IMAGE_URL || "https://files.catbox.moe/c836ws.png", {
            responseType: 'arraybuffer'
        });
        const thumbnailBuffer = Buffer.from(thumbnailRes.data, 'binary');

        // Custom fake contact quoted message with dynamic displayName
        let fgg = {
            key: {
                fromMe: false,
                participant: `0@s.whatsapp.net`,
                remoteJid: 'status@broadcast'
            },
            message: {
                contactMessage: {
                    displayName: `${config.BOT_NAME}`,
                    vcard: `BEGIN:VCARD\nVERSION:3.0\nN:;${config.BOT_NAME};;;\nFN:${config.BOT_NAME}\nitem1.TEL;waid=${m.sender.split('@')[0]}:${m.sender.split('@')[0]}\nitem1.X-ABLabel:JawadTechX\nEND:VCARD`
                }
            }
        };

        await conn.sendMessage(from, {
            audio: { url: rClip },
            mimetype: 'audio/mp4',
            ptt: true,
            waveform: [99, 0, 99, 0, 99],
            contextInfo: {
                forwardingScore: 999,
                isForwarded: true,
                externalAdReply: {
                    title: `${config.BOT_NAME} IS ONLINE`,
                    body: `${config.DESCRIPTION}`,
                    mediaType: 1,
                    renderLargerThumbnail: false,
                    thumbnail: thumbnailBuffer,
                    mediaUrl: "https://files.catbox.moe/l2t3e0.jpg",
                    sourceUrl: "https://wa.me/message/INB2QVGXHQREO1",
                    showAdAttribution: true
                }
            }
        }, { quoted: fgg });

    } catch (e) {
        console.error("Alive Error:", e);
        reply(`An error occurred: ${e.message}`);
    }
});
