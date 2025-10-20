const axios = require("axios");
const { cmd } = require("../command");

cmd({
  pattern: "preview",
  desc: "Send message back with real preview",
  category: "tools",
  react: "🌐",
  filename: __filename
}, async (conn, mek, m, { from, q, reply }) => {
  try {
    if (!q) return reply("⚠️ Provide text with a valid link.");

    const link = q.match(/https?:\/\/[^\s]+/);
    if (!link) return reply("❌ No valid link found.");

    const url = link[0];
    const { data } = await axios.get(url);

    // Extract title, desc, image
    const title = (data.match(/<title>(.*?)<\/title>/i) || [])[1] || url;
    const desc = (data.match(/<meta name="description" content="(.*?)"/i) || [])[1]
      || (data.match(/<meta property="og:description" content="(.*?)"/i) || [])[1]
      || "";
    const image = (data.match(/<meta property="og:image" content="(.*?)"/i) || [])[1]
      || (data.match(/<meta name="twitter:image" content="(.*?)"/i) || [])[1]
      || null;

    // Send back message with preview (native style)
    await conn.sendMessage(from, {
      text: q,
      previewType: 0,
      contextInfo: {
        linkPreview: {
          canonicalUrl: url,
          matchedText: url,
          title: title,
          description: desc,
          jpegThumbnail: image ? await (await axios.get(image, { responseType: "arraybuffer" })).data : null,
          originalUrl: url,
        },
      },
    }, { quoted: mek });

  } catch (e) {
    console.error(e);
    reply("❌ Couldn’t generate preview. Site may block requests.");
  }
});
