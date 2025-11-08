const { cmd } = require("../command");
const config = require("../config");
const { downloadContentFromMessage } = require('@whiskeysockets/baileys');

cmd({
  pattern: "vv3",
  alias: ["viewonce", 'retrive'],
  react: '🐳',
  desc: "Retrieve view once messages",
  category: "utility",
  filename: __filename
}, async (client, message, match, { from }) => {
  try {
    if (!match.quoted) {
      return await client.sendMessage(message.chat, {
        text: "*⛓️‍💥 Please Reply To A Once View Message*"
      }, { quoted: message });
    }

    // Proper view once detection
    const quoted = match.quoted;
    const isViewOnceImage = quoted.imageMessage?.viewOnce || quoted.mtype === 'viewOnceImageMessage';
    const isViewOnceVideo = quoted.videoMessage?.viewOnce || quoted.mtype === 'viewOnceVideoMessage';
    const isViewOnceAudio = quoted.audioMessage?.viewOnce || quoted.mtype === 'viewOnceAudioMessage';
    
    if (!isViewOnceImage && !isViewOnceVideo && !isViewOnceAudio) {
      return await client.sendMessage(message.chat, {
        text: "*⛓️‍💥 Please Reply To A Once View Message*"
      }, { quoted: message });
    }

    await client.sendMessage(message.chat, { 
      react: { text: '🕒', key: message.key } 
    });

    let buffer, mimeType, caption, isPTT;

    if (isViewOnceImage) {
      const viewOnceMsg = quoted.imageMessage || quoted;
      mimeType = viewOnceMsg.mimetype || 'image/jpeg';
      caption = viewOnceMsg.caption || '';
      const stream = await downloadContentFromMessage(viewOnceMsg, 'image');
      buffer = Buffer.from([]);
      for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk]);
      
    } else if (isViewOnceVideo) {
      const viewOnceMsg = quoted.videoMessage || quoted;
      mimeType = viewOnceMsg.mimetype || 'video/mp4';
      caption = viewOnceMsg.caption || '';
      const stream = await downloadContentFromMessage(viewOnceMsg, 'video');
      buffer = Buffer.from([]);
      for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk]);
      
    } else if (isViewOnceAudio) {
      const viewOnceMsg = quoted.audioMessage || quoted;
      mimeType = viewOnceMsg.mimetype || 'audio/ogg';
      isPTT = viewOnceMsg.ptt || false;
      const stream = await downloadContentFromMessage(viewOnceMsg, 'audio');
      buffer = Buffer.from([]);
      for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk]);
    }

    const options = { quoted: message };
    let messageContent = {};

    if (isViewOnceImage) {
      messageContent = {
        image: buffer,
        caption: caption ? `${caption}\n\n> ${config.DESCRIPTION}` : `> ${config.DESCRIPTION}`,
        mimetype: mimeType
      };
    } else if (isViewOnceVideo) {
      messageContent = {
        video: buffer,
        caption: caption ? `${caption}\n\n> ${config.DESCRIPTION}` : `> ${config.DESCRIPTION}`,
        mimetype: mimeType
      };
    } else if (isViewOnceAudio) {
      messageContent = {
        audio: buffer,
        mimetype: 'audio/mp4',
        ptt: isPTT
      };
    }

    await client.sendMessage(message.chat, messageContent, options);
    await client.sendMessage(message.chat, { 
      react: { text: '✅', key: message.key } 
    });

  } catch (error) {
    console.error("vv Error:", error);
    await client.sendMessage(message.chat, { 
      react: { text: '❌', key: message.key } 
    });
    await client.sendMessage(message.chat, {
      text: "❌ Error fetching view once message:\n" + error.message
    }, { quoted: message });
  }
});
