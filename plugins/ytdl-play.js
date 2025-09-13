const config = require('../config');
const { cmd } = require('../command');
const { ytsearch, ytmp3, ytmp4 } = require('@dark-yasiya/yt-dl.js'); 
const converter = require('../data/play-converter');
const fetch = require('node-fetch');
const yts = require('yt-search');

cmd({
    pattern: "play",
    alias: ["music"],
    react: "🎵",
    desc: "Download audio from YouTube (converted)",
    category: "download",
    use: ".play <query or url>",
    filename: __filename
}, async (conn, mek, m, { from, q, reply }) => {
    try {
        if (!q) return await reply("❌ Please provide a song name or YouTube URL!");

        let videoUrl, title;

        // ✅ Check if input is URL or search query
        if (q.match(/(youtube\.com|youtu\.be)/)) {
            videoUrl = q;
        } else {
            const search = await yts(q);
            if (!search.videos.length) return await reply("❌ No results found!");
            videoUrl = search.videos[0].url;
        }

        await reply("⏳ Downloading Please wait...");

        // ✅ Fetch from your API
        const apiUrl = `https://jawad-tech.vercel.app/download/yta?url=${encodeURIComponent(videoUrl)}`;
        const res = await fetch(apiUrl);
        const data = await res.json();

        if (!data.status || !data.result) {
            return await reply("❌ Failed to fetch audio. Try again later!");
        }

        title = data.metadata?.title || "Unknown Title";

        // ✅ Step 1: Download audio buffer
        const audioRes = await fetch(data.result);
        const audioBuffer = await audioRes.buffer();

        // ✅ Step 2: Convert to MP3 using play-converter
        let convertedAudio;
        try {
            convertedAudio = await converter.toAudio(audioBuffer, 'mp4');
        } catch (err) {
            console.error('Audio conversion failed:', err);
            return reply("❌ Audio conversion failed. Please try another song.");
        }

        // ✅ Step 3: Send converted audio
        await conn.sendMessage(from, {
            audio: convertedAudio,
            mimetype: "audio/mpeg",
            fileName: `${title}.mp3`
        }, { quoted: mek });

        await reply(`✅ *${title}* downloaded & converted successfully!\n\n🎧 Powered by JawadTechXD`);

    } catch (error) {
        console.error(error);
        await reply(`❌ Error: ${error.message}`);
    }
});

cmd({ 
    pattern: "play2", 
    alias: ["yta4"], 
    react: "☘️", 
    desc: "Download YouTube song via JawadTech API", 
    category: "main", 
    use: '.play2 <query or youtube url>', 
    filename: __filename 
}, async (conn, mek, m, { from, sender, reply, q }) => { 
    try {
        if (!q) return reply("*Please provide a song name or YouTube link.*");

        let ytUrl = '';
        if (/^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\//i.test(q)) {
            ytUrl = q.trim();
        } else {
            const yt = await ytsearch(q);
            if (!yt.results.length) return reply("No results found!");
            ytUrl = yt.results[0].url;
        }

        const apiUrl = `https://jawad-tech.vercel.app/download/ytmp3?url=${encodeURIComponent(ytUrl)}`;
        const res = await fetch(apiUrl);
        const data = await res.json();

        if (!data?.result) return reply("❌ Download failed. Try again later.");

        // Step 4: Download audio buffer
        const audioRes = await fetch(data.result);
        const audioBuffer = await audioRes.buffer();

        // Step 5: Convert to MP3 using toAudio
        let convertedAudio;
        try {
            convertedAudio = await converter.toAudio(audioBuffer, 'mp4');
        } catch (err) {
            console.error('Audio conversion failed:', err);
            return reply("❌ Audio conversion failed. Please try another song.");
        }

        // Step 6: Send converted audio
        await conn.sendMessage(from, {
            audio: convertedAudio,
            mimetype: "audio/mpeg",
            fileName: `${data.metadata?.title || 'song'}.mp3`
        }, { quoted: mek });

    } catch (error) {
        console.error(error);
        reply("An error occurred. Please try again.");
    }
});
