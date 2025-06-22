const { cmd } = require('../command');
const { ytsearch } = require('@dark-yasiya/yt-dl.js');

cmd({
    pattern: "play",
    alias: ["yta"],
    react: "🎵",
    desc: "Download YouTube songs (New API)",
    category: "downloader",
    use: ".play <song name>",
    filename: __filename
}, async (conn, mek, m, { from, q, reply }) => {
    try {
        if (!q) return reply("🎵 Please provide a song name (e.g. *.play Tum Hi Ho*)");
        
        // 1. Show processing indicator
        await conn.sendMessage(from, { react: { text: '⏳', key: m.key } });

        // 2. Search YouTube
        const yt = await ytsearch(q);
        if (!yt?.results?.length) {
            await conn.sendMessage(from, { react: { text: '❌', key: m.key } });
            return reply("❌ No results found");
        }

        const vid = yt.results[0];
        
        // 3. Fetch from new API
        const apiUrl = `https://api.siputzx.my.id/api/dl/youtube/mp3?url=${encodeURIComponent(vid.url)}`;
        const res = await fetch(apiUrl);
        const data = await res.json();

        if (!data?.status || !data.data) {
            await conn.sendMessage(from, { react: { text: '❌', key: m.key } });
            return reply("❌ Download failed. Try again later.");
        }

        // 4. Create caption
        const caption = `*YOUTUBE DOWNLOADER 🎧*
╭━━❐━⪼
┇๏ *Title*    –  ${vid.title}
┇๏ *Duration* –  ${vid.timestamp}
┇๏ *Views*    –  ${vid.views}
┇๏ *Author*   –  ${vid.author.name}
╰━━❑━⪼
> *Powered By KHAN-MD*`;

        // 5. Send thumbnail first
        await conn.sendMessage(from, 
            { image: { url: vid.thumbnail }, caption }, 
            { quoted: mek });

        // 6. Send audio
        await conn.sendMessage(from, 
            { audio: { url: data.data }, mimetype: "audio/mpeg" }, 
            { quoted: mek });

        // 7. Success reaction
        await conn.sendMessage(from, { react: { text: '✅', key: m.key } });

    } catch (e) {
        console.error('Play Error:', e);
        await conn.sendMessage(from, { react: { text: '❌', key: m.key } });
        reply("⚠️ An error occurred. Please try again.");
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
