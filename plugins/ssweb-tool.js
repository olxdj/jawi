// code by ⿻ ⌜ 𝐊𝐇𝐀𝐍 ⌟⿻⃮͛🇵🇰𖤐

const { cmd } = require("../command");
const axios = require("axios");

cmd({
  pattern: "ss",
  alias: ["screenshot", "ssweb"],
  react: "📱",
  desc: "Take website screenshot.",
  category: "utility",
  use: ".ss <url>",
  filename: __filename
}, async (conn, m, store, { from, args, reply }) => {
  try {
    const url = args[0];
    if (!url) return reply("❌ Please provide a URL\nExample: .ss https://google.com");
    if (!url.startsWith("http")) return reply("❌ URL must start with http:// or https://");

    // Send processing message
    await reply("📱 Taking screenshot...");
    
    // React: Processing ⏳
    await conn.sendMessage(from, { react: { text: '⏳', key: m.key } });

    const apiUrl = `https://api.giftedtech.web.id/api/tools/ssphone?apikey=gifted&url=${encodeURIComponent(url)}`;
    const { data } = await axios.get(apiUrl);
    
    if (data.status && data.result) {
      await conn.sendMessage(from, { 
        image: { url: data.result },
        caption: `📱 *Website Screenshot*\n\n✦ URL: ${url}\n✦ Powered by Jawad TechX`
      }, { quoted: m });

      // React: Success ✅
      await conn.sendMessage(from, { react: { text: '✅', key: m.key } });

    } else {
      reply("❌ Failed to capture screenshot. Please try again.");
      // React: Error ❌
      await conn.sendMessage(from, { react: { text: '❌', key: m.key } });
    }
  } catch (error) {
    console.error("Screenshot Error:", error);
    reply("❌ An error occurred while taking screenshot.");
    // React: Error ❌
    await conn.sendMessage(from, { react: { text: '❌', key: m.key } });
  }
});

// ⿻ ⌜ 𝐊𝐇𝐀𝐍 ⌟⿻⃮͛🇵🇰𖤐
