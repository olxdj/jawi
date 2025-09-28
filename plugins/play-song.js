const { cmd } = require('../command');
const yts = require('yt-search');
const axios = require('axios');

// Extract YouTube ID
function extractYouTubeId(url) {
    const regex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:watch\?v=|embed\/|v\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null;
}

// Convert input to full YT link
function convertYouTubeLink(q) {
    const videoId = extractYouTubeId(q);
    if (videoId) {
        return `https://www.youtube.com/watch?v=${videoId}`;
    }
    return q;
}

cmd({
    pattern: "play2",
    alias: ["song2"],
    desc: "Play YouTube song (direct audio).",
    react: "🎶",
    category: "download",
    filename: __filename
}, async (conn, mek, m, {
  from, q, reply
}) => {
  try {
    q = convertYouTubeLink(q);
    if (!q) return reply("*❌ Please provide a YouTube title or URL.*");

    let url;
    let data;

    if (q.includes("youtube.com") || q.includes("youtu.be")) {
      // Direct URL
      url = q;
      const search = await yts({ videoId: extractYouTubeId(q) });
      data = search;
    } else {
      // Search by title
      const search = await yts(q);
      data = search.videos[0];
      url = data.url;
    }

    if (!data) return reply("❌ No results found!");

    // Show info with thumbnail
    let caption = `
┌──「 *YOUTUBE RESULT* 」
│🎵 *Title:* ${data.title}
│⏱️ *Duration:* ${data.timestamp}
│📅 *Uploaded:* ${data.ago}
│👁️ *Views:* ${data.views}
└───────────────⦁
*Downloading audio... Please wait ⏳*
    `;

    await conn.sendMessage(from, {
      image: { url: data.thumbnail },
      caption
    }, { quoted: mek });

    // React: Processing
    await conn.sendMessage(from, { react: { text: '⏳', key: mek.key } });

    // Fetch from your API
    const apiUrl = `https://jawad-tech.vercel.app/download/yt?url=${encodeURIComponent(url)}`;
    const response = await axios.get(apiUrl);
    const resData = response.data;

    if (!resData.status || !resData.result) {
      return reply("❌ Failed to download audio.");
    }

    // React: Downloading
    await conn.sendMessage(from, { react: { text: '⬇️', key: mek.key } });

    // Send audio (clean, no externalAdReply)
    await conn.sendMessage(from, {
      audio: { url: resData.result },
      mimetype: "audio/mpeg"
    }, { quoted: mek });

    // React: Done
    await conn.sendMessage(from, { react: { text: '⬆️', key: mek.key } });

  } catch (e) {
    console.error(e);
    reply("❌ Error: " + e.message);
  }
});
