const { cmd } = require('../command');
const axios = require('axios');

cmd({
    pattern: "spotify",
    alias: ["spotdl", "spdl"],
    desc: "Download Spotify track by name",
    category: "downloader",
    react: "🎧",
    filename: __filename
}, async (conn, mek, m, { from, args, reply }) => {
    try {
        if (!args[0]) return reply("🎵 *Please provide a Spotify song name!*\n\nExample:\n`.spotify Spectre`");

        const query = args.join(" ");
        const api = `https://apis-keith.vercel.app/download/spotify?q=${encodeURIComponent(query)}`;

        const { data } = await axios.get(api);

        if (!data.status || !data.result || !data.result.track) {
            return reply("❌ No results found for your query.");
        }

        const { title, artist, duration, popularity, thumbnail, downloadLink } = data.result.track;

        const caption = `🎧 *SPOTIFY DOWNLOADER*\n\n🎵 *Title:* ${title}\n🎤 *Artist:* ${artist}\n🕒 *Duration:* ${duration}\n🔥 *Popularity:* ${popularity}\n\n_🎶 Powered By KHAN-MD_`;

        // Send cover image with info
        await conn.sendMessage(from, {
            image: { url: thumbnail },
            caption
        }, { quoted: mek });

        // Send audio with Spotify-style info
        await conn.sendMessage(from, {
            audio: { url: downloadLink },
            mimetype: 'audio/mpeg',
            fileName: `${title}.mp3`,
            contextInfo: {
                externalAdReply: {
                    title: `${title}`,
                    body: `🎧 ${artist} | Powered by KHAN-MD`,
                    thumbnailUrl: thumbnail,
                    mediaType: 2,
                    renderLargerThumbnail: true
                }
            }
        }, { quoted: mek });

    } catch (err) {
        console.error("Spotify Command Error:", err);
        reply("❌ *Error fetching or downloading track.*");
    }
});
