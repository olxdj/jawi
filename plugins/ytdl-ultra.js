const axios = require("axios");
const yts = require("yt-search");
const config = require("../config");

cmd({
    pattern: "video",
    alias: ["ytv", "ytmp4"],
    desc: "Download YouTube videos",
    category: "downloader",
    react: "📽️",
    filename: __filename
}, async (conn, mek, m, { from, q, reply }) => {
    try {
        if (!q) return await reply("🎬 Please provide video name or link!\n\nExample: .video Faded Alan Walker");

        // 1️⃣ Search YouTube
        const { videos } = await yts(q);
        if (!videos || videos.length === 0) return await reply("❌ No results found!");

        const vid = videos[0];
        const videoUrl = vid.url;
        const api = `https://apis-keith.vercel.app/download/video?url=${encodeURIComponent(videoUrl)}`;

        // 2️⃣ Send “Downloading” status message with video data + thumbnail
        await conn.sendMessage(from, {
            image: { url: vid.thumbnail },
            caption: `🎬 *${vid.title}*\n\n👤 *Channel:* ${vid.author.name}\n👁️ *Views:* ${vid.views}\n⏱️ *Duration:* ${vid.timestamp}\n📅 *Uploaded:* ${vid.ago}\n\n📥 *Status:* Downloading...`,
            footer: config.DESCRIPTION
        }, { quoted: mek });

        // 3️⃣ Fetch download link
        const res = await axios.get(api);
        const json = res.data;

        if (!json?.status || !json?.result) {
            return await reply("❌ Download failed! Try again later.");
        }

        const videoDownloadUrl = json.result;

        // 4️⃣ Send video
        await conn.sendMessage(from, {
            video: { url: videoDownloadUrl },
            mimetype: "video/mp4",
            fileName: `${vid.title}.mp4`,
            caption: `📥 *Downloaded By KHAN-MD*`
        }, { quoted: mek });

        // 5️⃣ React success ✅
        await conn.sendMessage(from, { react: { text: '✅', key: m.key } });

    } catch (e) {
        console.error("Error in .ytmp4:", e);
        await reply("❌ Error occurred while processing your request!");
        await conn.sendMessage(from, { react: { text: '❌', key: m.key } });
    }
});    
    
