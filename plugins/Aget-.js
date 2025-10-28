// ✅ Coded by JawadTechX
// ⚙️ Command: getconfig
// 📁 Function: Sends full config.js file

const fs = require('fs');
const path = require('path');
const { cmd } = require('../command');

cmd({
    pattern: 'getconfig',
    desc: 'Send full config.js file.',
    category: 'owner',
    react: '⚙️',
    filename: __filename
}, async (conn, mek, m, { from, isCreator }) => {

    // Only owner can use
    if (!isCreator) return m.reply('❌ Only owner can use this command.');

    try {
        const configPath = path.join(__dirname, '../config.js');

        if (!fs.existsSync(configPath)) {
            return m.reply('⚠️ config.js file not found.');
        }

        // Send the file as a document
        await conn.sendMessage(from, {
            document: fs.readFileSync(configPath),
            mimetype: 'application/javascript',
            fileName: 'config.js',
            caption: '🛠️ Here is your full config.js file.\n\nPowered by JawadTechX'
        }, { quoted: mek });

    } catch (e) {
        console.error(e);
        return m.reply('❌ Error reading config file.');
    }
});
