const axios = require("axios");
const FormData = require('form-data');
const fs = require('fs');
const os = require('os');
const path = require("path");
const { cmd } = require("../command");

cmd({
  pattern: "find",
  alias: ["whatmusic", "songfind", "musicid"],
  react: '🎵',
  desc: "Identify song from audio",
  category: "utility",
  use: ".find [reply to audio]",
  filename: __filename
}, async (client, message, { reply, quoted }) => {
  try {
    // Send processing reaction
    await client.sendMessage(message.chat, { 
      react: { text: '⏳', key: message.key } 
    });

    // Check if quoted message exists and has media
    const quotedMsg = quoted || message;
    const mimeType = (quotedMsg.msg || quotedMsg).mimetype || '';
    
    if (!mimeType || (!mimeType.startsWith('audio/') && !mimeType.startsWith('video/'))) {
      return reply("❌ Please reply to an audio or video message!");
    }

    // Download the media
    const mediaBuffer = await quotedMsg.download();
    
    // Create temp file
    const tempFilePath = path.join(os.tmpdir(), `find_audio_${Date.now()}.mp3`);
    fs.writeFileSync(tempFilePath, mediaBuffer);

    // Upload to Catbox
    const form = new FormData();
    form.append('fileToUpload', fs.createReadStream(tempFilePath), 'audio.mp3');
    form.append('reqtype', 'fileupload');

    const uploadResponse = await axios.post("https://catbox.moe/user/api.php", form, {
      headers: form.getHeaders(),
      timeout: 30000
    });

    const audioUrl = uploadResponse.data;
    fs.unlinkSync(tempFilePath); // Clean up temp file

    if (!audioUrl) {
      throw new Error("Failed to upload audio to Catbox");
    }

    // Identify song using API
    const encodedUrl = encodeURIComponent(audioUrl);
    const apiUrl = `https://api.zenzxz.my.id/tools/whatmusic?url=${encodedUrl}`;
    
    const response = await axios.get(apiUrl, { 
      timeout: 45000 
    });

    const result = response.data;

    if (!result.status || !result.title) {
      throw new Error("No song identified from this audio");
    }

    // Send success reaction
    await client.sendMessage(message.chat, { 
      react: { text: '✅', key: message.key } 
    });

    // Format response with styled caption
    const caption = `━━━〔 *SONG IDENTIFIED* 〕━━━⊷\n`
      + `┃🎵 *Title:* ${result.title}\n`
      + `┃🎤 *Artist:* ${result.artists || 'Unknown'}\n`
      + `┃👨‍💻 *API By:* ${result.creator || 'ZenzzXD'}\n`
      + `╰━━━⪼\n\n`
      + `🔹 *Powered by JawadTechX*`;

    await reply(caption);

  } catch (error) {
    console.error('Song Identification Error:', error);
    
    // Send error reaction
    await client.sendMessage(message.chat, { 
      react: { text: '❌', key: message.key } 
    });

    await reply(`❌ Error: ${error.message || "Failed to identify song. The audio might be too short or unclear."}`);
  }
});
