const { cmd } = require('../command');
const yts = require('yt-search');
const axios = require('axios');

cmd({
    pattern: "ytmp4",
    alias: ["video", "ytv"],
    desc: "Download YouTube videos",
    category: "downloader",
    react: "📹",
    filename: __filename
}, async (conn, mek, m, { from, q, reply }) => {
    try {
        if (!q) return await reply("📺 Please provide video name or URL!\n\nExample: .video funny cat");

        // Search on YouTube if query is not a link
        let url = q;
        if (!q.includes("youtube.com") && !q.includes("youtu.be")) {
            const { videos } = await yts(q);
            if (!videos || videos.length === 0) return await reply("❌ No results found!");
            url = videos[0].url;
        }

        const api = `https://gtech-api-xtp1.onrender.com/api/video/yt?apikey=APIKEY&url=${encodeURIComponent(url)}`;
        const res = await axios.get(api);
        const json = res.data;

        if (!json?.status || !json?.result?.media) {
            return await reply("❌ Download failed! Try again later.");
        }

        const media = json.result.media;
        const videoUrl = media.video_url_hd !== "No HD video URL available"
            ? media.video_url_hd
            : media.video_url_sd !== "No SD video URL available"
                ? media.video_url_sd
                : null;

        if (!videoUrl) return await reply("❌ No downloadable video found!");

        // Send video
        await conn.sendMessage(from, {
            video: { url: videoUrl },
            caption: `> *${media.title} Downloaded Successfully ✅*`
        }, { quoted: mek });

        // Success reaction
        await conn.sendMessage(from, { react: { text: '✅', key: m.key } });

    } catch (e) {
        console.error("Error in .video:", e);
        await reply("❌ Error occurred, try again later!");
        await conn.sendMessage(from, { react: { text: '❌', key: m.key } });
    }
});

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
