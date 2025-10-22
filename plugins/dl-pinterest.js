// ✅ Coded by JawadTechX for KHAN MD

const { cmd } = require('../command');
const axios = require('axios');

cmd({
    pattern: "pinterest",
    alias: ["pin", "pindl"],
    desc: "Download Pinterest videos/images",
    category: "download",
    react: "📌",
    filename: __filename
}, async (conn, mek, m, { from, q, reply }) => {
    try {
        if (!q) return await reply("📌 *Please provide a Pinterest URL*");

        // Validate Pinterest URL
        if (!q.includes('pinterest.com') && !q.includes('pin.it')) {
            return await reply("❌ *Invalid Pinterest URL!*\n\nPlease provide a valid Pinterest URL starting with 'pinterest.com' or 'pin.it'");
        }

        // Send processing react
        await conn.sendMessage(from, { react: { text: '⏳', key: m.key } });

        // 🎬 Fetch from Pinterest API
        const apiUrl = `https://jawad-tech.vercel.app/download/pinterest?url=${encodeURIComponent(q)}`;
        const res = await axios.get(apiUrl);
        const data = res.data;

        if (!data?.status || !data?.result?.url) {
            return await reply("❌ *Failed to download!*\n\nCould not fetch media from Pinterest. Please check the URL and try again.");
        }

        const pinData = data.result;
        const isVideo = pinData.type === 'video';

        // 📌 Send media with stylish caption
        const caption = `> 〔 *PINTEREST DOWNLOADER* 〕
╭━━❐━⪼
┇๏ Title:* ${pinData.title || 'No Title'}
┇๏ Type:* ${isVideo ? 'Video' : 'Image'}
┇๏ Platform:* Pinterest
┇๏ Quality:* HD Ultra
╰━━❑━⪼
> *© Pᴏᴡᴇʀᴇᴅ Bʏ KʜᴀɴX-Aɪ ♡*`;

        if (isVideo) {
            // Send as video
            await conn.sendMessage(from, {
                video: { url: pinData.url },
                caption: caption
            }, { quoted: mek });
        } else {
            // Send as image
            await conn.sendMessage(from, {
                image: { url: pinData.url },
                caption: caption
            }, { quoted: mek });
        }

        // ✅ React success
        await conn.sendMessage(from, { react: { text: '✅', key: m.key } });

    } catch (e) {
        console.error("❌ Error in .pinterest:", e);
        await reply("⚠️ *Something went wrong!*\n\nPlease try again with a different Pinterest URL.");
        await conn.sendMessage(from, { react: { text: '❌', key: m.key } });
    }
});
