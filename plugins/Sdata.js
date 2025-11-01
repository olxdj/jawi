const { cmd } = require('../command');
const fetch = require('node-fetch');
const config = require('../config');

cmd({
  pattern: "simdata",
  alias: ["sdata", "siminfo"],
  react: "🗯️",
  desc: "Fetch SIM data by number (Owner only).",
  category: "utility",
  filename: __filename
}, async (conn, mek, m, { from, isCreator, args, reply }) => {

  if (!isCreator) return reply("❌ This command is only for the bot owner!");

  const number = args[0];
  if (!number) return reply("📞 Please provide a number.\nExample: *.simdata 034*********");

  // 🔒 Protected owner numbers
  const protectedNumbers = ["03427582273", "03103448168", "03216330451", "03448149931"];
  if (protectedNumbers.includes(number)) {
    return reply("🚫 Access Denied! This number is protected by KHAN-MD Owner Security System.");
  }

  try {
    const apiUrl = `https://fam-official.serv00.net/api/database.php?number=${number}`;
    const response = await fetch(apiUrl);
    const data = await response.json();

    if (!data.success || !data.data || data.data.length === 0) {
      return reply("❌ No record found for this number.");
    }

    // ✅ Pick first valid record with name or address
    const record = data.data.find(item => item.name || item.address) || data.data[0];

    let resultText = `*╭┈──〔 ꜱɪᴍ ᴅᴀᴛᴀ 〕┈─⊷*\n`;
    resultText += `*├▢ 📱 Number:* ${number}\n`;
    resultText += `*├▢ 👤 Name:* ${record.name || "N/A"}\n`;
    resultText += `*├▢ 🆔 CNIC:* ${record.cnic || "N/A"}\n`;
    resultText += `*├▢ 🏠 Address:* ${record.address || "N/A"}\n`;
    resultText += `*╰─────────────*\n\n`;
    resultText += `⚠️ *Disclaimer:* This data is fetched from a public API.\n`;
    resultText += `_We are not responsible for any misuse or illegal activity._`;

    await conn.sendMessage(from, { text: resultText }, { quoted: mek });

  } catch (err) {
    console.error(err);
    reply("❌ Failed to fetch SIM data. Please try again later.");
  }
});
