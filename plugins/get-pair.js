const { cmd } = require('../command');
const axios = require('axios');
const config = require('../config');
const proto = require('@whiskeysockets/baileys').proto;

cmd({
    pattern: "pair2",
    alias: ["getpair2", "clonebot2"],
    react: "✅",
    desc: "Get pairing code for KHAN-MD bot",
    category: "download",
    use: ".pair 923427582XXX",
    filename: __filename
}, async (conn, mek, m, { from, q, senderNumber, reply }) => {
    try {
        const phoneNumber = q ? q.trim().replace(/[^0-9]/g, '') : senderNumber.replace(/[^0-9]/g, '');

        if (!phoneNumber || phoneNumber.length < 10 || phoneNumber.length > 15) {
            return await reply("❌ Please provide a valid phone number without `+`\nExample: `.pair 923427582XXX`");
        }

        const response = await axios.get(`https://khanmd-pair.onrender.com/code?number=${encodeURIComponent(phoneNumber)}`);
        if (!response.data || !response.data.code) {
            return await reply("❌ Failed to retrieve pairing code. Please try again later.");
        }

        const pairingCode = response.data.code;

        const msg = await conn.generateWAMessageFromContent(from, {
            viewOnceMessage: {
                message: {
                    messageContextInfo: {
                        deviceListMetadata: {},
                        deviceListMetadataVersion: 2
                    },
                    interactiveMessage: proto.Message.InteractiveMessage.create({
                        body: proto.Message.InteractiveMessage.Body.create({
                            text: `> *KHAN-MD PAIRING COMPLETED*\n\n✅ *Number:* ${phoneNumber}\n\nClick the copy button below!`
                        }),
                        footer: proto.Message.InteractiveMessage.Footer.create({
                            text: "KHAN-MD BOT"
                        }),
                        header: proto.Message.InteractiveMessage.Header.create({
                            hasMediaAttachment: true,
                            imageMessage: {
                                url: config.MENU_IMAGE_URL
                            }
                        }),
                        nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.create({
                            buttons: [
                                {
                                    name: "cta_copy",
                                    buttonParamsJson: JSON.stringify({
                                        display_text: "📋 Copy Pair Code",
                                        id: pairingCode,
                                        copy_code: pairingCode
                                    })
                                }
                            ]
                        })
                    })
                }
            }
        }, {});

        return await conn.relayMessage(msg.key.remoteJid, msg.message, { messageId: msg.key.id });

    } catch (error) {
        console.error("Pair interactive command error:", error);
        await reply("❌ An error occurred while generating pairing code. Please try again later.");
    }
});

cmd({
    pattern: "pair",
    alias: ["getpair", "clonebot"],
    react: "✅",
    desc: "Get pairing code for KHAN-MD bot",
    category: "download",
    use: ".pair 923427582XXX",
    filename: __filename
}, async (conn, mek, m, { from, quoted, body, isCmd, command, args, q, isGroup, senderNumber, reply }) => {
    try {
        // Extract phone number from command
        const phoneNumber = q ? q.trim().replace(/[^0-9]/g, '') : senderNumber.replace(/[^0-9]/g, '');

        // Validate phone number format
        if (!phoneNumber || phoneNumber.length < 10 || phoneNumber.length > 15) {
            return await reply("❌ Please provide a valid phone number without `+`\nExample: `.pair 923427582XXX`");
        }

        // Make API request to get pairing code
        const response = await axios.get(`https://jawadmd-pair.onrender.com/code?number=${encodeURIComponent(phoneNumber)}`);

        if (!response.data || !response.data.code) {
            return await reply("❌ Failed to retrieve pairing code. Please try again later.");
        }

        const pairingCode = response.data.code;
        const doneMessage = "> *KHAN-MD PAIRING COMPLETED*";

        // Send initial message with formatting
        await reply(`${doneMessage}\n\n*Your pairing code is:* ${pairingCode}`);

        // Optional 2-second delay
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Send clean code again
        await reply(`${pairingCode}`);

    } catch (error) {
        console.error("Pair command error:", error);
        await reply("❌ An error occurred while getting pairing code. Please try again later.");
    }
});
