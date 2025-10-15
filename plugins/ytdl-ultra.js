const { cmd } = require('../command');
const axios = require("axios");
const yts = require("yt-search");

cmd({
    pattern: "video",
    alias: ["ytv", "vid", "ytmp4"],
    desc: "Download YouTube videos",
    category: "downloader",
    react: "📽️",
    filename: __filename
}, async (conn, mek, m, { from, q, reply }) => {
    try {
        if (!q) return await reply("🎬 Please provide a video name or YouTube link!\n\nExample: .video Alan Walker Faded");

        // 🔍 Check if user input is a direct YouTube link
        const isLink = q.includes("youtube.com") || q.includes("youtu.be");
        let videoUrl, vid;

        if (isLink) {
            // Direct link — no search
            videoUrl = q.trim();
            const { videos } = await yts(videoUrl);
            vid = videos[0] || { title: "YouTube Video", thumbnail: "https://i.imgur.com/8Y4M3zD.png" };
        } else {
            // Search YouTube for the first result
            const { videos } = await yts(q);
            if (!videos || videos.length === 0) return await reply("❌ No results found!");
            vid = videos[0];
            videoUrl = vid.url;
        }

        const api = `https://apis-keith.vercel.app/download/video?url=${encodeURIComponent(videoUrl)}`;

        // 🖼️ Send thumbnail & video info before download
        await conn.sendMessage(from, {
            image: { url: vid.thumbnail },
            caption: `🎬 *${vid.title}*\n\n👤 *Channel:* ${vid.author?.name || "Unknown"}\n👁️ *Views:* ${vid.views || "N/A"}\n⏱️ *Duration:* ${vid.timestamp || "Unknown"}\n📅 *Uploaded:* ${vid.ago || "N/A"}\n\n📥 *Status:* Downloading...`
        }, { quoted: mek });

        // 🌐 Fetch video link
        const res = await axios.get(api);
        const json = res.data;

        if (!json?.status || !json?.result) {
            await conn.sendMessage(from, { react: { text: '❌', key: m.key } });
            return await reply("❌ Failed to download video. Please try again later.");
        }

        const videoDownloadUrl = json.result;

        // 📽️ Send video directly
        await conn.sendMessage(from, {
            video: { url: videoDownloadUrl },
            mimetype: "video/mp4",
            fileName: `${vid.title}.mp4`,
            caption: `📥 *Downloaded By KHAN-MD*`
        }, { quoted: mek });

        // ✅ Success react
        await conn.sendMessage(from, { react: { text: '✅', key: m.key } });

    } catch (e) {
        console.error("Error in .video command:", e);
        await reply("❌ An unexpected error occurred while processing your request!");
        await conn.sendMessage(from, { react: { text: '❌', key: m.key } });
    }
});
