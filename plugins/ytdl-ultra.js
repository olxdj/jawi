const { cmd } = require('../command');
const { ytsearch } = require('@dark-yasiya/yt-dl.js');
const AudioConverter = require('../data/converter'); // Path to your converter

cmd({
    pattern: "play",
    alias: ["yta"],
    react: "🎵",
    desc: "Download YouTube song (optimized audio)",
    category: "main",
    use: ".play <song name>",
    filename: __filename
}, async (conn, mek, m, { from, q, reply }) => {
    try {
        if (!q) return reply("🎵 Please provide a song name (e.g. .play Tum Hi Ho)");

        // 1. Show processing reaction
        await conn.sendMessage(from, { react: { text: '⏳', key: m.key } });

        // 2. Search YouTube
        const yt = await ytsearch(q);
        if (!yt?.results?.length) {
            await conn.sendMessage(from, { react: { text: '❌', key: m.key } });
            return reply("No YouTube results found");
        }

        const vid = yt.results[0];
        const apiUrl = `https://api-aswin-sparky.koyeb.app/api/downloader/song?search=${encodeURIComponent(vid.url)}`;

        // 3. Fetch and convert audio
        const response = await fetch(apiUrl);
        const json = await response.json();
        
        if (!json?.data?.downloadURL) {
            await conn.sendMessage(from, { react: { text: '❌', key: m.key } });
            return reply("Failed to fetch song URL");
        }

        // 4. Download and convert to proper MP3 format
        const audioBuffer = await (await fetch(json.data.downloadURL)).buffer();
        const convertedAudio = await AudioConverter.toAudio(audioBuffer, 'mp4');

        // 5. Create caption
        const caption = 
`*YOUTUBE DOWNLOADER ❤️*
╭━━❐━⪼
┇๏ *Title*    –  ${vid.title}
┇๏ *Duration* –  ${vid.timestamp}
┇๏ *Views*    –  ${vid.views}
┇๏ *Author*   –  ${vid.author.name}
╰━━❑━⪼
> *© POWERED BY KHAN-MD*`;

        // 6. Send as playable audio
        await conn.sendMessage(from, {
            audio: convertedAudio,
            mimetype: 'audio/mpeg',
            ptt: false
        }, { quoted: mek });

        // 7. Success reaction
        await conn.sendMessage(from, { react: { text: '✅', key: m.key } });

    } catch (e) {
        console.error('Play Error:', e);
        await conn.sendMessage(from, { react: { text: '❌', key: m.key } });
        reply("Error processing song. Try again later.");
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
