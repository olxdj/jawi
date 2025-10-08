const axios = require('axios');
const { cmd } = require('../command');

cmd({
    pattern: "tiktoksearch",
    alias: ["tiks2", "ttsearch"],
    desc: "Search TikTok videos & download without watermark",
    category: "downloader",
    react: "🎵",
    filename: __filename
}, async (conn, mek, m, { text, from, reply }) => {
    try {
        if (!text) return reply(`❌ *Please provide a search query!*\nExample: .tiktoksearch imran khan edit`);

        // 🔹 TikTok search API (Replace this with your own if needed)
        const apiUrl = `https://api.hanggts.xyz/downloader/tiktoksearch?query=${encodeURIComponent(text)}`;
        const { data } = await axios.get(apiUrl);

        if (!data.status || !data.result || data.result.length === 0) {
            return reply("❌ No results found. Try another keyword.");
        }

        let results = data.result;
        let index = 0;

        // 📨 Function to send each video one by one
        const sendVideo = async (i) => {
            const vid = results[i];
            if (!vid) return reply("✅ *No more videos.*");

            const caption = `🎬 *${vid.title}*\n👤 Author: ${vid.author.nickname} (@${vid.author.unique_id})\n🌍 Region: ${vid.region}\n▶️ Views: ${vid.play_count}\n❤️ Likes: ${vid.digg_count}\n💬 Comments: ${vid.comment_count}\n↪️ Shares: ${vid.share_count}\n\n✨ *Powered by JawadTechX*`;

            await conn.sendMessage(from, {
                video: { url: vid.play },
                caption
            }, { quoted: mek });

            if (i < results.length - 1) {
                reply("⏭️ *Reply with 'next' to get the next video*");
            }
        };

        // 🟡 Send first video
        await sendVideo(index);

        // 🟢 Listen for "next" reply from the same user
        const listener = async (u) => {
            if (!u.message) return;
            const msgText = u.message.conversation || u.message.extendedTextMessage?.text || "";
            const sender = u.key.participant || u.key.remoteJid;
            const isFromSameUser = sender === m.sender;
            const isFromSameChat = u.key.remoteJid === from;

            if (isFromSameChat && isFromSameUser && msgText.trim().toLowerCase() === "next") {
                index++;
                if (index < results.length) {
                    await sendVideo(index);
                } else {
                    reply("✅ No more videos found.");
                    conn.ev.off('messages.upsert', listener);
                }
            }
        };

        conn.ev.on('messages.upsert', listener);

        // Stop listening after 15 seconds ⏱️
        setTimeout(() => {
            conn.ev.off('messages.upsert', listener);
        }, 15000);

    } catch (e) {
        console.error("TikTok Search Error:", e);
        reply("❌ An error occurred while searching TikTok.");
    }
});
