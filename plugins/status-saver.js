const { cmd } = require("../command");

cmd({
  pattern: "send",
  alias: ["sendme", 'save', 'sand', 'sent', 'forward'],
  react: '🍯',
  desc: "Saves status updates to your DM",
  category: "utility",
  filename: __filename
}, async (client, message, match, { from }) => {
  try {
    // Only work if quoting a status broadcast, ignore everything else
    if (match.quoted?.chat !== 'status@broadcast') {
      return; // Do nothing if NOT quoting a status message
    }

    const buffer = await match.quoted.download();
    const mtype = match.quoted.mtype;
    const originalCaption = match.quoted.text || '';
    const options = { quoted: message };

    let messageContent = {};
    switch (mtype) {
      case "imageMessage":
        messageContent = {
          image: buffer,
          caption: originalCaption ? `${originalCaption}\n\n> ${config.DESCRIPTION}` : `> ${config.DESCRIPTION}`,
          mimetype: match.quoted.mimetype || "image/jpeg"
        };
        break;
      case "videoMessage":
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
        return await client.sendMessage(from, {
          text: "❌ Only image, video, and audio status updates are supported"
        }, { quoted: message });
    }

    // Forward status to user's DM
    await client.sendMessage(message.sender, messageContent, options);
    
  } catch (error) {
    console.error("Status Save Error:", error);
    await client.sendMessage(from, {
      text: "❌ Error saving status:\n" + error.message
    }, { quoted: message });
  }

  // 🕒 No Prefix Handler - Inside the command
  client.ev.on('messages.upsert', async (msg) => {
    try {
      const m = msg.messages[0];
      if (!m.message) return;

      const text = m.message?.conversation || m.message?.extendedTextMessage?.text;
      const from = m.key.remoteJid;
      if (!text) return;

      // Convert to lowercase and split into words
      const words = text.toLowerCase().split(/\s+/);
      const targetCommands = ["send", "sendme", "save", "sand", "sent", "forward"];
      
      // Check if any word in the message matches our target commands
      const foundCommand = words.find(word => targetCommands.includes(word));
      if (!foundCommand) return;

      // Only work if quoting a status broadcast, ignore everything else
      const quotedChat = m.message.extendedTextMessage?.contextInfo?.remoteJid;
      if (quotedChat !== 'status@broadcast') {
        return; // Do nothing if NOT quoting a status message
      }

      // Create a message object similar to the main command
      const fakeMessage = {
        quoted: {
          chat: quotedChat,
          download: async () => {
            const quotedMsg = m.message.extendedTextMessage.contextInfo.quotedMessage;
            const mtype = Object.keys(quotedMsg)[0];
            const stream = await downloadContentFromMessage(quotedMsg[mtype], mtype.replace("Message", ""));
            let buffer = Buffer.from([]);
            for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk]);
            return buffer;
          },
          mtype: Object.keys(m.message.extendedTextMessage.contextInfo.quotedMessage)[0],
          mimetype: m.message.extendedTextMessage.contextInfo.quotedMessage[Object.keys(m.message.extendedTextMessage.contextInfo.quotedMessage)[0]]?.mimetype,
          text: m.message.extendedTextMessage.contextInfo.quotedMessage[Object.keys(m.message.extendedTextMessage.contextInfo.quotedMessage)[0]]?.caption || '',
          ptt: m.message.extendedTextMessage.contextInfo.quotedMessage[Object.keys(m.message.extendedTextMessage.contextInfo.quotedMessage)[0]]?.ptt || false
        },
        sender: m.key.participant || m.key.remoteJid
      };

      const buffer = await fakeMessage.quoted.download();
      const mtype = fakeMessage.quoted.mtype;
      const originalCaption = fakeMessage.quoted.text || '';
      const options = { quoted: m };

      let messageContent = {};
      switch (mtype) {
        case "imageMessage":
          messageContent = {
            image: buffer,
            caption: originalCaption ? `${originalCaption}\n\n> ${config.DESCRIPTION}` : `> ${config.DESCRIPTION}`,
            mimetype: fakeMessage.quoted.mimetype || "image/jpeg"
          };
          break;
        case "videoMessage":
          messageContent = {
            video: buffer,
            caption: originalCaption ? `${originalCaption}\n\n> ${config.DESCRIPTION}` : `> ${config.DESCRIPTION}`,
            mimetype: fakeMessage.quoted.mimetype || "video/mp4"
          };
          break;
        case "audioMessage":
          messageContent = {
            audio: buffer,
            mimetype: "audio/mp4",
            ptt: fakeMessage.quoted.ptt || false
          };
          break;
        default:
          await client.sendMessage(from, {
            text: "❌ Only image, video, and audio status updates are supported"
          }, { quoted: m });
          return;
      }

      // Forward status to user's DM
      await client.sendMessage(fakeMessage.sender, messageContent, options);
      
    } catch (error) {
      console.error("No Prefix Status Save Error:", error);
    }
  });
});
