const axios = require("axios");
const { cmd } = require("../command");
const config = require("../config");

cmd({
  pattern: "fb4",
  alias: ["facebook4", "fbdl4"],
  react: "📥",
  desc: "Download videos from Facebook with quality & format selection",
  category: "download",
  use: ".fb4 <Facebook video URL>",
  filename: __filename,
}, async (conn, mek, m, { from, reply, args }) => {
  try {
    const fbUrl = args[0];
    if (!fbUrl || !fbUrl.includes("facebook.com")) {
      return reply(
        "❌ Please provide a valid Facebook video URL.\n\nExample:\n.fb4 https://facebook.com/..."
      );
    }

    await conn.sendMessage(from, { react: { text: "⏳", key: m.key } });

    const api = `https://jawad-tech.vercel.app/downloader?url=${encodeURIComponent(fbUrl)}`;
    const { data } = await axios.get(api);

    if (!data.status || !Array.isArray(data.result)) {
      return reply("❌ Could not fetch the video. Please check the link.");
    }

    const hd = data.result.find((v) => v.quality === "HD");
    const sd = data.result.find((v) => v.quality === "SD");

    if (!hd && !sd) return reply("❌ No downloadable video found.");

    // Attempt to construct a thumbnail directly from video CDN URL
    const videoUrl = hd?.url || sd?.url;
    const baseCDN = videoUrl.split("/v/t")[0];
    const thumbUrl = `${baseCDN}/v/t15.5256-10/thumbnail.jpg`; // Facebook's known thumbnail pattern

    const caption = `*⚡ Facebook Video Downloader*

📺 *Choose a format:*

1. 🎥 HD Video
2. 📽️ SD Video
3. 🎧 Audio (MP3)
4. 📄 Document (MP4)

_Reply with the number (1-4) to download._`;

    const sent = await conn.sendMessage(
      from,
      {
        image: { url: thumbUrl },
        caption,
      },
      { quoted: mek }
    );

    const messageID = sent.key.id;

    conn.ev.on("messages.upsert", async (msgData) => {
      const receivedMsg = msgData.messages[0];
      if (!receivedMsg?.message) return;

      const text =
        receivedMsg.message.conversation ||
        receivedMsg.message.extendedTextMessage?.text;
      const isReply =
        receivedMsg.message.extendedTextMessage?.contextInfo?.stanzaId ===
        messageID;
      const senderID = receivedMsg.key.remoteJid;

      if (isReply) {
        await conn.sendMessage(senderID, {
          react: { text: "⬇️", key: receivedMsg.key },
        });

        const selected = text?.trim();
        const videoURL = selected === "1" ? hd?.url : selected === "2" ? sd?.url : hd?.url || sd?.url;

        switch (selected) {
          case "1":
          case "2":
            return await conn.sendMessage(
              senderID,
              {
                video: { url: videoURL },
                caption: `🎬 Facebook Video (${selected === "1" ? "HD" : "SD"})\n> Powered By JawadTechX 💜`,
              },
              { quoted: receivedMsg }
            );

          case "3":
            return await conn.sendMessage(
              senderID,
              {
                audio: { url: videoURL },
                mimetype: "audio/mp4",
              },
              { quoted: receivedMsg }
            );

          case "4":
            return await conn.sendMessage(
              senderID,
              {
                document: { url: videoURL },
                mimetype: "video/mp4",
                fileName: "FacebookVideo.mp4",
              },
              { quoted: receivedMsg }
            );

          default:
            return await conn.sendMessage(
              senderID,
              {
                text: "❌ Invalid selection. Please reply with a number from 1 to 4.",
              },
              { quoted: receivedMsg }
            );
        }
      }
    });
  } catch (err) {
    console.error("FB4 Error:", err);
    reply("❌ An error occurred while processing the video. Try again later.");
  }
});
