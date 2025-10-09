const { cmd } = require('../command');
const axios = require("axios");
const fs = require('fs');
const path = require("path");
const { promisify } = require('util');
const stream = require("stream");
const pipeline = promisify(stream.pipeline);
const yts = require('yt-search');

cmd({
  pattern: "song2",
  alias: ['play3', "music"],
  react: '🎶',
  desc: "Download YouTube song",
  category: "media",
  use: ".song <song name or YouTube link>",
  filename: __filename
}, async (message, match, mek, { from, sender, reply, q }) => {
  try {
    if (!q) return reply("Please provide a song name or YouTube link.");

    let song;
    if (q.includes("youtube.com") || q.includes('youtu.be')) {
      song = {
        url: q,
        title: "YouTube Song",
        thumbnail: ''
      };
    } else {
      const search = await yts(q);
      if (!search || !search.videos.length) return reply("No results found.");
      song = search.videos[0];
    }

    const apiUrl = "https://izumiiiiiiii.dpdns.org/downloader/youtube?url=" + 
                   encodeURIComponent(song.url) + "&format=mp3";
    
    const apiResponse = await axios.get(apiUrl, {
      timeout: 30000,
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
      }
    });

    if (!apiResponse.data?.result?.download) {
      throw new Error("API failed to return valid download link.");
    }

    const downloadUrl = apiResponse.data.result.download;
    const tempDir = path.join(__dirname, "temp");
    
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    const filePath = path.join(tempDir, "song_" + Date.now() + ".mp3");

    try {
      const audioResponse = await axios({
        method: "GET",
        url: downloadUrl,
        responseType: "stream",
        timeout: 120000,
        headers: {
          'User-Agent': "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
        }
      });

      await pipeline(audioResponse.data, fs.createWriteStream(filePath));
      const audioBuffer = fs.readFileSync(filePath);

      await message.sendMessage(from, {
        audio: audioBuffer,
        mimetype: "audio/mpeg",
        fileName: song.title.replace(/[^\w\s]/gi, '') + ".mp3",
        contextInfo: {
          externalAdReply: {
            title: song.title.length > 25 ? `${song.title.substring(0, 22)}...` : song.title,
            body: "⇆  ||◁◁ㅤ ❚❚ ㅤ▷▷||ㅤ ⇆",
            mediaType: 1,
            thumbnailUrl: song.thumbnail.replace('default.jpg', 'hqdefault.jpg'),
            showAdAttribution: true,
            renderLargerThumbnail: true
          }
        }
      }, { quoted: mek });

    } finally {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

  } catch (error) {
    console.error("Error:", error);
    reply("❌ Download failed. Please try another song.");
  }
});
