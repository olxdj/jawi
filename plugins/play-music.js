const { cmd } = require('../command');
const axios = require("axios");
const fs = require('fs');
const path = require("path");
const { promisify } = require('util');
const stream = require("stream");
const pipeline = promisify(stream.pipeline);
const yts = require('yt-search');

cmd({
  pattern: "song",
  alias: ['play3', "music"],
  react: '🎶',
  desc: "Download YouTube song using KHAN-MD API",
  category: "main",
  use: ".song <song name or YouTube link>",
  filename: __filename
}, async (message, match, mek, {
  from,
  sender,
  reply,
  q
}) => {
  try {
    if (!q) {
      return await reply("Please provide a song name or YouTube link.");
    }
    let song;
    let songTitle = "YouTube Song";
    let thumbnail = '';
    if (q.includes("youtube.com") || q.includes('youtu.be')) {
      const search = await yts(q);
      if (!search || !search.videos.length) {
        return await reply("Invalid YouTube link.");
      }
      song = search.videos[0];
      songTitle = song.title;
      thumbnail = song.thumbnail;
    } else {
      const search = await yts(q);
      if (!search || !search.videos.length) {
        return await reply("No results found.");
      }
      song = search.videos[0];
      songTitle = song.title;
      thumbnail = song.thumbnail;
    }
    const apiUrl = "https://izumiiiiiiii.dpdns.org/downloader/youtube?url=" + encodeURIComponent(song.url) + "&format=mp3";
    const headers = {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
    };
    const apiResponse = await axios.get(apiUrl, {
      timeout: 30000,
      headers: headers
    });
    if (!apiResponse.data || !apiResponse.data.result || !apiResponse.data.result.download) {
      throw new Error("KHAN-MD API failed to return a valid link.");
    }
    const downloadData = apiResponse.data.result;
    const tempDir = path.join(__dirname, "temp");
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, {
        recursive: true
      });
    }
    const filePath = path.join(tempDir, "song_" + Date.now() + ".mp3");
    try {
      const audioResponse = await axios({
        'method': "GET",
        'url': downloadData.download,
        'responseType': "stream",
        'timeout': 120000,
        'headers': {
          'User-Agent': "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
        }
      });
      await pipeline(audioResponse.data, fs.createWriteStream(filePath));
      const audioBuffer = fs.readFileSync(filePath);
      await message.sendMessage(from, {
        'audio': audioBuffer,
        'mimetype': "audio/mpeg",
        'fileName': songTitle.replace(/[^\w\s]/gi, '') + ".mp3",
        'contextInfo': {
          'externalAdReply': {
            'title': songTitle.length > 25 ? `${songTitle.substring(0, 22)}...` : songTitle,
            'body': "⇆  ||◁◁ㅤ ❚❚ ㅤ▷▷||ㅤ ⇆",
            'mediaType': 1,
            'thumbnailUrl': downloadData.thumbnail || thumbnail,
            'showAdAttribution': true,
            'renderLargerThumbnail': false
          }
        }
      }, {
        quoted: mek
      });
    } catch (error) {
      console.error("Download error:", error);
      return await reply("❌ Failed to download audio. Please try another song.");
    } finally {
      try {
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      } catch (cleanupError) {
        console.error("Cleanup error:", cleanupError);
      }
    }
  } catch (error) {
    console.error("Main error:", error);
    await reply("❌ An error occurred. Please try again with a different song.");
  }
});
