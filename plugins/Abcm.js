const config = require('../config');
const { cmd } = require('../command');
const yts = require('yt-search');
const axios = require('axios');

// Keith API configuration
const keithAPI = {
    baseURL: "https://apis-keith.vercel.app/download/video"
};

cmd({
    pattern: "movie",
    alias: ["film", "moviedl", "movievideo", "cinema"],
    react: "🎥",
    desc: "Download movies from YouTube",
    category: "download",
    use: ".movie <movie name or url>",
    filename: __filename
}, async (conn, m, mek, { from, q, reply }) => {
    try {
        if (!q) return await reply("❌ Which movie do you want to download?\nExample: .movie Inception full movie");

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
            // Search YouTube for the movie
            const searchQuery = q + " full movie";
            const { videos } = await yts(searchQuery);
            if (!videos || videos.length === 0) {
                await conn.sendMessage(from, { react: { text: '❌', key: m.key } });
                return await reply("❌ No movies found!");
            }
            videoUrl = videos[0].url;
            videoTitle = videos[0].title;
            videoThumbnail = videos[0].thumbnail;
        }

        // Send thumbnail immediately with movie info
        try {
            const ytId = (videoUrl.match(/(?:youtu\.be\/|v=)([a-zA-Z0-9_-]{11})/) || [])[1];
            const thumb = videoThumbnail || (ytId ? `https://i.ytimg.com/vi/${ytId}/sddefault.jpg` : undefined);
            const captionTitle = videoTitle || q;
            
            if (thumb) {
                await conn.sendMessage(from, {
                    image: { url: thumb },
                    caption: `*🎥 MOVIE DOWNLOADER*\n\n*Title:* ${captionTitle}\n*Status:* Downloading...\n\n${config.DESCRIPTION || "Powered by KHAN-MD"}`
                }, { quoted: mek });
            }
        } catch (e) { 
            console.error('[MOVIE] thumb error:', e?.message || e); 
        }

        // Get Keith API link for video
        const apiUrl = `${keithAPI.baseURL}?url=${encodeURIComponent(videoUrl)}`;
        
        const res = await axios.get(apiUrl, {
            timeout: 60000, // Longer timeout for movies
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            }
        });

        if (!res.data || !res.data.status || !res.data.result) {
            await conn.sendMessage(from, { react: { text: '❌', key: m.key } });
            return await reply("❌ Keith API failed to return a valid video link.");
        }

        const downloadUrl = res.data.result;
        const finalTitle = videoTitle || q || 'movie';

        // Send video as video (not document)
        await conn.sendMessage(from, {
            video: { url: downloadUrl },
            mimetype: 'video/mp4',
            caption: `*${finalTitle}*\n\n${config.DESCRIPTION || "Powered by KHAN-MD"}`
        }, { quoted: mek });

        // ✅ React - success
        await conn.sendMessage(from, { react: { text: '✅', key: m.key } });

    } catch (error) {
        console.error('[MOVIE] Command Error:', error?.message || error);
        // ❌ React - error
        await conn.sendMessage(from, { react: { text: '❌', key: m.key } });
        await reply("❌ Download failed: " + (error?.message || 'Unknown error'));
    }
});
