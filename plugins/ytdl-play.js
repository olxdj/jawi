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

cmd({ 
    pattern: "play3", 
    alias: ["ytv3"], 
    react: "⚡", 
    desc: "Download YouTube content with options",
    category: "download", 
    use: '.play2 <Youtube URL or Name>', 
    filename: __filename }, 
    async (conn, mek, m, { from, prefix, quoted, q, reply }) => { 
        try {
            if (!q) return await reply("Please provide a YouTube URL or video name.");

            const yt = await ytsearch(q);
            if (yt.results.length < 1) return reply("No results found!");
            
            let yts = yt.results[0];  
            
            let ytmsg = `*🎬 YOUTUBE DOWNLOADER*
╭━━❐━⪼
┇๏ *Title* - ${yts.title}
┇๏ *Duration* - ${yts.timestamp}
┇๏ *Views* - ${yts.views}
┇๏ *Author* - ${yts.author.name}
╰━━❑━⪼
📌 *Reply with the number to download*
1. Video (MP4)
2. Audio (MP3)
3. Voice Note (PTT)
4. Document (MP4)
5. Document (MP3)
> *© Powered By KHAN-MD ♡*`;

            // Send video details with thumbnail
            const sentMsg = await conn.sendMessage(from, { 
                image: { url: yts.thumbnail }, 
                caption: ytmsg 
            }, { quoted: mek });

            const messageID = sentMsg.key.id;
            let responded = false;

            // Create a listener for the reply
            const replyHandler = async (msgData) => {
                const receivedMsg = msgData.messages[0];
                if (!receivedMsg.message || responded) return;

                const receivedText = receivedMsg.message.conversation || 
                                    receivedMsg.message.extendedTextMessage?.text;
                const senderID = receivedMsg.key.remoteJid;
                const isReplyToBot = receivedMsg.message.extendedTextMessage?.contextInfo?.stanzaId === messageID;

                if (isReplyToBot && senderID === from) {
                    if (!['1','2','3','4','5'].includes(receivedText)) {
                        await conn.sendMessage(from, { 
                            text: "❌ Invalid option! Please reply with 1, 2, 3, 4, or 5." 
                        }, { quoted: receivedMsg });
                        return;
                    }

                    responded = true;
                    conn.ev.off("messages.upsert", replyHandler);

                    await conn.sendMessage(from, {
                        react: { text: '⬇️', key: receivedMsg.key }
                    });

                    try {
                        // Get fresh download URL for each request
                        const apiResponse = await fetch(`https://jawad-tech.vercel.app/download/ytmp4?url=${encodeURIComponent(yts.url)}`);
                        const apiData = await apiResponse.json();
                        
                        if (!apiData.status || !apiData.result.download) {
                            throw new Error("Failed to get download URL");
                        }

                        const downloadUrl = apiData.result.download;
                        const sanitizedTitle = yts.title.replace(/[^\w\s]/gi, '').substring(0, 50);

                        switch (receivedText) {
                            case "1":
                                // Video download
                                await conn.sendMessage(from, { 
                                    video: { url: downloadUrl },
                                    caption: "*Download completed!*"
                                }, { quoted: receivedMsg });
                                break;
                                
                            case "2":
                                // Audio download
                                await conn.sendMessage(from, { 
                                    audio: { url: downloadUrl },
                                    mimetype: "audio/mpeg"
                                }, { quoted: receivedMsg });
                                break;
                                
                            case "3":
                                // Voice note (PTT)
                                await conn.sendMessage(from, { 
                                    audio: { url: downloadUrl },
                                    mimetype: "audio/mp4",
                                    ptt: true
                                }, { quoted: receivedMsg });
                                break;
                                
                            case "4":
                                // Document (Video)
                                await conn.sendMessage(from, { 
                                    document: { url: downloadUrl },
                                    mimetype: "video/mp4",
                                    fileName: `${sanitizedTitle}.mp4`
                                }, { quoted: receivedMsg });
                                break;
                                
                            case "5":
                                // Document (Audio)
                                await conn.sendMessage(from, { 
                                    document: { url: downloadUrl },
                                    mimetype: "audio/mpeg",
                                    fileName: `${sanitizedTitle}.mp3`
                                }, { quoted: receivedMsg });
                                break;
                        }
                    } catch (error) {
                        console.error("Download error:", error);
                        await conn.sendMessage(from, { 
                            text: "❌ Failed to download. Please try again later." 
                        }, { quoted: receivedMsg });
                    }
                }
            };

            conn.ev.on("messages.upsert", replyHandler);

            // Set timeout to remove listener after 1 minute
            setTimeout(() => {
                if (!responded) {
                    conn.ev.off("messages.upsert", replyHandler);
                    conn.sendMessage(from, { 
                        text: "⌛ Download menu expired. Please use the command again." 
                    }, { quoted: sentMsg });
                }
            }, 60000);

        } catch (e) {
            console.log(e);
            reply("An error occurred. Please try again later.");
        }
    }
);
