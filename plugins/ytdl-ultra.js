const { cmd } = require('../command');
const yts = require('yt-search');
const axios = require('axios');

cmd({
    pattern: "ytmp4",
    alias: ["video", "song", "ytv"],
    desc: "Download YouTube videos in MP4",
    category: "downloader",
    react: "🎬",
    filename: __filename
}, async (conn, mek, m, { from, q, reply }) => {
    try {
        if (!q) return await reply("🎬 Please provide video name or link!\n\nExample: .ytmp4 Moye Moye");

        // ⏳ Processing reaction
        await conn.sendMessage(from, { react: { text: '⏳', key: m.key } });

        let vid;
        if (q.includes("youtube.com") || q.includes("youtu.be")) {
            // If direct link is given
            vid = { url: q, title: "YouTube Video" };
        } else {
            // Search YouTube
            const { videos } = await yts(q);
            if (!videos || videos.length === 0) return await reply("❌ No results found!");
            vid = videos[0];
        }

        const api = `https://apis-keith.vercel.app/download/video?url=${encodeURIComponent(vid.url)}`;
        const res = await axios.get(api);
        const json = res.data;

        // Check if the API response is valid and has a result
        if (!json || json.status === false || !json.result) {
            return await reply("❌ Video download failed! Try again later.");
        }

        const videoUrl = json.result;
        const title = vid.title || "video";

        // 🎬 Send video
        await conn.sendMessage(from, {
            video: { url: videoUrl },
            mimetype: "video/mp4",
            fileName: `${title.replace(/[^\w\s]/gi, '')}.mp4`, // Remove special characters from filename
            caption: `*${title}*\n\n> Powered By Jawad TechX 🖤`
        }, { quoted: mek });

        // ✅ Success reaction
        await conn.sendMessage(from, { react: { text: '✅', key: m.key } });

    } catch (e) {
        console.error("Error in .ytmp4:", e);
        await reply("❌ Error occurred, try again later!");
        await conn.sendMessage(from, { react: { text: '❌', key: m.key } });
    }
});

// Play command remains unchanged as requested
cmd({
    pattern: "play",
    alias: ["ytmp3", "yta"],
    desc: "Download YouTube songs",
    category: "downloader",
    react: "🎵",
    filename: __filename
}, async (conn, mek, m, { from, q, reply }) => {
    try {
        if (!q) return await reply("🎶 Please provide song name!\n\nExample: .play Moye Moye");

        // 1. Notify downloading
        // await reply("⏳ Downloading Please Wait...");

        // 2. Search on YouTube
        const { videos } = await yts(q);
        if (!videos || videos.length === 0) return await reply("❌ No results found!");

        const vid = videos[0];
        const api = `https://apis-keith.vercel.app/download/dlmp3?url=${encodeURIComponent(vid.url)}`;
        const res = await axios.get(api);
        const json = res.data;

        if (!json?.status || !json?.result?.data?.downloadUrl) {
            return await reply("❌ Download failed! Try again later.");
        }

        const audioUrl = json.result.data.downloadUrl;
        const title = json.result.data.title || "song";

        // 3. Send audio
        await conn.sendMessage(from, {
            audio: { url: audioUrl },
            mimetype: "audio/mpeg",
            fileName: `${title}.mp3`
        }, { quoted: mek });

        // 4. Success reaction ✅
        await conn.sendMessage(from, { react: { text: '✅', key: m.key } });

    } catch (e) {
        console.error("Error in .play:", e);
        await reply("❌ Error occurred, try again later!");
        await conn.sendMessage(from, { react: { text: '❌', key: m.key } });
    }
});
