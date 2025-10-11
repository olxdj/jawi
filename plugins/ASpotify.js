const { cmd } = require('../command');
const axios = require('axios');

cmd({
    pattern: "spotify",
    alias: ["spotdl", "spdl"],
    desc: "Download Spotify track in MP3 format",
    category: "downloader",
    react: "🎵",
    filename: __filename
}, async (conn, mek, m, { from, args, reply }) => {
    try {
        if (!args[0]) return reply("🎧 *Please provide a Spotify track URL!*\n\nExample:\n`.spotify https://open.spotify.com/track/4Nwrh5BlZ8I31znYQULS7G`");

        const url = args[0];
        const api = `https://api.siputzx.my.id/api/d/spotify?url=${encodeURIComponent(url)}`;

        const { data } = await axios.get(api);

        if (!data.status || !data.data) return reply("❌ Failed to fetch Spotify data.");

        const { title, artis, durasi, image, download } = data.data;

        const caption = `🎧 *SPOTIFY DOWNLOADER*\n\n🎵 *Title:* ${title}\n🎤 *Artist:* ${artis}\n🕒 *Duration:* ${(durasi / 1000 / 60).toFixed(2)} mins\n\n_🎶 Powered By KHAN-MD_`;

        await conn.sendMessage(from, {
            image: { url: image },
            caption
        }, { quoted: mek });

        await conn.sendMessage(from, {
            audio: { url: download },
            mimetype: 'audio/mpeg',
            fileName: `${title}.mp3`
        }, { quoted: mek });

    } catch (e) {
        console.error("Spotify Error:", e);
        reply("❌ *Error while fetching Spotify track.*");
    }
});
