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
    if (!text) return m.reply(`❌ Please provide a song name or YouTube link.\n\nExample:\n${usedPrefix + command} Moye Moye`);

    m.react('⏳');

    let videoUrl;

    // ✅ If user provided direct YouTube link
    if (text.includes('youtube.com') || text.includes('youtu.be')) {
      videoUrl = text;
    } else {
      // 🔍 Search YouTube
      const search = await yts(text);
      if (!search || !search.videos || !search.videos.length)
        return m.reply('❌ No results found.');

      const vid = search.videos[0];
      videoUrl = vid.url;
    }

    // 🎧 Fetch from API
    const apiUrl = `https://jawad-tech.vercel.app/download/audio?url=${videoUrl}`;
    const res = await fetch(apiUrl);
    const data = await res.json();

    if (!data.status || !data.result)
      return m.reply('❌ Failed to fetch audio. Try again later.');

    const { title, thumbnail, author } = data.metadata;

    // 🎶 Send audio with external preview only
    await conn.sendMessage(m.chat, {
      audio: { url: data.result },
      mimetype: 'audio/mpeg',
      ptt: false,
      contextInfo: {
        externalAdReply: {
          title: title || 'Unknown Title',
          body: `🎧 ${author || 'Unknown Channel'} • Powered by JawadTechXD`,
          thumbnailUrl: thumbnail,
          sourceUrl: videoUrl,
          mediaType: 1,
          renderLargerThumbnail: true,
          showAdAttribution: true
        }
      }
    }, { quoted: m });

    await m.react('✅');
  } catch (e) {
    console.error(e);
    m.reply('⚠️ Error fetching audio.');
  }
});
