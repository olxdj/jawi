cmd({
  pattern: "delete",
  alias: ["del"],
  desc: "Delete a replied message",
  category: "group",
  react: "🗑️",
  filename: __filename
}, async (client, m, { reply }) => {
  try {
    // Check if user replied to a message
    if (!m.quoted) return reply("🗑️ Reply to a message you want to delete!");

    // Try deleting the replied message
    await client.sendMessage(m.chat, {
      delete: {
        remoteJid: m.chat,
        fromMe: m.quoted.fromMe,
        id: m.quoted.id,
        participant: m.quoted.sender
      }
    });

  } catch (err) {
    console.error("Delete Error:", err);
    await reply("❌ Failed to delete message.");
  }
});
