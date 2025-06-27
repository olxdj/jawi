const axios = require("axios");
const FormData = require("form-data");
const fs = require("fs");
const os = require("os");
const path = require("path");
const { cmd } = require("../command");
const converter = require("../data/converter");

cmd({
  pattern: "videourl",
  alias: ["vurl", "uploadvideo", "url2"],
  react: "🎥",
  desc: "Convert any media (audio/voice/video) to real .mp4 video URL",
  category: "utility",
  use: ".videourl [reply to media]",
  filename: __filename
}, async (client, message, args, { reply }) => {
  try {
    const quotedMsg = message.quoted;
    if (!quotedMsg || !quotedMsg.mimetype) {
      throw "⚠️ Please reply to an image, audio, or video message.";
    }

    const mimeType = quotedMsg.mimetype;
    const buffer = await quotedMsg.download();
    const isAudio = mimeType.includes("audio");
    const isVideo = mimeType.includes("video");

    let finalBuffer;
    let fileName;
    const ext = isAudio ? 'mp3' : isVideo ? 'mp4' : 'bin';

    if (isAudio) {
      // Convert audio to real video
      finalBuffer = await converter.toVideo(buffer, ext);
      fileName = `converted_${Date.now()}.mp4`;
    } else if (isVideo) {
      finalBuffer = buffer;
      fileName = `video_${Date.now()}.mp4`;
    } else {
      throw "❌ Only audio and video files are supported.";
    }

    const filePath = path.join(os.tmpdir(), fileName);
    fs.writeFileSync(filePath, finalBuffer);

    const form = new FormData();
    form.append("fileToUpload", fs.createReadStream(filePath), fileName);
    form.append("reqtype", "fileupload");

    const res = await axios.post("https://catbox.moe/user/api.php", form, {
      headers: form.getHeaders(),
    });

    fs.unlinkSync(filePath);

    if (!res.data || !res.data.startsWith("https://")) {
      throw "❌ Upload failed.";
    }

    const url = res.data;

    await reply(
      `🎬 *Video Uploaded Successfully!*\n\n` +
      `📦 *Size:* ${formatBytes(finalBuffer.length)}\n` +
      `🌐 *URL:* ${url}\n\n` +
      `> © Uploaded by JawadTechX 💜`
    );

  } catch (error) {
    console.error(error);
    await reply(`❌ Error: ${error.message || error}`);
  }
});

// 🔧 Helper function to format file size
function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}
