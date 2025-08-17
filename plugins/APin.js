const config = require('../config');
const { cmd } = require('../command');
const axios = require('axios');

cmd({
    pattern: "pinterest",
    alias: ["pindl", "pin2"],
    desc: "Download Pinterest videos or images",
    category: "download",
    react: "⬇️",
    filename: __filename
},
async (conn, mek, m, { from, sender, args, reply }) => {
    try {
        if (!args[0]) return reply("Please provide a Pinterest URL\nExample: .pinterest https://pin.it/example");

        const url = args[0].includes("pin.it") || args[0].includes("pinterest.com") ? args[0] : null;
        if (!url) return reply("Invalid Pinterest URL");

        // Show processing indicator
        await conn.sendMessage(from, { react: { text: '⏳', key: m.key } });

        const apiUrl = `https://delirius-apiofc.vercel.app/download/pinterestdl?url=${encodeURIComponent(url)}`;
        const response = await axios.get(apiUrl);

        if (!response.data.status || !response.data.data) {
            return reply("Failed to fetch Pinterest data. Please try again later.");
        }

        const pinData = response.data.data;
        const isVideo = pinData.download.type === "video";

        // Create buttons
        const buttons = [
            {
                buttonId: `pindl-image-${url}`,
                buttonText: { displayText: "📷 Download Image" },
                type: 1
            }
        ];

        if (isVideo) {
            buttons.push({
                buttonId: `pindl-video-${url}`,
                buttonText: { displayText: "🎬 Download Video" },
                type: 1
            });
        }

        // Send message with buttons
        await conn.sendMessage(from, {
            image: { url: pinData.thumbnail },
            caption: `*📌 Pinterest Downloader*\n\n` +
                     `*🔹 Title:* ${pinData.title}\n` +
                     `*🔸 Author:* ${pinData.author_name} (${pinData.username})\n` +
                     `*🔹 Likes:* ${pinData.likes}\n` +
                     `*🔸 Upload Date:* ${pinData.upload}\n\n` +
                     `_Select download option below_`,
            footer: config.BOT_NAME,
            buttons: buttons,
            headerType: 4
        }, { quoted: mek });

    } catch (error) {
        console.error("Pinterest Download Error:", error);
        reply(`❌ Error: ${error.message}`);
    }
});

// Handler for button selections
cmd({
    on: "button",
    fromMe: true,
    dontAddCommandList: true
},
async (conn, mek, m, { from, sender, args, reply }) => {
    try {
        if (!mek.message?.buttonsMessage) return;
        
        const selectedButtonId = mek.message.buttonsMessage.selectedButtonId;
        if (!selectedButtonId) return;
        
        if (selectedButtonId.startsWith('pindl-image-') || selectedButtonId.startsWith('pindl-video-')) {
            const type = selectedButtonId.includes('image') ? 'image' : 'video';
            const url = selectedButtonId.split('-').slice(2).join('-');
            
            if (!url) return reply("Invalid URL");
            
            await conn.sendMessage(from, { react: { text: '⏳', key: mek.key } });
            
            const apiUrl = `https://delirius-apiofc.vercel.app/download/pinterestdl?url=${encodeURIComponent(url)}`;
            const response = await axios.get(apiUrl);

            if (!response.data.status || !response.data.data) {
                return reply("Failed to fetch Pinterest data. Please try again later.");
            }

            const pinData = response.data.data;

            if (type === "video") {
                if (pinData.download.type !== "video") {
                    return reply("This pin doesn't contain a video.");
                }
                
                await conn.sendMessage(from, {
                    video: { url: pinData.download.url },
                    caption: `*📌 Pinterest Video*\n\n` +
                             `*🔹 Title:* ${pinData.title}\n` +
                             `*🔸 Author:* ${pinData.author_name}\n` +
                             `*🔹 Source:* ${pinData.source}`
                }, { quoted: mek });
            } else {
                await conn.sendMessage(from, {
                    image: { url: pinData.thumbnail },
                    caption: `*📌 Pinterest Image*\n\n` +
                             `*🔹 Title:* ${pinData.title}\n` +
                             `*🔸 Author:* ${pinData.author_name}\n` +
                             `*🔹 Source:* ${pinData.source}`
                }, { quoted: mek });
            }
        }
    } catch (error) {
        console.error("Pinterest Download Error:", error);
        reply(`❌ Error: ${error.message}`);
    }
});
