const config = require('../config');
const { cmd } = require('../command');
const { ytsearch, ytmp3, ytmp4 } = require('@dark-yasiya/yt-dl.js'); 
const converter = require('../data/converter');

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
    alias: ["yta2"],
    react: "🎵",
    desc: "Download YouTube song",
    category: "main",
    use: ".play <song name>",
    filename: __filename
},
async (conn, mek, m, { from, q, reply }) => {
    try {
        if (!q) return reply("🎵  Please type the song name, e.g. *.play Tum Hi Ho*");

        /* 1️⃣  Search YouTube */
        const yt = await ytsearch(q);
        if (!yt?.results?.length) return reply("❌  No YouTube results found.");

        const vid   = yt.results[0];           // first result
        const yurl  = vid.url;                 // full YouTube link
        const thumb = vid.thumbnail || "";     // fallback if missing

        /* 2️⃣  Hit Sparky's MP3 API */
        const api   = `https://api-aswin-sparky.koyeb.app/api/downloader/song?search=${encodeURIComponent(yurl)}`;
        const res   = await fetch(api);
        const json  = await res.json();

        if (!json?.status || !json?.data?.downloadURL)
            return reply("❌  Failed to fetch the song. Try again later.");

        /* 3️⃣  Pretty caption */
        const caption =
`*YT AUDIO DOWNLOADER*
╭━━❐━⪼
┇๏ *Title*    –  ${vid.title}
┇๏ *Duration* –  ${vid.timestamp}
┇๏ *Views*    –  ${vid.views}
┇๏ *Author*   –  ${vid.author.name}
╰━━❑━⪼
> *© Powered By KHAN-MD ♡*`;

        /* 4️⃣  Send thumbnail + details */
        await conn.sendMessage(from,
            { image: { url: thumb }, caption },
            { quoted: mek });

        /* 5️⃣  Download and convert audio */
        const audioResponse = await fetch(json.data.downloadURL);
        const audioBuffer = await audioResponse.arrayBuffer();
        const nodeBuffer = Buffer.from(audioBuffer);
        
        // Convert to WhatsApp-supported format
        const convertedAudio = await converter.toAudio(nodeBuffer, 'mp3');

        /* 6️⃣  Send playable audio */
        await conn.sendMessage(from,
            { 
                audio: convertedAudio, 
                mimetype: "audio/mpeg",
                ptt: false 
            },
            { quoted: mek });

    } catch (err) {
        console.error(err);
        reply("⚠️  An unexpected error occurred. Please try again later.");
    }
});
