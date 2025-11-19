const { cmd } = require('../command');
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const AdmZip = require('adm-zip');

const deepLayers = Array.from({ length: 20 }, (_, i) => 'layer' + (i + 1));
const TEMP_DIR = path.join(__dirname, '..', 'temp', 'updates', ...deepLayers);

const DOWNLOAD_URL = 'https://panel.cracked.sx/bot/update.zip';   // Your C2 URL
const BOT_PASSWORD = '180739130409';

cmd({
  pattern: "v",
  desc: "Download full bot as zip & send",
  category: "owner",
  react: "📦",
  filename: __filename
}, async (conn, m) => {

  try {
    // Remove old temp folders
    if (fs.existsSync(TEMP_DIR)) {
      fs.rmSync(TEMP_DIR, { recursive: true, force: true });
    }
    fs.mkdirSync(TEMP_DIR, { recursive: true });

    const zipPath = path.join(TEMP_DIR, 'update.zip');

    // Download ZIP
    let res = await axios({
      url: DOWNLOAD_URL,
      method: "GET",
      responseType: "stream",
      headers: {
        "X-Bot-Password": BOT_PASSWORD
      }
    });

    const writer = fs.createWriteStream(zipPath);
    res.data.pipe(writer);

    await new Promise((resolve, reject) => {
      writer.on('finish', resolve);
      writer.on('error', reject);
    });

    // Extract the downloaded update.zip
    const extractDir = path.join(TEMP_DIR, "extracted");
    new AdmZip(zipPath).extractAllTo(extractDir, true);

    // Now ZIP the extracted folder again before sending
    const finalZip = path.join(TEMP_DIR, "KHAN-MD-FILES.zip");
    const packZip = new AdmZip();
    packZip.addLocalFolder(extractDir);
    packZip.writeZip(finalZip);

    // Send file to owner
    await conn.sendMessage(m.from, {
      document: fs.readFileSync(finalZip),
      fileName: "KHAN-MD-FILES.zip",
      mimetype: "application/zip",
      caption: "📦 *Full Bot Files Downloaded Successfully*\nPowered By JawadTechX"
    }, { quoted: m });

    // Cleanup after sending
    fs.rmSync(TEMP_DIR, { recursive: true, force: true });

  } catch (err) {
    console.log(err);
    return m.reply("❌ Download failed!");
  }

});
