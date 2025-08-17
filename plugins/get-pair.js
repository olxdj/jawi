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
        
        // Create buttons message with copy option
        const buttonsMessage = {
            image: { url: "https://files.catbox.moe/qfi0h5.jpg" },
            caption: `- *Pairing Code For KHAN-MD ⚡*\n\nNotification has been sent to your WhatsApp. Please check your phone and copy this code to pair it and get your *KHAN-MD* session id.\n\n*🔢 Pairing Code*: *${pairingCode}*`,
            footer: "Click the button below to copy the code",
            buttons: [
                {
                    name: "cta_copy",
                    buttonParamsJson: JSON.stringify({
                        display_text: "📋 Copy Code",
                        id: pairingCode,
                        copy_code: pairingCode
                    })
                }
            ],
            headerType: 1
        };

        // Send message with buttons
        await conn.sendMessage(from, buttonsMessage, { quoted: m });

    } catch (error) {
        console.error("Pair command error:", error);
        await reply("❌ An error occurred. Please try again later.");
    }
});const { cmd, commands } = require('../command');
const axios = require('axios');

cmd({
    pattern: "pair2",
    alias: ["getpair2", "reqpair", "clonebot2"],
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
        
        // Create buttons message with copy option
        const buttonsMessage = {
            image: { url: "https://files.catbox.moe/qfi0h5.jpg" },
            caption: `- *Pairing Code For KHAN-MD ⚡*\n\nNotification has been sent to your WhatsApp. Please check your phone and copy this code to pair it and get your *KHAN-MD* session id.\n\n*🔢 Pairing Code*: *${pairingCode}*`,
            footer: "Click the button below to copy the code",
            buttons: [
                {
                    name: "cta_copy",
                    buttonParamsJson: JSON.stringify({
                        display_text: "📋 Copy Code",
                        id: pairingCode,
                        copy_code: pairingCode
                    })
                }
            ],
            headerType: 1
        };

        // Send message with buttons
        await conn.sendMessage(from, buttonsMessage, { quoted: m });

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

