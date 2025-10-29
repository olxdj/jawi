const axios = require("axios");
const FormData = require('form-data');
const fs = require('fs');
const os = require('os');
const path = require("path");
const { cmd } = require("../command");

cmd({
  pattern: "findsong",
  alias: ["whatsong", "songfinder", "find"],
  react: '🎵',
  desc: "Identify song from audio file",
  category: "utility",
  use: ".findsong [reply to audio/video]",
  filename: __filename
}, async (client, message, { reply, quoted }) => {
  try {
    // Check if quoted message exists and has media
    const quotedMsg = quoted || message;
    const mimeType = (quotedMsg.msg || quotedMsg).mimetype || '';
    
    if (!mimeType || (!mimeType.startsWith('audio/') && !mimeType.startsWith('video/'))) {
      return reply("Please reply to an audio or video file (MP3/MP4)");
    }

    // Download the media
    const mediaBuffer = await quotedMsg.download();
    
    // Get file extension based on mime type
    let extension = '';
    if (mimeType.includes('audio/mpeg')) extension = '.mp3';
    else if (mimeType.includes('video/mp4')) extension = '.mp4';
    else if (mimeType.includes('audio/')) extension = '.mp3';
    else {
      return reply("Unsupported format. Please use MP3 or MP4");
    }

    // Create temp file
    const tempFilePath = path.join(os.tmpdir(), `song_input_${Date.now()}${extension}`);
    fs.writeFileSync(tempFilePath, mediaBuffer);

    // Upload to Catbox
    const form = new FormData();
    form.append('fileToUpload', fs.createReadStream(tempFilePath), `audio${extension}`);
    form.append('reqtype', 'fileupload');

    const uploadResponse = await axios.post("https://catbox.moe/user/api.php", form, {
      headers: form.getHeaders(),
      timeout: 30000
    });

    const audioUrl = uploadResponse.data;
    fs.unlinkSync(tempFilePath); // Clean up temp file

    if (!audioUrl) {
      throw "Failed to upload audio to Catbox";
    }

    // Identify song using API
    const apiUrl = `https://api.zenzxz.my.id/api/tools/whatmusic?url=${encodeURIComponent(audioUrl)}`;
    const response = await axios.get(apiUrl, { 
      timeout: 30000
    });

    const result = response.data;

    if (!result.success || !result.data) {
      throw "Could not identify the song. Please try with a clearer audio sample.";
    }

    const { title, artists } = result.data;

    // Create stylish box response
    const songInfo = `
╭──「 🎵 *MUSIC FINDER* 」
│
│ • *Title:* ${title || 'Unknown'}
│ • *Artist:* ${artists || 'Unknown'}
│
│ *Powered by KHAN-MD*
╰─────────────────
    `.trim();

    await reply(songInfo);

  } catch (error) {
    console.error('Song Finder Error:', error);
    
    let errorMsg = "❌ Error: ";
    if (error.response?.status === 404) {
      errorMsg += "Song not found. Please try with a different audio sample.";
    } else if (error.code === 'ECONNABORTED') {
      errorMsg += "Request timeout. Please try again.";
    } else {
      errorMsg += error.message || "Failed to identify song. The audio might be too short or unclear.";
    }
    
    await reply(errorMsg);
  }
});
