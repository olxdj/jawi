const axios = require("axios");
const { cmd } = require("../command");
const fs = require("fs");
const path = require("path");

cmd({
  pattern: "pastebin",
  alias: ["pb", "getpaste"],
  react: "📄",
  desc: "Download and send raw Pastebin files",
  category: "utility",
  use: ".pastebin <Pastebin link>",
  filename: __filename,
}, async (conn, mek, m, { from, reply, args }) => {
  try {
    const url = args[0];
    if (!url || !url.includes("pastebin.com")) {
      return reply("❌ Please provide a valid Pastebin link.\n\nExample:\n.pastebin https://pastebin.com/abcd1234");
    }

    await conn.sendMessage(from, { react: { text: "⏳", key: m.key } });

    // Extract Paste ID
    const match = url.match(/pastebin\.com\/(?:raw\/)?([a-zA-Z0-9]+)/);
    const pasteId = match?.[1];

    if (!pasteId) {
      return reply("❌ Invalid Pastebin URL.");
    }

    const rawUrl = `https://pastebin.com/raw/${pasteId}`;
    const res = await axios.get(rawUrl);
    const content = res.data;

    // Save to temporary file
    const tempFile = path.join(__dirname, `../temp_${pasteId}.txt`);
    fs.writeFileSync(tempFile, content, "utf-8");

    await conn.sendMessage(from, {
      document: { url: tempFile },
      mimetype: "text/plain",
      fileName: `pastebin_${pasteId}.txt`,
      caption: `📄 *Pastebin Downloader*\n\n✅ Fetched: https://pastebin.com/${pasteId}\n\n> Powered By KHAN MD 💥`
    }, { quoted: mek });

    // Cleanup
    fs.unlinkSync(tempFile);
    await conn.sendMessage(from, { react: { text: "✅", key: m.key } });

  } catch (err) {
    console.error("Pastebin Downloader Error:", err);
    reply("❌ Failed to download or send the Pastebin file. Please try again later.");
    await conn.sendMessage(from, { react: { text: "❌", key: m.key } });
  }
});
