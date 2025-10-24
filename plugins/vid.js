const { cmd } = require('../command');
const axios = require('axios');
const yts = require('yt-search');

cmd({
    pattern: "video2",
    alias: ["playv", "ytv"],
    desc: "Download YouTube video with thumbnail (JawadTech API)",
    category: "downloader",
    react: "🎥",
    filename: __filename
}, async (conn, mek, m, { from, q, reply }) => {
    try {
        if (!q) return await reply("🎥 Please provide a video name or YouTube URL!\n\nExample: .video Teya Dora Dzanum\nExample: .video https://youtube.com/watch?v=dV_Dn9NbLhw");

        let videoUrl;
        let videoTitle;

        // Check if it's a URL or search query
        if (q.includes('youtube.com/watch?v=') || q.includes('youtu.be/')) {
            videoUrl = q;
            // Extract video ID and get title
            const videoId = q.includes('youtube.com/watch?v=') ? 
                q.split('v=')[1]?.split('&')[0] : 
                q.split('youtu.be/')[1]?.split('?')[0];
            
            if (videoId) {
                const { videos } = await yts({ videoId });
                if (videos && videos.length > 0) {
                    videoTitle = videos[0].title;
                }
            }
        } else {
            // Search for video
            const { videos } = await yts(q);
            if (!videos || videos.length === 0) return await reply("❌ No results found!");
            
            const vid = videos[0];
            videoUrl = vid.url;
            videoTitle = vid.title;
        }

        if (!videoUrl) return await reply("❌ Invalid YouTube URL or no results found!");

        // Download video in 360p quality
        const api = `https://jawad-tech.vercel.app/download/ytmp4?url=${encodeURIComponent(videoUrl)}&quality=360`;
        const res = await axios.get(api);
        const json = res.data;

        if (!json?.status || !json?.result) return await reply("❌ Download failed! Try again later.");

        // 🎥 Send video directly without externalAdReply
        await conn.sendMessage(from, {
            video: { url: json.result },
            mimetype: 'video/mp4',
            caption: `🎥 *${videoTitle || json.metadata.title}*\n\n> *© Pᴏᴡᴇʀᴇᴅ Bʏ KHAN-MD ♡*`
        }, { quoted: mek });

        await m.react('✅');

    } catch (e) {
        console.error("Error in .video/.playv:", e);
        await reply("❌ Error occurred, please try again later!");
        await conn.sendMessage(from, { react: { text: '❌', key: m.key } });
    }
});
