// Coded by JawadTechX for KHAN-MD

const config = require('../config');
const { cmd } = require('../command');
const yts = require('yt-search');
const axios = require('axios');

cmd({
    pattern: "video",
    alias: ["ytv", "vid", "ytvideo"],
    react: "📽️",
    desc: "Download YouTube videos (360p) using NekoLabs API.",
    category: "download",
    filename: __filename
}, async (conn, m, text) => {
    try {
        if (!text) {
            return await conn.sendMessage(m.chat, { 
                text: `📺 *Usage:* ${config.PREFIX}video <song name or YouTube link>` 
            }, { quoted: m });
        }

        await conn.sendMessage(m.chat, { text: `🔍 Searching for "${text}" on YouTube...` }, { quoted: m });

        // 🔎 Search or use direct link
        let videoUrl;
        if (text.includes("youtube.com") || text.includes("youtu.be")) {
            videoUrl = text;
        } else {
            const search = await yts(text);
            if (!search.videos.length) {
                return await conn.sendMessage(m.chat, { text: "❌ No video found." }, { quoted: m });
            }
            videoUrl = search.videos[0].url;
        }

        // 🧩 Fetch from NekoLabs API
        const api = `https://api.nekolabs.my.id/downloader/youtube/v1?url=${encodeURIComponent(videoUrl)}&format=360`;
        const res = await axios.get(api);

        if (!res.data.success || !res.data.result?.downloadUrl) {
            return await conn.sendMessage(m.chat, { text: "❌ Failed to fetch video data. Try again later." }, { quoted: m });
        }

        const { title, downloadUrl } = res.data.result;

        // 📤 Send the video
        await conn.sendMessage(m.chat, {
            video: { url: downloadUrl },
            caption: `🎬 *${title}*\n\n🚀 Powered By *JawadTechX*`
        }, { quoted: m });

    } catch (e) {
        console.error(e);
        await conn.sendMessage(m.chat, { text: "⚠️ Error: Something went wrong while processing your request." }, { quoted: m });
    }
});
