const { cmd } = require("../command");

cmd({
  pattern: "khusra",
  desc: "Tag a special khusra in group with funny lines",
  category: "fun",
  react: "💀",
  filename: __filename
}, async (conn, mek, m, { from, isGroup }) => {
  try {
    if (!isGroup) {
      return conn.sendMessage(from, { text: "❌ Yeh command sirf group mein kaam karta hai!" }, { quoted: mek });
    }

    // ✅ Target number without plus sign
    const targetNumber = "14502868052";
    const targetJid = `${targetNumber}@s.whatsapp.net`;
    const mentionTag = `@${targetNumber}`;

    // 📝 Funny messages list
    const funnyMessages = [
      `😂 Dakho dakho kon aya... khusra aya ${mentionTag} 💅`,
      `🚨 Khusra detected in the wild → ${mentionTag} 💀`,
      `Sab log mil ke bolo... KHUSRAA aya 😭 👉 ${mentionTag}`,
      `📢 Breaking News: ${mentionTag} ne group mein entry mari 💃`,
      `😂 Group mein aaj phir se hungama... ${mentionTag} a gaya`,
      `💅 Khusra mode activated → ${mentionTag}`,
      `🧨 Khusra ka dhamaka entry 💥 ${mentionTag}`,
      `🤣 Arey re re... ${mentionTag} ne phir se apni shakal dikhadi 😭`,
      `😂 Kon aya kon aya... KHUSRA aya ${mentionTag}`,
      `🛑 Alert: Ek khusra group mein ghus gaya 😭👉 ${mentionTag}`,
      `😎 Swagat karo sab log... aaj ka special mehmaan ${mentionTag}`,
      `💃 ${mentionTag} ki entry ne sab hilaa diya 😂`,
      `🚩 Dakho Dakho kon aya... Asli khusra aya ${mentionTag} 💀`,
      `🔥 Khusra Entry OP 💅 ${mentionTag}`,
      `🤣 ${mentionTag} ne kaha... "Main khusra hoon aur main wapas aaya hoon!"`,
      `💀 Sab line mein aa jao... khusra inspection ho raha hai ${mentionTag}`,
      `🕺 Dekho bhai dekho... khusra ki entry 😭 ${mentionTag}`,
      `📢 Tamam group walon ko ittila di ja rahi hai... ${mentionTag} group mein maujood hai 💅`,
      `🤣 Chup kar ja warna ${mentionTag} bula lunga 😭`,
      `💥 Kya entry maari bhai ne... ${mentionTag} ne poora group hilaa diya 😂`
    ];

    // 🎲 Pick random message
    const randomMsg = funnyMessages[Math.floor(Math.random() * funnyMessages.length)];

    await conn.sendMessage(from, {
      text: randomMsg,
      mentions: [targetJid]
    }, { quoted: mek });

  } catch (e) {
    console.error(e);
    await conn.sendMessage(from, { text: "❌ Error a gaya bhai!" }, { quoted: mek });
  }
});
