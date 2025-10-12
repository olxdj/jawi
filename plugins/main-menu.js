const config = require('../config')
const { cmd, commands } = require('../command');
const path = require('path');
const os = require("os")
const fs = require('fs');
const {runtime} = require('../lib/functions')
const axios = require('axios')

// Helper function for small caps text
const toSmallCaps = (text) => {
    const smallCapsMap = {
        'a': 'ᴀ', 'b': 'ʙ', 'c': 'ᴄ', 'd': 'ᴅ', 'e': 'ᴇ', 'f': 'ғ', 'g': 'ɢ', 'h': 'ʜ', 'i': 'ɪ',
        'j': 'ᴊ', 'k': 'ᴋ', 'l': 'ʟ', 'm': 'ᴍ', 'n': 'ɴ', 'o': 'ᴏ', 'p': 'ᴘ', 'q': 'ǫ', 'r': 'ʀ',
        's': 's', 't': 'ᴛ', 'u': 'ᴜ', 'v': 'ᴠ', 'w': 'ᴡ', 'x': 'x', 'y': 'ʏ', 'z': 'ᴢ',
        'A': 'ᴀ', 'B': 'ʙ', 'C': 'ᴄ', 'D': 'ᴅ', 'E': 'ᴇ', 'F': 'ғ', 'G': 'ɢ', 'H': 'ʜ', 'I': 'ɪ',
        'J': 'ᴊ', 'K': 'ᴋ', 'L': 'ʟ', 'M': 'ᴍ', 'N': 'ɴ', 'O': 'ᴏ', 'P': 'ᴘ', 'Q': 'ǫ', 'R': 'ʀ',
        'S': 's', 'T': 'ᴛ', 'U': 'ᴜ', 'V': 'ᴠ', 'W': 'ᴡ', 'X': 'x', 'Y': 'ʏ', 'Z': 'ᴢ'
    };
    return text.split('').map(char => smallCapsMap[char] || char).join('');
};

// Format category with your exact styles
const formatCategory = (category, cmds) => {
    let title = `\n\`『 ${category.toUpperCase()} 』\`\n╭───────────────────⊷\n`;
    let body = cmds.map(cmd => `*┋ ⬡ ${toSmallCaps(cmd.pattern)}*`).join('\n');
    let footer = `\n╰───────────────────⊷`;
    return `${title}${body}${footer}`;
};

cmd({
    pattern: "menu2",
    alias: ["allmenu","fullmenu"],
    use: '.menu2',
    desc: "Show all bot commands",
    category: "menu",
    react: "📜",
    filename: __filename
},
async (conn, mek, m, { from, quoted, body, isCmd, command, args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply }) => {
    try {
        let totalCommands = Object.keys(commands).length;
        
        // Get all unique categories
        const categories = [...new Set(Object.values(commands).map(c => c.category))].filter(Boolean);
        
        // Organize commands by category
        const categorized = {};
        categories.forEach(cat => {
            categorized[cat] = Object.values(commands).filter(c => c.category === cat);
        });

        // Build menu sections
        let menuSections = '';
        for (const [category, cmds] of Object.entries(categorized)) {
            menuSections += formatCategory(category, cmds);
        }

        // Main menu text with your exact header style
        let dec = `*╭────⬡ ${config.BOT_NAME} ⬡────⭓* 
*├▢ 🤖 Owner:* ${config.OWNER_NAME}
*├▢ 📜 Commands:* ${totalCommands}
*├▢ ⏱️ Runtime:* ${runtime(process.uptime())}
*├▢ 📡 Baileys:* Multi Device
*├▢ ☁️ Platform:* Heroku
*├▢ 📦 Prefix:* ${config.PREFIX}
*├▢ ⚙️ Mode:* ${config.MODE}
*├▢ 🏷️ Version:* 5.0.0 Bᴇᴛᴀ
*╰─────────────────⭓*

${menuSections}

> ${config.DESCRIPTION}`;

        await conn.sendMessage(from, { 
            image: { url: config.MENU_IMAGE_URL || 'https://files.catbox.moe/7zfdcq.jpg' }, 
            caption: dec, 
            contextInfo: { 
                mentionedJid: [m.sender], 
                forwardingScore: 999, 
                isForwarded: true, 
                forwardedNewsletterMessageInfo: { 
                    newsletterJid: '120363354023106228@newsletter', 
                    newsletterName: config.BOT_NAME, 
                    serverMessageId: 143 
                } 
            } 
        }, { quoted: mek });

    } catch (e) { 
        console.log(e); 
        reply(`Error: ${e}`); 
    } 
});
