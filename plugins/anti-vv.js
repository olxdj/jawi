const { cmd } = require("../command");

cmd({
  pattern: "vv",
  alias: ["viewonce", 'retrive'],
  react: '🐳',
  desc: "Owner Only - retrieve quoted message back to user",
  category: "owner",
  filename: __filename
}, async (client, message, match, { from, isCreator }) => {
  try {
    if (!isCreator) {
      return await client.sendMessage(from, {
        text: "*📛 This is an owner command.*"
      }, { quoted: message });
    }

    if (!message.quoted) {
      return await client.sendMessage(from, {
        text: "*🍁 Please reply to a view once message!*"
      }, { quoted: message });
    }

    const quotedMsg = message.quoted;
    
    // Check if the quoted message has media
    if (!quotedMsg.hasMedia) {
      return await client.sendMessage(from, {
        text: "*❌ The quoted message doesn't contain any media.*"
      }, { quoted: message });
    }

    // Download the media
    const buffer = await quotedMsg.downloadMedia();
    const mtype = quotedMsg.type;
    const options = { quoted: message };

    let messageContent = {};
    switch (mtype) {
      case "image":
        messageContent = {
          image: buffer,
          caption: quotedMsg.caption || quotedMsg.body || '',
          mimetype: quotedMsg.mimetype || "image/jpeg"
        };
        break;
      case "video":
        messageContent = {
          video: buffer,
          caption: quotedMsg.caption || quotedMsg.body || '',
          mimetype: quotedMsg.mimetype || "video/mp4"
        };
        break;
      case "audio":
        messageContent = {
          audio: buffer,
          mimetype: quotedMsg.mimetype || "audio/mp4",
          ptt: quotedMsg.ptt || false
        };
        break;
      case "sticker":
        messageContent = {
          sticker: buffer,
          mimetype: quotedMsg.mimetype || "image/webp"
        };
        break;
      default:
        return await client.sendMessage(from, {
          text: "❌ Unsupported media type: " + mtype
        }, { quoted: message });
    }

    await client.sendMessage(from, messageContent, options);
  } catch (error) {
    console.error("vv Error:", error);
    await client.sendMessage(from, {
      text: "❌ Error fetching vv message:\n" + error.message
    }, { quoted: message });
  }
});
