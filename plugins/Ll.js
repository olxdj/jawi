const { cmd } = require('../command');
const axios = require('axios');

cmd({
    pattern: "playl",
    alias: ["song"],
    react: "🎵",
    desc: "Download YouTube songs (Premium Quality)",
    category: "downloader",
    use: ".play <song name>",
    filename: __filename
}, async (conn, mek, m, { from, q, reply }) => {
    try {
        if (!q) return reply("🎵 Please provide a song name (e.g. *.play Tum Hi Ho*)");
        
        // 1. Show processing indicator
        await conn.sendMessage(from, { react: { text: '⏳', key: m.key } });

        /* --- YouTube Search with Fallback --- */
        let vid;
        try {
            // Try Primary Search API
            const yt1 = await axios.get(`https://yt.lemnoslife.com/search?q=${encodeURIComponent(q)}`);
            if (yt1.data?.items?.length) {
                vid = {
                    title: yt1.data.items[0].snippet.title,
                    url: `https://youtube.com/watch?v=${yt1.data.items[0].id.videoId}`,
                    timestamp: yt1.data.items[0].duration || "N/A",
                    views: yt1.data.items[0].viewCount || "N/A",
                    thumbnail: yt1.data.items[0].snippet.thumbnails.high.url,
                    author: { name: yt1.data.items[0].snippet.channelTitle }
                };
            } else {
                // Fallback to Secondary API
                const yt2 = await axios.get(`https://api.asura.tk/ytsearch?q=${encodeURIComponent(q)}`);
                vid = yt2.data?.result?.[0];
            }
        } catch (searchErr) {
            console.error("Search Error:", searchErr);
        }

        if (!vid) {
            await conn.sendMessage(from, { react: { text: '❌', key: m.key } });
            return reply("❌ Couldn't find the song. Try different keywords.");
        }

        /* --- Download with Multiple Fallback APIs --- */
        let audioUrl;
        const apis = [
            `https://api.siputzx.my.id/api/dl/youtube/mp3?url=${encodeURIComponent(vid.url)}`,
            `https://api.dhamzxploit.my.id/api/youtube-mp3?url=${encodeURIComponent(vid.url)}`,
            `https://api.akuari.my.id/downloader/youtube3?link=${encodeURIComponent(vid.url)}`
        ];

        for (const api of apis) {
            try {
                const { data } = await axios.get(api);
                if (data?.status && (data.data || data.result)) {
                    audioUrl = data.data || data.result;
                    break;
                }
            } catch (e) {
                continue; // Try next API
            }
        }

        if (!audioUrl) {
            await conn.sendMessage(from, { react: { text: '❌', key: m.key } });
            return reply("❌ All download APIs failed. Try again later.");
        }

        /* --- Send Results --- */
        const caption = `
*🎵 YOUTUBE DOWNLOADER*
╭━━━━━━━━━━━⪼
│ • *Title:* ${vid.title}
│ • *Duration:* ${vid.timestamp}
│ • *Views:* ${vid.views}
│ • *Channel:* ${vid.author.name}
╰━━━━━━━━━━━⪼
🔗 *URL:* ${vid.url.split('?')[0]}
> Powered By KHAN-MD`;

        // Send thumbnail
        await conn.sendMessage(from, 
            { image: { url: vid.thumbnail }, caption },
            { quoted: mek });

        // Send audio
        await conn.sendMessage(from,
            { audio: { url: audioUrl }, mimetype: "audio/mpeg" },
            { quoted: mek });

        // Success reaction
        await conn.sendMessage(from, { react: { text: '✅', key: m.key } });

    } catch (e) {
        console.error('Play Command Error:', e);
        await conn.sendMessage(from, { react: { text: '❌', key: m.key } });
        reply("⚠️ System overload. Please try again in a minute.");
    }
});
