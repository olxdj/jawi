// ✅ Coded by JawadTechX for KHAN MD

const { cmd } = require('../command');
const yts = require('yt-search');
const axios = require('axios');

cmd({
    pattern: "drama",
    alias: ["ep", "episode"],
    desc: "Download YouTube videos as document",
    category: "download",
    react: "📹",
    filename: __filename
}, async (conn, mek, m, { from, q, reply }) => {
    try {
        if (!q) return await reply("🎥 Please provide a YouTube video name or URL!\n\nExample: `.drama kdrama ep1`");

        let url = q;
        let videoInfo = null;

        // 🔍 Check if input is URL or search term
        if (q.startsWith('http://') || q.startsWith('https://')) {
            if (!q.includes("youtube.com") && !q.includes("youtu.be")) {
                return await reply("❌ Please provide a valid YouTube URL!");
            }
            const videoId = getVideoId(q);
            if (!videoId) return await reply("❌ Invalid YouTube URL!");
            const searchFromUrl = await yts({ videoId });
            videoInfo = searchFromUrl;
        } else {
            const search = await yts(q);
            videoInfo = search.videos[0];
            if (!videoInfo) return await reply("❌ No video results found!");
            url = videoInfo.url;
        }

        // 🎯 Extract YouTube video ID
        function getVideoId(url) {
            const match = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
            return match ? match[1] : null;
        }

        // 🖼️ Send preview
        await conn.sendMessage(from, {
            image: { url: videoInfo.thumbnail },
            caption: `*🎬 DRAMA DOWNLOADER*\n\n🎞️ *Title:* ${videoInfo.title}\n📺 *Channel:* ${videoInfo.author.name}\n🕒 *Duration:* ${videoInfo.timestamp}\n\n*Status:* Downloading...\n\n*© ᴘᴏᴡᴇʀᴇᴅ ʙʏ Jᴀᴡᴀᴅ TᴇᴄʜX*`
        }, { quoted: mek });

        // ⚙️ Fetch from JawadTech API
        const apiUrl = `https://jawad-tech.vercel.app/download/ytmp4?url=${encodeURIComponent(url)}`;
        const { data } = await axios.get(apiUrl);

        if (!data?.status || !data?.result) {
            return await reply("❌ Failed to fetch download link! Please try again later.");
        }

        const videoLink = data.result;

        // 📦 Send as document (.mp4)
        await conn.sendMessage(from, {
            document: { url: videoLink },
            fileName: `${videoInfo.title}.mp4`,
            mimetype: 'video/mp4',
            caption: `🎬 *${videoInfo.title}*\n\n*© ᴘᴏᴡᴇʀᴇᴅ ʙʏ Jᴀᴡᴀᴅ TᴇᴄʜX*`
        }, { quoted: mek });

        // ✅ React success
        await conn.sendMessage(from, { react: { text: '✅', key: m.key } });

    } catch (e) {
        console.error("❌ Error in .drama command:", e);
        await reply("⚠️ Something went wrong! Try again later.");
        await conn.sendMessage(from, { react: { text: '❌', key: m.key } });
    }
});
