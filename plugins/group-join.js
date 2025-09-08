const config = require('../config')
const { cmd, commands } = require('../command')
const { getBuffer, getGroupAdmins, getRandom, h2k, isUrl, Json, runtime, sleep, fetchJson } = require('../lib/functions')

cmd({
    pattern: "join",
    react: "⚙️",
    alias: ["j", "gc", "chalo"],
    desc: "To Join a Group from Invite link",
    category: "group",
    use: '.join < Group Link >',
    filename: __filename
}, async (conn, mek, m, { from, l, quoted, body, isCmd, command, args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isCreator, isDev, isAdmins, reply }) => {
    try {
        const msr = {
            own_cmd: "You don't have permission to use this command."
        };

        // Only allow the creator to use the command
        if (!isCreator) return reply(msr.own_cmd);

        // If there's no input, check if the message is a reply with a link
        if (!q && !quoted) return reply("*Please write the Group Link*️ 🖇️");

        let groupLink;

        // If the message is a reply to a group invite link
        if (quoted && quoted.type === 'conversation' && isUrl(quoted.text)) {
            groupLink = quoted.text.split('https://chat.whatsapp.com/')[1];
        } else if (q && isUrl(q)) {
            // If the user provided the link in the command
            groupLink = q.split('https://chat.whatsapp.com/')[1];
        }

        if (!groupLink) return reply("❌ *Invalid Group Link* 🖇️");

        // Remove any query parameters from the link
        groupLink = groupLink.split('?')[0];

        try {
            // Accept the group invite
            await conn.groupAcceptInvite(groupLink);
            
            // Contact-style quote
            let gift = {
                key: {
                    fromMe: false,
                    participant: `0@s.whatsapp.net`,
                    remoteJid: "status@broadcast"
                },
                message: {
                    contactMessage: {
                        displayName: `𝗞𝗛𝗔𝗡-𝗠𝗗`,
                        vcard: `BEGIN:VCARD\nVERSION:3.0\nN:;a,;;;\nFN:'GIFTED'\nitem1.TEL;waid=${m.sender.split("@")[0]}:${m.sender.split("@")[0]}\nitem1.X-ABLabel:Ponsel\nEND:VCARD`
                    }
                }
            };

            await conn.sendMessage(from, { 
                text: `✔️ *Successfully Joined The Group*`,
                contextInfo: {
                    mentionedJid: [m.sender],
                    forwardingScore: 5,
                    isForwarded: true,
                    forwardedNewsletterMessageInfo: {
                        newsletterJid: '120363354023106228@newsletter',
                        newsletterName: "Jawad TechX 🇵🇸",
                        serverMessageId: 143
                    }
                }
            }, { quoted: gift });

            await m.react("✅");

        } catch (e) {
            if (e.message && e.message.includes("already")) {
                return reply("❌ *I'm already in this group!*");
            } else if (e.message && e.message.includes("reset") || e.message.includes("expired")) {
                return reply("❌ *This link has expired or been reset! Please provide a new valid link.*");
            } else if (e.message && e.message.includes("invalid")) {
                return reply("❌ *Invalid group link! Please provide a valid WhatsApp group invite link.*");
            } else {
                throw e;
            }
        }

    } catch (e) {
        await conn.sendMessage(from, { react: { text: '❌', key: mek.key } });
        console.log(e);
        reply(`❌ *Error Occurred!!*\n\n${e.message}`);
    }
});
