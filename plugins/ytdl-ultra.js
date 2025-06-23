const { cmd } = require('../command');
const { ytsearch } = require('@dark-yasiya/yt-dl.js');
const axios = require('axios');

// Shared download function
const ytDownload = async (url, type = 'mp3', quality = '720') => {
    const { data } = await axios.post('https://y2kid.yogik.id/api/download', 
        { url, type, quality },
        { headers: { 'Content-Type': 'application/json' } }
    );
    return data;
};

// MP3 Download Command with Search
cmd({
    pattern: "yta3",
    alias: ["song3", "mp33"],
    react: "🎵",
    desc: "Download YouTube audio (High Quality)",
    category: "downloader",
    use: ".yta3 <song name or YouTube URL>",
    filename: __filename
}, async (conn, mek, m, { from, reply, args, q }) => {
    try {
        if (!q) return reply(`Please provide song name/URL\nExample: .yta3 Tum Hi Ho`);
        
        await conn.sendMessage(from, { react: { text: '⏳', key: m.key } });

        // Check if input is URL or search term
        let videoUrl = q;
        let videoTitle = "YouTube Audio";
        
        if (!q.includes('youtube.com') && !q.includes('youtu.be')) {
            const yt = await ytsearch(q);
            if (!yt?.results?.length) {
                await conn.sendMessage(from, { react: { text: '❌', key: m.key } });
                return reply("No results found");
            }
            videoUrl = yt.results[0].url;
            videoTitle = yt.results[0].title || videoTitle;
        }

        const result = await ytDownload(videoUrl, 'mp3', '1080');
        
        // Validate API response
        if (!result?.data?.download_url) {
            throw new Error("Invalid API response - no download URL");
        }

        // Ensure title is string
        const title = result.data.title?.toString() || videoTitle;
        const downloadUrl = result.data.download_url.toString();

        await conn.sendMessage(from, {
            audio: { url: downloadUrl },
            mimetype: 'audio/mpeg',
            fileName: `${title.replace(/[^\w\s]/gi, '')}.mp3`, // Remove special chars
            }, { quoted: mek });

        await conn.sendMessage(from, { react: { text: '✅', key: m.key } });

    } catch (e) {
        console.error('Audio Download Error:', e);
        await conn.sendMessage(from, { react: { text: '❌', key: m.key } });
        reply(`⚠️ Error: ${e.message.includes('toString') ? 'Invalid audio data received' : e.message}`);
    }
});

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
