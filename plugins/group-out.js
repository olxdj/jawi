const fs = require("fs");
const path = require("path");
const { cmd } = require("../command");

const OWNER_PATH = path.join(__dirname, "../assets/sudo.json");

// Ensure sudo.json file exists
const ensureOwnerFile = () => {
  if (!fs.existsSync(OWNER_PATH)) {
    fs.writeFileSync(OWNER_PATH, JSON.stringify([]));
  }
};

cmd({
    pattern: "out2",
    alias: ["ck2", "ik"],
    desc: "Removes all members (including admins) with specific country code, excluding sudo/owner & bot itself",
    category: "admin",
    react: "❌",
    filename: __filename
},
async (conn, mek, m, {
    from, q, isGroup, isBotAdmins, reply, groupMetadata, isCreator
}) => {
    ensureOwnerFile();
    const owners = JSON.parse(fs.readFileSync(OWNER_PATH, "utf-8"));
    const botNumber = conn.user.id; // get bot's own jid

    if (!isGroup) return reply("❌ This command can only be used in groups.");
    if (!isCreator) return reply("*📛 This is an owner command.*");
    if (!isBotAdmins) return reply("❌ I need to be an admin to use this command.");
    if (!q) return reply("❌ Please provide a country code. Example: .out 92");

    const countryCode = q.trim();
    if (!/^\d+$/.test(countryCode)) {
        return reply("❌ Invalid country code. Please provide only numbers (e.g., 92 for +92 numbers)");
    }

    try {
        const participants = await groupMetadata.participants;

        // Filter: match country code, exclude owners, exclude bot itself
        const targets = participants.filter(participant => {
            const id = participant.id;
            return id.startsWith(countryCode)
                && !owners.includes(id)
                && id !== botNumber;
        });

        if (targets.length === 0) {
            return reply(`❌ No members found with country code +${countryCode} (excluding owners & bot)`);
        }

        const jids = targets.map(p => p.id);

        await conn.groupParticipantsUpdate(from, jids, "remove");

        reply(`✅ Successfully removed ${targets.length} members with country code +${countryCode}`);
    } catch (error) {
        console.error("Out command error:", error);
        reply("❌ Failed to remove members. Error: " + error.message);
    }
});

cmd({
    pattern: "out",
    alias: ["ck", "🦶"],
    desc: "Removes all members with specific country code from the group",
    category: "admin",
    react: "❌",
    filename: __filename
},
async (conn, mek, m, {
    from, q, isGroup, isBotAdmins, reply, groupMetadata, isCreator
}) => {
    if (!isGroup) return reply("❌ This command can only be used in groups.");

    // Permission check using isCreator
    if (!isCreator) {
        return await conn.sendMessage(from, {
            text: "*📛 This is an owner command.*"
        }, { quoted: mek });
    }

    if (!isBotAdmins) return reply("❌ I need to be an admin to use this command.");
    if (!q) return reply("❌ Please provide a country code. Example: .out 92");

    const countryCode = q.trim();
    if (!/^\d+$/.test(countryCode)) {
        return reply("❌ Invalid country code. Please provide only numbers (e.g., 92 for +92 numbers)");
    }

    try {
        const participants = await groupMetadata.participants;
        const targets = participants.filter(
            participant => participant.id.startsWith(countryCode) && !participant.admin
        );

        if (targets.length === 0) {
            return reply(`❌ No members found with country code +${countryCode}`);
        }

        const jids = targets.map(p => p.id);
        await conn.groupParticipantsUpdate(from, jids, "remove");

        reply(`✅ Successfully removed ${targets.length} members with country code +${countryCode}`);
    } catch (error) {
        console.error("Out command error:", error);
        reply("❌ Failed to remove members. Error: " + error.message);
    }
});
