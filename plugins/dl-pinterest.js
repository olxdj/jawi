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

        // Create buttons message
        const buttonsMessage = {
            text: `*📌 Pinterest Downloader*\n\n` +
                  `*🔹 Title:* ${pinData.title}\n` +
                  `*🔸 Author:* ${pinData.author_name} (${pinData.username})\n` +
                  `*🔹 Likes:* ${pinData.likes}\n` +
                  `*🔸 Upload Date:* ${pinData.upload}\n\n` +
                  `_Select download option below_`,
            footer: config.DESCRIPTION,
            buttons: [
                {
                    buttonId: `pin-image-${url}`,
                    buttonText: { displayText: "📷 Download Image" },
                    type: 1
                }
            ],
            headerType: 1,
            image: { url: pinData.thumbnail }
        };

        if (isVideo) {
            buttonsMessage.buttons.push({
                buttonId: `pin-video-${url}`,
                buttonText: { displayText: "🎬 Download Video" },
                type: 1
            });
        }

        // Send message with buttons
        const sentMsg = await conn.sendMessage(from, buttonsMessage, { quoted: mek });
        const messageId = sentMsg.key.id;

        // Create a listener for button responses
        const buttonHandler = async (msgData) => {
            const receivedMsg = msgData.messages[0];
            if (!receivedMsg.message?.buttonsResponseMessage) return;

            const buttonId = receivedMsg.message.buttonsResponseMessage.selectedButtonId;
            const senderId = receivedMsg.key.remoteJid;
            const isReplyToBot = receivedMsg.message.buttonsResponseMessage.contextInfo?.stanzaId === messageId;

            if (isReplyToBot && senderId === from) {
                // Remove listener to prevent multiple triggers
                conn.ev.off("messages.upsert", buttonHandler);

                // Show processing reaction
                await conn.sendMessage(from, { react: { text: '⏳', key: receivedMsg.key } });

                try {
                    const type = buttonId.startsWith('pin-image-') ? 'image' : 'video';
                    const pinUrl = buttonId.split('-').slice(2).join('-');

                    // Make fresh API request
                    const freshApiUrl = `https://delirius-apiofc.vercel.app/download/pinterestdl?url=${encodeURIComponent(pinUrl)}`;
                    const freshResponse = await axios.get(freshApiUrl);

                    if (!freshResponse.data.status || !freshResponse.data.data) {
                        return reply("Failed to fetch Pinterest data. Please try again later.");
                    }

                    const freshData = freshResponse.data.data;

                    if (type === "video") {
                        if (freshData.download.type !== "video") {
                            return reply("This pin doesn't contain a video.");
                        }
                        
                        await conn.sendMessage(from, {
                            video: { url: freshData.download.url },
                            caption: `*📌 Pinterest Video*\n\n` +
                                     `*🔹 Title:* ${freshData.title}\n` +
                                     `*🔸 Author:* ${freshData.author_name}`
                        }, { quoted: receivedMsg });
                    } else {
                        await conn.sendMessage(from, {
                            image: { url: freshData.thumbnail },
                            caption: `*📌 Pinterest Image*\n\n` +
                                     `*🔹 Title:* ${freshData.title}\n` +
                                     `*🔸 Author:* ${freshData.author_name}`
                        }, { quoted: receivedMsg });
                    }
                } catch (error) {
                    console.error("Pinterest Download Error:", error);
                    reply(`❌ Error: ${error.message}`);
                }
            }
        };

        // Add the listener
        conn.ev.on("messages.upsert", buttonHandler);

        // Remove listener after 2 minutes if no response
        setTimeout(() => {
            conn.ev.off("messages.upsert", buttonHandler);
        }, 120000);

    } catch (error) {
        console.error("Pinterest Download Error:", error);
        reply(`❌ Error: ${error.message}`);
    }
});
