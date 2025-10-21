// Coded by JawadTechX — KHAN MD

const fetch = require("node-fetch");
const yts = require("yt-search");
const { cmd } = require("../command");
const config = require("../config");

const youtubeRegexID = /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/))([a-zA-Z0-9_-]{11})/;

cmd({
  pattern: "play",
  alias: ["song", "music"],
  desc: "Download YouTube audio (128kbps)",
  category: "downloader",
  react: "🎵",
  filename: __filename
}, async (conn, mek, m, { from, q, reply }) => {
  try {
    if (!q) return reply("🔔 *Please provide a song name or YouTube link!*");

    // Search or extract video ID
    let videoIdMatch = q.match(youtubeRegexID);
    let search = await yts(videoIdMatch ? `https://youtu.be/${videoIdMatch[1]}` : q);
    let video = videoIdMatch
      ? search.all.find(v => v.videoId === videoIdMatch[1]) || search.videos.find(v => v.videoId === videoIdMatch[1])
      : search.videos?.[0];

    if (!video) return reply("❌ *No results found for your search!*");

    const { title, thumbnail, views, ago, timestamp, url, author } = video;
    const channel = author?.name || "Unknown";

    // Send initial message with thumbnail
    await conn.sendMessage(from, {
      image: { url: thumbnail },
      caption: `🎧 *${title}*\n\n📀 *Status:* Downloading...`
    }, { quoted: mek });

    // Fetch audio using API
    const apiURL = `https://api.vreden.my.id/api/v1/download/youtube/audio?url=${encodeURIComponent(url)}&quality=128`;
    const res = await fetch(apiURL);
    const json = await res.json();

    if (!json.status || !json.result?.download?.url) {
      return reply("❌ *Failed to fetch audio link!*");
    }

    const audioUrl = json.result.download.url;
    const filename = json.result.download.filename || `${title}.mp3`;

    // Send audio file
    await conn.sendMessage(from, {
      audio: { url: audioUrl },
      mimetype: "audio/mpeg",
      fileName: filename
    }, { quoted: mek });

    await m.react("✅");

  } catch (e) {
    console.error(e);
    reply("❌ *Error:* " + e.message);
  }
});
