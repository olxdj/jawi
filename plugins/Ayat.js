const { cmd } = require('../command');
const yts = require('yt-search');
const fetch = require('node-fetch');
const config = require('../config');
const axios = require('axios');

cmd({
  pattern: "play5",
  alias: ["song5"],
  react: "🎶",
  desc: "Fast YouTube MP3 downloader",
  category: "music",
  filename: __filename
}, async (conn, mek, m, { from, q, reply }) => {
  try {
    if (!q) return reply("❌ Please give me a YouTube URL or search query");

    // Hit your API
    const api = `https://jawad-tech.vercel.app/download/audio?url=${encodeURIComponent(q)}`;
    const res = await axios.get(api);
    if (!res.data?.status || !res.data.result) return reply("❌ Failed to fetch audio");

    // Download MP3 buffer
    const audioRes = await axios.get(res.data.result, { responseType: "arraybuffer" });
    const buffer = Buffer.from(audioRes.data);

    await conn.sendMessage(from, {
      audio: buffer,
      mimetype: "audio/mpeg",
      ptt: false,
      fileName: "song.mp3"
    }, { quoted: mek });

    reply("✅ Audio sent — Powered By JawadTechX");
  } catch (e) {
    console.error(e);
    reply("❌ Error: " + e.message);
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
