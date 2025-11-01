const { cmd } = require('../command');
const fetch = require('node-fetch');
const { translate } = require('@vitalets/google-translate-api');

cmd({
  pattern: "quran",
  alias: ["surah"],
  react: "🖤",
  desc: "Get Quran Surah details with translation and recitation.",
  category: "islamic",
  filename: __filename
}, async (conn, mek, m, {
  from, args, reply
}) => {
  try {
    const surahInput = args[0];
    if (!surahInput)
      return reply('📖 Type Surah number (1–114)\nExample: `.quran 36`');

    // Fetch surah info
    const res = await fetch(`https://api.alquran.cloud/v1/surah/${surahInput}`);
    if (!res.ok) return reply(`❌ Surah not found or API error (${res.status})`);
    const json = await res.json();

    if (!json?.data) return reply('❌ Invalid response from Quran API.');
    const surah = json.data;

    // Audio (Mishary Rashid Alafasy)
    const audioUrl = `https://cdn.islamic.network/quran/audio-surah/128/ar.alafasy/${surah.number}.mp3`;

    // Translate English name translation to Urdu
    const urdu = await translate(surah.englishNameTranslation, { to: 'ur' });

    const caption = `
🕋 *Qur'an – The Holy Book* 🌙

📖 *Surah ${surah.englishName}* (${surah.name})
💫 *Meaning:* ${surah.englishNameTranslation}
🌸 *اردو ترجمہ:* ${urdu.text}
🔢 *Total Verses:* ${surah.numberOfAyahs}
🌍 *Revealed In:* ${surah.revelationType}

🎧 *Reciter:* Mishary Rashid Alafasy
───────────────────
> Powered by *JawadTechX*
`;

    // Send Surah info + image
    await conn.sendMessage(from, {
      image: { url: 'https://files.catbox.moe/8fy6up.jpg' },
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

    // Send audio as document
    await conn.sendMessage(from, {
      document: { url: audioUrl },
      mimetype: 'audio/mpeg',
      fileName: `Surah_${surah.englishName}.mp3`,
      caption: `📖 Surah ${surah.englishName} Recitation 🎧`
    }, { quoted: mek });

  } catch (err) {
    console.error(err);
    reply(`⚠️ Error: ${err.message}`);
  }
});
