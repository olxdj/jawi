const { cmd } = require("../command");
const { sleep } = require("../lib/functions");

cmd({
    pattern: "technologia",
    alias: ["techmeme", "tiktoktech"],
    desc: "Funny TikTok technologia meme with effects",
    category: "fun",
    react: "🤖",
    filename: __filename
},
async (conn, mek, m, { from, reply }) => {
    try {
        // Initial message with tech vibes
        const techMsg = await conn.sendMessage(from, {
            text: '*⚡ Initializing Technologia Sequence...*'
        }, { quoted: mek });

        // Funny tech meme steps
        const techSteps = [
            "*🔍 Scanning for TikTok cringe...*",
            "*📱 99% Battery | 2G Network*",
            "*🤖 Booting Russian Technologia...*",
            "*⚠️ Warning: Low Quality Meme Detected*",
            "*💾 Loading 2007 Nokia Vibes...*",
            "*📶 Connecting to Dial-Up...*",
            "*🎵 Audio Driver: 'Blyat Engine'*"
        ];

        // Edit animation with delays
        for (const step of techSteps) {
            await sleep(600); // Faster than restart command
            await conn.relayMessage(
                from,
                {
                    protocolMessage: {
                        key: techMsg.key,
                        type: 14,
                        editedMessage: {
                            conversation: step,
                        },
                    },
                },
                {}
            );
        }

        // Final punchline before audio
        await sleep(800);
        await conn.relayMessage(
            from,
            {
                protocolMessage: {
                    key: techMsg.key,
                    type: 14,
                    editedMessage: {
                        conversation: "*🎶 Technologia.mp3 🔊*",
                    },
                },
            },
            {}
        );

        // Send the iconic audio
        await sleep(500);
        await conn.sendMessage(from, { 
            audio: { url: "https://files.catbox.moe/fac856.mp3" },
            mimetype: "audio/mpeg",
            ptt: false
        }, { quoted: mek });

    } catch (e) {
        console.error(e);
        reply("*❌ Technologia Failed!*\n_Blyat! Error: " + e.message + "_");
    }
});
