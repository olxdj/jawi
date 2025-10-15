const { cmd } = require('../command');
const axios = require("axios");
const yts = require("yt-search");

cmd({
    pattern: "video",
    alias: ["ytv", "vid", "ytmp4"],
    desc: "Download YouTube videos using ZenzzXD API",
    category: "downloader",
    react: "📽️",
    filename: __filename
}, async (conn, mek, m, { from, q, reply }) => {
    try {
        if (!q) return await reply("🎬 Please provide a video name or link!\n\nExample: .video Faded Alan Walker");

        // 1️⃣ Search YouTube for the video
        const { videos } = await yts(q);
        if (!videos || videos.length === 0) return await reply("❌ No results found!");

        const vid = videos[0];
        const videoUrl = vid.url;
        const api = `https://api.zenzxz.my.id/api/downloader/ytmp4v2?url=${encodeURIComponent(videoUrl)}&resolution=360`;

        // 2️⃣ Send video info before downloading
        await conn.sendMessage(from, {
            image: { url: vid.thumbnail },
            caption: `🎬 *${vid.title}*\n\n👤 *Channel:* ${vid.author.name}\n👁️ *Views:* ${vid.views}\n⏱️ *Duration:* ${vid.timestamp}\n📅 *Uploaded:* ${vid.ago}\n\n📥 *Status:* Fetching download link...`
        }, { quoted: mek });

        // 3️⃣ Fetch download link from API
        const res = await axios.get(api);
        const json = res.data;

        if (!json?.success || !json?.data?.download_url) {
            return await reply("❌ Failed to fetch video link! Try again later.");
        }

        const videoData = json.data;

        // 4️⃣ Send the video
        await conn.sendMessage(from, {
            video: { url: videoData.download_url },
            mimetype: "video/mp4",
            fileName: `${videoData.title || vid.title}.mp4`,
            caption: `🎬 *${videoData.title || vid.title}*\n📺 *Quality:* ${videoData.format}\n💾 *Downloaded By KHAN-MD*`
        }, { quoted: mek });

        // 5️⃣ React ✅
        await conn.sendMessage(from, { react: { text: '✅', key: m.key } });

    } catch (e) {
        console.error("Error in .video:", e);
        await reply("❌ Error occurred while processing your request!");
        await conn.sendMessage(from, { react: { text: '❌', key: m.key } });
    }
});
