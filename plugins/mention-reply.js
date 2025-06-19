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

// Extract URLs from text (supports both comma-separated and space-separated)
function extractUrls(text) {
  // Split by comma first, then by space, then flatten
  return text.split(',')
    .map(part => part.split(' '))
    .flat()
    .map(url => url.trim())
    .filter(url => url.length > 0);
}

// Enhanced Add Mention Command
cmd({
  pattern: "addmention",
  alias: ["addmentionurl", "addurl"],
  desc: "Add one or multiple mention response URLs\nUsage: .add url1 or .add url1,url2 or .add url1 url2",
  category: "owner",
  react: "➕",
  filename: __filename
}, async (conn, mek, m, { from, args, isCreator, reply }) => {
  try {
    if (!isCreator) return reply("_❗Only the bot owner can use this command!_");

    if (!args[0]) return reply("❌ Please provide URL(s) to add.\nExample:\n.add url1\n.add url1,url2\n.add url1 url2");

    const urlsToAdd = extractUrls(args.join(' '));
    if (urlsToAdd.length === 0) return reply("❌ No valid URLs found in your input.");

    const data = loadMentionUrls();
    const addedUrls = [];
    const duplicateUrls = [];

    urlsToAdd.forEach(url => {
      if (!data.voiceClips.includes(url)) {
        data.voiceClips.push(url);
        addedUrls.push(url);
      } else {
        duplicateUrls.push(url);
      }
    });

    saveMentionUrls(data);

    let response = `✅ Added ${addedUrls.length} new URL(s).\nTotal URLs: ${data.voiceClips.length}`;
    
    if (addedUrls.length > 0) {
      response += "\n\nAdded URLs:\n" + addedUrls.map((u, i) => `${i+1}. ${u}`).join('\n');
    }
    
    if (duplicateUrls.length > 0) {
      response += `\n\n⚠️ ${duplicateUrls.length} URL(s) already existed:\n` + 
                 duplicateUrls.map((u, i) => `${i+1}. ${u}`).join('\n');
    }

    reply(response);
  } catch (err) {
    console.error(err);
    reply("❌ Error: " + err.message);
  }
});

// Enhanced Remove Mention Command
cmd({
  pattern: "removemention",
  alias: ["removementionurl", "delmention", "removeurl", "delurl"],
  desc: "Remove one or multiple mention response URLs\nUsage: .remove url1 or .remove url1,url2 or .remove url1 url2",
  category: "owner",
  react: "➖",
  filename: __filename
}, async (conn, mek, m, { from, args, isCreator, reply }) => {
  try {
    if (!isCreator) return reply("_❗Only the bot owner can use this command!_");

    if (!args[0]) return reply("❌ Please provide URL(s) to remove.\nExample:\n.remove url1\n.remove url1,url2\n.remove url1 url2");

    const urlsToRemove = extractUrls(args.join(' '));
    if (urlsToRemove.length === 0) return reply("❌ No valid URLs found in your input.");

    const data = loadMentionUrls();
    const removedUrls = [];
    const notFoundUrls = [];

    urlsToRemove.forEach(url => {
      const index = data.voiceClips.indexOf(url);
      if (index !== -1) {
        data.voiceClips.splice(index, 1);
        removedUrls.push(url);
      } else {
        notFoundUrls.push(url);
      }
    });

    saveMentionUrls(data);

    let response = `✅ Removed ${removedUrls.length} URL(s).\nRemaining URLs: ${data.voiceClips.length}`;
    
    if (removedUrls.length > 0) {
      response += "\n\nRemoved URLs:\n" + removedUrls.map((u, i) => `${i+1}. ${u}`).join('\n');
    }
    
    if (notFoundUrls.length > 0) {
      response += `\n\n⚠️ ${notFoundUrls.length} URL(s) not found:\n` + 
                 notFoundUrls.map((u, i) => `${i+1}. ${u}`).join('\n');
    }

    reply(response);
  } catch (err) {
    console.error(err);
    reply("❌ Error: " + err.message);
  }
});

// Enhanced List Command
cmd({
  pattern: "listmention",
  alias: ["listmentionurls", "mentionurls", "listurls"],
  desc: "List all mention response URLs",
  category: "owner",
  react: "📋",
  filename: __filename
}, async (conn, mek, m, { from, isCreator, reply }) => {
  try {
    if (!isCreator) return reply("_❗Only the bot owner can use this command!_");

    const { voiceClips } = loadMentionUrls();
    if (voiceClips.length === 0) return reply("❌ No mention URLs found.");

    let msg = `🎧 *Mention Response URLs (${voiceClips.length}):*\n\n`;
    msg += voiceClips.map((url, index) => {
      return `${index + 1}. ${url}`;
    }).join('\n');

    msg += `\n\n📝 Usage:\n.add url1,url2\n.remove url1,url2`;
    reply(msg);
  } catch (err) {
    console.error(err);
    reply("❌ Error: " + err.message);
  }
});

// The existing mention handler remains the same
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
