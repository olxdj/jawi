const axios = require("axios");
const { cmd } = require("../command");

// TikTok Downloader v3
cmd({
  pattern: "tt3",
  alias: ["tiktok3", "ttdl3"],
  react: '📥',
  desc: "Download videos from TikTok (API v3)",
  category: "download",
  use: ".tt3 <TikTok video URL>",
  filename: __filename
}, async (conn, mek, m, { from, reply, args }) => {
  try {
    const ttUrl = args[0];
    if (!ttUrl || !ttUrl.includes("tiktok.com")) {
      return reply('❌ Please provide a valid TikTok video URL.\n\nExample:\n.tt3 https://vt.tiktok.com/...');
    }

    await conn.sendMessage(from, { react: { text: '⏳', key: m.key } });

    const apiUrl = `https://jawad-tech.vercel.app/downloader?url=${encodeURIComponent(ttUrl)}`;
    const response = await axios.get(apiUrl);

    const data = response.data;
    const metadata = data.metadata || {};
    const author = metadata.author || {};

    if (!data.status || !Array.isArray(data.result) || data.result.length === 0) {
      return reply(`❌ Video not found or unavailable.\n\n👤 Author: ${author.nickname || "Unknown"}`);
    }

    const videoUrl = data.result[0];

    await reply(`Downloading TikTok video...`);

    await conn.sendMessage(from, {
      video: { url: videoUrl },
      caption: `🎬 *TikTok Downloader*\n👤 *User:* @${author.uniqueId || "unknown"}\n🆔 *ID:* ${author.id || "n/a"}\n\n> Powered By JawadTechX 💜`
    }, { quoted: mek });

    await conn.sendMessage(from, { react: { text: '✅', key: m.key } });
  } catch (error) {
    console.error('TT3 Error:', error);
    reply('❌ Failed to download the TikTok video. Please try again later.');
    await conn.sendMessage(from, { react: { text: '❌', key: m.key } });
  }
});

cmd({
    pattern: "tiktok",
    alias: ["ttdl", "tt", "tiktokdl"],
    desc: "Download TikTok video without watermark",
    category: "downloader",
    react: "🎵",
    filename: __filename
},
async (conn, mek, m, { from, args, q, reply }) => {
    try {
        if (!q) return reply("Please provide a TikTok video link.");
        if (!q.includes("tiktok.com")) return reply("Invalid TikTok link.");
        
        reply("Downloading video, please wait...");
        
        const apiUrl = `https://delirius-apiofc.vercel.app/download/tiktok?url=${q}`;
        const { data } = await axios.get(apiUrl);
        
        if (!data.status || !data.data) return reply("Failed to fetch TikTok video.");
        
        const { title, like, comment, share, author, meta } = data.data;
        const videoUrl = meta.media.find(v => v.type === "video").org;
        
        const caption = `🎵 *TikTok Video* 🎵\n\n` +
                        `👤 *User:* ${author.nickname} (@${author.username})\n` +
                        `📖 *Title:* ${title}\n` +
                        `👍 *Likes:* ${like}\n💬 *Comments:* ${comment}\n🔁 *Shares:* ${share}`;
        
        await conn.sendMessage(from, {
            video: { url: videoUrl },
            caption: caption,
            contextInfo: { mentionedJid: [m.sender] }
        }, { quoted: mek });
        
    } catch (e) {
        console.error("Error in TikTok downloader command:", e);
        reply(`An error occurred: ${e.message}`);
    }
});

cmd({
    pattern: "tt2",
    alias: ["ttdl2", "ttv2", "tiktok2"],
    desc: "Download TikTok video without watermark",
    category: "downloader",
    react: "⬇️",
    filename: __filename
}, async (conn, mek, m, { from, reply, args, q }) => {
    try {
        // Validate input
        const url = q || m.quoted?.text;
        if (!url || !url.includes("tiktok.com")) {
            return reply("❌ Please provide/reply to a TikTok link");
        }

        // Show processing reaction
        await conn.sendMessage(from, { react: { text: '⏳', key: m.key } });

        // Fetch video from BK9 API
        const { data } = await axios.get(`https://bk9.fun/download/tiktok2?url=${encodeURIComponent(url)}`);
        
        if (!data?.status || !data.BK9?.video?.noWatermark) {
            throw new Error("No video found in API response");
        }

        // Send video with minimal caption
        await conn.sendMessage(from, {
            video: { url: data.BK9.video.noWatermark },
            caption: `- *Powered By JawadTechX 💜*`
        }, { quoted: mek });

        // Success reaction
        await conn.sendMessage(from, { react: { text: '✅', key: m.key } });

    } catch (error) {
        console.error('TT2 Error:', error);
        reply("❌ Download failed. Invalid link or API error");
        await conn.sendMessage(from, { react: { text: '❌', key: m.key } });
    }
});
                
