const config = require('../config');
const { cmd } = require('../command');
const fetch = require('node-fetch');
const { runtime } = require('../lib/functions');

cmd({
    pattern: "pinterest",
    alias: ["pindl", "pin2"],
    desc: "Download Pinterest videos/images",
    category: "download",
    react: "⬇️",
    filename: __filename
},
async (conn, mek, m, { from, sender, reply, args }) => {
    try {
        if (!args[0]) return reply("Please provide a Pinterest URL\nExample: .pinterest https://pin.it/example");
        
        const encodedUrl = encodeURIComponent(args[0]);
        const apiUrl = `https://rest-lily.vercel.app/api/downloader/pinterestdl?url=${encodedUrl}`;
        
        const response = await fetch(apiUrl);
        const data = await response.json();
        
        if (!data.status || !data.data.medias) {
            return reply("❌ Failed to fetch Pinterest media. Please check the URL and try again.");
        }
        
        const { title, medias } = data.data;
        const videoMedias = medias.filter(m => m.extension === 'mp4');
        const imageMedias = medias.filter(m => m.extension === 'jpg' || m.extension === 'png');
        
        // Find highest quality video
        const bestVideo = videoMedias.reduce((prev, current) => 
            (parseInt(prev.quality) > parseInt(current.quality)) ? prev : current, {});
        
        // Find highest quality image
        const bestImage = imageMedias.reduce((prev, current) => 
            (parseInt(prev.quality) > parseInt(current.quality)) ? prev : current, {});
        
        // Send message with buttons
        await conn.sendMessage(from, {
            text: `*${title || 'Pinterest Download'}*\n\nSelect download option:`,
            footer: config.BOT_NAME,
            buttons: [
                {
                    buttonId: '#pin-image',
                    buttonText: { displayText: '📷 Download Image' },
                    type: 1
                },
                {
                    buttonId: '#pin-video',
                    buttonText: { displayText: '🎬 Download Video' },
                    type: 1
                }
            ],
            headerType: 1
        }, { quoted: mek });
        
        // Store media data temporarily for button handling
        conn.pinData = conn.pinData || {};
        conn.pinData[sender] = {
            bestImage: bestImage.url || imageMedias[0]?.url,
            bestVideo: bestVideo.url || videoMedias[0]?.url,
            timestamp: Date.now()
        };
        
        // Clean up old data
        setTimeout(() => {
            if (conn.pinData[sender]) {
                delete conn.pinData[sender];
            }
        }, 300000); // 5 minutes
        
    } catch (e) {
        console.error(e);
        reply(`❌ Error:\n${e.message}`);
    }
});

// Handle button responses
module.exports.button = async (conn, mek, m) => {
    try {
        const sender = mek.key.remoteJid;
        const message = mek.message.buttonsResponseMessage;
        
        if (!message || !conn.pinData[sender]) return;
        
        const selectedButtonId = message.selectedButtonId;
        const pinData = conn.pinData[sender];
        
        if (Date.now() - pinData.timestamp > 300000) {
            delete conn.pinData[sender];
            return conn.sendMessage(sender, { text: "Session expired. Please run the command again." });
        }
        
        if (selectedButtonId === '#pin-image' && pinData.bestImage) {
            await conn.sendMessage(sender, {
                image: { url: pinData.bestImage },
                caption: "Here's your Pinterest image download"
            }, { quoted: mek });
        } 
        else if (selectedButtonId === '#pin-video' && pinData.bestVideo) {
            await conn.sendMessage(sender, {
                video: { url: pinData.bestVideo },
                caption: "Here's your Pinterest video download"
            }, { quoted: mek });
        }
        
        // Clean up
        delete conn.pinData[sender];
        
    } catch (e) {
        console.error("Button handler error:", e);
    }
};
