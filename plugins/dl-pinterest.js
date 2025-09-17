const { cmd } = require('../command');
const axios = require('axios');

cmd({
    pattern: "pins",
    alias: ["pinterestdl", "pinterest", "pint", "pindl"],   
    react: "📌",
    desc: "Download Pinterest videos",
    category: "downloader",
    use: '.pin <Pinterest URL>',
    filename: __filename
},
async (conn, mek, m, { from, q, reply }) => {
    try {
        if (!q) return reply("📌 Please provide a Pinterest video link.");

        const apiUrl = `https://delirius-apiofc.vercel.app/download/pinterestdl?url=${encodeURIComponent(q)}`;
        const { data } = await axios.get(apiUrl);

        if (!data.status || !data.data || !data.data.download?.url) {
            return reply("❌ Couldn't fetch any video from Pinterest.");
        }

        const videoUrl = data.data.download.url;

        await conn.sendMessage(from, {
            video: { url: videoUrl },
            caption: "Powered by Jawad Tech X"
        }, { quoted: mek });

    } catch (err) {
        console.error("Pinterest Downloader Error:", err);
        reply("⚠️ Error while downloading Pinterest video.");
    }
});
