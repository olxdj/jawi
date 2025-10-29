// ✅ Coded by JawadTechX
// 📹 Command: snack / snackdl / snacks

const { cmd } = require('../command');
const axios = require('axios');
const config = require('../config');

cmd({
  pattern: "snack",
  alias: ["snackdl", "snacks"],
  desc: "Download Snack Video from link.",
  category: "downloader",
  react: "🎞️",
  use: ".snack <snackvideo link>",
  filename: __filename
}, async (conn, mek, m, { from, body, quoted, args, reply }) => {
  try {
    if (!args[0]) return reply("📍 Please provide a *SnackVideo link*.\n\nExample: .snack https://www.snackvideo.com/@kwai/video/...");

    const url = args[0];
    const apiUrl = `https://api.hanggts.xyz/download/snackvideo?url=${encodeURIComponent(url)}`;
    
    const { data } = await axios.get(apiUrl);

    if (!data.status || !data.result?.downloadUrl) {
      return reply("❌ Failed to download video. Please check the link and try again.");
    }

    const videoUrl = data.result.downloadUrl;

    await conn.sendMessage(from, {
      video: { url: videoUrl },
      caption: `🎬 *SnackVideo Downloader*\n\n> Powered By *JawadTechX 🇵🇰*`
    }, { quoted: mek });

  } catch (err) {
    console.error("SNACK VIDEO ERROR:", err);
    reply("⚠️ Error downloading the video. Try again later.");
  }
});
