// coded by jawadtech x

const config = require('../config');
const { cmd } = require('../command');
const axios = require('axios');

// Pinterest API configuration
const pinterestAPI = {
    baseURL: "https://izumiiiiiiii.dpdns.org/downloader/pinterest"
};

cmd({
    pattern: "pins2",
    alias: ["pinterest2", "pint2"],
    react: "📌",
    desc: "Download video from Pinterest",
    category: "download",
    use: ".pins <pinterest_url>",
    filename: __filename
}, async (conn, mek, m, { from, q, reply, quoted }) => {
    try {
        if (!q) return await reply("❌ Please provide a Pinterest URL!\nExample: .pins https://pin.it/5qEuEsayV");

        // Validate Pinterest URL
        if (!q.includes('pinterest.com') && !q.includes('pin.it')) {
            return await reply("❌ Please provide a valid Pinterest URL!");
        }

        // ⏳ React - processing
        await conn.sendMessage(from, { react: { text: '⏳', key: mek.key } });
        
        await reply("📥 Downloading Please Wait...");

        // Get Pinterest video data from API
        const apiUrl = `${pinterestAPI.baseURL}?url=${encodeURIComponent(q)}`;
        
        const res = await axios.get(apiUrl, {
            timeout: 30000,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'accept': '*/*'
            }
        });

        if (!res.data || !res.data.status || !res.data.result || !res.data.result.download) {
            return await reply("❌ Failed to download video. Invalid URL or no video found.");
        }

        const pinData = res.data.result;

        // Send the video
        await conn.sendMessage(from, {
            video: { url: pinData.download },
            mimetype: 'video/mp4',
            fileName: `pinterest_${Date.now()}.mp4`,
            caption: `*${pinData.title || 'Pinterest Video'}*\n\n` +
                     `*Author:* ${pinData.author?.name || 'N/A'}\n` +
                     `*Upload:* ${pinData.upload || 'N/A'}\n` +
                     `*Source:* Pinterest`
        }, { quoted: mek });

        // ✅ React - success
        await conn.sendMessage(from, { react: { text: '✅', key: mek.key } });

    } catch (error) {
        console.error('[PINTEREST] Command Error:', error?.message || error);
        await reply("❌ Download failed: " + (error?.message || 'Unknown error'));
    }
});
