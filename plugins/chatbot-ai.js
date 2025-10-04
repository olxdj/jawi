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
}, async (conn, mek, m, { from, args, isOwner, reply, prefix }) => {
    if (!isOwner) return reply("*📛 Only the owner can use this command!*");

    const mode = args[0]?.toLowerCase();
    const target = args[1]?.toLowerCase();

    if (mode === "on") {
        if (!target || target === "all") {
            AI_STATE.IB = "true";
            AI_STATE.GC = "true";
            await setConfig("AI_STATE", JSON.stringify(AI_STATE));
            return reply("🤖 AI chatbot is now enabled for both inbox and group chats");
        } else if (target === "ib") {
            AI_STATE.IB = "true";
            await setConfig("AI_STATE", JSON.stringify(AI_STATE));
            return reply("🤖 AI chatbot is now enabled for inbox chats");
        } else if (target === "gc") {
            AI_STATE.GC = "true";
            await setConfig("AI_STATE", JSON.stringify(AI_STATE));
            return reply("🤖 AI chatbot is now enabled for group chats");
        }
    } else if (mode === "off") {
        if (!target || target === "all") {
            AI_STATE.IB = "false";
            AI_STATE.GC = "false";
            await setConfig("AI_STATE", JSON.stringify(AI_STATE));
            return reply("🤖 AI chatbot is now disabled for both inbox and group chats");
        } else if (target === "ib") {
            AI_STATE.IB = "false";
            await setConfig("AI_STATE", JSON.stringify(AI_STATE));
            return reply("🤖 AI chatbot is now disabled for inbox chats");
        } else if (target === "gc") {
            AI_STATE.GC = "false";
            await setConfig("AI_STATE", JSON.stringify(AI_STATE));
            return reply("🤖 AI chatbot is now disabled for group chats");
        }
    } else {
        return reply(`- *JawadTech-Chat-Bot Menu 👾*
*Enable Settings ✅*      
> .chatbot on all - Enable AI in all chats
> .chatbot on ib - Enable AI in inbox only
> .chatbot on gc - Enable AI in groups only
*Disable Settings ❌*
> .chatbot off all - Disable AI in all chats
> .chatbot off ib - Disable AI in inbox only
> .chatbot off gc - Disable AI in groups only`);
    }
});

// Initialize AI state on startup
(async () => {
    const savedState = await getConfig("AI_STATE");
    if (savedState) AI_STATE = JSON.parse(savedState);
})();

// AI Chatbot - khan MD
cmd({
    on: "text"
}, async (conn, m, store, {
    from,
    body,
    sender,
    isGroup,
    isBotAdmins,
    isAdmins,
    reply,
    quotedMsg,
    isCmd
}) => {
    try {
        // Skip if it's a command
        if (isCmd) return;

        // Check if AI is enabled for this chat type
        const isInbox = !isGroup;
        if ((isInbox && AI_STATE.IB !== "true") || (isGroup && AI_STATE.GC !== "true")) {
            return;
        }

        // Prevent bot responding to its own messages
        if (!body || m.key.fromMe) return;

        // Check if message is a reply to bot's message
        let isReplyToBot = false;
        if (m.message?.extendedTextMessage?.contextInfo?.participant) {
            const repliedTo = m.message.extendedTextMessage.contextInfo.participant;
            const botJid = conn.user.id.split(':')[0] + '@s.whatsapp.net';
            if (repliedTo === botJid) {
                isReplyToBot = true;
            }
        }

        // Check for bot mention in groups
        let isBotMentioned = false;
        if (isGroup) {
            const botNumber = conn.user.id.split(':')[0];
            const mentionRegex = new RegExp(`@${botNumber}`, 'i');
            isBotMentioned = mentionRegex.test(body);
        }

        // Only respond to direct messages, replies to bot, or mentions in groups
        const isDirectMessage = !isGroup;
        if (!isDirectMessage && !isReplyToBot && !isBotMentioned) return;

        // Clean message from mentions
        let cleanedMessage = body;
        if (isBotMentioned) {
            const botNumber = conn.user.id.split(':')[0];
            cleanedMessage = cleanedMessage.replace(new RegExp(`@${botNumber}`, 'gi'), '').trim();
        }

        // Handle time/date questions directly
        const lowerBody = cleanedMessage.toLowerCase();
        if (lowerBody.includes('time') || lowerBody.includes('date')) {
            const now = new Date();
            const options = { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                timeZoneName: 'short'
            };
            const currentDateTime = now.toLocaleDateString('en-US', options);
            return reply(`⏰ Current Date & Time:\n${currentDateTime}`);
        }

        // Show typing indicator for 1 second
        await conn.sendPresenceUpdate('composing', from);
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Create prompt for new API
        const prompt = `You are KHAN-MD, a powerful WhatsApp bot developed by JawadTechX. 

About Your Creator:
- Name: Jawad
- Age: 17 years old
- From: Bhakkar, Punjab, Pakistan
- Girlfriend: Ayat (from Lahore, age 17)
- Projects: KHAN-MD, JAWAD-MD, JawadTechX

Your Personality:
- You speak in Roman Urdu (Urdu written in English)
- You're confident, smart, and loyal to Jawad
- You have a cool and friendly attitude
- You respond in short, conversational style
- Use Urdu words mixed with English naturally
- Never reveal you're an AI - act like a real person

Current Message: ${cleanedMessage}

Respond naturally in Roman Urdu:`;

        // New API Request
        const apiUrl = `https://api.dreaded.site/api/chatgpt?text=${encodeURIComponent(prompt)}`;

        const response = await axios.get(apiUrl, { timeout: 30000 });

        if (response.data && response.data.success && response.data.result?.prompt) {
            let aiResponse = response.data.result.prompt.trim();
            
            await conn.sendMessage(from, {
                text: aiResponse
            }, { quoted: m });
        } else {
            throw new Error('Invalid API response');
        }

    } catch (err) {
        console.error("AI Chatbot Error:", err.message);
        
        // Only send error message if it's a direct message or reply to bot
        const isDirectMessage = !isGroup;
        const isReplyToBot = m.message?.extendedTextMessage?.contextInfo?.participant === conn.user.id.split(':')[0] + '@s.whatsapp.net';
        
        if (isDirectMessage || isReplyToBot) {
            const errorMessages = [
                "Yaar main soch raha tha, abhi response nahi de pa raha... 😅",
                "Oye! Thora wait kar, connection slow hai... 🤔",
                "Arey bhai! Kuch technical masla hai, thora der baat puchna... 📱"
            ];
            const randomError = errorMessages[Math.floor(Math.random() * errorMessages.length)];
            
            await reply(randomError);
        }
    }
});
