const config = require('../config');
const { cmd } = require('../command');
const fs = require('fs');

cmd({
    pattern: "bugmenu",
    desc: "Show bug related menu",
    category: "menu2",
    react: "🐞",
    filename: __filename
},
async (conn, mek, m, { from, sender, pushname, reply }) => {
    try {
        const bugMenu = `*╭────⬡ BUG MENU ⬡────*
*├▢ 🐞* *android*
*├▢ 📱* *android2 92xxxx*
*├▢ 🔥* *android3 92*
*├▢ 🔒* *otplock*
*├▢ 🍏* *ios*
*├▢ 🪲* *bugcall*
*├▢ 💣* *bugpv*
*├▢ 👥* *buggroup*
*├▢ 🚀* *bugspam*
*├▢ ⚡* *buglag*
*├▢ 🧨* *bugauto*
*├▢ 🕸️* *bugblock*
*├▢ 🔄* *bugmulti*
*├▢ 🧩* *bugrandom*
*├▢ 🐝* *bugbotcrash*
*├▢ ☠️* *bugvirus*
*├▢ 💀* *bug*
*╰──────────────⬣*

> ${config.DESCRIPTION}
`;

        await conn.sendMessage(
            from,
            {
                image: { url: config.MENU_IMAGE_URL },
                caption: bugMenu,
                contextInfo: {
                    mentionedJid: [m.sender],
                    forwardingScore: 999,
                    isForwarded: true,
                    forwardedNewsletterMessageInfo: {
                        newsletterJid: '120363354023106228@newsletter',
                        newsletterName: 'JawadTechX',
                        serverMessageId: 143
                    }
                }
            },
            { quoted: mek }
        );

    } catch (e) {
        console.error(e);
        reply(`❌ Error:\n${e}`);
    }
});

cmd({
    pattern: "otplock",
    desc: "Premium bug command",
    category: "bugs",
    react: "🐞",
    filename: __filename
},
async (conn, mek, m, { reply }) => {
    reply(`*🚀 This command only premium user can use*\n*Contact developer to get premium connection*\n\nhttps://wa.me/message/C5OJ7S4CYLZ5E1`);
});



cmd({
    pattern: "android3",
    desc: "Premium bug command",
    category: "bugs",
    react: "🐞",
    filename: __filename
},
async (conn, mek, m, { reply }) => {
    reply(`*🚀 This command only premium user can use*\n*Contact developer to get premium connection*\n\nhttps://wa.me/message/C5OJ7S4CYLZ5E1`);
});


cmd({
    pattern: "android2",
    desc: "Premium bug command",
    category: "bugs",
    react: "🐞",
    filename: __filename
},
async (conn, mek, m, { reply }) => {
    reply(`*🚀 This command only premium user can use*\n*Contact developer to get premium connection*\n\nhttps://wa.me/message/C5OJ7S4CYLZ5E1`);
});


cmd({
    pattern: "android",
    desc: "Premium bug command",
    category: "bugs",
    react: "🐞",
    filename: __filename
},
async (conn, mek, m, { reply }) => {
    reply(`*🚀 This command only premium user can use*\n*Contact developer to get premium connection*\n\nhttps://wa.me/message/C5OJ7S4CYLZ5E1`);
});


cmd({
    pattern: "ios",
    desc: "Premium bug command",
    category: "bugs",
    react: "🐞",
    filename: __filename
},
async (conn, mek, m, { reply }) => {
    reply(`*🚀 This command only premium user can use*\n*Contact developer to get premium connection*\n\nhttps://wa.me/message/C5OJ7S4CYLZ5E1`);
});

cmd({
    pattern: "bugcall",
    desc: "Premium bug command",
    category: "bugs",
    react: "🐞",
    filename: __filename
},
async (conn, mek, m, { reply }) => {
    reply(`*🚀 This command only premium user can use*\n*Contact developer to get premium connection*\n\nhttps://wa.me/message/C5OJ7S4CYLZ5E1`);
});

cmd({
    pattern: "bugpv",
    desc: "Premium bug command",
    category: "bugs",
    react: "🐞",
    filename: __filename
},
async (conn, mek, m, { reply }) => {
    reply(`*🚀 This command only premium user can use*\n*Contact developer to get premium connection*\n\nhttps://wa.me/message/C5OJ7S4CYLZ5E1`);
});

cmd({
    pattern: "buggroup",
    desc: "Premium bug command",
    category: "bugs",
    react: "🐞",
    filename: __filename
},
async (conn, mek, m, { reply }) => {
    reply(`*🚀 This command only premium user can use*\n*Contact developer to get premium connection*\n\nhttps://wa.me/message/C5OJ7S4CYLZ5E1`);
});



cmd({
    pattern: "bugblock",
    desc: "Premium bug command",
    category: "bugs",
    react: "🐞",
    filename: __filename
},
async (conn, mek, m, { reply }) => {
    reply(`*🚀 This command only premium user can use*\n*Contact developer to get premium connection*\n\nhttps://wa.me/message/C5OJ7S4CYLZ5E1`);
});



cmd({
    pattern: "bugauto",
    desc: "Premium bug command",
    category: "bugs",
    react: "🐞",
    filename: __filename
},
async (conn, mek, m, { reply }) => {
    reply(`*🚀 This command only premium user can use*\n*Contact developer to get premium connection*\n\nhttps://wa.me/message/C5OJ7S4CYLZ5E1`);
});



cmd({
    pattern: "buglag",
    desc: "Premium bug command",
    category: "bugs",
    react: "🐞",
    filename: __filename
},
async (conn, mek, m, { reply }) => {
    reply(`*🚀 This command only premium user can use*\n*Contact developer to get premium connection*\n\nhttps://wa.me/message/C5OJ7S4CYLZ5E1`);
});



cmd({
    pattern: "bugspam",
    desc: "Premium bug command",
    category: "bugs",
    react: "🐞",
    filename: __filename
},
async (conn, mek, m, { reply }) => {
    reply(`*🚀 This command only premium user can use*\n*Contact developer to get premium connection*\n\nhttps://wa.me/message/C5OJ7S4CYLZ5E1`);
});

cmd({
    pattern: "bugmulti",
    desc: "Premium bug command",
    category: "bugs",
    react: "🐞",
    filename: __filename
},
async (conn, mek, m, { reply }) => {
    reply(`*🚀 This command only premium user can use*\n*Contact developer to get premium connection*\n\nhttps://wa.me/message/C5OJ7S4CYLZ5E1`);
});

cmd({
    pattern: "bugrandom",
    desc: "Premium bug command",
    category: "bugs",
    react: "🐞",
    filename: __filename
},
async (conn, mek, m, { reply }) => {
    reply(`*🚀 This command only premium user can use*\n*Contact developer to get premium connection*\n\nhttps://wa.me/message/C5OJ7S4CYLZ5E1`);
});

cmd({
    pattern: "bugbotcrash",
    desc: "Premium bug command",
    category: "bugs",
    react: "🐞",
    filename: __filename
},
async (conn, mek, m, { reply }) => {
    reply(`*🚀 This command only premium user can use*\n*Contact developer to get premium connection*\n\nhttps://wa.me/message/C5OJ7S4CYLZ5E1`);
});

cmd({
    pattern: "bugvirus",
    desc: "Premium bug command",
    category: "bugs",
    react: "🐞",
    filename: __filename
},
async (conn, mek, m, { reply }) => {
    reply(`*🚀 This command only premium user can use*\n*Contact developer to get premium connection*\n\nhttps://wa.me/message/C5OJ7S4CYLZ5E1`);
});



cmd({
    pattern: "bug",
    desc: "Premium bug command",
    category: "bugs",
    react: "🐞",
    filename: __filename
},
async (conn, mek, m, { reply }) => {
    reply(`*🚀 This command only premium user can use*\n*Contact developer to get premium connection*\n\nhttps://wa.me/message/C5OJ7S4CYLZ5E1`);
});



cmd({
    pattern: "buybug",
    alias: ["purchasebug", "bugbuy", "bugpurchase"],
    desc: "Buy premium bug access",
    category: "bugs",
    react: "💸",
    filename: __filename
},
async (conn, mek, m, { reply }) => {
    reply(`*🚀 This feature is under development. It will be available soon.*`);
});
