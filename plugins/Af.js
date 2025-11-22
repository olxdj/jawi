const { cmd } = require('../command');

// Created By JawadTechX
cmd({
  pattern: "debugmsg",
  alias: ["debug", "msginfo", "inspect"],
  desc: "Show full JSON structure of replied message",
  category: "tools",
  react: "🧩",
  filename: __filename
},
async (conn, mek, m, { reply }) => {
  try {

    // Command works ONLY on reply
    if (!m.quoted) {
      return reply("🔍 *Reply to any message to inspect its JSON structure.*");
    }

    // Safely convert m.quoted to JSON
    let structure;
    try {
      structure = JSON.stringify(m.quoted, null, 4);
    } catch {
      structure = "Error converting quoted message to JSON.";
    }

    // Convert JSON to buffer
    const buffer = Buffer.from(structure, "utf-8");

    // Send as a text file (WhatsApp won't allow long plain text)
    await conn.sendMessage(m.chat, {
      document: buffer,
      mimetype: "application/json",
      fileName: "quoted-message-debug.json",
      caption: "🧩 *Quoted Message Structure Dump* \nHere is the full JSON structure of `m.quoted`."
    }, { quoted: mek });

  } catch (e) {
    console.log("DEBUG ERROR:", e);
    reply("❌ Error occurred while generating debug info.\n" + e.message);
  }
});
