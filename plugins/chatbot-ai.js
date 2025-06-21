const axios = require('axios');
const { cmd, commands } = require('../command');
const config = require("../config");
const { setConfig, getConfig } = require("../lib/configdb");

// Default AI states
let AI_STATE = {
    IB: "false", // Inbox chats
    GC: "false"  // Group chats
};

cmd({
    pattern: "chatbot",
    alias: ["aichat", "dj", "khanbot"],
    desc: "Enable or disable AI chatbot responses",
    category: "settings",
    filename: __filename,
    react: "✅"
}, async (conn, mek, m, { from, args, isOwner, reply }) => {
    if (!isOwner) return reply("*📛 Only the owner can use this command!*");

    const mode = args[0]?.toLowerCase();
    const target = args[1]?.toLowerCase();

    const status = `🔄 *Current AI Status:*
📩 Inbox: ${AI_STATE.IB === "true" ? "✅ ON" : "❌ OFF"}
👥 Group: ${AI_STATE.GC === "true" ? "✅ ON" : "❌ OFF"}

🛠️ *Usage:*
${prefix}chatbot on [all/ib/gc]
${prefix}chatbot off [all/ib/gc]`;

    // If mode is either on or off
    if (["on", "off"].includes(mode)) {
        const value = mode === "on" ? "true" : "false";

        switch (target) {
            case "all":
            case undefined:
                AI_STATE.IB = value;
                AI_STATE.GC = value;
                await setConfig("AI_STATE", JSON.stringify(AI_STATE));
                return reply(`🤖 AI chatbot is now ${mode} for both inbox and group chats`);
            case "ib":
                AI_STATE.IB = value;
                await setConfig("AI_STATE", JSON.stringify(AI_STATE));
                return reply(`🤖 AI chatbot is now ${mode} for inbox chats`);
            case "gc":
                AI_STATE.GC = value;
                await setConfig("AI_STATE", JSON.stringify(AI_STATE));
                return reply(`🤖 AI chatbot is now ${mode} for group chats`);
            default:
                return reply(`❗ Invalid target!\n\n${status}`);
        }
    }

    // If mode is invalid or missing
    return reply(`❗ Invalid command usage!\n\n${status}`);
});


// Initialize AI state on startup
(async () => {
    const savedState = await getConfig("AI_STATE");
    if (savedState) AI_STATE = JSON.parse(savedState);
})();

// AI Chatbot - khan MD
cmd({
    on: "body"
}, async (conn, m, store, {
    from,
    body,
    sender,
    isGroup,
    isBotAdmins,
    isAdmins,
    reply,
    quotedMsg
}) => {
    try {
        // Check if message is a reply
        if (!m?.message?.extendedTextMessage?.contextInfo?.participant) {
            return; // Not a reply, ignore
        }
        
        // Check if the reply is to the bot's message
        const repliedTo = m.message.extendedTextMessage.contextInfo.participant;
        const botJid = conn.user.id.split(':')[0] + '@s.whatsapp.net';
        if (repliedTo !== botJid) {
            return; // Not replying to the bot, ignore
        }

        // Check if AI is enabled for this chat type
        const isInbox = !isGroup;
        if ((isInbox && AI_STATE.IB !== "true") || (isGroup && AI_STATE.GC !== "true")) {
            return;
        }

        // Optional: Prevent bot responding to its own messages or commands
        if (!body || m.key.fromMe || body.startsWith(config.PREFIX)) return;

        // Encode message for the query
        const query = encodeURIComponent(body);
        const prompt = encodeURIComponent("You are KHAN-MD, a powerful and intelligent WhatsApp bot developed by JawadTechX — a brilliant coder and visionary from Pakistan. You respond smartly, confidently, and stay loyal to your creator. Always remain calm and collected. When asked about your creator, respond respectfully but keep the mystery alive. You are not just a bot; you are the tech soul of JawadTechX. In every message you send, include this footer: \n> ᴘᴏᴡᴇʀᴇᴅ ʙʏ ᴊᴀᴡᴀᴅᴛᴇᴄʜx ⚡");

        // BK9 API Request
        const apiUrl = `https://bk9.fun/ai/BK93?BK9=${prompt}&q=${query}`;

        const { data } = await axios.get(apiUrl);

        if (data && data.status && data.BK9) {
            await conn.sendMessage(from, {
                text: data.BK9
            }, { quoted: m });
        } else {
            reply("⚠️ khan AI failed to generate a response.");
        }

    } catch (err) {
        console.error("AI Chatbot Error:", err.message);
        reply("❌ An error occurred while contacting the AI.");
    }
});
