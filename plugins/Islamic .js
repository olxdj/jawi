const { cmd } = require('../command');
const fetch = require('node-fetch');
const { translate } = require('@vitalets/google-translate-api');

cmd({
  pattern: "quran",
  alias: ["surah"],
  react: "🤍",
  desc: "Get Quran Surah details and audio recitation.",
  category: "islamic",
  filename: __filename
}, async (conn, mek, m, {
  from, args, reply
}) => {
  try {
    let surahInput = args[0];
    if (!surahInput) return reply('📖 Type Surah number (1–114)\nExample: `.quran 36`');

    // Fetch surah details from AlQuran API
    let res = await fetch(`https://api.alquran.cloud/v1/surah/${surahInput}`);
    if (!res.ok) return reply(`❌ Surah not found or API error (${res.status})`);
    let data = await res.json();

    if (!data?.data) return reply('❌ Invalid response from Quran API.');
    let surah = data.data;

    // Fetch audio (Mishary Rashid Alafasy)
    const audioUrl = `https://cdn.islamic.network/quran/audio-surah/128/ar.alafasy/${surah.number}.mp3`;

    // Translate Surah meaning into Urdu & English
    const urdu = await translate(surah.englishNameTranslation, { to: 'ur' });
    const english = surah.englishNameTranslation;

    const caption = `
🕋 *Qur'an – The Holy Book* 🌙

📖 *Surah ${surah.englishName}* (${surah.name})
💬 *Meaning:* ${english}
💫 *اردو ترجمہ:* ${urdu.text}
🔢 *Ayahs:* ${surah.numberOfAyahs}
🌍 *Revelation:* ${surah.revelationType}

🎧 *Reciter:* Mishary Rashid Alafasy
`;

    // Send info + image
    await conn.sendMessage(from, {
      image: { url: `https://files.catbox.moe/8fy6up.jpg` },
      caption,
      contextInfo: {
        mentionedJid: [m.sender],
        forwardingScore: 999,
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
          newsletterJid: '120363354023106228@newsletter',
          newsletterName: 'JawadTechX',
          serverMessageId: 143
        }
      }
    }, { quoted: mek });

    // Send audio recitation
    await conn.sendMessage(from, {
      audio: { url: audioUrl },
      mimetype: 'audio/mpeg',
      ptt: false
    }, { quoted: mek });

  } catch (err) {
    console.error(err);
    reply(`⚠️ Error: ${err.message}`);
  }
});
