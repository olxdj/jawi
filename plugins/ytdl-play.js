const config = require('../config');
const { cmd } = require('../command');
const { ytsearch, ytmp3, ytmp4 } = require('@dark-yasiya/yt-dl.js'); 
const converter = require('../data/play-converter');
const fetch = require('node-fetch');

cmd({ 
     pattern: "play", 
     alias: ["yta"], 
     react: "🎵", 
     desc: "Download Youtube song",
     category: "main", 
     use: '.song < Yt url or Name >', 
     filename: __filename }, 
     async (conn, mek, m, { from, prefix, quoted, q, reply }) => 
     
     { try { if (!q) return await reply("Please provide a YouTube URL or song name.");

const yt = await ytsearch(q);
    if (yt.results.length < 1) return reply("No results found!");
    
    let yts = yt.results[0];  
    let apiUrl = `https://apis.davidcyriltech.my.id/youtube/mp3?url=${encodeURIComponent(yts.url)}`;
    
    let response = await fetch(apiUrl);
    let data = await response.json();
    
    if (data.status !== 200 || !data.success || !data.result.downloadUrl) {
        return reply("Failed to fetch the audio. Please try again later.");
    }
    
    let ytmsg = `*YT AUDIO DOWNLOADER*
╭━━❐━⪼
┇๏ *Tital* -  ${yts.title}
┇๏ *Duration* - ${yts.timestamp}
┇๏ *Views* -  ${yts.views}
┇๏ *Author* -  ${yts.author.name} 
╰━━❑━⪼
> *© Pᴏᴡᴇʀᴇᴅ Bʏ KHAN-MD ♡*`;



// Send song details
    await conn.sendMessage(from, { image: { url: data.result.image || '' }, caption: ytmsg }, { quoted: mek });
    
    // Send audio file
    await conn.sendMessage(from, { audio: { url: data.result.downloadUrl }, mimetype: "audio/mpeg" }, { quoted: mek });
    
} catch (e) {
    console.log(e);
    reply("An error occurred. Please try again later.");
}

});

cmd({
    pattern: "play2",
    alias: ["yta2", "song"],
    react: "🎵",
    desc: "Download high quality YouTube audio",
    category: "media",
    use: "<song name>",
    filename: __filename
}, async (conn, mek, m, { from, q, reply }) => {
    try {
        if (!q) return reply("Please provide a song name\nExample: .play2 Tum Hi Ho");

        // Step 1: Search YouTube
        await conn.sendMessage(from, { text: "🔍 Searching for your song..." }, { quoted: mek });
        const yt = await ytsearch(q);
        if (!yt?.results?.length) return reply("❌ No results found. Try a different search term.");

        const vid = yt.results[0];

        const caption =
`*YT AUDIO DOWNLOADER*
╭━━❐━⪼
┇๏ *Title*    –  ${vid.title}
┇๏ *Duration* –  ${vid.timestamp}
┇๏ *Views*    –  ${vid.views}
┇๏ *Author*   –  ${vid.author.name}
╰━━❑━⪼
> *Downloading Audio File ♡*`;

        // Step 2: Send video info with thumbnail
        await conn.sendMessage(from, {
            image: { url: vid.thumbnail },
            caption
        }, { quoted: mek });

        // Step 3: Fetch audio URL
        const apiUrl = `https://api-aswin-sparky.koyeb.app/api/downloader/song?search=${encodeURIComponent(vid.url)}`;
        const response = await fetch(apiUrl);
        const data = await response.json();

        if (!data?.status || !data?.data?.downloadURL) {
            return reply("❌ Failed to fetch audio. Try again later.");
        }

        // Step 4: Download audio buffer
        const audioRes = await fetch(data.data.downloadURL);
        const audioBuffer = await audioRes.buffer();

        // Step 5: Convert to MP3 using toAudio
        let convertedAudio;
        try {
            convertedAudio = await converter.toAudio(audioBuffer, 'mp4');
        } catch (err) {
            console.error('Audio conversion failed:', err);
            return reply("❌ Audio conversion failed. Please try another song.");
        }

        // Step 6: Send converted audio
        await conn.sendMessage(from, {
            audio: convertedAudio,
            mimetype: 'audio/mpeg',
            ptt: false,
            fileName: `${vid.title}.mp3`.replace(/[^\w\s.-]/gi, '')
        }, { quoted: mek });

        // Step 7: React success
        await conn.sendMessage(from, { react: { text: "✅", key: mek.key } });

    } catch (error) {
        console.error('Play2 command error:', error);
        reply("⚠️ An unexpected error occurred. Please try again.");
        await conn.sendMessage(from, { react: { text: "❌", key: mek.key } });
    }
});
