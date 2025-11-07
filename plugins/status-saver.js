const { cmd } = require("../command");

cmd({
  pattern: "send",
  alias: ["sendme", 'save'],
  react: '📤',
  desc: "Saves status updates to your DM",
  category: "utility",
  filename: __filename
}, async (client, message, match, { from }) => {
  try {
    // Only work if quoting a status broadcast, ignore everything else
    if (match.quoted?.chat !== 'status@broadcast') {
      return; // Do nothing if NOT quoting a status message
    }
    
    if (!match.quoted) {
      return await client.sendMessage(from, {
        text: "*🍁 Please reply to a status update!*"
      }, { quoted: message });
    }

    const buffer = await match.quoted.download();
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
      default:
        return await client.sendMessage(from, {
          text: "❌ Only image, video, and audio status updates are supported"
        }, { quoted: message });
    }

    // Forward status to user's DM
    await client.sendMessage(message.sender, messageContent, options);
    
    // Send confirmation in the original chat
    await client.sendMessage(from, {
      text: "✅ Status saved to your DM!"
    }, { quoted: message });
    
  } catch (error) {
    console.error("Status Save Error:", error);
    await client.sendMessage(from, {
      text: "❌ Error saving status:\n" + error.message
    }, { quoted: message });
  }
});
