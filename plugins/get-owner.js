const { cmd } = require('../command');
const config = require('../config');

cmd({
    pattern: "owner",
    react: "✅",
    desc: "Get owner number",
    category: "main",
    filename: __filename
}, async (conn, mek, m, { from, reply }) => {
    try {
        const ownerNumber = config.OWNER_NUMBER;
        const ownerName = config.OWNER_NAME;

        const vcard = `BEGIN:VCARD\n` +
                      `VERSION:3.0\n` +
                      `FN:${ownerName}\n` +
                      `ORG:Owner of the Bot\n` +
                      `TEL;type=CELL;type=VOICE;waid=${ownerNumber.replace('+', '')}:${ownerNumber}\n` +
                      `END:VCARD`;

        const contactMsg = {
            contacts: {
                displayName: ownerName,
                contacts: [{
                    vcard
                }]
            }
        };

        await conn.sendMessage(from, contactMsg, { quoted: mek });

    } catch (error) {
        console.error("Error sending contact:", error);
        await reply(`⚠️ Could not send contact.\nTry saving manually:\n\n*Name:* ${config.OWNER_NAME}\n*Number:* ${config.OWNER_NUMBER}`);
    }
});
