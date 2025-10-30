const { cmd } = require('../command');
const axios = require('axios');
const config = require('../config');

// Helper for small caps font
const toSmallCaps = (text) => {
    const map = {
        'a': 'ᴀ','b': 'ʙ','c': 'ᴄ','d': 'ᴅ','e': 'ᴇ','f': 'ғ','g': 'ɢ','h': 'ʜ','i': 'ɪ','j': 'ᴊ',
        'k': 'ᴋ','l': 'ʟ','m': 'ᴍ','n': 'ɴ','o': 'ᴏ','p': 'ᴘ','q': 'ǫ','r': 'ʀ','s': 's','t': 'ᴛ',
        'u': 'ᴜ','v': 'ᴠ','w': 'ᴡ','x': 'x','y': 'ʏ','z': 'ᴢ'
    };
    return text.split('').map(c => map[c.toLowerCase()] || c).join('');
};

cmd({
    pattern: "ik",
    alias: ["ikx"],
    desc: "Search aand Download Videos",
    category: "download",
    react: "🔍",
    filename: __filename
}, async (conn, mek, m, { from, q, isCreator, reply }) => {
    try {
        if (!isCreator) return reply("_❗Only the bot owner can use this command!_");

        if (!q) return await reply("🔍 Please provide a search");

        // 🔍 Search IK
        const searchUrl = `https://api.hanggts.xyz/search/xnxx?q=${encodeURIComponent(q)}`;
        const { data } = await axios.get(searchUrl);

        if (!data?.status || !data?.result || !data.result.length) {
            return await reply("❌ No results found for your search.");
        }

        // Get 5 random results
        const results = data.result
            .sort(() => 0.5 - Math.random())
            .slice(0, 5);

        // Create simplified menu with results
        let caption = `╭─── *iK VIDEOS* ───⊷\n`;
        
        results.forEach((item, index) => {
            // Use full title without cutting
            const fullTitle = item.title || 'No Title';
            caption += `│ ⬡ ${index + 1}. ${fullTitle}\n`;
        });
        
        caption += `╰─────────────────⊷\n\n`;
        caption += `> ${toSmallCaps('please reply with 1 to 5')}`;

        const sent = await conn.sendMessage(from, {
            text: caption
        }, { quoted: mek });

        const msgId = sent.key.id;

        // 🕒 Wait for user reply
        conn.ev.on("messages.upsert", async (msgData) => {
            const received = msgData.messages[0];
            if (!received.message) return;

            const text = received.message.conversation || received.message.extendedTextMessage?.text;
            const sender = received.key.remoteJid;
            const replyToBot = received.message.extendedTextMessage?.contextInfo?.stanzaId === msgId;

            if (replyToBot && sender === from) {
                await conn.sendMessage(sender, { react: { text: '⬇️', key: received.key } });

                const selectedNum = parseInt(text);
                if (selectedNum >= 1 && selectedNum <= 5) {
                    const selectedItem = results[selectedNum - 1];
                    
                    if (!selectedItem?.link) {
                        return await conn.sendMessage(sender, { 
                            text: "❌ Invalid selection or missing download link." 
                        }, { quoted: received });
                    }

                    try {
                        // Download video using the API
                        const downloadUrl = `https://api.hanggts.xyz/download/xnxx?url=${encodeURIComponent(selectedItem.link)}`;
                        const downloadData = await axios.get(downloadUrl);

                        if (!downloadData?.data?.status || !downloadData?.data?.result) {
                            return await conn.sendMessage(sender, { 
                                text: "❌ Download failed. Please try again later." 
                            }, { quoted: received });
                        }

                        const videoData = downloadData.data.result;
                        // Use low quality video (as requested)
                        const videoUrl = videoData.files?.low;

                        if (!videoUrl) {
                            return await conn.sendMessage(sender, { 
                                text: "❌ No low quality video URL found." 
                            }, { quoted: received });
                        }

                        // Send as document
                        await conn.sendMessage(sender, {
                            document: { url: videoUrl },
                            fileName: `${videoData.title || 'iK-VIDEO'}.mp4`,
                            mimetype: 'video/mp4',
                            caption: `*${videoData.title || 'iKVideo'}*`
                        }, { quoted: received });

                        await conn.sendMessage(sender, { react: { text: '✅', key: received.key } });

                    } catch (downloadError) {
                        console.error(downloadError);
                        await conn.sendMessage(sender, { 
                            text: `❌ Download error: ${downloadError.message}` 
                        }, { quoted: received });
                    }

                } else {
                    await conn.sendMessage(sender, {
                        text: `> *Invalid selection. Please reply with a number between 1-5 to download.`
                    }, { quoted: received });
                }
            }
        });

    } catch (e) {
        console.error(e);
        await reply(`❌ Error: ${e.message}`);
        await conn.sendMessage(from, { react: { text: '❌', key: m.key } });
    }
});
