const { cmd } = require('../command');
const axios = require('axios');
const yts = require('yt-search');

cmd({
    pattern: "play",
    desc: "Download YouTube audio with thumbnail (JawadTech API)",
    category: "download",
    react: "🎶",
    filename: __filename
}, async (conn, mek, m, { from, q, reply }) => {
    try {
        if (!q) return await reply("🎧 Please provide a song name!\n\nExample: .play Faded Alan Walker");

        const { videos } = await yts(q);
        if (!videos || videos.length === 0) return await reply("❌ No results found!");

        const vid = videos[0];

        // 🎵 Send video thumbnail + info first
        await conn.sendMessage(from, {
            image: { url: vid.thumbnail },
            caption: `- *AUDIO DOWNLOADER 🎧*\n╭━━❐━⪼\n┇๏ *Title* - ${vid.title}\n┇๏ *Duration* - ${vid.timestamp}\n┇๏ *Views* - ${vid.views.toLocaleString()}\n┇๏ *Author* - ${vid.author.name}\n┇๏ *Status* - Downloading...\n╰━━❑━⪼\n> *© Pᴏᴡᴇʀᴇᴅ Bʏ KHAN-MD ♡*`
        }, { quoted: mek });

        const api = `https://jawad-tech.vercel.app/download/audio?url=${encodeURIComponent(vid.url)}`;
        const res = await axios.get(api);
        const json = res.data;

        if (!json?.status || !json?.result) return await reply("❌ Download failed! Try again later.");

        const audioUrl = json.result;
        const title = vid.title || "Unknown Song";

        // 🎧 Send final audio file without externalAdReply
        await conn.sendMessage(from, {
            audio: { url: audioUrl },
            mimetype: "audio/mpeg",
            fileName: `${title}.mp3`
        }, { quoted: mek });

        await conn.sendMessage(from, { react: { text: '✅', key: m.key } });

    } catch (e) {
        console.error("Error in .music/.play2:", e);
        await reply("❌ Error occurred, please try again later!");
        await conn.sendMessage(from, { react: { text: '❌', key: m.key } });
    }
});

cmd({
    pattern: "play2",
    desc: "Download YouTube audio with thumbnail (JawadTech API)",
    category: "download",
    react: "🎶",
    filename: __filename
}, async (conn, mek, m, { from, q, reply }) => {
    try {
        if (!q) return await reply("🎧 Please provide a song name!\n\nExample: .play3 Faded Alan Walker");

        const { videos } = await yts(q);
        if (!videos || videos.length === 0) return await reply("❌ No results found!");

        const vid = videos[0];

        // Send thumbnail and video details first
        await conn.sendMessage(from, {
            image: { url: vid.thumbnail },
            caption: `🎶 *${vid.title}*\n⏱️ *Duration:* ${vid.timestamp}\n👀 *Views:* ${vid.views.toLocaleString()}\n📡 *Status:* Downloading...`
        }, { quoted: mek });

        const api = `https://jawad-tech.vercel.app/download/yt?url=${encodeURIComponent(vid.url)}`;
        const res = await axios.get(api);
        const json = res.data;

        if (!json?.status || !json?.result) return await reply("❌ Download failed! Try again later.");

        const audioUrl = json.result;
        const title = vid.title || "Unknown Song";

        await conn.sendMessage(from, {
            audio: { url: audioUrl },
            mimetype: "audio/mpeg",
            fileName: `${title}.mp3`
        }, { quoted: mek });

        await conn.sendMessage(from, { react: { text: '✅', key: m.key } });
    } catch (e) {
        console.error("Error in .play3:", e);
        await reply("❌ Error occurred, please try again later!");
        await conn.sendMessage(from, { react: { text: '❌', key: m.key } });
    }
});
