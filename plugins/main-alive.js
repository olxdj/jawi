const config = require('../config');
const { cmd, commands } = require('../command');
const { runtime } = require('../lib/functions');

cmd({
    pattern: "alive",
    alias: ["status", "live"],
    desc: "Check if the bot is running.",
    react: "🟢",
    category: "info",
    filename: __filename,
}, async (conn, mek, m, { from, reply }) => {
    try {
        let totalCommands = Object.keys(commands).length;

        const aliveInfo = `
╭─〔 *🤖 KHAN-MD STATUS* 〕
│
├─ *🌐 Platform:* Heroku
├─ *📦 Mode:* ${config.MODE}
├─ *👑 Owner:* ${config.OWNER_NAME}
├─ *🔹 Prefix:* ${config.PREFIX}
├─ *🧩 Version:* 5.0.0 Beta
├─ *📁 Total Commands:* ${totalCommands}
├─ *⏱ Runtime:* ${runtime(process.uptime())}
│
╰─ *⚡ Powered by KHAN-MD*
        `.trim();

        await conn.sendMessage(from, {
            text: aliveInfo,
            contextInfo: {
                forwardingScore: 999,
                isForwarded: true
            }
        }, { quoted: mek });

    } catch (err) {
        console.error("Error in alive command:", err);
        reply("❌ Bot status check failed.");
    }
});
