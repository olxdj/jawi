//---------------------------------------------------------------------------
//           KHAN-MD  
//---------------------------------------------------------------------------
//  ⚠️ DO NOT MODIFY THIS FILE ⚠️  
//---------------------------------------------------------------------------
const { cmd, commands } = require('../command');
const config = require('../config');
const prefix = config.PREFIX;
const fs = require('fs');
const { getBuffer, getGroupAdmins, getRandom, h2k, isUrl, Json, sleep, fetchJson } = require('../lib/functions');
const { writeFileSync } = require('fs');
const path = require('path');
const os = require('os');
const { exec } = require('child_process');
const axios = require('axios');
const FormData = require('form-data');
const { setConfig, getConfig } = require("../lib/configdb");

// SET BOT IMAGE
cmd({
  pattern: "setbotimage",
  alias: ["botdp", "botpic", "botimage"],
  desc: "Set the bot's image URL",
  category: "owner",
  react: "✅",
  filename: __filename
}, async (conn, mek, m, { args, isCreator, reply }) => {
  try {
    if (!isCreator) return reply("❗ Only the bot owner can use this command.");

    let imageUrl = args[0];

    // Upload image if replying to one
    if (!imageUrl && m.quoted) {
      const quotedMsg = m.quoted;
      const mimeType = (quotedMsg.msg || quotedMsg).mimetype || '';
      if (!mimeType.startsWith("image")) return reply("❌ Please reply to an image.");

      const mediaBuffer = await quotedMsg.download();
      const extension = mimeType.includes("jpeg") ? ".jpg" : ".png";
      const tempFilePath = path.join(os.tmpdir(), `botimg_${Date.now()}${extension}`);
      fs.writeFileSync(tempFilePath, mediaBuffer);

      const form = new FormData();
      form.append("fileToUpload", fs.createReadStream(tempFilePath), `botimage${extension}`);
      form.append("reqtype", "fileupload");

      const response = await axios.post("https://catbox.moe/user/api.php", form, {
        headers: form.getHeaders()
      });

      fs.unlinkSync(tempFilePath);

      if (typeof response.data !== 'string' || !response.data.startsWith('https://')) {
        throw new Error(`Catbox upload failed: ${response.data}`);
      }

      imageUrl = response.data;
    }

    if (!imageUrl || !imageUrl.startsWith("http")) {
      return reply("❌ Provide a valid image URL or reply to an image.");
    }

    await setConfig("MENU_IMAGE_URL", imageUrl);

    await reply(`✅ Bot image updated.\n\n*New URL:* ${imageUrl}\n\n♻️ Restarting...`);
    setTimeout(() => exec("pm2 restart all"), 2000);

  } catch (err) {
    console.error(err);
    reply(`❌ Error: ${err.message || err}`);
  }
});

// SET PREFIX
cmd({
  pattern: "setprefix",
  alias: ["prefix", "prifix"],
  desc: "Set the bot's command prefix",
  category: "owner",
  react: "⚡",
  filename: __filename
}, async (conn, mek, m, { args, isCreator, reply, from }) => {
  try {
    // ⏳ React - processing
    await conn.sendMessage(from, { react: { text: '⏳', key: m.key } });
    await sleep(300);

    if (!isCreator) {
      await reply("❗ *Only the bot owner can use this command.*");
      await sleep(500);
      await conn.sendMessage(from, { react: { text: '❌', key: m.key } });
      return;
    }

    const newPrefix = args[0]?.trim();
    
    if (!newPrefix) {
      await reply(`🔰 *Prefix Settings*\n\n⚡ Current Prefix: *${config.PREFIX}*\n\nUsage: .prefix ,`);
      await sleep(500);
      await conn.sendMessage(from, { react: { text: 'ℹ️', key: m.key } });
      return;
    }

    if (newPrefix.length > 2) {
      await reply("❌ *Invalid Prefix!*\n\n📏 Prefix must be 1-2 characters only.\n\nExample: .prifix !");
      await sleep(500);
      await conn.sendMessage(from, { react: { text: '❌', key: m.key } });
      return;
    }

    await setConfig("PREFIX", newPrefix);
    await reply(`✅ *Prefix Updated!*\n\n⚡ New Prefix: *${newPrefix}*\n\n📝 Commands will now use: *${newPrefix}command*\n\n♻️ Restarting...`);
    await sleep(1000);
    await conn.sendMessage(from, { react: { text: '✅', key: m.key } });

    setTimeout(() => exec("pm2 restart all"), 2000);
  } catch (error) {
    await reply(`❌ *Error!*\n\nFailed to update prefix.\nError: ${error.message}`);
    await sleep(500);
    await conn.sendMessage(from, { react: { text: '❌', key: m.key } });
  }
});

cmd({
    pattern: "mode",
    alias: ["setmode", "mod"],
    react: "✅",
    desc: "Set bot mode to private or public.",
    category: "setting",
    filename: __filename,
}, async (conn, mek, m, { args, isCreator, reply }) => {
    if (!isCreator) return reply("*📛 Only the owner can use this command!*");

    const currentMode = getConfig("MODE") || "public";

    if (!args[0]) {
        return reply(`📌 Current mode: *${currentMode}*\n\nUsage: .mode private OR .mode public`);
    }

    const modeArg = args[0].toLowerCase();

    if (["private", "public"].includes(modeArg)) {
        setConfig("MODE", modeArg);
        await reply(`✅ Bot mode is now set to *${modeArg.toUpperCase()}*.\n\n♻ Restarting bot to apply changes...`);

        exec("pm2 restart all", (error, stdout, stderr) => {
            if (error) {
                console.error("Restart error:", error);
                return;
            }
            console.log("PM2 Restart:", stdout || stderr);
        });
    } else {
        return reply("❌ Invalid mode. Please use `.mode private` or `.mode public`.");
    }
});

// SET BOT NAME
cmd({
  pattern: "setbotname",
  alias: ["botname"],
  desc: "Set the bot's name",
  category: "owner",
  react: "🤖",
  filename: __filename
}, async (conn, mek, m, { args, isCreator, reply, from }) => {
  try {
    // ⏳ React - processing
    await conn.sendMessage(from, { react: { text: '⏳', key: m.key } });
    await sleep(300);

    if (!isCreator) {
      await reply("❗ *Only the bot owner can use this command.*");
      await sleep(500);
      await conn.sendMessage(from, { react: { text: '❌', key: m.key } });
      return;
    }

    const newName = args.join(" ").trim();
    if (!newName) {
      await reply("❌ *Please provide a bot name.*\n\nExample: .setbotname MyBot");
      await sleep(500);
      await conn.sendMessage(from, { react: { text: '❌', key: m.key } });
      return;
    }

    await setConfig("BOT_NAME", newName);
    await reply(`✅ *Bot Name Updated!*\n\n🤖 New Name: *${newName}*\n\n♻️ Restarting...`);
    await sleep(1000);
    await conn.sendMessage(from, { react: { text: '✅', key: m.key } });

    setTimeout(() => exec("pm2 restart all"), 2000);
  } catch (error) {
    await reply(`❌ *Error!*\n\nFailed to update bot name.\nError: ${error.message}`);
    await sleep(500);
    await conn.sendMessage(from, { react: { text: '❌', key: m.key } });
  }
});

// SET OWNER NAME
cmd({
  pattern: "setownername",
  alias: ["ownername"],
  desc: "Set the owner's name",
  category: "owner",
  react: "👑",
  filename: __filename
}, async (conn, mek, m, { args, isCreator, reply, from }) => {
  try {
    // ⏳ React - processing
    await conn.sendMessage(from, { react: { text: '⏳', key: m.key } });
    await sleep(300);

    if (!isCreator) {
      await reply("❗ *Only the bot owner can use this command.*");
      await sleep(500);
      await conn.sendMessage(from, { react: { text: '❌', key: m.key } });
      return;
    }

    const name = args.join(" ").trim();
    if (!name) {
      await reply("❌ *Please provide an owner name.*\n\nExample: .setownername John Doe");
      await sleep(500);
      await conn.sendMessage(from, { react: { text: '❌', key: m.key } });
      return;
    }

    await setConfig("OWNER_NAME", name);
    await reply(`✅ *Owner Name Updated!*\n\n👑 New Name: *${name}*\n\n♻️ Restarting...`);
    await sleep(1000);
    await conn.sendMessage(from, { react: { text: '✅', key: m.key } });

    setTimeout(() => exec("pm2 restart all"), 2000);
  } catch (error) {
    await reply(`❌ *Error!*\n\nFailed to update owner name.\nError: ${error.message}`);
    await sleep(500);
    await conn.sendMessage(from, { react: { text: '❌', key: m.key } });
  }
});

// WELCOME
cmd({
  pattern: "welcome",
  alias: ["setwelcome"],
  react: "👋",
  desc: "Enable or disable welcome messages for new members",
  category: "setting",
  filename: __filename
}, async (conn, mek, m, { from, args, isCreator, reply }) => {
  try {
    // ⏳ React - processing
    await conn.sendMessage(from, { react: { text: '⏳', key: m.key } });
    await sleep(300);

    if (!isCreator) {
      await reply("*📛 Only the owner can use this command!*");
      await sleep(500);
      await conn.sendMessage(from, { react: { text: '❌', key: m.key } });
      return;
    }

    const status = args[0]?.toLowerCase();
    
    if (status === "on") {
      config.WELCOME = "true";
      await reply("✅ *Welcome Enabled!*\n\n👋 Welcome messages are now active for new members.");
      await sleep(1000);
      await conn.sendMessage(from, { react: { text: '✅', key: m.key } });
    } else if (status === "off") {
      config.WELCOME = "false";
      await reply("❌ *Welcome Disabled!*\n\n🚫 Welcome messages are now turned off.");
      await sleep(1000);
      await conn.sendMessage(from, { react: { text: '✅', key: m.key } });
    } else {
      await reply(`🔰 *Welcome Settings*\n\nCurrent Status: *${config.WELCOME === 'true' ? 'ON' : 'OFF'}*\n\nUsage: .welcome on/off`);
      await sleep(500);
      await conn.sendMessage(from, { react: { text: 'ℹ️', key: m.key } });
    }
  } catch (error) {
    await reply(`❌ *Error!*\n\nFailed to update welcome settings.\nError: ${error.message}`);
    await sleep(500);
    await conn.sendMessage(from, { react: { text: '❌', key: m.key } });
  }
});

cmd({
    pattern: "anti-call",
    react: "🫟",
    alias: ["anticall"],
    desc: "Enable or disable welcome messages for new members",
    category: "owner",
    filename: __filename
},
async (conn, mek, m, { from, args, isCreator, reply }) => {
    if (!isCreator) return reply("*🫟σɴℓу тнє σωɴєʀ ¢αɴ ᴜѕє тнιѕ ¢σммαɴ∂!*");

    const status = args[0]?.toLowerCase();
    if (status === "on") {
        config.ANTI_CALL = "true";
        return reply("*✅ αɴтι-¢αℓℓ нαѕ вєєɴ єɴαвℓє∂*");
    } else if (status === "off") {
        config.ANTI_CALL = "false";
        return reply("*❌ αɴтι-¢αℓℓ нαѕ вєєɴ ∂ιѕαвℓє∂*");
    } else {
        return reply(`*🏷️ єχαмρℓє: αɴтι-¢αℓℓ σɴ/σff*`);
    }
});

cmd({
    pattern: "autotyping",
    alias: ["auto-typing", "typing"],
    react: "🫟",
    description: "Enable or disable auto-typing feature.",
    category: "setting",
    filename: __filename
},    
async (conn, mek, m, { from, args, isCreator, reply }) => {
    if (!isCreator) return reply("*📛 ᴏɴʟʏ ᴛʜᴇ ᴏᴡɴᴇʀ ᴄᴀɴ ᴜsᴇ ᴛʜɪs ᴄᴏᴍᴍᴀɴᴅ!*");

    const status = args[0]?.toLowerCase();
    if (!["on", "off"].includes(status)) {
        return reply("*🫟 ᴇxᴀᴍᴘʟᴇ:  .ᴀᴜᴛᴏᴛʏᴘɪɴɢ ᴏɴ*");
    }

    config.AUTO_TYPING = status === "on" ? "true" : "false";
    return reply(`Auto typing has been turned ${status}.`);
});
//--------------------------------------------
// ALWAYS_ONLINE COMMANDS
//--------------------------------------------
cmd({
    pattern: "alwaysonline",
    alias: ["online", "always-online"],
    react: "🫟",
    desc: "Enable or disable auto-viewing of statuses",
    category: "setting",
    filename: __filename
},    
async (conn, mek, m, { from, args, isCreator, reply }) => {
    if (!isCreator) return reply("*📛 ᴏɴʟʏ ᴛʜᴇ ᴏᴡɴᴇʀ ᴄᴀɴ ᴜsᴇ ᴛʜɪs ᴄᴏᴍᴍᴀɴᴅ!*");

    const status = args[0]?.toLowerCase();

    if (args[0] === "on") {
        config.ALWAYS_ONLINE = "true";
        return reply("alwaysonline now enabled.");
    } else if (args[0] === "off") {
        config.ALWAYS_ONLINE = "false";
        return reply("alwaysonline is now disabled.");
    } else {
        return reply(`*🫟 ᴇxᴀᴍᴘʟᴇ:  .alwaysonline on*`);
    }
}); 
//--------------------------------------------
//  AUTO_RECORDING COMMANDS
//--------------------------------------------
cmd({
    pattern: "autorecoding",
    alias: ["recoding", "auto-recoding"],
    react: "🫟",
    desc: "Enable or disable auto-viewing of statuses",
    category: "setting",
    filename: __filename
},    
async (conn, mek, m, { from, args, isCreator, reply }) => {
    if (!isCreator) return reply("*📛 ᴏɴʟʏ ᴛʜᴇ ᴏᴡɴᴇʀ ᴄᴀɴ ᴜsᴇ ᴛʜɪs ᴄᴏᴍᴍᴀɴᴅ!*");

    const status = args[0]?.toLowerCase();

    if (args[0] === "on") {
        config.AUTO_RECORDING = "true";
        return reply("Auto Recoding is now enabled.");
    } else if (args[0] === "off") {
        config.AUTO_RECORDING = "false";
        return reply("Auto Recoding is now disabled.");
    } else {
        return reply(`*🫟 ᴇxᴀᴍᴘʟᴇ:  .autorecoding on*`);
    }
}); 
//--------------------------------------------
// AUTO_VIEW_STATUS COMMANDS
//--------------------------------------------
cmd({
    pattern: "autostatusreact",
    alias: ["status-react", "statusreact", "sreact"],
    react: "🫟",
    desc: "Enable or disable auto-viewing of statuses",
    category: "setting",
    filename: __filename
},    
async (conn, mek, m, { from, args, isCreator, reply }) => {
    if (!isCreator) return reply("*📛 ᴏɴʟʏ ᴛʜᴇ ᴏᴡɴᴇʀ ᴄᴀɴ ᴜsᴇ ᴛʜɪs ᴄᴏᴍᴍᴀɴᴅ!*");

    const status = args[0]?.toLowerCase();
    // Default value for AUTO_VIEW_STATUS is "false"
    if (args[0] === "on") {
        config.AUTO_STATUS_REACT = "true";
        return reply("Autoreact of statuses is now enabled.");
    } else if (args[0] === "off") {
        config.AUTO_STATUS_REACT = "false";
        return reply("Autoreact of statuses is now disabled.");
    } else {
        return reply(`*🫟 ᴇxᴀᴍᴘʟᴇ:  .autustatusreact on*`);
    }
}); 
//--------------------------------------------
// AUTO_LIKE_STATUS COMMANDS
//--------------------------------------------

cmd({
    pattern: "autostatusview",
    alias: ["status-view","sview","statusview"],
    desc: "Enable or disable autoview of statuses",
    category: "setting",
    filename: __filename
},    
async (conn, mek, m, { from, args, isCreator, reply }) => {
    if (!isCreator) return reply("*📛 ᴏɴʟʏ ᴛʜᴇ ᴏᴡɴᴇʀ ᴄᴀɴ ᴜsᴇ ᴛʜɪs ᴄᴏᴍᴍᴀɴᴅ!*");

    const status = args[0]?.toLowerCase();
    // Default value for AUTO_LIKE_STATUS is "false"
    if (args[0] === "on") {
        config.AUTO_STATUS_SEEN = "true";
        return reply("Autoview of statuses is now enabled.");
    } else if (args[0] === "off") {
        config.AUTO_STATUS_SEEN= "false";
        return reply("Autoview of statuses is now disabled.");
    } else {
        return reply(`Example: .autoviewstatus on`);
    }
});

//--------------------------------------------
//  READ-MESSAGE COMMANDS
//--------------------------------------------
cmd({
    pattern: "read-message",
    alias: ["autoread"],
    desc: "enable or disable readmessage.",
    category: "setting",
    filename: __filename
},    
async (conn, mek, m, { from, args, isCreator, reply }) => {
    if (!isCreator) return reply("*📛 ᴏɴʟʏ ᴛʜᴇ ᴏᴡɴᴇʀ ᴄᴀɴ ᴜsᴇ ᴛʜɪs ᴄᴏᴍᴍᴀɴᴅ!*");

    const status = args[0]?.toLowerCase();
    // Check the argument for enabling or disabling the anticall feature
    if (args[0] === "on") {
        config.AUTO_READ_MESSAGE = "true";
        return reply("readmessage feature is now enabled.");
    } else if (args[0] === "off") {
        config.AUTO_READ_MESSAGE = "false";
        return reply("readmessage feature is now disabled.");
    } else {
        return reply(`_example:  .readmessage on_`);
    }
});

//--------------------------------------------
//  ANI-BAD COMMANDS
//--------------------------------------------
cmd({
    pattern: "antibad",
    alias: ["anti-bad"],
    react: "🫟",
    alias: ["antibadword"],
    desc: "enable or disable antibad.",
    category: "setting",
    filename: __filename
},    
async (conn, mek, m, { from, args, isCreator, reply }) => {
    if (!isCreator) return reply("*📛 ᴏɴʟʏ ᴛʜᴇ ᴏᴡɴᴇʀ ᴄᴀɴ ᴜsᴇ ᴛʜɪs ᴄᴏᴍᴍᴀɴᴅ!*");

    const status = args[0]?.toLowerCase();
    // Check the argument for enabling or disabling the anticall feature
    if (args[0] === "on") {
        config.ANTI_BAD_WORD = "true";
        return reply("*anti bad word is now enabled.*");
    } else if (args[0] === "off") {
        config.ANTI_BAD_WORD = "false";
        return reply("*anti bad word feature is now disabled*");
    } else {
        return reply(`_example:  .antibad on_`);
    }
});
//--------------------------------------------
//  AUTO-STICKER COMMANDS
//--------------------------------------------
cmd({
    pattern: "autosticker",
    alias: ["auto-sticker"],
    react: "🫟",
    alias: ["autosticker"],
    desc: "enable or disable auto-sticker.",
    category: "setting",
    filename: __filename
},    
async (conn, mek, m, { from, args, isCreator, reply }) => {
    if (!isCreator) return reply("*📛 ᴏɴʟʏ ᴛʜᴇ ᴏᴡɴᴇʀ ᴄᴀɴ ᴜsᴇ ᴛʜɪs ᴄᴏᴍᴍᴀɴᴅ!*");

    const status = args[0]?.toLowerCase();
    // Check the argument for enabling or disabling the anticall feature
    if (args[0] === "on") {
        config.AUTO_STICKER = "true";
        return reply("auto-sticker feature is now enabled.");
    } else if (args[0] === "off") {
        config.AUTO_STICKER = "false";
        return reply("auto-sticker feature is now disabled.");
    } else {
        return reply(`_example:  .autosticker on_`);
    }
});
//--------------------------------------------
//  AUTO-REPLY COMMANDS
//--------------------------------------------
cmd({
    pattern: "autoreply",
    alias: ["auto-reply"],
    react: "🫟",
    alias: ["autoreply"],
    desc: "enable or disable auto-reply.",
    category: "setting",
    filename: __filename
},    
async (conn, mek, m, { from, args, isCreator, reply }) => {
    if (!isCreator) return reply("*📛 ᴏɴʟʏ ᴛʜᴇ ᴏᴡɴᴇʀ ᴄᴀɴ ᴜsᴇ ᴛʜɪs ᴄᴏᴍᴍᴀɴᴅ!*");

    const status = args[0]?.toLowerCase();
    // Check the argument for enabling or disabling the anticall feature
    if (args[0] === "on") {
        config.AUTO_REPLY = "true";
        return reply("*auto-reply  is now enabled.*");
    } else if (args[0] === "off") {
        config.AUTO_REPLY = "false";
        return reply("auto-reply feature is now disabled.");
    } else {
        return reply(`*🫟 ᴇxᴀᴍᴘʟᴇ: . ᴀᴜᴛᴏʀᴇᴘʟʏ ᴏɴ*`);
    }
});

//--------------------------------------------
//   AUTO-REACT COMMANDS
//--------------------------------------------

cmd({
    pattern: "autoreact",
    alias: ["auto-react", "autoreaction"],
    react: "🫟",
    desc: "Enable or disable the autoreact feature",
    category: "setting",
    filename: __filename
}, async (conn, mek, m, { from, args, isCreator, reply }) => {
    try {
        // ⏳ React - processing
        await conn.sendMessage(from, { react: { text: '⏳', key: m.key } });
        await sleep(800);

        if (!isCreator) {
            await reply("*📛 Only the owner can use this command!*");
            await sleep(900);
            await conn.sendMessage(from, { react: { text: '❌', key: m.key } });
            return;
        }

        const status = args[0]?.toLowerCase();
        
        if (status === "on") {
            config.AUTO_REACT = "true";
            await reply("✅ *Auto React Enabled!*\n\n🤖 Bot will now automatically react to messages.");
            await sleep(1000);
            await conn.sendMessage(from, { react: { text: '✅', key: m.key } });
        } else if (status === "off") {
            config.AUTO_REACT = "false";
            await reply("❌ *Auto React Disabled!*\n\n🚫 Auto reactions are now turned off.");
            await sleep(1000);
            await conn.sendMessage(from, { react: { text: '✅', key: m.key } });
        } else {
            await reply(`🔰 *Auto React Settings*\n\nCurrent Status: *${config.AUTO_REACT === 'true' ? 'ON' : 'OFF'}*\n\nUsage: .autoreact on/off`);
            await sleep(800);
            await conn.sendMessage(from, { react: { text: 'ℹ️', key: m.key } });
        }
    } catch (error) {
        await reply(`❌ *Error!*\n\nFailed to update auto react settings.\nError: ${error.message}`);
        await sleep(500);
        await conn.sendMessage(from, { react: { text: '❌', key: m.key } });
    }
});

//--------------------------------------------
//  STATUS-REPLY COMMANDS
//--------------------------------------------

cmd({
    pattern: "autostatusreply",
    react: "🫟",
    alias: ["statusreply", "status-reply"],
    desc: "enable or disable status-reply.",
    category: "setting",
    filename: __filename
},    
async (conn, mek, m, { from, args, isCreator, reply }) => {
    if (!isCreator) return reply("*📛 ᴏɴʟʏ ᴛʜᴇ ᴏᴡɴᴇʀ ᴄᴀɴ ᴜsᴇ ᴛʜɪs ᴄᴏᴍᴍᴀɴᴅ!*");

    const status = args[0]?.toLowerCase();
    // Check the argument for enabling or disabling the anticall feature
    if (args[0] === "on") {
        config.AUTO_STATUS_REPLY = "true";
        return reply("status-reply feature is now enabled.");
    } else if (args[0] === "off") {
        config.AUTO_STATUS_REPLY = "false";
        return reply("status-reply feature is now disabled.");
    } else {
        return reply(`*🫟 ᴇxᴀᴍᴘʟᴇ:  .sᴛᴀᴛᴜsʀᴇᴘʟʏ ᴏɴ*`);
    }
});

// men reply 

cmd({
    pattern: "mention-reply",
    alias: ["menetionreply", "mee"],
    description: "Set bot status to always online or offline.",
    category: "setting",
    filename: __filename
},    
async (conn, mek, m, { from, args, isCreator, reply }) => {
    if (!isCreator) return reply("*📛 ᴏɴʟʏ ᴛʜᴇ ᴏᴡɴᴇʀ ᴄᴀɴ ᴜsᴇ ᴛʜɪs ᴄᴏᴍᴍᴀɴᴅ!*");

    const status = args[0]?.toLowerCase();
    // Check the argument for enabling or disabling the anticall feature
    if (args[0] === "on") {
        config.MENTION_REPLY = "true";
        return reply("Mention Reply feature is now enabled.");
    } else if (args[0] === "off") {
        config.MENTION_REPLY = "false";
        return reply("Mention Reply feature is now disabled.");
    } else {
        return reply(`_example:  .mee on_`);
    }
});


cmd({
    pattern: "admin-events",
    alias: ["adminevents", "adminaction"],
    desc: "Enable or disable admin event notifications",
    category: "setting",
    filename: __filename
},
async (conn, mek, m, { from, args, isCreator, reply }) => {
    if (!isCreator) return reply("*📛 ᴏɴʟʏ ᴛʜᴇ ᴏᴡɴᴇʀ ᴄᴀɴ ᴜsᴇ ᴛʜɪs ᴄᴏᴍᴍᴀɴᴅ!*");

    const status = args[0]?.toLowerCase();
    if (status === "on") {
        config.ADMIN_ACTION = "true";
        return reply("✅ Admin event notifications are now enabled.");
    } else if (status === "off") {
        config.ADMIN_ACTION = "false";
        return reply("❌ Admin event notifications are now disabled.");
    } else {
        return reply(`Example: .admin-events on`);
    }
});

cmd({
    pattern: "ownerreact",
    alias: ["owner-react", "selfreact", "self-react"],
    react: "👑",
    desc: "Enable or disable the owner react feature",
    category: "setting",
    filename: __filename
},    
async (conn, mek, m, { from, args, isCreator, reply }) => {
    if (!isCreator) return reply("*📛 ᴏɴʟʏ ᴛʜᴇ ᴏᴡɴᴇʀ ᴄᴀɴ ᴜsᴇ ᴛʜɪs ᴄᴏᴍᴍᴀɴᴅ!*");

    const status = args[0]?.toLowerCase();

    if (args[0] === "on") {
        config.OWNER_REACT = "true";
        await reply("ownerreact feature is now enabled.");
    } else if (args[0] === "off") {
        config.OWNER_REACT = "false";
        await reply("ownerreact feature is now disabled.");
    } else {
        await reply(`*🔥 ᴇxᴀᴍᴘʟᴇ: .ᴏᴡɴᴇʀʀᴇᴀᴄᴛ ᴏɴ*`);
    }
});

cmd({
  pattern: "deletelink",
  alias: ["delete-links"],
  desc: "Enable or disable DELETE_LINKS in groups",
  category: "group",
  react: "❌",
  filename: __filename
}, async (conn, mek, m, { isGroup, isAdmins, isBotAdmins, args, reply }) => {
  try {
    if (!isGroup) return reply('This command can only be used in a group.');
    if (!isBotAdmins) return reply('Bot must be an admin to use this command.');
    if (!isAdmins) return reply('You must be an admin to use this command.');

    if (args[0] === "on") {
      config.DELETE_LINKS = "true";
      reply("✅ DELETE_LINKS is now enabled.");
    } else if (args[0] === "off") {
      config.DELETE_LINKS = "false";
      reply("❌ DELETE_LINKS is now disabled.");
    } else {
      reply("Usage: *.deletelink on/off*");
    }
  } catch (e) {
    reply(`Error: ${e.message}`);
  }
});


// CUSTOM REACT
cmd({
    pattern: "customreact",
    alias: ["creact", "reactc"],
    react: "😎",
    desc: "Enable or disable custom reactions",
    category: "setting",
    filename: __filename
},
async (conn, mek, m, { from, args, isCreator, reply }) => {
    if (!isCreator) return reply("*📛 ᴏɴʟʏ ᴛʜᴇ ᴏᴡɴᴇʀ ᴄᴀɴ ᴜsᴇ ᴛʜɪs ᴄᴏᴍᴍᴀɴᴅ!*");

    const status = args[0]?.toLowerCase();
    if (status === "on") {
        config.CUSTOM_REACT = "true";
        return reply("✅ Custom reactions are now enabled.");
    } else if (status === "off") {
        config.CUSTOM_REACT = "false";
        return reply("❌ Custom reactions are now disabled.");
    } else {
        return reply(`Example: .customreact on`);
    }
});

cmd({
  pattern: "setreacts",
  alias: ["customemojis", "emojis", "cemojis"],
  desc: "Set custom reaction emojis for the bot",
  category: "owner",
  react: "🌈",
  filename: __filename
}, async (conn, mek, m, { args, isCreator, reply }) => {
  if (!isCreator) return reply("❗ Only the bot owner can use this command.");
  
  const emojiList = args.join(" ").trim();
  if (!emojiList) return reply("❌ Please provide a comma-separated list of emojis.\n\nExample:\n.setreactemoji 💖,💗,💘,💕");

  await setConfig("CUSTOM_REACT_EMOJIS", emojiList);

  await reply(`✅ Custom reaction emojis updated to:\n${emojiList}\n\n♻️ Restarting bot to apply changes...`);
  setTimeout(() => exec("pm2 restart all"), 2000);
});
