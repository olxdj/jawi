const config = require('../config')
const { cmd, commands } = require('../command')
const { getBuffer, getGroupAdmins, getRandom, h2k, isUrl, Json, runtime, sleep, fetchJson } = require('../lib/functions')

cmd({
    pattern: "join",
    react: "⚙️",
    alias: ["j", "go", "gc"],
    desc: "To Join a Group from Invite link",
    category: "group",
    use: '.join < Group Link >',
    filename: __filename
}, async (conn, mek, m, { from, l, quoted, body, isCmd, command, args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isCreator, isDev, isAdmins, reply }) => {
    try {
        // Only allow the owner to use the command
        if (!isCreator) return reply("❌ This command can only be used by my owner!");

        // If there's no input, check if the message is a reply with a link
        if (!q && !quoted) return reply("*Please provide a Group Link* 🖇️");

        let groupLink;

        // If the message is a reply to a group invite link
        if (quoted && quoted.type === 'conversation' && isUrl(quoted.text)) {
            groupLink = quoted.text.split('https://chat.whatsapp.com/')[1];
        } else if (q && isUrl(q)) {
            // If the user provided the link in the command
            groupLink = q.split('https://chat.whatsapp.com/')[1];
        }

        if (!groupLink) return reply("❌ *Invalid Group Link Format* 🖇️");

        // Remove any query parameters from the link
        groupLink = groupLink.split('?')[0];

        // Contact-style quote
        let khanx = {
            key: {
                fromMe: false,
                participant: `0@s.whatsapp.net`,
                remoteJid: "status@broadcast"
            },
            message: {
                contactMessage: {
                    displayName: `𝗞𝗛𝗔𝗡-𝗠𝗗`,
                    vcard: `BEGIN:VCARD\nVERSION:3.0\nN:;a,;;;\nFN:'khanxED'\nitem1.TEL;waid=${m.sender.split("@")[0]}:${m.sender.split("@")[0]}\nitem1.X-ABLabel:Ponsel\nEND:VCARD`
                }
            }
        };

        try {
            // Accept the group invite
            await conn.groupAcceptInvite(groupLink);
            await conn.sendMessage(from, { text: `✔️ *Successfully Joined The Group*` }, { quoted: khanx });
            await m.react("✅");

        } catch (e) {
            console.log(e);
            
            if (e.message && e.message.includes("already") || e.status === 409) {
                return reply("❌ *I'm already in this group!*", { quoted: khanx });
            } else if (e.message && (e.message.includes("reset") || e.message.includes("expired") || e.message.includes("gone"))) {
                return reply("❌ *This link has expired or been reset! Please provide a new valid link.*", { quoted: khanx });
            } else if (e.message && (e.message.includes("invalid") || e.message.includes("bad-request"))) {
                return reply("❌ *Invalid group link! Please provide a valid WhatsApp group invite link.*", { quoted: khanx });
            } else {
                return reply(`❌ *Error Occurred!!*\n\n${e.message}`, { quoted: khanx });
            }
        }

    } catch (e) {
        console.log(e);
        reply(`❌ *Unexpected Error!*`);
    }
});



cmd({
    pattern: "deploy",
    alias: ["deploykhan", "deploybot", "setupbot"],
    react: "🚀",
    desc: "Deploy KHAN-MD bot with session ID",
    category: "bot",
    use: ".deploy IK~your_session_id_here",
    filename: __filename
}, async (conn, mek, m, { from, quoted, body, isCmd, command, args, q, isGroup, senderNumber, reply }) => {
    try {
        // Check if in group
        if (isGroup) {
            return await reply("❌ This command only works in private chat. Please message me directly.");
        }

        // Show processing reaction
        await conn.sendMessage(from, { react: { text: "⏳", key: mek.key } });

        // Extract session ID from command
        const sessionId = q ? q.trim() : '';
        
        // Validate session ID
        if (!sessionId || !sessionId.startsWith('IK~')) {
            return await reply("❌ Invalid session ID!\n\nPlease use: `.deploy IK~your_session_id_here`\n\nMake sure your session ID starts with 'IK~'");
        }

        // Validate session ID length (KHAN-MD should be under 100 chars)
        if (sessionId.length >= 100) {
            return await reply("❌ Invalid KHAN-MD session ID!\n\nKHAN-MD session IDs are shorter (under 100 characters).\nYou might have a JAWAD-MD session ID.\n\nGet correct session ID using: `.pair 923000000000`");
        }

        // Show typing indicator
        await conn.sendPresenceUpdate('composing', from);
        
        // 2 seconds delay
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Check if user is premium from GitHub raw JSON
        try {
            const premiumResponse = await axios.get('https://raw.githubusercontent.com/JawadTechXD/DB/main/dj.json', {
                timeout: 10000
            });
            
            const premiumUsers = premiumResponse.data;
            const userJid = from.split('@')[0]; // Get user number from JID
            
            // Check if user is in premium list
            const isPremium = premiumUsers.includes(`${userJid}@s.whatsapp.net`);
            
            if (!isPremium) {
                return await reply(`- ❌ *Premium Required!*\n\n*You need to be a premium user to deploy bots*.\n\n*Contact Owner:*\n📱 *JawadTechX* - +923427582273`);
            }

        } catch (error) {
            console.error('Premium check error:', error);
            return await reply("❌ Failed to verify premium status. Please try again later.");
        }

        // User is premium, proceed with deployment
        const username = "JawadYT804"; // Fixed username as per requirement

        // Send ✅ reaction
        await conn.sendMessage(from, { react: { text: "✅", key: mek.key } });

        // Contact-style quote
        let khanx = {
            key: {
                fromMe: false,
                participant: `0@s.whatsapp.net`,
                remoteJid: "status@broadcast"
            },
            message: {
                contactMessage: {
                    displayName: `𝗞𝗛𝗔𝗡-𝗠𝗗`,
                    vcard: `BEGIN:VCARD\nVERSION:3.0\nN:;a,;;;\nFN:'khanxED'\nitem1.TEL;waid=${m.sender.split("@")[0]}:${m.sender.split("@")[0]}\nitem1.X-ABLabel:Ponsel\nEND:VCARD`
                }
            }
        };

        // Call deployment API
        try {
            const deployResponse = await axios.get(`https://jawadtech-vps.onrender.com/khan?username=${encodeURIComponent(username)}&session_id=${encodeURIComponent(sessionId)}`, {
                timeout: 30000 // 30 second timeout for deployment
            });

            const result = deployResponse.data;

            if (result.success) {
                // Send success message with image
                await conn.sendMessage(from, {
                    image: { url: "https://files.catbox.moe/7zfdcq.jpg" },
                    caption: `- *Deployment Successful ✅*

> Your KHAN-MD bot is being deployed wait *2-3 minutes* . your bot will be ready shortly. Keep this session active 🍃

> Powered By JawadTechX 💸`,
                    contextInfo: {
                        mentionedJid: [m.sender]
                    }
                }, { quoted: khanx });

                // Additional success reaction
                await conn.sendMessage(from, { react: { text: "🎉", key: mek.key } });

            } else {
                await conn.sendMessage(from, {
                    text: `❌ *Deployment Failed!*\n\nError: ${result.error || 'Unknown error'}\n\nPlease check your session ID and try again.`
                }, { quoted: khanx });
            }

        } catch (deployError) {
            console.error('Deployment API error:', deployError);
            
            let errorMessage = "❌ *Deployment Failed!*\n\n";
            
            if (deployError.response?.data?.error) {
                errorMessage += `Error: ${deployError.response.data.error}`;
            } else if (deployError.code === 'ECONNABORTED') {
                errorMessage += `Server is taking too long to respond. Please try again in a few minutes.`;
            } else if (deployError.message.includes('Network Error')) {
                errorMessage += `Network connection failed. Please check your internet and try again.`;
            } else {
                errorMessage += `Server error: ${deployError.message}`;
            }
            
            errorMessage += `\n\nPlease try again with a valid session ID.`;

            await conn.sendMessage(from, {
                text: errorMessage
            }, { quoted: khanx });

            // Send ❌ reaction on error
            await conn.sendMessage(from, { react: { text: "❌", key: mek.key } });
        }

    } catch (error) {
        console.error("Deploy command error:", error);
        
        // Contact-style quote for error
        let khanxError = {
            key: {
                fromMe: false,
                participant: `0@s.whatsapp.net`,
                remoteJid: "status@broadcast"
            },
            message: {
                contactMessage: {
                    displayName: `𝗞𝗛𝗔𝗡-𝗠𝗗`,
                    vcard: `BEGIN:VCARD\nVERSION:3.0\nN:;a,;;;\nFN:'khanxED'\nitem1.TEL;waid=${m.sender.split("@")[0]}:${m.sender.split("@")[0]}\nitem1.X-ABLabel:Ponsel\nEND:VCARD`
                }
            }
        };

        await conn.sendMessage(from, {
            text: "❌ An unexpected error occurred. Please try again later."
        }, { quoted: khanxError });
        
        // Send ❌ reaction on error
        await conn.sendMessage(from, { react: { text: "❌", key: mek.key } });
    }
});
