const config = require('../config');
const { cmd } = require('../command');
const axios = require('axios');
const { getBuffer } = require("../lib/functions");
const { videoToWebp } = require('../lib/video-utils');
const { Sticker, createSticker, StickerTypes } = require("wa-sticker-formatter");

cmd({
    pattern: "tstick",
    alias: ["tg", "tgs", "tsticker", "telegramsticker"],
    react: "🛡️",
    desc: "Download Telegram sticker pack",
    category: "download",
    use: ".tstick <telegram_sticker_url>",
    filename: __filename
}, async (conn, mek, m, { from, q, reply, quoted, isCreator }) => {
    try {
        // Owner restriction
        if (!isCreator) {
            return await reply("📛 This is an owner command.");
        }

        if (!q) return await reply("❌ Please provide a Telegram sticker pack URL!\nExample: .tstick https://t.me/addstickers/packname");

        // Validate Telegram sticker URL
        if (!q.includes('t.me/addstickers/')) {
            return await reply("❌ Please provide a valid Telegram sticker pack URL!\nIt should look like: https://t.me/addstickers/packname");
        }

        // ⏳ React - processing
        await conn.sendMessage(from, { react: { text: '⏳', key: mek.key } });
        
        await reply("📦 Downloading sticker pack... Please wait!");

        // Get pack name from URL
        const packName = q.replace("https://t.me/addstickers/", "");

        // Using working bot token
        const botToken = '7801479976:AAGuPL0a7kXXBYz6XUSR_ll2SR5V_W6oHl4';
        
        try {
            // Fetch sticker pack info
            const response = await fetch(
                `https://api.telegram.org/bot${botToken}/getStickerSet?name=${encodeURIComponent(packName)}`,
                { 
                    method: "GET",
                    headers: {
                        "Accept": "application/json",
                        "User-Agent": "Mozilla/5.0"
                    }
                }
            );

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const stickerData = await response.json();
            
            if (!stickerData.ok || !stickerData.result) {
                return await reply("❌ Failed to fetch sticker pack. Invalid pack name or bot error.");
            }

            const packInfo = stickerData.result;
            const stickers = packInfo.stickers;

            if (!stickers || stickers.length === 0) {
                return await reply("❌ No stickers found in this pack!");
            }

            // Send sticker pack info
            await reply(`📦 *Sticker Pack Info*\n\n` +
                       `*Name:* ${packInfo.name || 'N/A'}\n` +
                       `*Title:* ${packInfo.title || 'N/A'}\n` +
                       `*Type:* ${packInfo.sticker_type || 'regular'}\n` +
                       `*Stickers:* ${stickers.length}\n\n` +
                       `⏳ Processing stickers...`);

            let sentCount = 0;
            let failedCount = 0;
            const totalStickers = stickers.length;

            // Send each sticker
            for (const [index, sticker] of stickers.entries()) {
                try {
                    const fileId = sticker.thumb ? sticker.thumb.file_id : sticker.file_id;
                    
                    // Get file info
                    const fileResponse = await fetch(
                        `https://api.telegram.org/bot${botToken}/getFile?file_id=${fileId}`,
                        { 
                            method: "GET",
                            headers: {
                                "Accept": "application/json",
                                "User-Agent": "Mozilla/5.0"
                            }
                        }
                    );

                    if (!fileResponse.ok) {
                        throw new Error(`File fetch error: ${fileResponse.status}`);
                    }

                    const fileData = await fileResponse.json();
                    
                    if (!fileData.ok || !fileData.result) {
                        throw new Error("Invalid file data received");
                    }

                    const fileUrl = `https://api.telegram.org/file/bot${botToken}/${fileData.result.file_path}`;
                    const fileExtension = fileData.result.file_path.split('.').pop().toLowerCase();

                    // Detect sticker type and process accordingly
                    if (fileExtension === 'webp') {
                        // Static WebP sticker - send directly
                        await conn.sendMessage(from, {
                            sticker: { url: fileUrl }
                        }, { quoted: mek });
                        
                    } else if (fileExtension === 'tgs') {
                        // Animated TGS sticker - convert to video WebP
                        try {
                            const stickerBuffer = await getBuffer(fileUrl);
                            
                            // For TGS files, we need to handle them appropriately
                            // Since TGS is Telegram's animated format, we'll convert to WebM/WebP
                            const webpBuffer = await videoToWebp(stickerBuffer);
                            
                            await conn.sendMessage(from, {
                                sticker: webpBuffer
                            }, { quoted: mek });
                            
                        } catch (convertError) {
                            console.error("TGS conversion error:", convertError);
                            // Fallback: send as document
                            await conn.sendMessage(from, {
                                document: { url: fileUrl },
                                fileName: `sticker_${index + 1}.tgs`,
                                mimetype: 'application/x-tgsticker'
                            }, { quoted: mek });
                        }
                        
                    } else if (fileExtension === 'webm') {
                        // WebM video sticker - convert to WebP
                        try {
                            const videoBuffer = await getBuffer(fileUrl);
                            const webpBuffer = await videoToWebp(videoBuffer);
                            
                            await conn.sendMessage(from, {
                                sticker: webpBuffer
                            }, { quoted: mek });
                            
                        } catch (convertError) {
                            console.error("WebM conversion error:", convertError);
                            // Fallback: send as video
                            await conn.sendMessage(from, {
                                video: { url: fileUrl },
                                caption: `Sticker ${index + 1}/${totalStickers}`
                            }, { quoted: mek });
                        }
                    } else {
                        // Unknown format - send as document
                        await conn.sendMessage(from, {
                            document: { url: fileUrl },
                            fileName: `sticker_${index + 1}.${fileExtension}`,
                            mimetype: 'application/octet-stream'
                        }, { quoted: mek });
                    }

                    sentCount++;
                    
                    // Add small delay to avoid rate limiting
                    if (index < stickers.length - 1) {
                        await new Promise(resolve => setTimeout(resolve, 1000));
                    }
                    
                } catch (stickerError) {
                    console.error(`Error processing sticker ${index + 1}:`, stickerError);
                    failedCount++;
                    await reply(`❌ Failed to process sticker ${index + 1}`);
                }
            }

            // Final report
            await reply(`✅ *Sticker Pack Download Complete!*\n\n` +
                       `*Success:* ${sentCount}/${totalStickers}\n` +
                       `*Failed:* ${failedCount}\n\n` +
                       `🎉 Enjoy your stickers!`);

        } catch (apiError) {
            console.error("API Error:", apiError);
            await reply("❌ Error fetching sticker pack. Please check:\n" +
                       "• The sticker pack URL is correct\n" +
                       "• The sticker pack is public\n" +
                       "• Try again later");
        }

    } catch (error) {
        console.error("General error:", error);
        await reply("❌ An unexpected error occurred. Please try again later.");
    }
});
