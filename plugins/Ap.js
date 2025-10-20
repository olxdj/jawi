const { cmd } = require("../command");

cmd({
  pattern: "preview",
  desc: "Send back message with link preview",
  category: "tools",
  react: "🌐",
  filename: __filename
}, async (conn, mek, m, { from, q, reply }) => {
  try {
    if (!q) return reply("⚠️ Please provide text containing a link.");

    // Send back the same text but force link preview
    await conn.sendMessage(from, {
      text: q,
      linkPreview: true
    }, { quoted: mek });

  } catch (e) {
    console.error(e);
    reply("❌ Error sending preview.");
  }
});
