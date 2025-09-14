const { cmd } = require('../command');
const yts = require('yt-search');
const axios = require('axios');

cmd({
    pattern: "play",
    desc: "Download YouTube song",
    category: "downloader",
    react: "🎶",
    filename: __filename
}, async (conn, mek, m, { from, q, reply }) => {
    try {
        if (!q) return reply("🎶 Please provide song name!");

        // 1. Notify downloading
        reply("⏳ Please wait downloading ...");

        // 2. Search on YouTube
        const { videos } = await yts(q);
        if (!videos || videos.length === 0) return reply("❌ No results found!");

        const vid = videos[0];
        const api = `https://apis-keith.vercel.app/download/dlmp3?url=${encodeURIComponent(vid.url)}`;
        const res = await axios.get(api);
        const json = res.data;

        if (!json?.result?.downloadUrl) return reply("❌ Download failed!");

        // 3. Send audio
        await conn.sendMessage(from, {
            audio: { url: json.result.downloadUrl },
            mimetype: "audio/mpeg",
            fileName: `${json.result.title || "song"}.mp3`
        }, { quoted: mek });

        // 4. Success reaction ✅
        await conn.sendMessage(from, { react: { text: '✅', key: m.key } });

    } catch (e) {
        console.error("Error in .play:", e);
        reply("❌ Error occurred, try again later!");
        await conn.sendMessage(from, { react: { text: '❌', key: m.key } });
    }
});
