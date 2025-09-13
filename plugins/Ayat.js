const { cmd } = require('../command');
const yts = require('yt-search');
const fetch = require('node-fetch');
const config = require('../config');
const config = require('../config');
const ffmpeg = require('child_process').spawn;
const fs = require('fs');
const path = require('path');
const { tmpdir } = require('os');

// Fast converter
async function toAudio(buffer, ext) {
    return new Promise((resolve, reject) => {
        try {
            const inputPath = path.join(tmpdir(), `input.${ext}`);
            const outputPath = path.join(tmpdir(), `output.mp3`);

            fs.writeFileSync(inputPath, buffer);

            const args = [
                '-y',
                '-i', inputPath,
                '-vn',
                '-ac', '2',
                '-ar', '44100',
                '-b:a', '192k',
                '-acodec', 'libmp3lame',
                '-f', 'mp3',
                outputPath
            ];

            const proc = ffmpeg('ffmpeg', args);

            proc.on('close', () => {
                const converted = fs.readFileSync(outputPath);
                fs.unlinkSync(inputPath);
                fs.unlinkSync(outputPath);
                resolve(converted);
            });

            proc.on('error', (err) => reject(err));
        } catch (err) {
            reject(err);
        }
    });
}

cmd({
    pattern: "yt5",
    alias: ["play5", "music5"],
    react: "🎶",
    desc: "Download HQ audio from YouTube",
    category: "download",
    use: ".yt5 <query or url>",
    filename: __filename
}, async (conn, m, mek, { from, q, reply }) => {
    try {
        if (!q) return await reply("❌ Please provide a song name or YouTube URL!");

        let videoUrl, title;

        // If YouTube link
        if (q.match(/(youtube\.com|youtu\.be)/)) {
            videoUrl = q;
        } else {
            // Search YouTube
            const search = await yts(q);
            if (!search.videos.length) return await reply("❌ No results found!");
            videoUrl = search.videos[0].url;
            title = search.videos[0].title;
        }

        await reply("⏳ Fetching HQ audio...");

        // Call your API
        const apiUrl = `https://jawad-tech.vercel.app/download/audio?url=${encodeURIComponent(videoUrl)}`;
        const response = await fetch(apiUrl);
        const data = await response.json();

        if (!data.status || !data.result) return await reply("❌ Failed to fetch audio link!");

        const downloadUrl = data.result;

        // Download file
        const audioRes = await fetch(downloadUrl);
        const buffer = await audioRes.buffer();

        // Convert with ffmpeg
        const converted = await toAudio(buffer, 'mp3');

        // Send audio
        await conn.sendMessage(from, {
            audio: converted,
            mimetype: 'audio/mpeg',
            fileName: `${title || "yt-audio"}.mp3`,
            ptt: false
        }, { quoted: mek });

        await reply(`✅ ${title || "Audio"} downloaded in HQ!\n🎧 Powered By JawadTechX`);

    } catch (error) {
        console.error(error);
        await reply(`❌ Error: ${error.message}`);
    }
});

cmd({
    pattern: "yt2",
    alias: ["play2", "music"],
    react: "🎵",
    desc: "Download audio from YouTube",
    category: "download",
    use: ".yt2 <query or url>",
    filename: __filename
}, async (conn, m, mek, { from, q, reply }) => {
    try {
        if (!q) return await reply("❌ Please provide a song name or YouTube URL!");

        let videoUrl, title;

        // Check if input is URL
        if (q.match(/(youtube\.com|youtu\.be)/)) {
            videoUrl = q;
        } else {
            // Search YouTube
            const search = await yts(q);
            if (!search.videos.length) return await reply("❌ No results found!");
            videoUrl = search.videos[0].url;
        }

        await reply("⏳ Downloading audio... Please wait.");

        // Fetch from your new API
        const apiUrl = `https://jawad-tech.vercel.app/download/yta?url=${encodeURIComponent(videoUrl)}`;
        const res = await fetch(apiUrl);
        const data = await res.json();

        if (!data.status || !data.result) {
            return await reply("❌ Failed to fetch audio. Try again later!");
        }

        title = data.metadata?.title || "Unknown Title";

        await conn.sendMessage(from, {
            audio: { url: data.result },
            mimetype: 'audio/mpeg',
            ptt: false
        }, { quoted: mek });

        await reply(`✅ *${title}* downloaded successfully!\n\n🎧 Powered by JawadTechXD`);

    } catch (error) {
        console.error(error);
        await reply(`❌ Error: ${error.message}`);
    }
});
