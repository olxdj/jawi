// ✅ Coded by JawadTechX for KHAN MD

const { cmd } = require('../command');
const yts = require('yt-search');
const axios = require('axios');

cmd({
    pattern: "ytmp4",
    alias: ["video", "song", "ytv"],
    desc: "Download YouTube videos",
    category: "download",
    react: "📹",
    filename: __filename
}, async (conn, mek, m, { from, q, reply }) => {
    try {
        if (!q) return await reply("🎥 Please provide a YouTube video name or URL!\n\nExample: `.video alone marshmello`");

        // 🔍 Search video if query isn't a YouTube URL
        let url = q;
        if (!q.includes("youtube.com") && !q.includes("youtu.be")) {
            const search = await yts(q);
            const video = search.videos[0];
            if (!video) return await reply("❌ No video results found!");
            url = video.url;
        }

        // 🎬 Fetch video from API
        const api = `https://api.xyro.site/download/youtubemp4?url=${encodeURIComponent(url)}&quality=360`;
        const res = await axios.get(api);
        const data = res.data;

        if (!data?.status || !data?.result?.download) {
            return await reply("❌ Failed to fetch download link! Try again later.");
        }

        const vid = data.result;

        // 🧾 Send video
        await conn.sendMessage(from, {
            video: { url: vid.download },
            caption: `🎬 *${vid.title}*\n📥 *Quality:* ${vid.quality}p\n🕒 *Duration:* ${vid.duration}s\n\n> Powered by *JawadTechX ⚡*`
        }, { quoted: mek });

        // ✅ React success
        await conn.sendMessage(from, { react: { text: '✅', key: m.key } });

    } catch (e) {
        console.error("❌ Error in .ytmp4:", e);
        await reply("⚠️ Something went wrong! Try again later.");
        await conn.sendMessage(from, { react: { text: '❌', key: m.key } });
    }
});
