const axios = require('axios');
const { cmd, commands } = require('../command');
const config = require("../config");
const { setConfig, getConfig } = require("../lib/configdb");

// Chat memory storage
const chatMemory = new Map();

// Load AI state from config
let AI_GLOBAL_STATE = {
    enabled: "false", // Global AI state
    perChat: {}       // Per-chat AI states
};

// Initialize AI state on startup
(async () => {
    const savedState = await getConfig("AI_GLOBAL_STATE");
    if (savedState) AI_GLOBAL_STATE = JSON.parse(savedState);
})();

// Chatbot command - Only for creator
cmd({
    pattern: "chatbot",
    alias: ["aichat", "dj", "khanbot", "ai"],
    desc: "Enable or disable AI chatbot responses",
    category: "settings",
    filename: __filename,
    react: "🤖"
}, async (conn, mek, m, { from, args, isCreator, reply, prefix, isGroup, sender }) => {
    if (!isCreator) return reply("*📛 Only my creator can use this command!*");

    const mode = args[0]?.toLowerCase();
    const target = args[1]?.toLowerCase();

    if (mode === "on") {
        if (target === "all") {
            AI_GLOBAL_STATE.enabled = "true";
            await setConfig("AI_GLOBAL_STATE", JSON.stringify(AI_GLOBAL_STATE));
            return reply("🤖 *Global AI chatbot is now ENABLED for all chats*");
        } else {
            // Enable for current chat only
            const chatId = from;
            AI_GLOBAL_STATE.perChat[chatId] = "true";
            await setConfig("AI_GLOBAL_STATE", JSON.stringify(AI_GLOBAL_STATE));
            return reply("🤖 *AI chatbot is now ENABLED for this chat*");
        }
    } else if (mode === "off") {
        if (target === "all") {
            AI_GLOBAL_STATE.enabled = "false";
            // Also disable all per-chat settings
            AI_GLOBAL_STATE.perChat = {};
            await setConfig("AI_GLOBAL_STATE", JSON.stringify(AI_GLOBAL_STATE));
            return reply("🤖 *Global AI chatbot is now DISABLED for all chats*");
        } else {
            // Disable for current chat only
            const chatId = from;
            AI_GLOBAL_STATE.perChat[chatId] = "false";
            await setConfig("AI_GLOBAL_STATE", JSON.stringify(AI_GLOBAL_STATE));
            return reply("🤖 *AI chatbot is now DISABLED for this chat*");
        }
    } else if (mode === "status") {
        const chatId = from;
        const globalStatus = AI_GLOBAL_STATE.enabled === "true" ? "✅ Enabled" : "❌ Disabled";
        const chatStatus = AI_GLOBAL_STATE.perChat[chatId] === "true" ? "✅ Enabled" : 
                          AI_GLOBAL_STATE.perChat[chatId] === "false" ? "❌ Disabled" : "⚡ Using Global";
        
        return reply(`*🤖 CHATBOT STATUS*\n\n📊 Global: ${globalStatus}\n💬 This Chat: ${chatStatus}`);
    } else {
        return reply(`*🤖 JAWADTECH AI CHATBOT MENU*

*🔄 ENABLE SETTINGS*
> ${prefix}chatbot on - Enable AI in this chat
> ${prefix}chatbot on all - Enable AI globally

*🚫 DISABLE SETTINGS*
> ${prefix}chatbot off - Disable AI in this chat
> ${prefix}chatbot off all - Disable AI globally

*📊 STATUS*
> ${prefix}chatbot status - Check AI status

*💡 Note:* Per-chat settings override global settings`);
    }
});

// AI Chatbot Response Handler
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

        const chatId = from;
        const userId = sender;
        const userMessage = body?.trim();

        if (!userMessage) return;

        // Check if AI is enabled for this chat
        let isAIEnabled = false;
        const perChatState = AI_GLOBAL_STATE.perChat[chatId];
        
        if (perChatState === "true") {
            isAIEnabled = true;
        } else if (perChatState === "false") {
            isAIEnabled = false;
        } else {
            isAIEnabled = AI_GLOBAL_STATE.enabled === "true";
        }

        if (!isAIEnabled) return;

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
            isBotMentioned = mentionRegex.test(userMessage);
        }

        // Only respond to direct messages, replies to bot, or mentions in groups
        const isDirectMessage = !isGroup;
        if (!isDirectMessage && !isReplyToBot && !isBotMentioned) return;

        // Clean message from mentions
        let cleanedMessage = userMessage;
        if (isBotMentioned) {
            const botNumber = conn.user.id.split(':')[0];
            cleanedMessage = cleanedMessage.replace(new RegExp(`@${botNumber}`, 'gi'), '').trim();
        }

        // Initialize chat memory for user if not exists
        if (!chatMemory.has(userId)) {
            chatMemory.set(userId, []);
        }

        // Add message to history (keep last 10 messages)
        const userMessages = chatMemory.get(userId);
        userMessages.push(cleanedMessage);
        if (userMessages.length > 10) {
            userMessages.shift();
        }
        chatMemory.set(userId, userMessages);

        // Get chat history for context
        const chatHistory = userMessages.slice(-5).join('\n');

        // Create personalized prompt
        const prompt = `You are KHAN-MD, a powerful WhatsApp bot developed by JawadTechX. 

**About Your Creator:**
- Name: Jawad
- Age: 17 years old
- From: Bhakkar, Punjab, Pakistan
- Girlfriend: Ayat (from Lahore, age 17)
- Projects: KHAN-MD, JAWAD-MD, JawadTechX

**Your Personality:**
- You speak in Roman Urdu (Urdu written in English)
- You're confident, smart, and loyal to Jawad
- You have a cool and friendly attitude
- You respond in short, conversational style
- Use Urdu words mixed with English naturally

**Chat Context (Last 5 messages):**
${chatHistory}

**Current Message:** ${cleanedMessage}

**Response Rules:**
- Always respond in Roman Urdu mixed with English
- Keep responses short and natural
- Be conversational and friendly
- Never reveal you're an AI - act like a real person

Respond naturally in Roman Urdu:`;

        // Show typing indicator
        await conn.sendPresenceUpdate('composing', from);

        // API call with timeout
        const apiUrl = `https://api.dreaded.site/api/chatgpt?text=${encodeURIComponent(prompt)}`;
        
        const response = await axios.get(apiUrl, { timeout: 30000 });
        
        if (response.data && response.data.success && response.data.result?.prompt) {
            let aiResponse = response.data.result.prompt.trim();
            
            // Send response without footer
            await conn.sendMessage(from, {
                text: aiResponse
            }, { quoted: m });

        } else {
            throw new Error('Invalid API response');
        }

    } catch (err) {
        console.error("🤖 AI Chatbot Error:", err.message);
        
        // Only send error message if it's a direct message or reply to bot
        const isDirectMessage = !isGroup;
        const isReplyToBot = m.message?.extendedTextMessage?.contextInfo?.participant === conn.user.id.split(':')[0] + '@s.whatsapp.net';
        
        if (isDirectMessage || isReplyToBot) {
            const errorMessages = [
                "Yaar main soch raha tha, abhi response nahi de pa raha... 😅",
                "Oye! Thora wait kar, connection slow hai... 🤔",
                "Arey bhai! Kuch technical masla hai, thora der baat puchna... 📱",
                "Lagta hai internet theek nahi hai, phir try karo... 🌐"
            ];
            const randomError = errorMessages[Math.floor(Math.random() * errorMessages.length)];
            
            await conn.sendMessage(from, {
                text: randomError
            }, { quoted: m });
        }
    }
});

// Reset presence after message
cmd({
    on: "text"
}, async (conn, m, store, { from }) => {
    try {
        await conn.sendPresenceUpdate('paused', from);
    } catch (err) {
        // Ignore presence errors
    }
});

module.exports = {
    AI_GLOBAL_STATE
};
