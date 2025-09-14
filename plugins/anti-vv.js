const { cmd } = require("../command");
const { downloadMediaMessage } = require("../lib/msg");

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

    if (!match.quoted) {
      return await client.sendMessage(from, {
        text: "*🍁 Please reply to a view once message!*"
      }, { quoted: message });
    }

    let buffer;
    try {
      // Try to use the download function if it exists
      if (typeof match.quoted.download === 'function') {
        buffer = await match.quoted.download();
      } else {
        // Fallback to the direct download method
        buffer = await downloadMediaMessage(match.quoted);
      }
    } catch (downloadError) {
      console.error("Download error:", downloadError);
      return await client.sendMessage(from, {
        text: "❌ Error downloading media: " + downloadError.message
      }, { quoted: message });
    }

    const mtype = match.quoted.mtype;
    const options = { quoted: message };

    let messageContent = {};
    switch (mtype) {
      case "imageMessage":
        messageContent = {
          image: buffer,
          caption: match.quoted.text || '',
          mimetype: match.quoted.mimetype || "image/jpeg"
        };
        break;
      case "videoMessage":
        messageContent = {
          video: buffer,
          caption: match.quoted.text || '',
          mimetype: match.quoted.mimetype || "video/mp4"
        };
        break;
      case "audioMessage":
        messageContent = {
          audio: buffer,
          mimetype: "audio/mp4",
          ptt: match.quoted.ptt || false
        };
        break;
      case "stickerMessage":
        messageContent = {
          sticker: buffer,
          mimetype: "image/webp"
        };
        break;
      case "documentMessage":
        messageContent = {
          document: buffer,
          mimetype: match.quoted.mimetype || "application/octet-stream",
          fileName: match.quoted.fileName || "file"
        };
        break;
      default:
        // For text messages or unsupported types, try to forward as newsletter
        try {
          await match.forwardAsNewsletter('120363354023106228@newsletter', 'JawadTechX', 143);
          return await client.sendMessage(from, {
            text: "✅ Message forwarded as newsletter"
          }, { quoted: message });
        } catch (newsletterError) {
          return await client.sendMessage(from, {
            text: "❌ Unsupported message type and failed to forward as newsletter"
          }, { quoted: message });
        }
    }

    await client.sendMessage(from, messageContent, options);
  } catch (error) {
    console.error("vv Error:", error);
    await client.sendMessage(from, {
      text: "❌ Error fetching vv message:\n" + error.message
    }, { quoted: message });
  }
});
