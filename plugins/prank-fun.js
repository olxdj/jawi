const { cmd } = require('../command');
const config = require('../config');

cmd({
    pattern: "hack",
    desc: "Displays a dynamic and playful 'Hacking' message for fun.",
    category: "fun",
    filename: __filename
},
async (conn, mek, m, { 
    from, quoted, body, isCmd, command, args, q, isGroup, senderNumber, reply, isCreator 
}) => {
    try {
        if (!isCreator) {
            return reply("📛 *This is an owner command.*");
        }

        const steps = [
            `💻 *${config.BOT_NAME} HACKING SYSTEM ACTIVATED* 💻\n*Initializing cyber attack sequence...* 🚀`,
            
            `*${config.BOT_NAME} AI CORE ENGAGED* 🤖\n*Bypassing security protocols...* 🔓`,
            `*${config.BOT_NAME} deploying penetration tools...* 🛠️\n*Scanning vulnerable endpoints...* 📡`,
            
            '```[▰▱▱▱▱▱▱▱▱▱] 10%``` *Accessing mainframe...* ⏳',
            '```[▰▰▰▱▱▱▱▱▱▱] 20%``` *Injecting malware payload...* 💉',
            '```[▰▰▰▰▰▱▱▱▱▱] 30%``` *Decrypting security keys...* 🔑',
            '```[▰▰▰▰▰▰▰▱▱▱] 40%``` *Exploiting zero-day vulnerabilities...* 🕳️',
            '```[▰▰▰▰▰▰▰▰▰▱] 50%``` *Downloading confidential data...* 📥',
            '```[▰▰▰▰▰▰▰▰▰▰] 60%``` *Establishing backdoor access...* 🚪',
            '```[▰▰▰▰▰▰▰▰▰▰▰▱▱▱] 70%``` *Bypassing firewall...* 🔥',
            '```[▰▰▰▰▰▰▰▰▰▰▰▰▰▱▱] 80%``` *Covering tracks...* 🎭',
            '```[▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▱] 90%``` *Finalizing data extraction...* 📊',
            '```[▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰] 100%``` *MISSION ACCOMPLISHED* ✅',
            
            '🔓 *SYSTEM BREACH: SUCCESSFUL!* 🔓\n*All security layers compromised* 💀',
            '🚀 *COMMAND EXECUTION: COMPLETE!* 🎯\n*Root access achieved* 👑',
            
            `*${config.BOT_NAME} transmitting stolen data...* 📤\n*Data packets: 2.4TB transferred* 💾`,
            '_🕵️‍♂️ Erasing digital footprints..._ 🤫\n*Anti-forensics activated* 🧹',
            `*${config.BOT_NAME} finalizing cyber operations...* 🏁\n*Remote connection terminated* 📴`,
            
            '⚠️ *DANGER: HIGH-RISK OPERATION DETECTED* ⚠️',
            '⚠️ *WARNING: This is a simulated demonstration only*',
            '⚠️ *REMEMBER: Ethical hacking ensures digital security*',
            
            `> *${config.BOT_NAME} HACKING PROTOCOL COMPLETE ☣*\n> *SYSTEM STATUS: TARGET NEUTRALIZED* 🎯\n> *ALL DATA COMPROMISED SUCCESSFULLY* 💀`
        ];

        // Method 1: Try with much longer delays first
        let sentMessage = await reply("🚀 *Starting hacking simulation...*");
        
        for (let i = 0; i < steps.length; i++) {
            try {
                // Delete previous message and send new one (simulates update)
                try {
                    await conn.sendMessage(from, { 
                        delete: sentMessage.key 
                    });
                } catch (deleteError) {
                    // Ignore delete errors
                }
                
                // Send new message
                sentMessage = await conn.sendMessage(from, { 
                    text: steps[i] 
                }, { quoted: mek });
                
                // Use longer delays - 2 seconds for normal, 3 seconds for progress bars
                if (steps[i].includes('```[')) {
                    await new Promise(resolve => setTimeout(resolve, 3000));
                } else {
                    await new Promise(resolve => setTimeout(resolve, 2000));
                }
                
            } catch (error) {
                console.error(`Error at step ${i + 1}:`, error.message);
                // Wait longer and continue
                await new Promise(resolve => setTimeout(resolve, 3000));
            }
        }

        // Final message
        await conn.sendMessage(from, { 
            text: `✅ *${config.BOT_NAME} HACKING SIMULATION COMPLETED!*\n*All operations finished successfully!* 🎯` 
        }, { quoted: mek });

    } catch (e) {
        console.error(e);
        reply(`❌ *HACKING FAILED:* ${e.message}`);
    }
});
