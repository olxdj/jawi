const { cmd } = require('../command');
const axios = require('axios');

cmd({
    pattern: "botjs",
    alias: ["mrfrank", "indexjs"],
    react: "📄",
    desc: "📥 Download MrFrank Bot Index.js",
    category: "📁 Download",
    filename: __filename
},
async (conn, mek, m, { from, q, reply }) => {
    try {
        // ⏳ React - processing
        await conn.sendMessage(from, { react: { text: '⏳', key: m.key } });

        const DOWNLOAD_URL = 'https://mrfrankk-cdn.hf.space/mrfrank/index.js';

        // Fetch JS file as arraybuffer for binary send
        const { data } = await axios.get(DOWNLOAD_URL, {
            responseType: 'arraybuffer'
        });

        if (!data || data.length === 0) {
            await conn.sendMessage(from, { react: { text: '❌', key: m.key } });
            return reply("❌ *File not available or CDN error.*");
        }

        // Convert to Buffer
        const buffer = Buffer.from(data, 'binary');

        // Send JS file as document
        await conn.sendMessage(from, {
            document: buffer,
            mimetype: "application/javascript",
            fileName: "mrfrank-index.js",
            caption: "✅ *MrFrank Bot Index.js downloaded!*\n\n🔗 Source: https://mrfrankk-cdn.hf.space/mrfrank/index.js\n\n*Note:* This is the remote script for your Subzero bot. Run with Node.js after config setup.\nPowered By JawadTechX 🤍"
        }, { quoted: mek });

        // ✅ React - success
        await conn.sendMessage(from, { react: { text: '✅', key: m.key } });

    } catch (error) {
        console.error(error);
        await conn.sendMessage(from, { react: { text: '❌', key: m.key } });
        reply("❌ *An error occurred while fetching the JS file.*\n\n*Status:* " + (error.code === 'ENOTFOUND' ? 'CDN offline.' : error.message));
    }
});
