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

        // Send initial message to confirm command is working
        await reply("🚀 *Hacking sequence initiated... Stand by for updates...*");

        // Send all messages with proper error handling
        for (let i = 0; i < steps.length; i++) {
            try {
                await conn.sendMessage(from, { text: steps[i] }, { quoted: mek });
                
                // Add dynamic delay - longer delays for progress bars
                if (steps[i].includes('```[')) {
                    await new Promise(resolve => setTimeout(resolve, 1200)); // Longer delay for progress updates
                } else {
                    await new Promise(resolve => setTimeout(resolve, 800)); // Normal delay for other messages
                }
                
                // Small delay every 3 messages to avoid rate limiting
                if ((i + 1) % 3 === 0) {
                    await new Promise(resolve => setTimeout(resolve, 500));
                }
                
            } catch (error) {
                console.error(`Error sending message ${i + 1}:`, error);
                // Continue with next message instead of stopping
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
        }

        // Final confirmation
        await conn.sendMessage(from, { 
            text: `✅ *${config.BOT_NAME} Hacking Simulation Completed Successfully!*` 
        }, { quoted: mek });

    } catch (e) {
        console.error(e);
        reply(`❌ *CYBER ATTACK FAILED:* ${e.message}`);
    }
});
