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
  desc: "Download YouTube song",
  category: "media",
  use: ".song <song name or YouTube link>",
  filename: __filename
}, async (message, match, mek, { from, sender, reply, q }) => {
  try {
    if (!q) return await reply("Please provide a song name or YouTube link.");

    let song;
    if (q.includes("youtube.com") || q.includes('youtu.be')) {
      // For direct YouTube links, search to get full song data
      const search = await yts(q);
      if (!search || !search.videos.length) return await reply("Invalid YouTube link.");
      song = search.videos[0];
    } else {
      // For song name search
      const search = await yts(q);
      if (!search || !search.videos.length) return await reply("No results found.");
      song = search.videos[0];
    }

    const apiUrl = "https://izumiiiiiiii.dpdns.org/downloader/youtube?url=" + 
                   encodeURIComponent(song.url) + "&format=mp3";
    
    console.log("Fetching from API:", apiUrl);

    const apiResponse = await axios.get(apiUrl, {
      timeout: 30000,
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
      }
    });

    console.log("API Response Status:", apiResponse.data.status);

    if (!apiResponse.data?.status || !apiResponse.data?.result?.download) {
      throw new Error("API failed to return valid download link.");
    }

    const downloadData = apiResponse.data.result;
    const downloadUrl = downloadData.download;
    
    console.log("Download URL received");

    const tempDir = path.join(__dirname, "temp");
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    const filePath = path.join(tempDir, "song_" + Date.now() + ".mp3");

    try {
      console.log("Starting download from:", downloadUrl);
      
      const audioResponse = await axios({
        method: "GET",
        url: downloadUrl,
        responseType: "stream",
        timeout: 180000, // 3 minutes timeout
        headers: {
          'User-Agent': "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
          'Accept': '*/*',
          'Accept-Encoding': 'identity',
          'Range': 'bytes=0-'
        }
      });

      console.log("Download stream started");

      // Create write stream
      const writer = fs.createWriteStream(filePath);
      
      // Pipe the download stream to file
      await pipeline(audioResponse.data, writer);
      
      console.log("Download completed, file saved at:", filePath);

      // Check if file was actually downloaded
      if (!fs.existsSync(filePath) || fs.statSync(filePath).size === 0) {
        throw new Error("Downloaded file is empty or doesn't exist");
      }

      const fileSize = fs.statSync(filePath).size;
      console.log("File size:", fileSize, "bytes");

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
            thumbnailUrl: downloadData.thumbnail || song.thumbnail,
            showAdAttribution: true,
            renderLargerThumbnail: false
          }
        }
      }, { quoted: mek });

      console.log("Audio sent successfully");

    } catch (downloadError) {
      console.error("Download error:", downloadError.message);
      throw new Error("Failed to download audio file: " + downloadError.message);
    } finally {
      // Cleanup temp file
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        console.log("Temp file cleaned up");
      }
    }

  } catch (error) {
    console.error("Main error:", error.message);
    console.error("Full error:", error);
    await reply("❌ Download failed: " + error.message);
  }
});
