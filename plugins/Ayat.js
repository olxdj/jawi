const { cmd } = require('../command');
const { ytsearch } = require('@dark-yasiya/yt-dl.js');
const axios = require('axios');

cmd({
  pattern: "play2",
  alias: ["yta2", "song2"],
  react: "🎶",
  desc: "Download YouTube song using Anomaki API",
  category: "main",
  use: '.play2 <query or youtube url>',
  filename: __filename
}, async (conn, mek, m, { from, reply, q }) => {
  try {
    if (!q) return reply("❗ Please provide a song name or YouTube link.");

    let ytUrl = '';
    let title = '';

    // If it's a YouTube link
    if (/^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\//i.test(q)) {
      ytUrl = q.trim();
      title = "Your Song";
    } else {
      // Otherwise, search YouTube
      const yt = await ytsearch(q);
      if (!yt.results.length) return reply("⚠️ No results found.");
      ytUrl = yt.results[0].url;
      title = yt.results[0].title;
    }

    // Call API
    const apiUrl = `https://www.apis-anomaki.zone.id/downloader/yta?url=${encodeURIComponent(ytUrl)}`;
    const { data } = await axios.get(apiUrl);

    if (!data?.result?.data?.downloadURL) {
      return reply("⚠️ Download failed. Try again later.");
    }

    // Download as buffer
    const audioRes = await axios.get(data.result.data.downloadURL, { responseType: "arraybuffer" });
    const audioBuffer = Buffer.from(audioRes.data);

    // Some APIs return m4a (AAC), not mp3 → fix by using audio/mp4
    await conn.sendMessage(from, {
      audio: audioBuffer,
      mimetype: "audio/mp4",   // ✅ makes WhatsApp accept/play
      fileName: `${title}.m4a`,
      ptt: false
    }, { quoted: mek });

    // Success reply
    await reply(`${title} Downloaded Successfully ✅`);

  } catch (err) {
    console.error("Play2 Error:", err);
    reply("⚠️ Error occurred. Try again.");
  }
});
