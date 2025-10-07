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
    
    console.log("API Response:", data); // Debug log
    
    // Check different possible response structures
    if (data.status && data.result) {
      // Case 1: data.status true with data.result
      await conn.sendMessage(from, { 
        image: { url: data.result },
        caption: `📱 *Website Screenshot*\n\n✦ URL: ${url}\n✦ Powered by Jawad TechX`
      }, { quoted: m });
    } else if (data.status && data.url) {
      // Case 2: data.status true with data.url
      await conn.sendMessage(from, { 
        image: { url: data.url },
        caption: `📱 *Website Screenshot*\n\n✦ URL: ${url}\n✦ Powered by Jawad TechX`
      }, { quoted: m });
    } else if (data.image) {
      // Case 3: Direct image URL in data.image
      await conn.sendMessage(from, { 
        image: { url: data.image },
        caption: `📱 *Website Screenshot*\n\n✦ URL: ${url}\n✦ Powered by Jawad TechX`
      }, { quoted: m });
    } else if (data.result && typeof data.result === 'string') {
      // Case 4: data.result is direct URL string
      await conn.sendMessage(from, { 
        image: { url: data.result },
        caption: `📱 *Website Screenshot*\n\n✦ URL: ${url}\n✦ Powered by Jawad TechX`
      }, { quoted: m });
    } else {
      console.log("Unexpected API response structure:", data);
      reply("❌ Unexpected API response. Please try again.");
      await conn.sendMessage(from, { react: { text: '❌', key: m.key } });
      return;
    }

    // React: Success ✅
    await conn.sendMessage(from, { react: { text: '✅', key: m.key } });

  } catch (error) {
    console.error("Screenshot Error:", error);
    console.error("Error response:", error.response?.data);
    reply("❌ An error occurred while taking screenshot.");
    // React: Error ❌
    await conn.sendMessage(from, { react: { text: '❌', key: m.key } });
  }
});
