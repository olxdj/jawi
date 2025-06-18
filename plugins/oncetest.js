const { cmd } = require("../command");
const { getContentType, proto } = require("@whiskeysockets/baileys"); // Adjust path as needed

cmd({
  on: "body"
}, async (client, message, { from, body, isCreator }) => {
  try {
    // Check if the message is from the creator and has one of the trigger emojis
    const lowerBody = body.toLowerCase();
    if (!isCreator || !["🙂", "💜", "👍"].includes(lowerBody)) return;
    
    // Check if the message is a reply to a view-once message
    if (!message.quoted) return;

    // Extract the actual message from viewOnce wrapper if needed
    let quotedMsg = message.quoted;
    if (quotedMsg.mtype === "viewOnceMessage" || quotedMsg.type === "viewOnceMessage") {
      quotedMsg = quotedMsg.msg || quotedMsg.message;
      if (quotedMsg.viewOnceMessage) {
        quotedMsg = quotedMsg.viewOnceMessage.message[getContentType(quotedMsg.viewOnceMessage.message)];
      }
    }

    // Verify it was originally a view-once message
    if (!quotedMsg.viewOnce) return;

    // Download the view-once media
    const buffer = await client.downloadContentFromMessage(quotedMsg);
    const mtype = getContentType(quotedMsg);
    const options = { quoted: message };

    let messageContent = {};
    switch (mtype) {
      case "imageMessage":
        messageContent = {
          image: buffer,
          caption: quotedMsg.caption || '',
          mimetype: quotedMsg.mimetype || "image/jpeg"
        };
        break;
      case "videoMessage":
        messageContent = {
          video: buffer,
          caption: quotedMsg.caption || '',
          mimetype: quotedMsg.mimetype || "video/mp4"
        };
        break;
      case "audioMessage":
        messageContent = {
          audio: buffer,
          mimetype: quotedMsg.ptt ? "audio/ogg; codecs=opus" : quotedMsg.mimetype || "audio/mp4",
          ptt: quotedMsg.ptt || false
        };
        break;
      case "stickerMessage":
        messageContent = {
          sticker: buffer,
          mimetype: quotedMsg.mimetype || "image/webp"
        };
        break;
      default:
        return; // Unsupported media type
    }

    // Send the media back to the user who triggered it
    await client.sendMessage(from, messageContent, options);
    
  } catch (error) {
    console.error("View Once Save Error:", error);
    // No error response to maintain stealth
  }
});
