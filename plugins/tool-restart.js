const { cmd } = require("../command");
const { sleep } = require("../lib/functions");

cmd({
    pattern: "restart",
    desc: "Restart KHAN-MD",
    category: "owner",
    react: "🔄",
    filename: __filename
},
async (conn, mek, m, { from, reply, isCreator }) => {
    try {
        if (!isCreator) {
            return reply("*📛 Owner Only Command!*");
        }

        // Initial message
        const restartMsg = await conn.sendMessage(from, {
            text: '*🚀 Starting System Restart...*'
        }, { quoted: mek });

        // Clean restart sequence with emojis
        const restartSteps = [
            "*🔌 Closing All Connections...*",
            "*🧹 Clearing Cache...*",
            "*💾 Saving Session Data...*",
            "*⚙️ Preparing For Restart...*"
        ];

        // Show each step by editing previous message
        for (const step of restartSteps) {
            await sleep(800);
            await conn.relayMessage(
                from,
                {
                    protocolMessage: {
                        key: restartMsg.key,
                        type: 14,
                        editedMessage: {
                            conversation: step,
                        },
                    },
                },
                {}
            );
        }

        // Final edit with rocket emoji
        await sleep(800);
        await conn.relayMessage(
            from,
            {
                protocolMessage: {
                    key: restartMsg.key,
                    type: 14,
                    editedMessage: {
                        conversation: "*✅ Restarting Now! 🚀*",
                    },
                },
            },
            {}
        );

        // Execute restart
        const { exec } = require("child_process");
        exec("pm2 restart all");

    } catch (e) {
        console.error(e);
        reply(`*❌ Restart Failed!*\n${e.message}`);
    }
});
