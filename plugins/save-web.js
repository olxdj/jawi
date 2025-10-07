const axios = require("axios");
const fs = require('fs');
const os = require('os');
const path = require("path");
const { cmd } = require("../command");

cmd({
  pattern: "saveweb",
  alias: ["webzip", "websave", "web", "sitezip", "downloadweb"],
  react: '🌐',
  desc: "Save website as ZIP file",
  category: "utility",
  use: ".saveweb [website_url]",
  filename: __filename
}, async (client, message, context) => {
  try {
    const { reply, quoted, args } = context;
    
    // Get URL from different sources
    let websiteUrl = '';
    
    if (quoted && quoted.text) {
      websiteUrl = quoted.text.trim();
    } else if (args && args.trim() !== '') {
      websiteUrl = args.trim();
    } else {
      return reply("❌ Please provide a website URL\n\n*Usage:*\n`.saveweb https://example.com`\nOr reply `.saveweb` to a message containing URL");
    }

    // Clean URL
    websiteUrl = websiteUrl.replace(/\n/g, '').trim();
    
    // Add protocol if missing
    if (!websiteUrl.startsWith('http')) {
      websiteUrl = 'https://' + websiteUrl;
    }

    // Basic URL validation
    if (!websiteUrl.includes('.') || websiteUrl.length < 5) {
      return reply("❌ Invalid URL. Please provide a valid website address.");
    }

    await reply(`🔄 Processing: ${websiteUrl}\nThis may take a moment...`);

    // API call
    const apiUrl = `https://api.hanggts.xyz/tools/saveweb2zip?url=${encodeURIComponent(websiteUrl)}`;
    const response = await axios.get(apiUrl, { timeout: 120000 });
    
    if (!response.data.status || !response.data.result?.downloadUrl) {
      throw new Error("Failed to generate download link");
    }

    const { downloadUrl, copiedFilesAmount } = response.data.result;

    // Download ZIP
    const zipResponse = await axios.get(downloadUrl, { 
      responseType: 'arraybuffer', 
      timeout: 60000 
    });

    const tempPath = path.join(os.tmpdir(), `web_${Date.now()}.zip`);
    fs.writeFileSync(tempPath, zipResponse.data);

    await client.sendMessage(message.chat, {
      document: fs.readFileSync(tempPath),
      fileName: `website_${websiteUrl.replace(/[^a-zA-Z0-9]/g, '_')}.zip`,
      mimetype: 'application/zip',
      caption: `🌐 Website ZIP\n📁 ${websiteUrl}\n📊 Files: ${copiedFilesAmount || 'N/A'}\n👨‍💻 Powered by JawadTechXD`
    }, { quoted: message });

    fs.unlinkSync(tempPath);

  } catch (error) {
    console.error('Error:', error);
    await reply(`❌ Error: ${error.message || 'Failed to download website'}`);
  }
});
