const { cmd } = require("../command");
const { sleep } = require("../lib/functions");

cmd({
    pattern: "restart",
    desc: "Restart KHAN-MD with cool effects",
    category: "owner",
    react: "🔄",
    filename: __filename
},
async (conn, mek, m, { from, reply, isCreator }) => {
    try {
        if (!isCreator) {
            return await conn.sendMessage(from, {
                text: "*📛 This is an owner-only command!*"
            }, { quoted: mek });
        }

        // Initial message with bold text
        const restartMsg = await conn.sendMessage(from, {
            text: '*🚀 Initializing System Restart...*'
        }, { quoted: mek });

        // Restart process steps with cool effects
        const restartSteps = [
            "*🔵 Terminating active processes...*",
            "*🟢 Closing all connections...*",
            "*🔴 Clearing cache...*",
            "*🟡 Saving session data...*",
            "*🔵 Preparing for reboot...*",
            "*⚪ Killing Node processes...*",
            "*🟣 Starting fresh instance...*",
            "*🟤 Loading modules...*",
            "*⚫ Almost there...*"
        ];

        // Show each step with delay and edit effect
        for (const step of restartSteps) {
            await sleep(800); // Slightly faster than chai command
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

        // Final message before restart
        await sleep(800);
        await conn.sendMessage(from, {
            text: '*✅ KHAN-MD Restart Sequence Complete!*\n_System rebooting now..._'
        }, { quoted: mek });

        // Execute restart after a brief delay
        await sleep(1500);
        const { exec } = require("child_process");
        exec("pm2 restart all");

    } catch (e) {
        console.error(e);
        await conn.sendMessage(from, {
            text: `*❌ Restart Failed!*\n_Error:_ ${e.message}`
        }, { quoted: mek });
    }
});
