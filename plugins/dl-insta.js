const axios = require("axios");
const { cmd } = require('../command');

cmd({
    pattern: "igdl",
    alias: ["instagram", "insta", "ig"],
    react: "⬇️",
    desc: "Download Instagram videos/reels",
    category: "download",
    use: ".igdl <Instagram URL>",
    filename: __filename
}, async (conn, mek, m, { from, reply, args, q }) => {
    try {
        const url = q || m.quoted?.text;
        if (!url || !url.includes("instagram.com")) {
            return reply("❌ Please provide/reply to an Instagram link");
        }

        // Show processing reaction
        await conn.sendMessage(from, { react: { text: '⏳', key: m.key } });

        // Fetch from API
        const apiUrl = `https://api-aswin-sparky.koyeb.app/api/downloader/igdl?url=${encodeURIComponent(url)}`;
        const response = await axios.get(apiUrl);

        if (!response.data?.status || !response.data.data?.length) {
            await conn.sendMessage(from, { react: { text: '❌', key: m.key } });
            return reply("Failed to fetch media. Invalid link or private content.");
        }

        // Send all media items
        for (const item of response.data.data) {
            await conn.sendMessage(from, {
                [item.type === 'video' ? 'video' : 'image']: { url: item.url },
                caption: `📶 *Instagram Downloader*\n\n` +
        `- ❤‍🩹 *Quality*: HD\n\n` +
        `> *© Powered by JawadTechXD*`
            }, { quoted: mek });
        }

        // Success reaction
        await conn.sendMessage(from, { react: { text: '✅', key: m.key } });

    } catch (error) {
        console.error('IGDL Error:', error);
        await conn.sendMessage(from, { react: { text: '❌', key: m.key } });
        reply("❌ Download failed. Try again later.");
    }
});

cmd({
  pattern: "igdl2",
  alias: ["instagram2", "ig2", "instadl2"],
  react: '📥',
  desc: "Download videos from Instagram (API v5)",
  category: "download",
  use: ".igdl5 <Instagram video URL>",
  filename: __filename
}, async (conn, mek, m, { from, reply, args }) => {
  try {
    const igUrl = args[0];
    if (!igUrl || !igUrl.includes("instagram.com")) {
      return reply('❌ Please provide a valid Instagram video URL.\n\nExample:\n.igdl5 https://instagram.com/reel/...');
    }

    await conn.sendMessage(from, { react: { text: '⏳', key: m.key } });

    const apiUrl = `https://jawad-tech.vercel.app/downloader?url=${encodeURIComponent(igUrl)}`;
    const response = await axios.get(apiUrl);

    const data = response.data;

    if (!data.status || !data.result || !Array.isArray(data.result)) {
      return reply('❌ Unable to fetch the video. Please check the URL and try again.');
    }

    const videoUrl = data.result[0];
    if (!videoUrl) return reply("❌ No video found in the response.");

    const metadata = data.metadata || {};
    const author = metadata.author || "Unknown";
    const caption = metadata.caption ? metadata.caption.slice(0, 300) + "..." : "No caption provided.";
    const likes = metadata.like || 0;
    const comments = metadata.comment || 0;

    await reply('Downloading Instagram video...Please wait.📥');

    await conn.sendMessage(from, {
      video: { url: videoUrl },
      caption: `📥 *Instagram Reel Downloader*\n👤 *Author:* ${author}\n💬 *Caption:* ${caption}\n❤️ *Likes:* ${likes} | 💭 *Comments:* ${comments}\n\n> Powered By JawadTechX 💜`
    }, { quoted: mek });

    await conn.sendMessage(from, { react: { text: '✅', key: m.key } });
  } catch (error) {
    console.error('IGDL5 Error:', error);
    reply('❌ Failed to download the Instagram video. Please try again later.');
    await conn.sendMessage(from, { react: { text: '❌', key: m.key } });
  }
});

cmd({
  pattern: "ig3",
 alias: ["instagram3", "igdl3", "instadl3"],  
  desc: "Download Instagram posts, reels, or stories",
  category: "downloader",
  react: "⚡",
  filename: __filename
}, async (client, message, args) => {
  try {
    if (!args[0]) return message.reply("💡 Example: .igdl <Instagram URL>");

    let url = args[0];
    let api = `https://jawad-tech.vercel.app/igdl?url=${encodeURIComponent(url)}`;
    let { data } = await axios.get(api);

    if (!data.status || !data.result.length)
      return message.reply("❌ No media found. Please check the URL.");

    for (let media of data.result) {
      await client.sendMessage(message.chat, {
        [media.contentType.startsWith("video") ? "video" : "image"]: { url: media.url },
        caption: `✨ *Instagram Downloader*\n🎬 Format: ${media.format}\n\n> Powered By JawadTechX 🤍`
      }, { quoted: message });
    }

  } catch (e) {
    console.error(e);
    message.reply("⚠️ Error: Unable to fetch Instagram media.");
  }
});
