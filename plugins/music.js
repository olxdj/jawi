const { cmd } = require('../command');
const axios = require('axios');
const yts = require('yt-search');

cmd({
    pattern: "music",
    desc: "Download YouTube audio with thumbnail (JawadTech API)",
    category: "downloader",
    react: "🎶",
    filename: __filename
}, async (conn, mek, m, { from, q, reply }) => {
    try {
        if (!q) return await reply("🎧 Please provide a song name!\n\nExample: .music Faded Alan Walker");

        const { videos } = await yts(q);
        if (!videos || videos.length === 0) return await reply("❌ No results found!");

        const vid = videos[0];

        const api = `https://jawad-tech.vercel.app/download/audio?url=${encodeURIComponent(vid.url)}`;
        const res = await axios.get(api);
        const json = res.data;

        if (!json?.status || !json?.result) return await reply("❌ Download failed! Try again later.");

        // 🎧 Send audio directly with externalAdReply including thumbnail
        await conn.sendMessage(from, {
            audio: { url: json.result },
            mimetype: 'audio/mpeg',
            ptt: false,
            contextInfo: {
                externalAdReply: {
                    title: vid.title.length > 25 ? `${vid.title.substring(0, 22)}...` : vid.title,
                    body: "⇆  ||◁◁ㅤ ❚❚ ㅤ▷▷||ㅤ ⇆",
                    mediaType: 1,
                    thumbnailUrl: vid.thumbnail,
                    sourceUrl: "KHAN-MD",
                    showAdAttribution: true,
                    renderLargerThumbnail: true
                }
            }
        }, { quoted: mek });

        await m.react('✅');

    } catch (e) {
        console.error("Error in .music/.play2:", e);
        await reply("❌ Error occurred, please try again later!");
        await conn.sendMessage(from, { react: { text: '❌', key: m.key } });
    }
});
