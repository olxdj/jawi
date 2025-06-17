const { cmd } = require('../command');
const axios = require('axios');

cmd({
    pattern: "apk",
    alias: ["app"],
    react: "📲",
    desc: "📥 Download APK directly",
    category: "📁 Download",
    filename: __filename
},
async (conn, mek, m, { from, q, reply }) => {
    try {
        if (!q) return reply("❌ *Please provide an app name!*");

        // ⏳ React - processing
        await conn.sendMessage(from, { react: { text: '⏳', key: m.key } });

        const { data } = await axios.get(`https://apis.davidcyriltech.my.id/download/apk?text=${encodeURIComponent(q)}`);

        if (!data.success || !data.download_link) {
            await conn.sendMessage(from, { react: { text: '❌', key: m.key } });
            return reply("❌ *App not found or API error.*");
        }

        // Send APK file directly
        await conn.sendMessage(from, {
            document: { url: data.download_link },
            mimetype: "application/vnd.android.package-archive",
            fileName: `${data.apk_name}.apk`,
            caption: "✅ *APK successfully uploaded!*\nPowered By JawadTechX 🤍"
        }, { quoted: mek });

        // ✅ React - success
        await conn.sendMessage(from, { react: { text: '✅', key: m.key } });

    } catch (error) {
        console.error(error);
        await conn.sendMessage(from, { react: { text: '❌', key: m.key } });
        reply("❌ *An error occurred while fetching the APK.*");
    }
});
