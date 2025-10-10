const config = require('../config');
const { cmd } = require('../command');
const yts = require('yt-search');
const axios = require('axios');

// Hang API configuration
const hangAPI = {
    baseURL: "https://api.hanggts.xyz/download/ytdl"
};

cmd({
    pattern: "drama",
    alias: ["ep", "dramadl", "dramavideo"],
    react: "📺",
    desc: "Download drama episodes from YouTube",
    category: "download",
    use: ".drama <drama name or episode query or url>",
    filename: __filename
}, async (conn, m, mek, { from, q, reply }) => {
    try {
        if (!q) return await reply("❌ Which drama episode do you want to download?\nExample: .ep Sher Episode 3");

        // ⏳ React - processing
        await conn.sendMessage(from, { react: { text: '⏳', key: m.key } });

        let videoUrl = '';
        let videoTitle = '';
        let videoThumbnail = '';
        
        // Determine if input is a YouTube link
        if (q.startsWith('http://') || q.startsWith('https://')) {
            videoUrl = q;
            
            // Validate YouTube URL
            let urls = videoUrl.match(/(?:https?:\/\/)?(?:youtu\.be\/|(?:www\.|m\.)?youtube\.com\/(?:watch\?v=|v\/|embed\/|shorts\/|playlist\?list=)?)([a-zA-Z0-9_-]{11})/gi);
            if (!urls) {
                await conn.sendMessage(from, { react: { text: '❌', key: m.key } });
                return await reply("❌ This is not a valid YouTube link!");
            }
        } else {
            // Search YouTube for the drama episode
            const searchQuery = q + " drama episode";
            const { videos } = await yts(searchQuery);
            if (!videos || videos.length === 0) {
                await conn.sendMessage(from, { react: { text: '❌', key: m.key } });
                return await reply("❌ No drama episodes found!");
            }
            videoUrl = videos[0].url;
            videoTitle = videos[0].title;
            videoThumbnail = videos[0].thumbnail;
        }

        // Send thumbnail immediately with episode info
        try {
            const ytId = (videoUrl.match(/(?:youtu\.be\/|v=)([a-zA-Z0-9_-]{11})/) || [])[1];
            const thumb = videoThumbnail || (ytId ? `https://i.ytimg.com/vi/${ytId}/sddefault.jpg` : undefined);
            const captionTitle = videoTitle || q;
            
            if (thumb) {
                await conn.sendMessage(from, {
                    image: { url: thumb },
                    caption: `*🎬 DRAMA DOWNLOADER*\n\n*Title:* ${captionTitle}\n*Status:* Downloading...\n\n${config.DESCRIPTION || "Powered by KHAN-MD"}`
                }, { quoted: mek });
            }
        } catch (e) { 
            console.error('[DRAMA] thumb error:', e?.message || e); 
        }

        // Get Hang API link for video
        const apiUrl = `${hangAPI.baseURL}?url=${encodeURIComponent(videoUrl)}`;
        
        const res = await axios.get(apiUrl, {
            timeout: 30000,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            }
        });

        if (!res.data || !res.data.status || !res.data.result || !res.data.result.mp4) {
            await conn.sendMessage(from, { react: { text: '❌', key: m.key } });
            return await reply("❌ Hang API failed to return a valid video link.");
        }

        const videoData = res.data.result;
        const finalTitle = videoData.title || videoTitle || 'drama_episode';

        // Send video as document with detailed caption
        await conn.sendMessage(from, {
            document: { url: videoData.mp4 },
            mimetype: 'video/mp4',
            fileName: `${finalTitle.replace(/[^\w\s]/gi, '')}.mp4`,
            caption: `*${finalTitle}*\n\n${config.DESCRIPTION || "Powered by KHAN-MD"}`
        }, { quoted: mek });

        // ✅ React - success
        await conn.sendMessage(from, { react: { text: '✅', key: m.key } });

    } catch (error) {
        console.error('[DRAMA] Command Error:', error?.message || error);
        // ❌ React - error
        await conn.sendMessage(from, { react: { text: '❌', key: m.key } });
        await reply("❌ Download failed: " + (error?.message || 'Unknown error'));
    }
});
