const { cmd } = require("../command");
const axios = require("axios");

cmd({
  pattern: "phub",
  alias: ['xxx'],
  desc: "Search and Download Adult Videos",
  category: "download",
  react: '18+',
  filename: __filename
}, async (bot, message, args, { from, q, isCreator, reply }) => {
  try {
    // Only bot owner can use
    if (!isCreator) {
      return reply("_Only the bot owner can use this command!_");
    }

    // Need search query
    if (!q) {
      return reply("Please provide a search query.\nExample: `.phub mia khalifa`");
    }

    // Search API
    const searchUrl = `https://api.hanggts.xyz/search/xnxx?q=${encodeURIComponent(q)}`;
    const { data } = await axios.get(searchUrl);

    if (!data?.status || !data?.result || data.result.length === 0) {
      return reply("No results found for your search.");
    }

    // Take TOP 5 results (no random)
    const topResults = data.result.slice(0, 5);

    // Build list
    let listText = "╭─── *XNXX SEARCH RESULTS* ───⊷\n";
    topResults.forEach((video, index) => {
      const title = video.title ? video.title.trim() : "No Title";
      listText += `│ ${index + 1}. ${title}\n`;
    });
    listText += "╰──────────────────────────⊷\n\n";
    listText += "> *Reply with a number (1-5) to download*";

    // Send list
    const sentMsg = await bot.sendMessage(from, { text: listText }, { quoted: message });
    const listMsgId = sentMsg.key.id;

    // Listen for reply
    bot.ev.on('messages.upsert', async (update) => {
      const msg = update.messages[0];
      if (!msg.message) return;

      const text = msg.message.conversation || msg.message.extendedTextMessage?.text || "";
      const isReply = msg.message.extendedTextMessage?.contextInfo?.stanzaId === listMsgId;
      const sameChat = msg.key.remoteJid === from;

      if (!isReply || !sameChat) return;

      const choice = parseInt(text.trim());
      if (isNaN(choice) || choice < 1 || choice > 5) {
        return bot.sendMessage(from, {
          text: "> *Invalid choice. Reply with 1 to 5 only.*"
        }, { quoted: msg });
      }

      await bot.sendMessage(from, { react: { text: 'Downloading...', key: msg.key } });

      const selected = topResults[choice - 1];
      if (!selected?.link) {
        return bot.sendMessage(from, { text: "Link not available." }, { quoted: msg });
      }

      try {
        // Download API
        const dlUrl = `https://api.hanggts.xyz/download/xnxx?url=${encodeURIComponent(selected.link)}`;
        const dlRes = await axios.get(dlUrl);

        if (!dlRes.data?.status || !dlRes.data?.result?.files?.high) {
          return bot.sendMessage(from, { text: "Failed to get video. Try again." }, { quoted: msg });
        }

        const videoUrl = dlRes.data.result.files.high;
        const title = dlRes.data.result.title || "XVideo";

        // Send as document (bypass WhatsApp video preview ban)
        await bot.sendMessage(from, {
          document: { url: videoUrl },
          fileName: `${title}.mp4`,
          mimetype: "video/mp4",
          caption: `*${title}*`
        }, { quoted: msg });

        await bot.sendMessage(from, { react: { text: 'Checkmark', key: msg.key } });
      } catch (err) {
        console.error(err);
        await bot.sendMessage(from, {
          text: `Download error: ${err.message}`
        }, { quoted: msg });
      }
    });

  } catch (err) {
    console.error(err);
    reply(`Error: ${err.message}`);
  }
});
