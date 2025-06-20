const config = require('../config')
const { cmd, commands } = require('../command');
const axios = require('axios')

cmd({
  pattern: "settings",
  alias: ["env", "var"],
  desc: "Show all bot configuration settings",
  category: "owner",
  react: "⚙️",
  filename: __filename
}, async (conn, mek, m, { from, reply, isCreator }) => {
  if (!isCreator) return reply("❗ Only the bot owner can use this command.");

  const settingsMenu = `╭────⬡ *SETTING MENU* ⬡────⭓
│
├───⬡ *BOT CONFIGURATION* ⬡───
│├▢ .prefix [new prefix]
│├▢ .botname [name]
│├▢ .ownername [name]
│├▢ .botimage [ reply to image ]
│├▢ .mode [public/private]
│
├───⬡ *AUTO FEATURES* ⬡───
│├▢ .autoreact on/off
│├▢ .autoreply on/off
│├▢ .autosticker on/off
│├▢ .autotyping on/off
│├▢ .autostatusview on/off
│├▢ .autostatusreact on/off
│├▢ .autostatusreply on/off
│├▢ .autorecoding on/off
│├▢ .alwaysonline on/off
│
├───⬡ *GROUP SETTINGS* ⬡───
│├▢ .welcome on/off
│├▢ .goodbye on/off
│├▢ .antilink on/off
│├▢ .antilinkkick on/off
│├▢ .deletelink on/off
│├▢ .antibad on/off
│├▢ .antibot on/off
│
├───⬡ *MESSAGE SETTINGS* ⬡───
│├▢ .read-message on/off
│├▢ .mention-reply on/off
│├▢ .admin-action on/off
│
├───⬡ *CUSTOMIZATION* ⬡───
│├▢ .creact on/off
│├▢ .cemojis ❤️,🧡,💛
│
╰────⬡ *Use ${config.PREFIX}command on/off* ⬡────⭓
> ${config.DESCRIPTION}
`;

  await conn.sendMessage(from, { 
    image: { url: config.MENU_IMAGE_URL || 'https://files.catbox.moe/7zfdcq.jpg' }, 
    caption: settingsMenu 
  }, { quoted: mek });
});
