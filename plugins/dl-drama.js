// ✅ Coded by JawadTechX for KHAN MD

const { cmd } = require('../command');
const yts = require('yt-search');
const axios = require('axios');

cmd({
    pattern: "drama",
    alias: ["ep", "episode"],
    desc: "Download YouTube dramas as document",
    category: "download",
    react: "🎬",
    filename: __filename
}, async (conn, mek, m, { from, q, reply }) => {
    try {
        if (!q) return await reply("🎬 Please provide a drama name or URL!\n\nExample: `.drama Kabhi Main Kabhi Tum Episode 3`");

        let url = q;
        let videoInfo = null;
        
        // 🔍 Check if query is a URL or title
        if (q.startsWith('http://') || q.startsWith('https://')) {
            // It's a URL - use directly and fetch info
            if (!q.includes("youtube.com") && !q.includes("youtu.be")) {
                return await reply("❌ Please provide a valid YouTube URL!");
            }
            // Fetch video info for URL
            const searchFromUrl = await yts({ videoId: getVideoId(q) });
            videoInfo = searchFromUrl;
        } else {
            // It's a title - search for video
            const search = await yts(q);
            videoInfo = search.videos[0];
            if (!videoInfo) return await reply("❌ No drama results found!");
            url = videoInfo.url;
        }

        // Helper function to extract video ID from URL
        function getVideoId(url) {
            const match = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
            return match ? match[1] : null;
        }

        // 📸 Send thumbnail with title and downloading status
        if (videoInfo) {
            await conn.sendMessage(from, {
                image: { url: videoInfo.thumbnail },
                caption: `*🎬 DRAMA DOWNLOADER*\n\n${videoInfo.title}\n\n*Status:* Downloading...\n\n*© ᴘᴏᴡᴇʀᴇᴅ ʙʏ Jᴀᴡᴀᴅ TᴇᴄʜX*`
            }, { quoted: mek });
        }

        // 🎬 Fetch video from Hang-GTS API
        const apiUrl = `https://api.hanggts.xyz/download/ytdl?url=${encodeURIComponent(url)}`;
        
        await reply("🔄 Fetching download links from API...");
        
        const res = await axios.get(apiUrl);
        const data = res.data;

        if (!data?.status || !data?.result?.mp4) {
            return await reply("❌ Failed to fetch download link from API! Try again later.");
        }

        const vid = data.result;

        // 🧾 Send video as document
        await conn.sendMessage(from, {
            document: { url: vid.mp4 },
            fileName: `${vid.title}.mp4`,
            mimetype: 'video/mp4',
            caption: `*${vid.title}*\n\n*© ᴘᴏᴡᴇʀᴇᴅ ʙʏ Jᴀᴡᴀᴅ TᴇᴄʜX*`
        }, { quoted: mek });

        // ✅ React success
        await conn.sendMessage(from, { react: { text: '✅', key: m.key } });

    } catch (e) {
        console.error("❌ Error in .drama:", e);
        await reply("⚠️ Something went wrong! Try again later.");
        await conn.sendMessage(from, { react: { text: '❌', key: m.key } });
    }
});

