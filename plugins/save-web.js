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
}, async (client, message, { args, reply, quoted }) => {
  try {
    let websiteUrl = args;

    // Check if URL is provided in quoted message or args
    if (quoted && quoted.text) {
      websiteUrl = quoted.text;
    }

    // Validate URL
    if (!websiteUrl) {
      return reply("Please provide a website URL\nExample: .saveweb https://example.com");
    }

    // Add https:// if no protocol is specified
    if (!websiteUrl.startsWith('http://') && !websiteUrl.startsWith('https://')) {
      websiteUrl = 'https://' + websiteUrl;
    }

    // Validate URL format
    try {
      new URL(websiteUrl);
    } catch (error) {
      return reply("Invalid URL format. Please provide a valid website URL\nExample: .saveweb https://example.com");
    }

    // Show processing message
    await reply("🔄 Downloading website content... This may take a moment.");

    // Call the website to ZIP API
    const apiUrl = `https://api.hanggts.xyz/tools/saveweb2zip?url=${encodeURIComponent(websiteUrl)}`;
    const response = await axios.get(apiUrl, { 
      timeout: 120000 // 2 minute timeout for website processing
    });

    if (!response.data.status || !response.data.result) {
      throw "Failed to process website";
    }

    const result = response.data.result;

    // Check for errors
    if (result.error && result.error.text) {
      throw `Website processing error: ${result.error.text}`;
    }

    if (!result.downloadUrl) {
      throw "No download URL received from API";
    }

    // Download the ZIP file
    await reply(`📁 Website processed successfully!\n📊 Files copied: ${result.copiedFilesAmount || 'Unknown'}\n⬇️ Downloading ZIP file...`);

    const zipResponse = await axios.get(result.downloadUrl, {
      responseType: 'arraybuffer',
      timeout: 60000
    });

    // Save ZIP file temporarily
    const zipFileName = `website_${Date.now()}.zip`;
    const zipFilePath = path.join(os.tmpdir(), zipFileName);
    fs.writeFileSync(zipFilePath, zipResponse.data);

    // Get file size
    const stats = fs.statSync(zipFilePath);
    const fileSize = (stats.size / (1024 * 1024)).toFixed(2); // Size in MB

    // Send the ZIP file
    await client.sendMessage(message.chat, {
      document: fs.readFileSync(zipFilePath),
      fileName: `website_backup_${new URL(websiteUrl).hostname}_${Date.now()}.zip`,
      mimetype: 'application/zip',
      caption: `🌐 *Website Saved as ZIP*

📋 *Website:* ${result.url}
📊 *Files Copied:* ${result.copiedFilesAmount || 'Unknown'}
📦 *File Size:* ${fileSize} MB
👨‍💻 *Powered By:* JawadTechXD

✅ Successfully downloaded`
    }, { quoted: message });

    // Clean up
    fs.unlinkSync(zipFilePath);

  } catch (error) {
    console.error('Save Web Error:', error);
    
    let errorMessage = "Failed to save website";
    
    if (error.response) {
      if (error.response.status === 404) {
        errorMessage = "Website not found or inaccessible";
      } else if (error.response.status === 500) {
        errorMessage = "Server error while processing website";
      } else if (error.response.status === 403) {
        errorMessage = "Access to website denied (robots.txt or permissions)";
      }
    } else if (error.code === 'ECONNABORTED') {
      errorMessage = "Request timeout - website might be too large or slow to respond";
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    await reply(`❌ Error: ${errorMessage}\n\nPlease check:\n• Website URL is correct\n• Website is accessible\n• Website allows downloading`);
  }
});
