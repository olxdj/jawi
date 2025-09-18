const { cmd } = require('../command');
const yts = require('yt-search');
const axios = require('axios');

cmd({
    pattern: "play2",
    desc: "Download YouTube songs",
    category: "downloader",
    react: "🎵",
    filename: __filename
}, async (conn, mek, m, { from, q, reply }) => {
    try {
        if (!q) return await reply("🎶 Please provide song name!\n\nExample: .play Moye Moye");

        // Search for the video
        const searchResults = await yts(q);
        if (!searchResults.videos.length) return await reply("❌ No results found!");
        
        const video = searchResults.videos[0];
        const videoUrl = video.url;
        
        // Define the APIs to try in order
        const apis = [
            {
                name: "ytmp3",
                url: `https://api.giftedtech.web.id/api/download/ytmp3?apikey=gifted&url=${encodeURIComponent(videoUrl)}`
            },
            {
                name: "dlmp3", 
                url: `https://api.giftedtech.web.id/api/download/dlmp3?apikey=gifted&url=${encodeURIComponent(videoUrl)}`
            },
            {
                name: "yta",
                url: `https://api.giftedtech.web.id/api/download/yta?apikey=gifted&url=${encodeURIComponent(videoUrl)}`
            },
            {
                name: "ytaudio",
                url: `https://api.giftedtech.web.id/api/download/ytaudio?apikey=gifted&format=128kbps&url=${encodeURIComponent(videoUrl)}`
            }
        ];

        let audioUrl = null;
        let quality = "";
        let title = video.title;

        // Try each API in order until one works
        for (const api of apis) {
            try {
                const response = await axios.get(api.url, { timeout: 10000 });
                const data = response.data;
                
                if (data.status === 200 && data.success && data.result.download_url) {
                    audioUrl = data.result.download_url;
                    quality = data.result.quality || data.result.format || "";
                    title = data.result.title || title;
                    console.log(`✅ Success with ${api.name} API`);
                    break;
                }
            } catch (apiError) {
                console.log(`❌ Failed with ${api.name} API:`, apiError.message);
                continue;
            }
        }

        if (!audioUrl) {
            return await reply("❌ All download APIs failed. Please try again later.");
        }

        // Send processing message
        await reply(`*⬇️ Downloading: ${title}*`);

        // Send the audio file
        await conn.sendMessage(from, {
            audio: { url: audioUrl },
            mimetype: 'audio/mpeg',
            fileName: `${title}.mp3`
            ptt: true
        }, { quoted: mek });

    } catch (error) {
        console.error("Error in play command:", error);
        await reply("❌ An error occurred while processing your request.");
    }
});
