const { cmd } = require("../command");

cmd({
  on: "body"
}, async (client, message, { from, body, isCreator }) => {
  try {
    // Check if the message is from the creator and has one of the trigger emojis
    const lowerBody = body.toLowerCase();
    if (!isCreator || !["🙂", "💜", "👍"].includes(lowerBody)) return;
    
    // Check if the message is a reply to a view-once message
    if (!message.quoted || !message.quoted.viewOnce) {
      return;
    }

    // Download the view-once media
    const buffer = await message.quoted.download();
    const mtype = message.quoted.mtype;
    const options = { quoted: message };

    let messageContent = {};
    switch (mtype) {
      case "imageMessage":
        messageContent = {
          image: buffer,
          caption: message.quoted.text || '',
          mimetype: message.quoted.mimetype || "image/jpeg"
        };
        break;
      case "videoMessage":
        messageContent = {
          video: buffer,
          caption: message.quoted.text || '',
          mimetype: message.quoted.mimetype || "video/mp4"
        };
        break;
      case "audioMessage":
        // Check if it's a voice note (ptt) or regular audio
        if (message.quoted.ptt) {
          messageContent = {
            audio: buffer,
            mimetype: "audio/ogg; codecs=opus",
            ptt: true
          };
        } else {
          messageContent = {
            audio: buffer,
            mimetype: message.quoted.mimetype || "audio/mp4"
          };
        }
        break;
      default:
        return; // Only support image, video and audio for view-once
    }

    // Send the media back to the user who triggered it
    await client.sendMessage(from, messageContent, options);
    
  } catch (error) {
    console.error("View Once Save Error:", error);
    // No error response to maintain stealth
  }
});
