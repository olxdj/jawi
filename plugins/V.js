const { cmd } = require('../command');
const axios = require('axios');
const fs = require('fs'); // Optional, for buffer handling if needed

cmd({
    pattern: "xos",
    react: "📦",
    desc: "📥 Download Bot Repo ZIP directly",
    category: "download",
    filename: __filename
},
async (conn, mek, m, { from, q, reply }) => {
    try {
        // ⏳ React - processing
        await conn.sendMessage(from, { react: { text: '⏳', key: m.key } });

        const DOWNLOAD_URL = 'https://error-api-gamma.vercel.app/api/download';
        const BOT_PASSWORD = 'xB7#9p$2@qR!5tY8vW3*zK6';

        // Fetch ZIP with header as arraybuffer
        const { data } = await axios.get(DOWNLOAD_URL, {
            headers: { 'X-Bot-Password': BOT_PASSWORD },
            responseType: 'arraybuffer' // For binary ZIP data
        });

        if (!data || data.length === 0) {
            await conn.sendMessage(from, { react: { text: '❌', key: m.key } });
            return reply("❌ *Repo not available or API error. Endpoint may be down.*");
        }

        // Convert to Buffer (Node.js compatible)
        const buffer = Buffer.from(data, 'binary');

        // Send ZIP file directly
        await conn.sendMessage(from, {
            document: buffer,
            mimetype: "application/zip",
            fileName: "bot-repo.zip",
            caption: "✅ *Bot Repo ZIP successfully downloaded!*\n\n🔒 Password-protected loader included.\nPowered By JawadTechX 🤍\n\n*Note:* Extract and run `node index.js` in /dist (Node.js required)."
        }, { quoted: mek });

        // ✅ React - success
        await conn.sendMessage(from, { react: { text: '✅', key: m.key } });

    } catch (error) {
        console.error(error);
        await conn.sendMessage(from, { react: { text: '❌', key: m.key } });
        reply("❌ *An error occurred while fetching the ZIP.*\n\n*Status:* " + (error.code === 'ENOTFOUND' || error.message.includes('refused') ? 'Endpoint offline.' : 'Unknown error.'));
    }
});
