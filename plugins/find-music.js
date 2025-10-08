const axios = require("axios");
const yts = require("yt-search");
const FormData = require('form-data');
const fs = require('fs');
const os = require('os');
const path = require("path");
const { cmd } = require("../command"); // Add this line to import cmd

cmd({
  pattern: "whatmusic",
  alias: ["find", "findmusic", "audioscan"],
  react: '🎵',
  desc: "Identify music from audio files",
  category: "tools",
  use: ".whatmusic [reply to audio/video]",
  filename: __filename
}, async (conn, message, m, { reply, mek }) => {
  try {
    const from = m.chat;
    
    // Send processing reaction
    await conn.sendMessage(from, { react: { text: '⏳', key: m.key } });

    // Check if quoted message exists and has media
    const quotedMsg = message.quoted ? message.quoted : message;
    const mimeType = (quotedMsg.msg || quotedMsg).mimetype || '';
    
    // Check if it's audio or video
    const isAudio = mimeType.startsWith('audio/');
    const isVideo = mimeType.startsWith('video/');
    
    if (!isAudio && !isVideo) {
      await conn.sendMessage(from, { react: { text: '❌', key: m.key } });
      return reply("Please reply to an audio or video file");
    }

    // Download the media
    const mediaBuffer = await quotedMsg.download();
    
    // Get file extension based on mime type
    let extension = '.mp3';
    if (mimeType.includes('audio/mpeg')) extension = '.mp3';
    else if (mimeType.includes('audio/mp4')) extension = '.m4a';
    else if (mimeType.includes('audio/ogg')) extension = '.ogg';
    else if (mimeType.includes('video/mp4')) extension = '.mp4';
    else if (mimeType.includes('video/quicktime')) extension = '.mov';
    
    const tempFilePath = path.join(os.tmpdir(), `audio_${Date.now()}${extension}`);
    fs.writeFileSync(tempFilePath, mediaBuffer);

    // Upload to Catbox
    const form = new FormData();
    form.append('fileToUpload', fs.createReadStream(tempFilePath), `audio${extension}`);
    form.append('reqtype', 'fileupload');

    const uploadResponse = await axios.post("https://catbox.moe/user/api.php", form, {
      headers: form.getHeaders()
    });

    const mediaUrl = uploadResponse.data;
    fs.unlinkSync(tempFilePath); // Clean up temp file

    if (!mediaUrl) {
      throw "Failed to upload media to Catbox";
    }

    // Identify music using the API
    const apiUrl = `https://api.zenzxz.my.id/tools/whatmusic?url=${encodeURIComponent(mediaUrl)}`;
    const response = await axios.get(apiUrl);

    if (!response.data || !response.data.status) {
      await conn.sendMessage(from, { react: { text: '❌', key: m.key } });
      return reply("❌ Could not identify the music. Please try with a clearer audio sample.");
    }

    const musicData = response.data;
    const title = musicData.title || 'Unknown';
    const artists = musicData.artists || 'Unknown';

    // Try to find more details on YouTube
    let ytResults = null;
    let thumbnail = null;
    
    try {
      const searchQuery = `${title} ${artists}`;
      const searchResults = await yts(searchQuery);
      
      if (searchResults && searchResults.videos && searchResults.videos.length > 0) {
        ytResults = searchResults.videos[0];
        thumbnail = ytResults.thumbnail;
      }
    } catch (ytError) {
      console.log("YouTube search failed, using basic results");
    }

    let caption = `━━━〔 *MUSIC FINDER RESULTS* 〕━━━⊷\n`;
    caption += `┃🎵 *Title:* ${title}\n`;
    caption += `┃🎤 *Artist:* ${artists}\n`;
    
    // Add YouTube data if available
    if (ytResults) {
      caption += `┃⏱️ *Duration:* ${ytResults.timestamp || 'N/A'}\n`;
      caption += `┃👁️ *Views:* ${ytResults.views || 'N/A'}\n`;
      caption += `┃📅 *Uploaded:* ${ytResults.ago || 'N/A'}\n`;
      caption += `┃🔗 *YouTube:* ${ytResults.url || 'N/A'}\n`;
    }
    
    caption += `╰━━━⪼\n\n`;
    caption += `🔹 *Powered by JawadTechX*`;

    // Send success reaction
    await conn.sendMessage(from, { react: { text: '✅', key: m.key } });

    // Send message with thumbnail if available
    if (thumbnail && ytResults) {
      await conn.sendMessage(from, {
        image: { url: thumbnail },
        caption: caption
      });
    } else {
      await conn.sendMessage(from, {
        text: caption
      });
    }

  } catch (error) {
    console.error("WhatMusic Error:", error);
    await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
    reply(`❌ An error occurred: ${error.response?.data?.message || error.message || "Unknown error"}`);
  }
});
