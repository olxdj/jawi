const config = require('../config');
const { cmd, commands } = require('../command');
const { sleep } = require('../lib/functions');

cmd({
    pattern: "update",
    alias: ["sync", "up", "r", "reboot", "restart"],
    react: "🚀",
    desc: "update the bot",
    category: "owner",
    filename: __filename
},
async (conn, mek, m, {
    from, quoted, body, isCmd, command, args, q,
    isGroup, sender, senderNumber, botNumber2, botNumber,
    pushname, isMe, isOwner, isCreator, groupMetadata,
    groupName, participants, groupAdmins, isBotAdmins,
    isAdmins, reply
}) => {
    try {
        if (!isCreator) {
            return reply("🚫 *This command is only for the bot owner (creator).*");
        }

        // Send react immediately
        await conn.sendMessage(from, { react: { text: '⏳', key: m.key } });
        
        // Wait 500ms
        await sleep(500);
        
        // Send update message
        await reply("*♻️ Updating and restarting the bot*...");
        
        // Send ✅ react after message
        await conn.sendMessage(from, { react: { text: '✅', key: m.key } });
        
        // Wait 1500ms after sending message and react
        await sleep(1500);
        
        // Execute restart
        const { exec } = require("child_process");
        exec("pm2 restart all");
        
    } catch (e) {
        console.log(e);
        reply(`${e}`);
    }
});
