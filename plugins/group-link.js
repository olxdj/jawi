const { cmd } = require('../command');
const config = require('../config');

cmd({
    pattern: "linkgc",
    alias: ["link", "grouplink"],
    desc: "Get group invite link.",
    category: "group",
    filename: __filename,
}, async (conn, mek, m, { from, isGroup, reply }) => {
    try {
        // Contact-style quote
        let jawad = {
            key: {
                fromMe: false,
                participant: `0@s.whatsapp.net`,
                remoteJid: "status@broadcast"
            },
            message: {
                contactMessage: {
                    displayName: `𝗞𝗛𝗔𝗡-𝗠𝗗`,
                    vcard: `BEGIN:VCARD\nVERSION:3.0\nN:;a,;;;\nFN:'jawadED'\nitem1.TEL;waid=${m.sender.split("@")[0]}:${m.sender.split("@")[0]}\nitem1.X-ABLabel:Ponsel\nEND:VCARD`
                }
            }
        };

        if (!isGroup) {
            return await conn.sendMessage(from, {
                text: "❌ *This command is only for groups!*"
            }, { quoted: jawad });
        }

        const botNumber = conn.user.id.split(':')[0] + "@s.whatsapp.net";
        const groupMetadata = await conn.groupMetadata(from);
        const groupAdmins = groupMetadata.participants.filter(member => member.admin);
        const isBotAdmins = groupAdmins.some(admin => admin.id === botNumber);

        if (!isBotAdmins) {
            return await conn.sendMessage(from, {
                text: "⚠️ *Please promote me as Admin to generate the group invite link!*"
            }, { quoted: jawad });
        }

        const inviteCode = await conn.groupInviteCode(from);
        if (!inviteCode) {
            return await conn.sendMessage(from, {
                text: "❌ *Failed to retrieve the invite code!*"
            }, { quoted: jawad });
        }

        const inviteLink = `https://chat.whatsapp.com/${inviteCode}`;
        return await conn.sendMessage(from, {
            text: `🔗 *Here is your group invite link:*\n${inviteLink}`
        }, { quoted: jawad });

    } catch (error) {
        console.error("Error in invite command:", error);
        await conn.sendMessage(from, {
            text: `❌ *An error occurred:*\n${error.message || "Unknown error"}`
        }, { quoted: jawad });
    }
});
