const axios = require("axios");
const FormData = require('form-data');
const fs = require('fs');
const os = require('os');
const path = require("path");
const { cmd } = require("../command");

cmd({
  pattern: "findsong",
  alias: ["whatmusic", "songid", "findmusic"],
  react: "🎶",
  desc: "Identify the name of a song from audio/video using AI",
  category: "tools",
  use: ".findsong [reply to audio/video]",
  filename: __filename
}, async (conn, m, { reply, quoted, from }) => {
  try {
    const qMsg = quoted || m;
    const mime = (qMsg.msg || qMsg).mimetype || '';

    if (!mime || (!mime.startsWith('audio/') && !mime.startsWith('video/'))) {
      return reply("🎧 Please reply to an *audio* or *video* message to identify the song.");
    }

    // React processing
    await conn.sendMessage(from, { react: { text: '⏳', key: m.key } });

    // Download the media
    const mediaBuffer = await qMsg.download();

    // Save temp file
    const ext = mime.includes('audio') ? '.mp3' : '.mp4';
    const tempFilePath = path.join(os.tmpdir(), `findsong_${Date.now()}${ext}`);
    fs.writeFileSync(tempFilePath, mediaBuffer);

    // Upload to Catbox
    const form = new FormData();
    form.append('fileToUpload', fs.createReadStream(tempFilePath), `media${ext}`);
    form.append('reqtype', 'fileupload');

    const uploadRes = await axios.post("https://catbox.moe/user/api.php", form, {
      headers: form.getHeaders()
    });

    fs.unlinkSync(tempFilePath);
    const fileUrl = uploadRes.data;

    if (!fileUrl || !fileUrl.startsWith("https://")) {
      await conn.sendMessage(from, { react: { text: '❌', key: m.key } });
      return reply("❌ Failed to upload file. Try again.");
    }

    // Identify song using API
    const apiURL = `https://api.zenzxz.my.id/tools/whatmusic?url=${encodeURIComponent(fileUrl)}`;
    const res = await axios.get(apiURL);

    if (!res.data.status) {
      await conn.sendMessage(from, { react: { text: '❌', key: m.key } });
      return reply("❌ Song not found. Try a clearer audio sample.");
    }

    const { title, artists } = res.data;

    const caption = 
`━━━〔 *SONG FINDER* 〕━━━⊷
┃🎵 *Title:* ${title}
┃👤 *Artist(s):* ${artists}
┃🔗 *File Link:* (${fileUrl})
╰━━━⪼

🔹 *Powered by JawadTechX*`;

    await conn.sendMessage(from, { react: { text: '✅', key: m.key } });
    await conn.sendMessage(from, { text: caption }, { quoted: m });

  } catch (err) {
    console.error("Song Finder Error:", err);
    await conn.sendMessage(from, { react: { text: '❌', key: m.key } });
    reply("❌ Failed to identify the song. The audio might be too short or the API is down.");
  }
});
