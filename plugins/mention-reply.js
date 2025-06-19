const fs = require("fs");
const path = require("path");
const { cmd } = require("../command");
const axios = require("axios");
const config = require("../config");

// Helper function to load mention URLs
function loadMentionUrls() {
  try {
    const filePath = path.join(__dirname, "../assets/mention_urls.json");
    if (!fs.existsSync(filePath)) {
      // Create default file if it doesn't exist
      const defaultUrls = {
        voiceClips: [
          "https://cdn.ironman.my.id/i/7p5plg.mp4",
          "https://cdn.ironman.my.id/i/l4dyvg.mp4",
          "https://cdn.ironman.my.id/i/4z93dg.mp4"
        ]
      };
      fs.writeFileSync(filePath, JSON.stringify(defaultUrls, null, 2));
      return defaultUrls;
    }
    return JSON.parse(fs.readFileSync(filePath, "utf-8"));
  } catch (e) {
    console.error("Error loading mention URLs:", e);
    return { voiceClips: [] };
  }
}

// Helper function to save mention URLs
function saveMentionUrls(data) {
  try {
    const filePath = path.join(__dirname, "../assets/mention_urls.json");
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    return true;
  } catch (e) {
    console.error("Error saving mention URLs:", e);
    return false;
  }
}

// Mention handler
cmd({
  on: "body"
}, async (conn, m, { isGroup }) => {
  try {
    if (config.MENTION_REPLY !== "true" || !isGroup) return;
    if (!m.mentionedJid || m.mentionedJid.length === 0) return;

    const { voiceClips } = loadMentionUrls();
    if (voiceClips.length === 0) return;

    const randomClip = voiceClips[Math.floor(Math.random() * voiceClips.length)];
    const botNumber = conn.user.id.split(":")[0] + "@s.whatsapp.net";

    if (m.mentionedJid.includes(botNumber)) {
      const thumbnailRes = await axios.get(config.MENU_IMAGE_URL || "https://files.catbox.moe/c836ws.png", {
        responseType: "arraybuffer"
      });
      const thumbnailBuffer = Buffer.from(thumbnailRes.data, "binary");

      await conn.sendMessage(m.chat, {
        audio: { url: randomClip },
        mimetype: "audio/mp4",
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

// Command to add new mention URL
cmd({
  pattern: "addmention",
  alias: ["addmentionurl"],
  desc: "Add a new mention response URL",
  category: "owner",
  react: "➕",
  filename: __filename
}, async (conn, mek, m, { from, args, isCreator, reply }) => {
  try {
    if (!isCreator) return reply("_❗Only the bot owner can use this command!_");

    const url = args[0];
    if (!url) return reply("❌ Please provide a URL to add.");

    const data = loadMentionUrls();
    if (data.voiceClips.includes(url)) {
      return reply("❌ This URL is already in the list.");
    }

    data.voiceClips.push(url);
    saveMentionUrls(data);

    reply(`✅ URL added successfully!\nTotal URLs: ${data.voiceClips.length}`);
  } catch (err) {
    console.error(err);
    reply("❌ Error: " + err.message);
  }
});

// Command to remove mention URL
cmd({
  pattern: "removemention",
  alias: ["removementionurl", "delmention"],
  desc: "Remove a mention response URL",
  category: "owner",
  react: "➖",
  filename: __filename
}, async (conn, mek, m, { from, args, isCreator, reply }) => {
  try {
    if (!isCreator) return reply("_❗Only the bot owner can use this command!_");

    const url = args[0];
    if (!url) return reply("❌ Please provide a URL to remove.");

    const data = loadMentionUrls();
    if (!data.voiceClips.includes(url)) {
      return reply("❌ This URL is not in the list.");
    }

    data.voiceClips = data.voiceClips.filter(u => u !== url);
    saveMentionUrls(data);

    reply(`✅ URL removed successfully!\nRemaining URLs: ${data.voiceClips.length}`);
  } catch (err) {
    console.error(err);
    reply("❌ Error: " + err.message);
  }
});

// Command to list all mention URLs
cmd({
  pattern: "listmention",
  alias: ["listmentionurls", "mentionurls"],
  desc: "List all mention response URLs",
  category: "owner",
  react: "📋",
  filename: __filename
}, async (conn, mek, m, { from, isCreator, reply }) => {
  try {
    if (!isCreator) return reply("_❗Only the bot owner can use this command!_");

    const { voiceClips } = loadMentionUrls();
    if (voiceClips.length === 0) return reply("❌ No mention URLs found.");

    let msg = "🎧 *Mention Response URLs:*\n\n";
    voiceClips.forEach((url, index) => {
      msg += `${index + 1}. ${url}\n`;
    });

    reply(msg);
  } catch (err) {
    console.error(err);
    reply("❌ Error: " + err.message);
  }
});

// Command to reset mention URLs to default
cmd({
  pattern: "resetmention",
  alias: ["resetmentionurls"],
  desc: "Reset mention URLs to default",
  category: "owner",
  react: "🔄",
  filename: __filename
}, async (conn, mek, m, { from, isCreator, reply }) => {
  try {
    if (!isCreator) return reply("_❗Only the bot owner can use this command!_");

    const defaultUrls = {
      voiceClips: [
        "https://cdn.ironman.my.id/i/7p5plg.mp4",
        "https://cdn.ironman.my.id/i/l4dyvg.mp4",
        "https://cdn.ironman.my.id/i/4z93dg.mp4"
      ]
    };

    saveMentionUrls(defaultUrls);
    reply("✅ Mention URLs reset to default!");
  } catch (err) {
    console.error(err);
    reply("❌ Error: " + err.message);
  }
});
