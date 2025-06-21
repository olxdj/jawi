const { cmd } = require('../command');
const { ytsearch } = require('@dark-yasiya/yt-dl.js');

cmd({
    pattern: "play",
    alias: ["yta"],
    react: "🎵",
    desc: "Download YouTube audio",
    category: "downloader",
    use: ".mp3 <song name>",
    filename: __filename
}, async (conn, mek, m, { from, q, reply }) => {
    try {
        if (!q) return reply("🎵 Please provide a song name");
        
        await conn.sendMessage(from, { react: { text: '⏳', key: m.key } });
        
        const yt = await ytsearch(q);
        if (!yt?.results?.length) {
            await conn.sendMessage(from, { react: { text: '❌', key: m.key } });
            return reply("No results found");
        }
        
        const vid = yt.results[0];
        const api = `https://api-aswin-sparky.koyeb.app/api/downloader/song?search=${encodeURIComponent(vid.url)}`;
        const res = await fetch(api);
        const json = await res.json();
        
        if (!json?.data?.downloadURL) {
            await conn.sendMessage(from, { react: { text: '❌', key: m.key } });
            return reply("Download failed");
        }

        // Critical Fixes:
        // 1. Download the audio first to buffer
        const audioRes = await fetch(json.data.downloadURL);
        const audioBuffer = await audioRes.buffer();
        
        // 2. Send with proper metadata
        await conn.sendMessage(from, {
            audio: audioBuffer,
            mimetype: "audio/mpeg", // Force MP3 type
            ptt: false, // Important for music
            fileName: `${json.data.title.replace(/[^\w\s]/gi, '')}.mp3` // Clean filename
        }, { quoted: mek });
        
        await reply(`🎵 *${json.data.title}* - Downloaded Successfully ✅`);
        await conn.sendMessage(from, { react: { text: '✅', key: m.key } });
        
    } catch (e) {
        console.error(e);
        await conn.sendMessage(from, { react: { text: '❌', key: m.key } });
        reply("Error occurred: " + e.message);
    }
});

cmd({
    pattern: "song",
    alias: ["video"],
    react: "🎬",
    desc: "Download YouTube video",
    category: "downloader",
    use: ".mp4 <query/url>",
    filename: __filename
}, async (conn, mek, m, { from, q, reply }) => {
    try {
        if (!q) return reply("🎬 Please provide video name/URL");
        
        // 1. Indicate processing
        await conn.sendMessage(from, { react: { text: '⏳', key: m.key } });
        
        // 2. Search YouTube
        const yt = await ytsearch(q);
        if (!yt?.results?.length) {
            await conn.sendMessage(from, { react: { text: '❌', key: m.key } });
            return reply("No results found");
        }
        
        const vid = yt.results[0];
        
        // 3. Fetch video
        const api = `https://api-aswin-sparky.koyeb.app/api/downloader/ytv?url=${encodeURIComponent(vid.url)}`;
        const res = await fetch(api);
        const json = await res.json();
        
        if (!json?.data?.downloadURL) {
            await conn.sendMessage(from, { react: { text: '❌', key: m.key } });
            return reply("Download failed");
        }
        
        // 4. Create stylish caption
        const caption = `
╭─〔 *🎥 KHAN-MD DOWNLOADER* 〕
├─▸ *📌 Title:* ${vid.title}
├─▸ *⏳ Duration:* ${vid.timestamp}
├─▸ *👀 Views:* ${vid.views}
├─▸ *👤 Author:* ${vid.author.name}
╰─➤ *Powered by KHAN-MD*`;
        
        // 5. Send video with formatted caption
        await conn.sendMessage(from, {
            video: { url: json.data.downloadURL },
            caption: caption
        }, { quoted: mek });
        
        // 6. Success reaction
        await conn.sendMessage(from, { react: { text: '✅', key: m.key } });
        
    } catch (e) {
        console.error(e);
        await conn.sendMessage(from, { react: { text: '❌', key: m.key } });
        reply("Error occurred");
    }
});
