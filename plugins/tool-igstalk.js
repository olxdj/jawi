const { cmd } = require('../command');
const axios = require('axios');

cmd({
    pattern: "igstalk",
    alias: ["instastalk", "stalkig", "iginfo"],
    desc: "Get Instagram user details by username",
    category: "stalker",
    react: "📸",
    filename: __filename
}, async (conn, mek, m, { args, reply }) => {
    try {
        if (!args[0]) return reply(`❌ *Please provide an Instagram username.*\n\n📌 Example: .igstalk ur.jawadx`);

        const username = args[0].replace(/@/g, '');
        const apiUrl = `https://api.zenzxz.my.id/stalker/instagram?username=${username}`;

        const { data } = await axios.get(apiUrl);

        if (!data.status || !data.result) {
            return reply(`❌ Couldn't find info for *${username}*`);
        }

        const info = data.result;

        let caption = `📸 *Instagram User Info*\n\n`;
        caption += `👤 *Username:* ${info.username}\n`;
        caption += `📝 *Name:* ${info.name || '-'}\n`;
        caption += `💬 *Bio:* ${info.bio || '-'}\n`;
        caption += `👥 *Followers:* ${info.followers}\n`;
        caption += `🔸 *Following:* ${info.following}\n`;
        caption += `📂 *Posts:* ${info.posts}\n`;
        caption += `☑️ *Verified:* ${info.verified ? 'Yes ✅' : 'No ❌'}\n`;
        caption += `📊 *Engagement Rate:* ${info.engagement_rate}%\n\n`;
        caption += `🔗 *Profile:* https://instagram.com/${info.username}\n\n`;
        caption += `🚀 *Powered By JawadTechX*`;

        await conn.sendMessage(mek.chat, {
            image: { url: info.profile_pic },
            caption
        }, { quoted: mek });

    } catch (e) {
        console.log("IG Stalk Error:", e);
        reply(`❌ An error occurred while fetching the data.`);
    }
});
