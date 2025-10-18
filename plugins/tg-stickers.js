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
        if (!q.includes('t.me/addstickers/') && !q.includes('telegram.me/addstickers/')) {
            return await reply("❌ Please provide a valid Telegram sticker pack URL!\nIt should look like: https://t.me/addstickers/packname");
        }

        // ⏳ React - processing
        await conn.sendMessage(from, { react: { text: '⏳', key: mek.key } });
        
        await reply("📦 Downloading sticker pack... Please wait!");

        // Get pack name from URL
        const packName = q.replace("https://t.me/addstickers/", "").replace("https://telegram.me/addstickers/", "");

        // Using working bot token
        const botToken = '7801479976:AAGuPL0a7kXXBYz6XUSR_ll2SR5V_W6oHl4';
        
        try {
            // Fetch sticker pack info
            const response = await axios.get(
                `https://api.telegram.org/bot${botToken}/getStickerSet?name=${encodeURIComponent(packName)}`,
                { 
                    timeout: 30000,
                    headers: {
                        "Accept": "application/json",
                        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
                    }
                }
            );

            if (!response.data.ok) {
                throw new Error(`API error! ${response.data.description || 'Unknown error'}`);
            }

            const stickerSet = response.data.result;
            const stickers = stickerSet.stickers;

            if (!stickers || stickers.length === 0) {
                return await reply("❌ No stickers found in this pack!");
            }

            // Send sticker pack info
            await reply(`📦 *Sticker Pack Info*\n\n` +
                       `*Name:* ${stickerSet.name || 'N/A'}\n` +
                       `*Title:* ${stickerSet.title || 'N/A'}\n` +
                       `*Type:* ${stickerSet.sticker_type || 'regular'}\n` +
                       `*Stickers:* ${stickers.length}\n\n` +
                       `⏳ Processing stickers...`);

            let sentCount = 0;
            let failedCount = 0;
            const totalStickers = stickers.length;
            let pack = "𝐊𝐇𝐀𝐍-𝐗 ⿻⃮͛ 🏴‍☠️💀";

            // Send each sticker
            for (const [index, sticker] of stickers.entries()) {
                try {
                    const fileId = sticker.thumb ? sticker.thumb.file_id : sticker.file_id;
                    
                    // Get file info
                    const fileResponse = await axios.get(
                        `https://api.telegram.org/bot${botToken}/getFile?file_id=${fileId}`,
                        {
                            timeout: 30000,
                            headers: {
                                "Accept": "application/json",
                                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
                            }
                        }
                    );

                    if (!fileResponse.data.ok) {
                        throw new Error('Failed to get file info');
                    }

                    const fileData = fileResponse.data.result;
                    const fileUrl = `https://api.telegram.org/file/bot${botToken}/${fileData.file_path}`;
                    
                    const fileExtension = fileData.file_path.split('.').pop().toLowerCase();
                    
                    // Detect sticker type and process accordingly
                    if (fileExtension === 'webp') {
                        // Static WebP sticker - send directly
                        await conn.sendMessage(from, {
                            sticker: { url: fileUrl }
                        }, { quoted: mek });
                        
                    } else if (fileExtension === 'tgs' || fileExtension === 'webm') {
                        // Animated sticker - TGS or WEBM
                        // Download, convert to WebP and send as animated sticker
                        try {
                            const videoBuffer = await getBuffer(fileUrl);
                            
                            // Convert video to WebP sticker
                            const webpBuffer = await videoToWebp(videoBuffer);
                            
                            // Send as animated sticker
                            await conn.sendMessage(from, {
                                sticker: webpBuffer
                            }, { quoted: mek });
                            
                        } catch (convertError) {
                            console.error('Conversion error:', convertError);
                            // Fallback: send as document
                            await conn.sendMessage(from, {
                                document: await getBuffer(fileUrl),
                                fileName: `sticker_${index + 1}.${fileExtension}`,
                                mimetype: fileExtension === 'tgs' ? 'application/x-tgsticker' : 'video/webm'
                            }, { quoted: mek });
                        }
                    } else {
                        // Unknown format - send as document
                        await conn.sendMessage(from, {
                            document: await getBuffer(fileUrl),
                            fileName: `sticker_${index + 1}.${fileExtension}`,
                            mimetype: 'application/octet-stream'
                        }, { quoted: mek });
                    }
                    
                    sentCount++;
                    
                    // Add small delay to avoid rate limiting
                    if (index < totalStickers - 1) {
                        await new Promise(resolve => setTimeout(resolve, 1000));
                    }
                    
                } catch (stickerError) {
                    console.error(`Error processing sticker ${index + 1}:`, stickerError);
                    failedCount++;
                    
                    // Continue with next sticker even if one fails
                    continue;
                }
            }

            // Send completion message
            await reply(`✅ *Sticker Pack Download Complete!*\n\n` +
                       `*Success:* ${sentCount}/${totalStickers}\n` +
                       `*Failed:* ${failedCount}\n\n` +
                       `🎉 Enjoy your stickers!`);

        } catch (apiError) {
            console.error('Telegram API error:', apiError);
            
            if (apiError.response?.data?.description?.includes('not found')) {
                return await reply("❌ Sticker pack not found! Please check the URL and make sure the pack exists.");
            } else if (apiError.response?.data?.description?.includes('token')) {
                return await reply("❌ Bot token error! Please check the bot configuration.");
            } else {
                return await reply(`❌ Telegram API error: ${apiError.message || 'Unknown error'}`);
            }
        }

    } catch (error) {
        console.error('General error:', error);
        await reply(`❌ Error: ${error.message || 'Something went wrong!'}`);
    }
});
