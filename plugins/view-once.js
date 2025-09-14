const {  
    default: makeWASocket,  
    getAggregateVotesInPollMessage,   
    useMultiFileAuthState,  
    DisconnectReason,  
    getDevice,  
    fetchLatestBaileysVersion,  
    jidNormalizedUser,  
    getContentType,  
    Browsers,  
    delay,  
    makeInMemoryStore,  
    makeCacheableSignalKeyStore,  
    downloadContentFromMessage,  
    generateForwardMessageContent,  
    generateWAMessageFromContent,  
    prepareWAMessageMedia,  
    proto  
} = require('@whiskeysockets/baileys')  
const fs = require('fs')  
const FileType = require('file-type')  
const { cmd, commands } = require('../command')  
  
cmd({  
  pattern: "vv3",  
  react: "🌠",  
  alias: ["vv3","❤️"],  
  desc: "Recover View Once messages",  
  category: "main",  
  use: ".vv3",  
  filename: __filename  
}, async (sock, message, msgData, { from, quoted, body, isCmd, command, args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply }) => {  
  try {  
    const quotedMsg = msgData?.msg?.contextInfo?.quotedMessage;  
  
    if (quotedMsg) {  
      if (quotedMsg.imageMessage?.viewOnce) {  
        console.log("Detected a View Once image");  
        let caption = quotedMsg.imageMessage?.caption || '';  
        let mediaPath = await sock.downloadAndSaveMediaMessage(quotedMsg.imageMessage);  
  
        const mediaObject = { url: mediaPath };  
        const response = { image: mediaObject, caption };  
  
        return sock.sendMessage(msgData.chat, response);  
      }   
        
      else if (quotedMsg.videoMessage?.viewOnce) {  
        console.log("Detected a View Once video");  
        let caption = quotedMsg.videoMessage?.caption || '';  
        let mediaPath = await sock.downloadAndSaveMediaMessage(quotedMsg.videoMessage);  
  
        const mediaObject = { url: mediaPath };  
        const response = { video: mediaObject, caption };  
  
        return sock.sendMessage(msgData.chat, response);  
      }   
        
      else if (quotedMsg.audioMessage?.viewOnce) {  
        console.log("Detected a View Once audio");  
        let caption = quotedMsg.audioMessage?.caption || '';  
        let mediaPath = await sock.downloadAndSaveMediaMessage(quotedMsg.audioMessage);  
  
        const mediaObject = { url: mediaPath };  
        const response = { audio: mediaObject, caption };  
  
        return sock.sendMessage(msgData.chat, response);  
      }   
        
      else {  
        return reply("```THIS IS NOT A VIEW ONCE MESSAGE!```");  
      }  
    }   
      
    else {  
      return reply("```PLEASE REPLY TO A VIEW ONCE MESSAGE!```");  
    }  
  } catch (error) {  
    console.error("Error:", error);  
    reply("❌ An error occurred while processing the command.");  
  }  
});
