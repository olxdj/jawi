const config = require('../config');
const { cmd } = require('../command');
const yts = require('yt-search');
const axios = require('axios');

// New API configuration
const newAPI = {
    baseURL: "https://api.privatezia.biz.id"
};

// Old Izumi API configuration
const izumi = {
    baseURL: "https://izumiiiiiiii.dpdns.org"
};

// New video command with new API
cmd({
    pattern: "video",
    alias: ["ytmp4", "ytv", "mp4"],
    react: "🎥",
    desc: "Download video from YouTube (New API)",
    category: "download",
    use: ".video <query or url>",
    filename: __filename
}, async (conn, m, mek, { from, q, reply }) => {
    try {
        if (!q) return await reply("❌ What video do you want to download?");

        let videoUrl = '';
        let videoTitle = '';
        let videoThumbnail = '';
        
        // Determine if input is a YouTube link
        if (q.startsWith('http://') || q.startsWith('https://')) {
            videoUrl = q;
        } else {
            // Search YouTube for the video
            const { videos } = await yts(q);
            if (!videos || videos.length === 0) {
                return await reply("❌ No videos found!");
            }
            videoUrl = videos[0].url;
            videoTitle = videos[0].title;
            videoThumbnail = videos[0].thumbnail;
        }

        // Validate YouTube URL
        let urls = videoUrl.match(/(?:https?:\/\/)?(?:youtu\.be\/|(?:www\.|m\.)?youtube\.com\/(?:watch\?v=|v\/|embed\/|shorts\/|playlist\?list=)?)([a-zA-Z0-9_-]{11})/gi);
        if (!urls) {
            return await reply("❌ This is not a valid YouTube link!");
        }

        // Send thumbnail immediately
        try {
            const ytId = (videoUrl.match(/(?:youtu\.be\/|v=)([a-zA-Z0-9_-]{11})/) || [])[1];
            const thumb = videoThumbnail || (ytId ? `https://i.ytimg.com/vi/${ytId}/sddefault.jpg` : undefined);
            const captionTitle = videoTitle || q;
            if (thumb) {
                await conn.sendMessage(from, {
                    image: { url: thumb },
                    caption: `*${captionTitle}*\n📥 Downloading video...`
                }, { quoted: mek });
            }
        } catch (e) { 
            console.error('[VIDEO] thumb error:', e?.message || e); 
        }

        // Get video from new API
        const apiUrl = `${newAPI.baseURL}/api/downloader/ytmp4?url=${encodeURIComponent(videoUrl)}`;
        
        const res = await axios.get(apiUrl, {
            timeout: 30000,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'accept': '*/*'
            }
        });

        if (!res.data || !res.data.status || !res.data.result || !res.data.result.downloadUrl) {
            return await reply("❌ New API failed to return a valid video link.");
        }

        const videoData = res.data.result;

        // Send video directly using the download URL
        await conn.sendMessage(from, {
            video: { url: videoData.downloadUrl },
            mimetype: 'video/mp4',
            fileName: `${(videoData.title || videoTitle || 'video').replace(/[^\w\s]/gi, '')}.mp4`,
            caption: `*${videoData.title || videoTitle || 'Video'}* Downloaded ✅\n\n> *_POWERED BY KHAN-MD_*`
        }, { quoted: mek });

    } catch (error) {
        console.error('[VIDEO] Command Error:', error?.message || error);
        await reply("❌ Download failed: " + (error?.message || 'Unknown error'));
    }
});

// Old video command as video2
cmd({
    pattern: "video2",
    alias: ["ytmp42", "ytv2", "drama"],
    react: "🎬",
    desc: "Download video from YouTube (Old API)",
    category: "download",
    use: ".video2 <query or url>",
    filename: __filename
}, async (conn, m, mek, { from, q, reply }) => {
    try {
        if (!q) return await reply("❌ What video do you want to download?");

        let videoUrl = '';
        let videoTitle = '';
        let videoThumbnail = '';
        
        // Determine if input is a YouTube link
        if (q.startsWith('http://') || q.startsWith('https://')) {
            videoUrl = q;
        } else {
            // Search YouTube for the video
            const { videos } = await yts(q);
            if (!videos || videos.length === 0) {
                return await reply("❌ No videos found!");
            }
            videoUrl = videos[0].url;
            videoTitle = videos[0].title;
            videoThumbnail = videos[0].thumbnail;
        }

        // Send thumbnail immediately
        try {
            const ytId = (videoUrl.match(/(?:youtu\.be\/|v=)([a-zA-Z0-9_-]{11})/) || [])[1];
            const thumb = videoThumbnail || (ytId ? `https://i.ytimg.com/vi/${ytId}/sddefault.jpg` : undefined);
            const captionTitle = videoTitle || q;
            if (thumb) {
                await conn.sendMessage(from, {
                    image: { url: thumb },
                    caption: `*${captionTitle}*\nDownloading from old API...`
                }, { quoted: mek });
            }
        } catch (e) { 
            console.error('[VIDEO2] thumb error:', e?.message || e); 
        }

        // Validate YouTube URL
        let urls = videoUrl.match(/(?:https?:\/\/)?(?:youtu\.be\/|(?:www\.|m\.)?youtube\.com\/(?:watch\?v=|v\/|embed\/|shorts\/|playlist\?list=)?)([a-zA-Z0-9_-]{11})/gi);
        if (!urls) {
            return await reply("❌ This is not a valid YouTube link!");
        }

        // Get Izumi API link for video
        const apiUrl = `${izumi.baseURL}/downloader/youtube?url=${encodeURIComponent(videoUrl)}&format=720`;
        
        const res = await axios.get(apiUrl, {
            timeout: 30000,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            }
        });

        if (!res.data || !res.data.result || !res.data.result.download) {
            return await reply("❌ Izumi API failed to return a valid video link.");
        }

        const videoData = res.data.result;

        // Send video directly using the download URL
        await conn.sendMessage(from, {
            video: { url: videoData.download },
            mimetype: 'video/mp4',
            fileName: `${videoData.title || videoTitle || 'video'}.mp4`,
            caption: `*${videoData.title || videoTitle || 'Video'}*\n\n> *_POWERED BY KHAN-MD*_`
        }, { quoted: mek });

    } catch (error) {
        console.error('[VIDEO2] Command Error:', error?.message || error);
        await reply("❌ Download failed: " + (error?.message || 'Unknown error'));
    }
});
