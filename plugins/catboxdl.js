const { cmd } = require('../command');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

cmd({
    pattern: "download",
    alias: ["getfile", "filedl", "filedownload"],
    desc: "Download files from direct URLs",
    category: "utility",
    react: "📥",
    filename: __filename
}, async (conn, mek, m, { from, reply, text }) => {
    try {
        if (!text) return reply('Please provide a file URL\nExample: !download https://files.catbox.moe/yv8zy4m');

        const fileUrl = text.trim();

        // Validate URL
        if (!fileUrl.match(/^https?:\/\/.+/i)) {
            return reply('❌ Invalid URL! Please provide a valid http/https URL');
        }

        // Get filename from URL or generate one
        let filename = path.basename(fileUrl).split('?')[0];
        if (!filename || filename === path.basename('/')) {
            filename = `file_${Date.now()}`;
        }

        reply('⬇️ Downloading file... Please wait');

        // Download the file
        const response = await axios({
            method: 'get',
            url: fileUrl,
            responseType: 'stream'
        });

        // Check if the response is successful
        if (response.status !== 200) {
            return reply(`❌ Failed to download file. Server returned status ${response.status}`);
        }

        // Get content type and file size
        const contentType = response.headers['content-type'] || 'application/octet-stream';
        const contentLength = response.headers['content-length'];
        
        // Check file size limit (100MB)
        if (contentLength && parseInt(contentLength) > 100 * 1024 * 1024) {
            return reply('❌ File is too large! Maximum size is 100MB');
        }

        // Temporary file path
        const tempFilePath = path.join(__dirname, `../temp/${filename}`);

        // Write file to temp directory
        const writer = fs.createWriteStream(tempFilePath);
        response.data.pipe(writer);

        await new Promise((resolve, reject) => {
            writer.on('finish', resolve);
            writer.on('error', reject);
        });

        // Determine message type based on content type
        let messageOptions = {
            document: { url: fileUrl },
            fileName: filename,
            mimetype: contentType,
            caption: `Here is your downloaded file: ${filename}`
        };

        // If it's an image, send as image instead of document
        if (contentType.startsWith('image/')) {
            messageOptions = {
                image: { url: fileUrl },
                caption: `Here is your downloaded image`
            };
        }
        // Similarly, you can add conditions for video/audio

        // Send the file
        await conn.sendMessage(from, messageOptions, { quoted: mek });

        // Delete the temp file after sending
        fs.unlink(tempFilePath, (err) => {
            if (err) console.error('Error deleting temp file:', err);
        });

    } catch (error) {
        console.error('File Download Error:', error);
        reply('❌ Failed to download file. Error: ' + error.message);
    }
});
