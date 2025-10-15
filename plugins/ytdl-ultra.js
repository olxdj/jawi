const { cmd } = require('../command');
const axios = require("axios");
const yts = require("yt-search");

cmd({
    pattern: "video",
    alias: ["ytv", "vid", "ytmp4"],
    desc: "Download YouTube videos using PrivateZia API",
    category: "downloader",
    react: "📽️",
    filename: __filename
}, async (conn, mek, m, { from, q, reply }) => {
    try {
        if (!q) {
            return await reply("🎬 Please provide a video name or link!\n\nExample: .video Faded Alan Walker");
        }

        // 1️⃣ Search on YouTube if not a direct link
        const isUrl = q.includes("youtube.com") || q.includes("youtu.be");
        let videoUrl = q;
        let vid = null;

        if (!isUrl) {
            const { videos } = await yts(q);
            if (!videos || videos.length === 0) return await reply("❌ No results found!");
            vid = videos[0];
            videoUrl = vid.url;
        }

        const api = `https://api.privatezia.biz.id/api/downloader/ytmp4?url=${encodeURIComponent(videoUrl)}`;

        // 2️⃣ Fetch video details from API
        const res = await axios.get(api);
        const json = res.data;

        if (!json?.status || !json?.result?.downloadUrl) {
            return await reply("❌ Failed to fetch video data. Please try again later.");
        }

        const result = json.result;

        // 3️⃣ Send video details (thumbnail + info)
        await conn.sendMessage(from, {
            image: { url: result.thumbnail || (vid ? vid.thumbnail : "") },
            caption: `🎬 *${result.title || (vid ? vid.title : "Unknown Title")}*\n\n` +
                     `📏 *Quality:* ${result.quality || "N/A"}\n` +
                     `⏱️ *Duration:* ${result.duration ? `${result.duration}s` : (vid ? vid.timestamp : "N/A")}\n` +
                     `👤 *Source:* YouTube\n\n📥 *Status:* Downloading...`
        }, { quoted: mek });

        // 4️⃣ Send the actual video
        await conn.sendMessage(from, {
            video: { url: result.downloadUrl },
            mimetype: "video/mp4",
            fileName: `${result.title || "video"}.mp4`,
            caption: `📥 *Downloaded By KHAN-MD*`
        }, { quoted: mek });

        // 5️⃣ React success ✅
        await conn.sendMessage(from, { react: { text: '✅', key: m.key } });

    } catch (e) {
        console.error("Error in .video:", e);
        await reply("❌ Error occurred while processing your request!");
        await conn.sendMessage(from, { react: { text: '❌', key: m.key } });
    }
});
