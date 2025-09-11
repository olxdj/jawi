const { cmd } = require('../command');
const axios = require('axios');

const getBuffer = async (url, options) => {
    try {
        options ? options : {};
        const res = await axios({
            method: 'get',
            url,
            headers: {
                'DNT': 1,
                'Upgrade-Insecure-Request': 1
            },
            ...options,
            responseType: 'arraybuffer'
        });
        return res.data;
    } catch (e) {
        console.log(e);
    }
};

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

        // Fetch APK from PrinceTech API
        const res = await axios.get(`https://api.princetechn.com/api/download/apkdl?apikey=prince&appName=${encodeURIComponent(q)}`);
        const data = res.data;

        if (!data.success || !data.result || !data.result.download_url) {
            await conn.sendMessage(from, { react: { text: '❌', key: m.key } });
            return reply("❌ *No app found with that name, please try again.*");
        }

        const app = data.result;

        // Get app icon buffer for thumbnail
        const thumb = await getBuffer(app.appicon);

        // Send APK with real thumbnail
        await conn.sendMessage(from, {
            document: { url: app.download_url },
            mimetype: app.mimetype || "application/vnd.android.package-archive",
            fileName: `${app.appname}.apk`,
            caption: `✅ *APK successfully downloaded*\n\n📱 *App:* ${app.appname}\n👨‍💻 *Developer:* ${app.developer}\n\nPowered By KHAN-MD 💚`,
            jpegThumbnail: thumb
        }, { quoted: mek });

        // ✅ React - success
        await conn.sendMessage(from, { react: { text: '✅', key: m.key } });

    } catch (error) {
        console.error(error);
        await conn.sendMessage(from, { react: { text: '❌', key: m.key } });
        reply("❌ *An error occurred while fetching the APK.*");
    }
});
