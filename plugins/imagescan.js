const axios = require("axios");
const FormData = require('form-data');
const fs = require('fs');
const os = require('os');
const path = require("path");
const { cmd } = require("../command");

cmd({
  pattern: "imgscan",
  alias: ["scanimg", "imagescan", "analyzeimg"],
  react: '🔍',
  desc: "Scan and analyze images using AI",
  category: "utility",
  use: ".imgscan [reply to image]",
  filename: __filename
}, async (client, message, { reply, quoted }) => {
  try {
    // Check if quoted message exists and has media
    const quotedMsg = quoted || message;
    const mimeType = (quotedMsg.msg || quotedMsg).mimetype || '';
    
    if (!mimeType || !mimeType.startsWith('image/')) {
      return reply("Please reply to an image file (JPEG/PNG)");
    }

    // Download the media
    const mediaBuffer = await quotedMsg.download();
    
    // Get file extension based on mime type
    let extension = '';
    if (mimeType.includes('image/jpeg')) extension = '.jpg';
    else if (mimeType.includes('image/png')) extension = '.png';
    else {
      return reply("Unsupported image format. Please use JPEG or PNG");
    }

    const tempFilePath = path.join(os.tmpdir(), `imgscan_${Date.now()}${extension}`);
    fs.writeFileSync(tempFilePath, mediaBuffer);

    // Upload to ImgBB
    const form = new FormData();
    form.append('image', fs.createReadStream(tempFilePath));
    
    const uploadResponse = await axios.post(
      "https://api.imgbb.com/1/upload?key=f07b8d2d9f0593bc853369f251a839de",
      form,
      { headers: form.getHeaders() }
    );

    fs.unlinkSync(tempFilePath); // Clean up temp file

    if (!uploadResponse.data || !uploadResponse.data.data || !uploadResponse.data.data.url) {
      throw "Failed to upload image to ImgBB";
    }

    const imageUrl = uploadResponse.data.data.url;

    // Scan the image using the API
    const scanUrl = `https://apis.davidcyriltech.my.id/imgscan?url=${encodeURIComponent(imageUrl)}`;
    const scanResponse = await axios.get(scanUrl);

    if (!scanResponse.data.success) {
      throw scanResponse.data.message || "Failed to analyze image";
    }

    // Simplified response with only analysis results
    await reply(
      `🔍 *Image Analysis Results*\n\n` +
      `${scanResponse.data.result}\n\n` +
      `> © Powered by JawadTechX 💜`
    );

  } catch (error) {
    console.error('Image Scan Error:', error);
    await reply(`❌ Error: ${error.message || error}`);
  }
});
