const { cmd } = require('../command');
const axios = require('axios');

cmd({
  pattern: 'capcut',
  alias: ['cut', 'cctemplate'],
  desc: 'Download CapCut Template video by URL',
  category: 'downloader',
  filename: __filename,
  react: '🎬', // bot reacts to command
}, async (conn, m, { args, reply }) => {
  try {
    if (!args[0]) {
      return reply('*🧩 Provide a CapCut Template URL!*\n\n_Example:_ .capcut https://www.capcut.com/t/Zs8DGoMqf/');
    }

    // React when command is received
    await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });

    reply('Downloading CapCut Template, please wait...');

    const api = `https://dark-shan-yt.koyeb.app/download/capcut?url=${encodeURIComponent(args[0])}`;
    const res = await axios.get(api);

    const capData = res.data?.data;
    const media = capData?.medias?.[0];

    if (!res.data.status || !media?.url) {
      return reply('❌ Failed to download CapCut template. Please check the link.');
    }

    const caption = `🎬 *CapCut Template*\n\n`
      + `📝 *Title:* ${capData.title || 'N/A'}\n`
      + `📦 *Size:* ${media.formattedSize || 'Unknown'}\n`
      + `🎥 *Quality:* ${media.quality || 'N/A'}\n`
      + `👤 *Powered By:* JawadTechXD ❤️`;

    await conn.sendMessage(m.chat, {
      document: { url: media.url },
      fileName: `${capData.title || 'capcut_template'}.mp4`,
      mimetype: 'video/mp4',
      caption,
    }, { quoted: m });

  } catch (err) {
    console.error('[CapCut Error]', err?.response?.data || err.message || err);
    reply('🚫 Error fetching CapCut video. Try again later.');
  }
});
