const config = require('../config');
const { cmd } = require('../command');
const { ytsearch, ytmp3, ytmp4 } = require('@dark-yasiya/yt-dl.js'); 
const converter = require('../data/play-converter');
const fetch = require('node-fetch');
const yts = require('yt-search');
const axios = require('axios');

cmd({
  pattern: "play2",
  desc: "Download YouTube song",
  category: "download",
  react: "🎶",
  filename: __filename
}, async (conn, mek, m, { from, reply }) => {
  try {
    const text = m.body.split(" ").slice(1).join(" ");
    if (!text) return reply("❌ Please provide a song name!\n\nExample: .play Moye Moye");

    reply("⏳ Please wait downloading ...");

    // Search YouTube
    const { videos } = await yts(text);
    if (!videos || videos.length === 0) return reply("⚠️ No results found!");

    const video = videos[0];
    const urlYt = video.url;

    // API Call for MP3
    const response = await axios.get(`https://apis-keith.vercel.app/download/dlmp3?url=${urlYt}`);
    const data = response.data;

    if (!data || !data.status || !data.result || !data.result.downloadUrl) {
      return reply("❌ Failed to fetch audio. Try again later.");
    }

    const audioUrl = data.result.downloadUrl;
    const title = data.result.title || "audio";

    // Send Audio
    await conn.sendMessage(from, {
      audio: { url: audioUrl },
      mimetype: "audio/mpeg",
      fileName: `${title}.mp3`
    }, { quoted: mek });

  } catch (e) {
    console.error("Error in .play command:", e);
    reply("❌ Download failed. Please try again later.");
  }
});

cmd({ 
    pattern: "play", 
    alias: ["yta"], 
    react: "🎵", 
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
