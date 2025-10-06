const config = require('../config');
const { cmd } = require('../command');
const yts = require('yt-search');
const axios = require('axios');
const { translate } = require('@vitalets/google-translate-api');

// Lyrics API configuration
const lyricsAPI = {
    baseURL: "https://izumiiiiiiii.dpdns.org/search/lirik"
};

cmd({
    pattern: "lyrics",
    alias: ["lirik", "songlyrics", "ganalyrics"],
    react: "🎵",
    desc: "Find song lyrics with multiple language options",
    category: "music",
    use: ".lyrics <song_name>",
    filename: __filename
}, async (conn, m, mek, { from, q, reply, sender }) => {
    try {
        if (!q) return await reply("❌ Please provide a song name!\nExample: .lyrics shape of you");

        // ⏳ React - processing
        await conn.sendMessage(from, { react: { text: '⏳', key: m.key } });
        
        await reply("🔍 Searching for lyrics...");

        // First try to find the song on YouTube for validation
        let songData = null;
        let songTitle = '';
        let songArtist = '';
        
        try {
            const { videos } = await yts(q);
            if (videos && videos.length > 0) {
                songData = videos[0];
                songTitle = songData.title;
                songArtist = songData.author?.name || 'Unknown Artist';
            }
        } catch (e) {
            console.log('[LYRICS] YouTube search failed:', e?.message);
        }

        // Get lyrics from API
        const apiUrl = `${lyricsAPI.baseURL}?title=${encodeURIComponent(q)}`;
        
        const res = await axios.get(apiUrl, {
            timeout: 30000,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            }
        });

        if (!res.data || !res.data.status || !res.data.result || res.data.result.length === 0) {
            return await reply("❌ No lyrics found for this song!");
        }

        const lyricsResults = res.data.result;
        const firstResult = lyricsResults[0];

        // Create interactive menu
        const caption = `*╭────⬡ LYRICS FINDER ⬡────*
*├▢ 🎵 Song:* ${firstResult.trackName || q}
*├▢ 🎤 Artist:* ${firstResult.artistName || 'Unknown'}
*├▢ ⏱️ Duration:* ${firstResult.duration ? Math.floor(firstResult.duration / 60) + ':' + (firstResult.duration % 60).toString().padStart(2, '0') : 'N/A'}
*╰────────────────*

*╭───⬡ SELECT LYRICS FORMAT ⬡───*
*├▢ 1. 📖 English Lyrics*
*├▢ 2. 🎵 Urdu Lyrics*
*╰────────────────*

> Reply with the number to select format (1-2)
> _This menu will expire in 30 seconds_`;

        const sentMsg = await conn.sendMessage(from, {
            image: { url: config.MENU_IMAGE_URL || 'https://i.ibb.co.com/0jZ7Z2L/music.jpg' },
            caption: caption
        }, { quoted: mek });

        const messageID = sentMsg.key.id;
        let menuActive = true;

        // Set timeout to expire menu after 30 seconds
        setTimeout(() => {
            menuActive = false;
        }, 30000);

        // Handle user response
        const responseHandler = async (msgData) => {
            const receivedMsg = msgData.messages[0];
            if (!receivedMsg.message || receivedMsg.key.remoteJid !== from) return;

            const receivedText = receivedMsg.message.conversation || receivedMsg.message.extendedTextMessage?.text;
            const isReplyToBot = receivedMsg.message.extendedTextMessage?.contextInfo?.stanzaId === messageID;

            if (isReplyToBot && menuActive) {
                // Remove listener to prevent multiple responses
                conn.ev.off('messages.upsert', responseHandler);

                await conn.sendMessage(from, { react: { text: '⬇️', key: receivedMsg.key } });

                const selectedOption = receivedText.trim();
                let lyricsText = '';

                // Get the plain lyrics
                if (firstResult.plainLyrics) {
                    lyricsText = firstResult.plainLyrics;
                } else if (firstResult.syncedLyrics) {
                    // Remove timestamps from synced lyrics
                    lyricsText = firstResult.syncedLyrics.replace(/\[\d{2}:\d{2}\.\d{2}\] /g, '');
                } else {
                    return await reply("❌ No lyrics content available for this song!");
                }

                // Limit lyrics length to avoid message limits
                if (lyricsText.length > 4000) {
                    lyricsText = lyricsText.substring(0, 4000) + '\n\n... (lyrics truncated)';
                }

                try {
                    if (selectedOption === '1') {
                        // English Lyrics (original)
                        await conn.sendMessage(from, {
                            text: `*🎵 ${firstResult.trackName || q} - ${firstResult.artistName || 'Unknown'}*\n\n${lyricsText}\n\n*${config.DESCRIPTION}*`
                        }, { quoted: mek });

                    } else if (selectedOption === '2') {
                        // Urdu Lyrics (translated)
                        await reply("🔄 Translating to Urdu...");
                        
                        const translated = await translate(lyricsText, { to: 'ur' });
                        
                        await conn.sendMessage(from, {
                            text: `*🎵 ${firstResult.trackName || q} - ${firstResult.artistName || 'Unknown'}*\n\n${translated.text}\n\n*${config.DESCRIPTION}*`
                        }, { quoted: mek });

                    } else {
                        await reply("❌ Invalid selection! Please use 1 or 2.");
                        return;
                    }

                    // ✅ React - success
                    await conn.sendMessage(from, { react: { text: '✅', key: receivedMsg.key } });

                } catch (error) {
                    console.error('[LYRICS] Processing error:', error);
                    await reply("❌ Error processing lyrics. Please try again.");
                }
            }
        };

        // Add listener for user response
        conn.ev.on('messages.upsert', responseHandler);

        // Remove listener after timeout
        setTimeout(() => {
            conn.ev.off('messages.upsert', responseHandler);
            if (menuActive) {
                menuActive = false;
                reply("⏰ Menu expired. Please use the command again.");
            }
        }, 30000);

    } catch (error) {
        console.error('[LYRICS] Command Error:', error?.message || error);
        await reply("❌ Lyrics search failed: " + (error?.message || 'Unknown error'));
    }
});
