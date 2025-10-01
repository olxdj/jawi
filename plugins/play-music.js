const { cmd } = require('../command');
const axios = require("axios");
const yts = require('yt-search');

cmd({
  pattern: "song",
  alias: ['play3', "music"],
  react: '🎶',
  desc: "Download YouTube song using KHAN-MD API",
  category: "main",
  use: ".song <song name or YouTube link>",
  filename: __filename
}, async (message, match, mek, { from, sender, reply, q }) => {
  try {
    if (!q) {
      return await reply("Please provide a song name or YouTube link.");
    }

    let song;
    if (q.includes("youtube.com") || q.includes('youtu.be')) {
      const search = await yts(q);
      if (!search || !search.videos.length) {
        return await reply("Invalid YouTube link.");
      }
      song = search.videos[0];
    } else {
      const search = await yts(q);
      if (!search || !search.videos.length) {
        return await reply("No results found.");
      }
      song = search.videos[0];
    }

    const apiUrl = "https://izumiiiiiiii.dpdns.org/downloader/youtube?url=" + encodeURIComponent(song.url) + "&format=mp3";
    
    const apiResponse = await axios.get(apiUrl, {
      timeout: 30000,
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
      }
    });

    if (!apiResponse.data || !apiResponse.data.result || !apiResponse.data.result.download) {
      throw new Error("KHAN-MD API failed to return a valid link.");
    }

    const downloadData = apiResponse.data.result;
    
    const audioResponse = await axios({
      method: "GET",
      url: downloadData.download,
      responseType: "stream",
      timeout: 120000,
      headers: {
        'User-Agent': "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
      }
    });

    const audioBuffer = await new Promise((resolve, reject) => {
      const chunks = [];
      audioResponse.data.on('data', chunk => chunks.push(chunk));
      audioResponse.data.on('end', () => resolve(Buffer.concat(chunks)));
      audioResponse.data.on('error', reject);
    });

    await message.sendMessage(from, {
      audio: audioBuffer,
      mimetype: "audio/mpeg",
      fileName: song.title.replace(/[^\w\s]/gi, '') + ".mp3",
      contextInfo: {
        externalAdReply: {
          title: song.title.length > 25 ? `${song.title.substring(0, 22)}...` : song.title,
          body: "⇆  ||◁◁ㅤ ❚❚ ㅤ▷▷||ㅤ ⇆",
          mediaType: 1,
          thumbnailUrl: song.thumbnail,
          showAdAttribution: true,
          renderLargerThumbnail: false
        }
      }
    }, { quoted: mek });

  } catch (error) {
    console.error("Error:", error);
    await reply("❌ Download failed. Please try another song.");
  }
});
