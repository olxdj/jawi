const { cmd } = require("../command");

cmd({
  pattern: "del",
  alias: ["delete"],
  react: '🗑️',
  desc: "Delete messages - for me or everyone",
  category: "utility",
  filename: __filename
}, async (client, message, match, { from, isCreator, isGroup, isBotAdmins, isAdmins }) => {
  try {
    if (!isCreator) {
      return await client.sendMessage(from, {
        text: "*📛 This is an owner command.*"
      }, { quoted: message });
    }

    if (!match.quoted) {
      return await client.sendMessage(from, {
        text: "*🍁 Please reply to a message to delete!*"
      }, { quoted: message });
    }

    // ⏳ React - processing
    await client.sendMessage(from, { react: { text: '⏳', key: message.key } });

    const quotedMsg = match.quoted;
    const isOwnMessage = quotedMsg.fromMe;
    
    // Check if we're in a group
    if (isGroup) {
      // In group - check conditions for delete for everyone
      if (isOwnMessage && isBotAdmins) {
        // Own message + bot is admin = delete for everyone
        await client.sendMessage(from, { 
          delete: quotedMsg.key 
        });
      } else if (!isOwnMessage && isBotAdmins && isAdmins) {
        // Others' message + bot is admin + user is admin = delete for everyone
        await client.sendMessage(from, { 
          delete: quotedMsg.key 
        });
      } else {
        // Delete for me only (clear from bot's view)
        await client.chatModify(
          {
            clear: {
              messages: [
                {
                  id: quotedMsg.id,
                  fromMe: quotedMsg.fromMe,
                  timestamp: quotedMsg.messageTimestamp.toString()
                }
              ]
            }
          },
          from
        );
      }
    } else {
      // In private chat (IB)
      if (isOwnMessage) {
        // Own message in private chat = delete for everyone
        await client.sendMessage(from, { 
          delete: quotedMsg.key 
        });
      } else {
        // Others' message in private chat = delete for me only
        await client.chatModify(
          {
            clear: {
              messages: [
                {
                  id: quotedMsg.id,
                  fromMe: quotedMsg.fromMe,
                  timestamp: quotedMsg.messageTimestamp.toString()
                }
              ]
            }
          },
          from
        );
      }
    }

    // ✅ React - success
    await client.sendMessage(from, { react: { text: '✅', key: message.key } });

  } catch (error) {
    console.error("Delete Error:", error);
    // ❌ React - error
    await client.sendMessage(from, { react: { text: '❌', key: message.key } });
    
    await client.sendMessage(from, {
      text: "❌ Error deleting message:\n" + error.message
    }, { quoted: message });
  }
});
