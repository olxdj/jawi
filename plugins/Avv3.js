const { cmd } = require("../command");
const config = require("../config");

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

    const buffer = await match.quoted.download();
    const mtype = match.quoted.mtype;
    const originalCaption = match.quoted.text || '';
    const options = { quoted: message };

    let messageContent = {};
    switch (mtype) {
      case "imageMessage":
      case "viewOnceImageMessage":
        messageContent = {
          image: buffer,
          caption: originalCaption ? `${originalCaption}\n\n> ${config.DESCRIPTION}` : `> ${config.DESCRIPTION}`,
          mimetype: match.quoted.mimetype || "image/jpeg"
        };
        break;
      case "videoMessage":
      case "viewOnceVideoMessage":
        messageContent = {
          video: buffer,
          caption: originalCaption ? `${originalCaption}\n\n> ${config.DESCRIPTION}` : `> ${config.DESCRIPTION}`,
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
      default:
        return await client.sendMessage(message.chat, {
          text: "*⛓️‍💥 Please Reply To A Once View Message*"
        }, { quoted: message });
    }

    await client.sendMessage(message.chat, messageContent, options);
  } catch (error) {
    console.error("vv Error:", error);
    await client.sendMessage(message.chat, {
      text: "❌ Error fetching view once message:\n" + error.message
    }, { quoted: message });
  }
});
