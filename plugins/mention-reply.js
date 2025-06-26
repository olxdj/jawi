const fs = require("fs");
const path = require("path");
const { cmd } = require("../command");
const axios = require('axios');
const config = require('../config');

const AUDIO_PATH = path.join(__dirname, "../assets/mention.json");

// Main mention handler
cmd({
  on: "body"
}, async (conn, m, { isGroup }) => {
  try {
    if (config.MENTION_REPLY !== 'true' || !isGroup) return;
    if (!m.mentionedJid || m.mentionedJid.length === 0) return;

    // Read clips from JSON file
    let voiceClips = [];
    if (fs.existsSync(AUDIO_PATH)) {
      voiceClips = JSON.parse(fs.readFileSync(AUDIO_PATH, "utf-8"));
    }

    if (voiceClips.length === 0) return;

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
            mediaUrl: "https://files.catbox.moe/l2t3e0.jpg",
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

// Command: Add voice clip URL(s)
cmd({
    pattern: "addurl",
    alias: ["addmention", "addvoice"],
    desc: "Add one or multiple voice clip URLs (comma separated)",
    category: "owner",
    react: "🎵",
    filename: __filename
}, async (conn, mek, m, { from, q, isCreator, reply }) => {
    try {
        if (!isCreator) return reply("_❗This Command Can Only Be Used By My Owner!_");

        if (!q) return reply("❌ Please provide URL(s). Example:\n.addurl url1\n.addurl url1,url2,url3");

        let clips = fs.existsSync(AUDIO_PATH) 
            ? JSON.parse(fs.readFileSync(AUDIO_PATH, "utf-8"))
            : [];
            
        const urls = q.split(',').map(url => url.trim()).filter(url => url);
        
        if (urls.length === 0) return reply("❌ No valid URLs provided");

        let added = 0;
        let duplicates = 0;

        urls.forEach(url => {
            if (!clips.includes(url)) {
                clips.push(url);
                added++;
            } else {
                duplicates++;
            }
        });

        fs.writeFileSync(AUDIO_PATH, JSON.stringify(clips, null, 2));

        let msg = `✅ Added ${added} new URL(s)`;
        if (duplicates > 0) msg += `\n⚠️ ${duplicates} duplicate URL(s) skipped`;
        reply(msg);
    } catch (err) {
        console.error(err);
        reply("❌ Error: " + err.message);
    }
});

// Command: Remove voice clip URL(s)
cmd({
    pattern: "delurl",
    alias: ["delmention", "delvoice"],
    desc: "Remove one or multiple voice clip URLs (comma separated)",
    category: "owner",
    react: "🗑️",
    filename: __filename
}, async (conn, mek, m, { from, q, isCreator, reply }) => {
    try {
        if (!isCreator) return reply("_❗This Command Can Only Be Used By My Owner!_");

        if (!q) return reply("❌ Please provide URL(s). Example:\n.delurl url1\n.delurl url1,url2,url3");

        let clips = fs.existsSync(AUDIO_PATH) 
            ? JSON.parse(fs.readFileSync(AUDIO_PATH, "utf-8"))
            : [];
            
        const urls = q.split(',').map(url => url.trim()).filter(url => url);
        
        if (urls.length === 0) return reply("❌ No valid URLs provided");

        const originalCount = clips.length;
        clips = clips.filter(url => !urls.includes(url));
        const removed = originalCount - clips.length;

        fs.writeFileSync(AUDIO_PATH, JSON.stringify(clips, null, 2));

        if (removed === 0) {
            reply("❌ None of the provided URLs were found in the list");
        } else {
            reply(`✅ Removed ${removed} URL(s)`);
            if (removed < urls.length) {
                reply(`⚠️ ${urls.length - removed} URL(s) not found`);
            }
        }
    } catch (err) {
        console.error(err);
        reply("❌ Error: " + err.message);
    }
});

// Command: List all voice clip URLs
cmd({
    pattern: "listurl",
    alias: ["listmention", "listvoice"],
    desc: "List all voice clip URLs",
    category: "owner",
    react: "📋",
    filename: __filename
}, async (conn, mek, m, { from, isCreator, reply }) => {
    try {
        if (!isCreator) return reply("_❗This Command Can Only Be Used By My Owner!_");

        const clips = fs.existsSync(AUDIO_PATH) 
            ? JSON.parse(fs.readFileSync(AUDIO_PATH, "utf-8"))
            : [];

        if (clips.length === 0) {
            return reply("❌ No voice clips found.");
        }

        let listMessage = `🎵 Voice Clips (${clips.length}):\n\n`;
        clips.forEach((url, i) => {
            listMessage += `${i + 1}. ${url}\n`;
        });

        reply(listMessage);
    } catch (err) {
        console.error(err);
        reply("❌ Error: " + err.message);
    }
});

cmd({
    pattern: "men",
    alias: ["xeoni", "me"],
    desc: "Send a random voice clip from mention list",
    category: "fun",
    react: "🎵",
    filename: __filename
}, async (conn, mek, m, { from, reply }) => {
    try {
        // Read clips from JSON file
        let voiceClips = [];
        if (fs.existsSync(AUDIO_PATH)) {
            voiceClips = JSON.parse(fs.readFileSync(AUDIO_PATH, "utf-8"));
        }

        if (voiceClips.length === 0) {
            return reply("❌ No voice clips found in the database.");
        }

        const randomClip = voiceClips[Math.floor(Math.random() * voiceClips.length)];
        
        // Get thumbnail for audio message
        const thumbnailRes = await axios.get(config.MENU_IMAGE_URL || "https://files.catbox.moe/c836ws.png", {
            responseType: 'arraybuffer'
        });
        const thumbnailBuffer = Buffer.from(thumbnailRes.data, 'binary');

        // Send the audio message
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
                    mediaUrl: "https://files.catbox.moe/l2t3e0.jpg",
                    sourceUrl: "https://wa.me/message/INB2QVGXHQREO1",
                    showAdAttribution: true
                }
            }
        }, { quoted: m });

    } catch (e) {
        console.error("Error in men command:", e);
        reply("❌ An error occurred while processing the audio.");
    }
});
