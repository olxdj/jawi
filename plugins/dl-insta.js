const axios = require("axios");
const { cmd } = require('../command');
const axios = require("axios");
const { cmd } = require("../command");

cmd({
  pattern: "igdl",
  alias: ["instagram", "insta", "igvideo", "ig"],
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

    // Try the first API (agatz.xyz)
    let videoUrl, quality, title;
    try {
      const api1 = `https://api.agatz.xyz/api/instagram?url=${encodeURIComponent(igUrl)}`;
      const res1 = await axios.get(api1);
      
      if (res1.data?.status === 200 && res1.data?.data?.videoLinks?.length > 0) {
        const videoData = res1.data.data;
        title = videoData.title || "Instagram Video";
        // Get HD quality if available, otherwise take the first one
        const hdVideo = videoData.videoLinks.find(v => v.quality.includes("download ("));
        videoUrl = hdVideo?.url || videoData.videoLinks[0].url;
        quality = hdVideo?.quality || videoData.videoLinks[0].quality;
      }
    } catch (e) {
      console.log("First API failed, trying backup...");
    }

    // If first API failed, try the second API (bk9.fun)
    if (!videoUrl) {
      try {
        const api2 = `https://bk9.fun/download/instagram?url=${encodeURIComponent(igUrl)}`;
        const res2 = await axios.get(api2);
        
        if (res2.data?.status && res2.data?.BK9?.[0]?.url) {
          videoUrl = res2.data.BK9[0].url;
          quality = "HD";
          title = "Instagram Video";
        }
      } catch (e) {
        console.log("Second API also failed");
      }
    }

    if (!videoUrl) {
      return reply('❌ Failed to download video. Please try again later or check the URL.');
    }

    await reply('```Downloading video... Please wait.📥```');

    // Download the video
    const videoResponse = await axios.get(videoUrl, { responseType: 'arraybuffer' });
    if (!videoResponse.data) {
      return reply('❌ Failed to download the video. Please try again later.');
    }

    const videoBuffer = Buffer.from(videoResponse.data, 'binary');

    await conn.sendMessage(from, {
      video: videoBuffer,
      caption: `📥 *Instagram Video*\n\n` +
        `🔖 *Title*: ${title}\n` +
        `📏 *Quality*: ${quality}\n\n` +
        `> © Powered By JawadTechXD 🔪`,
    }, { quoted: mek });

    await conn.sendMessage(from, { react: { text: '✅', key: m.key } });
  } catch (error) {
    console.error('Error downloading video:', error);
    reply('❌ Unable to download the video. Please try again later.');
    await conn.sendMessage(from, { react: { text: '❌', key: m.key } });
  }
});


cmd({
  pattern: "ig2",
  alias: ["insta2", "igdl2", "instagram2"],
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
