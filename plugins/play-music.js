const { cmd } = require('../command');
const axios = require("axios");
const fs = require('fs');
const path = require("path");
const { promisify } = require('util');
const stream = require("stream");
const pipeline = promisify(stream.pipeline);
const yts = require('yt-search');

cmd({
  pattern: "play3",
  alias: ['song', "music"],
  react: '🎶',
  desc: "Download YouTube song using Izumi API",
  category: "main",
  use: ".play <song name or YouTube link>",
  filename: __filename
}, async (conn, mek, m, { from, sender, reply, q }) => {
  try {
    if (!q) {
      return reply("Please provide a song name or YouTube link.");
    }

    let video;
    let title = "YouTube Song";
    let thumbnail = '';

    if (q.includes("youtube.com") || q.includes('youtu.be')) {
      video = { url: q, title: "YouTube Song" };
    } else {
      const search = await yts(q);
      if (!search || !search.videos.length) {
        return reply("No results found.");
      }
      video = search.videos[0];
      title = video.title;
      thumbnail = video.thumbnail;
    }

    const apiUrl = "https://izumiiiiiiii.dpdns.org/downloader/youtube?url=" 
      + encodeURIComponent(video.url) + "&format=mp3";

    const headers = {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
    };

    const res = await axios.get(apiUrl, { timeout: 30000, headers });
    if (!res.data || !res.data.result || !res.data.result.download) {
      throw new Error("Izumi API failed to return a valid link.");
    }

    const result = res.data.result;
    const tempDir = path.join(__dirname, "temp");
    if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });

    const filePath = path.join(tempDir, "song_" + Date.now() + ".mp3");

    try {
      const dlStream = await axios({
        method: "GET",
        url: result.download,
        responseType: "stream",
        timeout: 120000,
        headers
      });

      await pipeline(dlStream.data, fs.createWriteStream(filePath));

      const buffer = fs.readFileSync(filePath);

      await conn.sendMessage(from, {
        audio: buffer,
        mimetype: "audio/mpeg",
        fileName: title.replace(/[^\w\s]/gi, '') + ".mp3",
        contextInfo: {
          externalAdReply: {
            title: title.length > 25 ? title.substring(0, 22) + "..." : title,
            body: "THIS IS DARKZONE-MD BOT BABY",
            mediaType: 1,
            thumbnailUrl: thumbnail,
            sourceUrl: video.url,
            showAdAttribution: false,
            renderLargerThumbnail: false
          }
        }
      }, { quoted: mek });

    } catch (err) {
      console.error("Download error:", err);
      return reply("❌ Failed to download audio. Please try another song.");
    } finally {
      try {
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      } catch (cleanupErr) {
        console.error("Cleanup error:", cleanupErr);
      }
    }
  } catch (err) {
    console.error("Main error:", err);
    reply("❌ An error occurred. Please try again with a different song.");
  }
});
