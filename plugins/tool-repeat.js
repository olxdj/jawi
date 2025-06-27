const config = require('../config');
const { cmd } = require('../command');

cmd({
  pattern: "msg",
  desc: "Send a message multiple times (Owner Only)",
  category: "utility",
  react: "🔁",
  filename: __filename
},
async (conn, mek, m, { from, reply, isCreator, q }) => {
  if (!isCreator) return reply('🚫 *Owner only command!*');

  try {
    if (!q.includes(',')) return reply("❌ *Format:* .msg text,count\n*Example:* .msg Hello,5");

    const [message, countStr] = q.split(',');
    const count = parseInt(countStr.trim());

    if (isNaN(count) || count < 1 || count > 100) {
      return reply("❌ *Max 100 messages at once!*");
    }

    for (let i = 0; i < count; i++) {
      const msg = `${message} [${i + 1}]`; // Safe variation to avoid detection
      await conn.sendMessage(from, { text: msg }, { quoted: null });
      if (i < count - 1) await new Promise(res => setTimeout(res, 1000)); // 1 second delay
    }

  } catch (e) {
    console.error("Error in msg command:", e);
    reply(`❌ *Error:* ${e.message}`);
  }
});
