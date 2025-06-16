const axios = require("axios");
const { cmd } = require('../command');

cmd({
  pattern: "igdl",
  alias: ["instagram", "insta", "ig", "igvideo"],
  react: '📶',
  desc: "Download videos from Instagram (Alternative API)",
  category: "download",
  use: ".igdl2 <Instagram URL>",
  filename: __filename
}, async (conn, mek, m, { from, reply, args }) => {
  try {
    const igUrl = args[0];
    if (!igUrl || !igUrl.includes("instagram.com")) {
      return reply('Please provide a valid Instagram URL. Example: `.igdl2 https://instagram.com/...`');
    }

    await conn.sendMessage(from, { react: { text: '⏳', key: m.key } });

    const apiUrl = `https://bk9.fun/download/instagram?url=${encodeURIComponent(igUrl)}`;
    const response = await axios.get(apiUrl);

    if (!response.data?.status || !response.data?.BK9?.[0]?.url) {
      return reply('❌ Unable to fetch the video. Try .igdl2 for primary download.');
    }

    const videoUrl = response.data.BK9[0].url;
    await reply('```Downloading video Please wait 🚀```');

    const videoResponse = await axios.get(videoUrl, { responseType: 'arraybuffer' });
    if (!videoResponse.data) {
      return reply('❌ Failed to download the video. Please try again later.');
    }

    const videoBuffer = Buffer.from(videoResponse.data, 'binary');

    await conn.sendMessage(from, {
      video: videoBuffer,
      caption: `📥 *Instagram Downloader*\n\n` +
        `📏 *Quality*: HD\n\n` +
        `> © Powered by JawadTechXD 🔪`,
    }, { quoted: mek });

    await conn.sendMessage(from, { react: { text: '✅', key: m.key } });
  } catch (error) {
    console.error('Error downloading video:', error);
    reply('❌ API 2 failed. Try .igdl for primary download.');
    await conn.sendMessage(from, { react: { text: '❌', key: m.key } });
  }
});

const axios = require("axios");
const { cmd } = require("../command");

cmd({
  pattern: "ig2",
  alias: ["insta2", "igdl2", "instagram2"],
  react: '📥',
  desc: "Download videos from Instagram",
  category: "download",
  use: ".igdl <Instagram URL>",
  filename: __filename
}, async (conn, mek, m, { from, reply, args }) => {
  try {
    const igUrl = args[0];
    if (!igUrl || !igUrl.includes("instagram.com")) {
      return reply('Please provide a valid Instagram URL. Example: `.igdl https://instagram.com/...`');
    }

    await conn.sendMessage(from, { react: { text: '⏳', key: m.key } });

    // Call the API
    const apiUrl = `https://api.agatz.xyz/api/instagram?url=${encodeURIComponent(igUrl)}`;
    const response = await axios.get(apiUrl);

    // Validate response
    if (!response.data || response.data.status !== 200 || !response.data.data?.videoLinks?.length) {
      return reply('❌ Unable to fetch video. Invalid URL or API error.');
    }

    // Get video links (excluding MP3)
    const videoLinks = response.data.data.videoLinks.filter(v => !v.quality.includes("mp3"));
    if (!videoLinks.length) {
      return reply('❌ No video download link found.');
    }

    // Select first video link (they're usually ordered by quality)
    const videoInfo = videoLinks[0];
    const downloadUrl = videoInfo.url;
    const quality = videoInfo.quality.replace("download (", "").replace(")", "") || "HD";

    await reply('📥 Downloading...');

    // Download video
    const videoResponse = await axios.get(downloadUrl, { responseType: 'arraybuffer' });
    if (!videoResponse.data) {
      return reply('❌ Failed to download video.');
    }

    // Send video
    await conn.sendMessage(from, {
      video: Buffer.from(videoResponse.data),
      caption: `📥 Instagram Video\nQuality: ${quality}`,
    }, { quoted: mek });

    await conn.sendMessage(from, { react: { text: '✅', key: m.key } });
  } catch (error) {
    console.error('Error:', error);
    reply('❌ Download failed: ' + (error.message || 'Unknown error'));
    await conn.sendMessage(from, { react: { text: '❌', key: m.key } });
  }
});


cmd({
  pattern: "ig3",
  alias: ["insta3", "igdl3", "instagram3"],
  desc: "Download Instagram videos/reels",
  react: "🎥",
  category: "download",
  filename: __filename
}, async (conn, m, store, { from, q, reply }) => {
  try {
    if (!q || !q.startsWith("http")) {
      return reply("❌ Please provide a valid Instagram URL\nExample: .ig https://www.instagram.com/reel/...");
    }

    // Show processing indicator
    await conn.sendMessage(from, { react: { text: "⏳", key: m.key } });

    // API endpoint
    const apiUrl = `https://apis.davidcyriltech.my.id/instagram?url=${encodeURIComponent(q)}`;
    
    // Fetch data from API
    const { data } = await axios.get(apiUrl);

    // Validate response
    if (!data?.success || data?.status !== 200 || !data?.downloadUrl) {
      return reply("⚠️ Failed to fetch media. Please check the link or try again later.");
    }

    // Determine media type
    const isVideo = data.type === "mp4";
    const mediaType = isVideo ? "video" : "image";

    // Send the media
    await conn.sendMessage(
      from,
      {
        [mediaType]: { url: data.downloadUrl },
        mimetype: isVideo ? "video/mp4" : "image/jpeg",
        caption: `> *Powerd By JawadTechX ♥️*`
      },
      { quoted: m }
    );

  } catch (error) {
    console.error("Instagram Download Error:", error);
    reply(`❌ Error: ${error.message || "Failed to download media"}`);
  }
});
