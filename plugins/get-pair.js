const { cmd, commands } = require('../command');
const axios = require('axios');

cmd({
    pattern: "pair",
    alias: ["getpair", "reqpair", "clonebot"],
    react: "📉",
    desc: "Get pairing code for KHAN-MD bot",
    category: "download",
    use: ".pair 923427582XXX",
    filename: __filename
}, async (conn, mek, m, { from, quoted, body, isCmd, command, args, q, isGroup, senderNumber, reply }) => {
    try {
        // Show processing reaction
        await conn.sendMessage(from, { react: { text: "⏳", key: mek.key } });

        // Extract phone number
        const phoneNumber = q ? q.trim().replace(/[^0-9]/g, '') : senderNumber.replace(/[^0-9]/g, '');

        // Validate phone number
        if (!phoneNumber || phoneNumber.length < 10 || phoneNumber.length > 15) {
            return await reply("❌ Invalid phone number format!\n\nPlease use: `.pair 923000000000`\n(Without + sign)");
        }

        // Get pairing code from API
        const response = await axios.get(`https://khanmd-pair.onrender.com/code?number=${encodeURIComponent(phoneNumber)}`);
        
        if (!response.data?.code) {
            return await reply("❌ Failed to get pairing code. Please try again later.");
        }

        const pairingCode = response.data.code;
        
        // Create buttons message with image and copy button
        const buttonsMessage = {
            image: { url: "https://files.catbox.moe/qfi0h5.jpg" },
            caption: `- *Pairing Code For KHAN-MD ⚡*\n\nNotification has been sent to your WhatsApp. Please check your phone and copy this code to pair it and get your *KHAN-MD* session id.\n\n*🔢 Pairing Code*: *${pairingCode}*`,
            footer: "Click the button below to copy the code",
            buttons: [
                {
                    buttonId: `copy-code-${pairingCode}`,
                    buttonText: { displayText: "📋 Copy Code" },
                    type: 1
                }
            ],
            headerType: 1
        };

        // Send message with buttons
        const sentMsg = await conn.sendMessage(from, buttonsMessage, { quoted: m });
        const messageId = sentMsg.key.id;

        // Create a listener for button responses
        const buttonHandler = async (msgData) => {
            const receivedMsg = msgData.messages[0];
            if (!receivedMsg.message?.buttonsResponseMessage) return;

            const buttonId = receivedMsg.message.buttonsResponseMessage.selectedButtonId;
            const senderId = receivedMsg.key.remoteJid;
            const isReplyToBot = receivedMsg.message.buttonsResponseMessage.contextInfo?.stanzaId === messageId;

            if (isReplyToBot && senderId === from) {
                if (buttonId.startsWith('copy-code-')) {
                    const codeToCopy = buttonId.replace('copy-code-', '');
                    
                    // Send a message that can be copied
                    await conn.sendMessage(from, {
                        text: `📋 *Code Copied!*\n\nHere's your pairing code:\n\n\`\`\`${codeToCopy}\`\`\`\n\nYou can now paste it in the pairing process.`,
                        footer: "The code is now in your clipboard"
                    }, { quoted: receivedMsg });
                    
                    // Add ✅ reaction to confirm copy
                    await conn.sendMessage(from, { react: { text: "✅", key: receivedMsg.key } });
                }
            }
        };

        // Add the listener
        conn.ev.on("messages.upsert", buttonHandler);

    } catch (error) {
        console.error("Pair command error:", error);
        await reply("❌ An error occurred. Please try again later.");
    }
});

cmd({
    pattern: "pair2",
    alias: ["getpair2", "clonebot2"],
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
        const response = await axios.get(`https://khanmd-pair.onrender.com/code?number=${encodeURIComponent(phoneNumber)}`);

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

