const fetch = require('node-fetch');
const yts = require('yt-search');
const { cmd } = require('../command');

cmd({
  pattern: 'music',
  alias: ['play2'],
  desc: 'Download YouTube audio using KHAN-MD',
  category: 'downloader',
  react: '🎧',
  filename: __filename
}, async (conn, m, { text, usedPrefix, command }) => {
  try {
    if (!text)
      return m.reply(`❌ Please provide a song name or YouTube link.\n\nExample:\n${usedPrefix + command} Moye Moye`);

    await m.react('⏳');

    let videoUrl;
    if (text.includes('youtube.com') || text.includes('youtu.be')) {
      videoUrl = text;
    } else {
      const search = await yts(text);
      if (!search?.videos?.length) return m.reply('❌ No results found.');
      videoUrl = search.videos[0].url;
    }

    const apiUrl = `https://jawad-tech.vercel.app/download/audio?url=${videoUrl}`;
    const res = await fetch(apiUrl);
    const data = await res.json();

    if (!data.status || !data.result)
      return m.reply('❌ Failed to fetch audio. Try again later.');

    const song = data.metadata;

    await conn.sendMessage(m.chat, {
      audio: { url: data.result },
      mimetype: 'audio/mpeg',
      ptt: false,
      contextInfo: {
        externalAdReply: {
          title: song.title.length > 25 ? `${song.title.substring(0, 22)}...` : song.title,
          body: "⇆  ||◁◁ㅤ ❚❚ ㅤ▷▷||ㅤ ⇆",
          mediaType: 1,
          thumbnailUrl: song.thumbnail,
          sourceUrl: videoUrl,
          showAdAttribution: true,
          renderLargerThumbnail: false
        }
      }
    }, { quoted: m });

    await m.react('✅');
  } catch (e) {
    console.error(e);
    m.reply('⚠️ Error fetching audio.');
  }
});
