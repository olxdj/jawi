const config = require('../config');
const { cmd } = require('../command');
const yts = require('yt-search');
const axios = require('axios');

// Play command 1
cmd({
    pattern: "play",
    alias: ["song", "music"],
    desc: "Download YouTube songs - API 1",
    category: "downloader",
    react: "🎵",
    filename: __filename
}, async (conn, mek, m, { from, q, reply }) => {
    try {
        if (!q) return await reply("🎶 Please provide song name!\n\nExample: .play Faded");
        
        await conn.sendMessage(from, { react: { text: '⏳', key: m.key } });

        const { videos } = await yts(q);
        if (!videos || videos.length === 0) {
            await conn.sendMessage(from, { react: { text: '❌', key: m.key } });
            return await reply("❌ No results found!");
        }

        const vid = videos[0];
        const api = `https://apis-keith.vercel.app/download/audio?url=${encodeURIComponent(vid.url)}`;
        const res = await axios.get(api);
        const json = res.data;

        if (!json?.status || !json?.result) {
            await conn.sendMessage(from, { react: { text: '❌', key: m.key } });
            return await reply("❌ Download failed! Try again later.");
        }

        await conn.sendMessage(from, {
            audio: { url: json.result },
            mimetype: "audio/mpeg",
            fileName: `${vid.title}.mp3`
        }, { quoted: mek });

        await conn.sendMessage(from, { react: { text: '✅', key: m.key } });

    } catch (e) {
        console.error("Error in .play:", e);
        await conn.sendMessage(from, { react: { text: '❌', key: m.key } });
        await reply("❌ Error occurred, try again later!");
    }
});

// Play command 2
cmd({
    pattern: "play2",
    alias: ["song2", "yta"],
    desc: "Download YouTube songs - API 2",
    category: "downloader",
    react: "🎵",
    filename: __filename
}, async (conn, mek, m, { from, q, reply }) => {
    try {
        if (!q) return await reply("🎶 Please provide song name!\n\nExample: .play2 Faded");
        
        await conn.sendMessage(from, { react: { text: '⏳', key: m.key } });

        const { videos } = await yts(q);
        if (!videos || videos.length === 0) {
            await conn.sendMessage(from, { react: { text: '❌', key: m.key } });
            return await reply("❌ No results found!");
        }

        const vid = videos[0];
        const api = `https://apis-keith.vercel.app/download/yta?url=${encodeURIComponent(vid.url)}`;
        const res = await axios.get(api);
        const json = res.data;

        if (!json?.success || !json?.result) {
            await conn.sendMessage(from, { react: { text: '❌', key: m.key } });
            return await reply("❌ Download failed! Try again later.");
        }

        await conn.sendMessage(from, {
            audio: { url: json.result },
            mimetype: "audio/mpeg",
            fileName: `${vid.title}.mp3`
        }, { quoted: mek });

        await conn.sendMessage(from, { react: { text: '✅', key: m.key } });

    } catch (e) {
        console.error("Error in .play2:", e);
        await conn.sendMessage(from, { react: { text: '❌', key: m.key } });
        await reply("❌ Error occurred, try again later!");
    }
});

// Play command 3
cmd({
    pattern: "play3",
    alias: ["song3", "ytmp3"],
    desc: "Download YouTube songs - API 3",
    category: "downloader",
    react: "🎵",
    filename: __filename
}, async (conn, mek, m, { from, q, reply }) => {
    try {
        if (!q) return await reply("🎶 Please provide song name!\n\nExample: .play3 Faded");
        
        await conn.sendMessage(from, { react: { text: '⏳', key: m.key } });

        const { videos } = await yts(q);
        if (!videos || videos.length === 0) {
            await conn.sendMessage(from, { react: { text: '❌', key: m.key } });
            return await reply("❌ No results found!");
        }

        const vid = videos[0];
        const api = `https://apis-keith.vercel.app/download/ytmp3?url=${encodeURIComponent(vid.url)}`;
        const res = await axios.get(api);
        const json = res.data;

        if (!json?.status || !json?.result?.url) {
            await conn.sendMessage(from, { react: { text: '❌', key: m.key } });
            return await reply("❌ Download failed! Try again later.");
        }

        await conn.sendMessage(from, {
            audio: { url: json.result.url },
            mimetype: "audio/mpeg",
            fileName: `${json.result.filename || vid.title}.mp3`
        }, { quoted: mek });

        await conn.sendMessage(from, { react: { text: '✅', key: m.key } });

    } catch (e) {
        console.error("Error in .play3:", e);
        await conn.sendMessage(from, { react: { text: '❌', key: m.key } });
        await reply("❌ Error occurred, try again later!");
    }
});

// Play command 4
cmd({
    pattern: "play4",
    alias: ["song4"],
    desc: "Download YouTube songs - API 4",
    category: "downloader",
    react: "🎵",
    filename: __filename
}, async (conn, mek, m, { from, q, reply }) => {
    try {
        if (!q) return await reply("🎶 Please provide song name!\n\nExample: .play4 Faded");
        
        await conn.sendMessage(from, { react: { text: '⏳', key: m.key } });

        const { videos } = await yts(q);
        if (!videos || videos.length === 0) {
            await conn.sendMessage(from, { react: { text: '❌', key: m.key } });
            return await reply("❌ No results found!");
        }

        const vid = videos[0];
        const api = `https://apis-keith.vercel.app/download/mp3?url=${encodeURIComponent(vid.url)}`;
        const res = await axios.get(api);
        const json = res.data;

        if (!json?.status || !json?.result) {
            await conn.sendMessage(from, { react: { text: '❌', key: m.key } });
            return await reply("❌ Download failed! Try again later.");
        }

        await conn.sendMessage(from, {
            audio: { url: json.result },
            mimetype: "audio/mpeg",
            fileName: `${vid.title}.mp3`
        }, { quoted: mek });

        await conn.sendMessage(from, { react: { text: '✅', key: m.key } });

    } catch (e) {
        console.error("Error in .play4:", e);
        await conn.sendMessage(from, { react: { text: '❌', key: m.key } });
        await reply("❌ Error occurred, try again later!");
    }
});

cmd({
  pattern: "play5",
  desc: "Download YouTube audio by title",
  category: "download",
  react: "🎵",
  filename: __filename
}, async (conn, mek, m, { from, args, q, reply }) => {
  try {
    if (!q) return reply("❌ Please give me a song name.");

    // 1. Search video on YouTube
    let search = await yts(q);
    let video = search.videos[0];
    if (!video) return reply("❌ No results found.");

    // 2. Call your API with video URL
    let apiUrl = `https://jawad-tech.vercel.app/download/yt?url=${encodeURIComponent(video.url)}`;
    let res = await axios.get(apiUrl);

    if (!res.data.status) {
      return reply("❌ Failed to fetch audio. Try again later.");
    }

    // 3. Send audio file first
    await conn.sendMessage(from, {
      audio: { url: res.data.result },
      mimetype: "audio/mpeg",
      ptt: false,
      contextInfo: { forwardingScore: 999, isForwarded: false }
    }, { quoted: mek });

    // 4. Then reply with success message
    await reply(`✅ *${video.title}* Downloaded Successfully!`);

  } catch (e) {
    console.error("play2 error:", e);
    reply("❌ Error while downloading audio.");
  }
});
