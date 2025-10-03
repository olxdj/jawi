const { cmd } = require('../command');
const { Sticker, StickerTypes } = require("wa-sticker-formatter");
const Config = require('../config');
const fetch = require('node-fetch');
const Crypto = require("crypto");
const { videoToWebp } = require('../lib/video-utils');
const fs = require('fs-extra');
const path = require('path');
const { tmpdir } = require("os");

cmd(
    {
        pattern: 'tg',
        alias: ['tgs', 'tgsticker', 'tgpack'],
        desc: 'Download Telegram sticker pack',
        category: 'sticker',
        use: '<telegram_sticker_url>',
        filename: __filename,
    },
    async (conn, mek, m, { quoted, args, q, reply, from, isCreator }) => {
        try {
            // Only Bot Owner Can Use
            if (!isCreator) {
                return reply('❌ *Owner Only Command!*\n\nOnly Bot Owner Can Use This Command.');
            }

            if (!q) {
                return reply(`📦 *Telegram Sticker Download*\n\nUsage: .tg <url>\nExample: .tg https://t.me/addstickers/blueemojii`);
            }

            // Extract pack name from URL
            let packName = q.replace("https://t.me/addstickers/", "").trim();
            if (!packName) {
                return reply('❌ *Invalid pack name!* Please check the URL.');
            }

            packName = packName.split('?')[0];
            await reply(`🔍 *Searching for:* ${packName}\n⏳ *Please wait...*`);

            const botToken = '7801479976:AAGuPL0a7kXXBYz6XUSR_ll2SR5V_W6oHl4';

            try {
                const response = await fetch(
                    `https://api.telegram.org/bot${botToken}/getStickerSet?name=${encodeURIComponent(packName)}`,
                    { timeout: 30000 }
                );

                if (!response.ok) {
                    return reply(`❌ *API Error!* HTTP ${response.status}`);
                }

                const data = await response.json();
                
                if (!data.ok || !data.result) {
                    return reply(`❌ *Sticker pack not found!*\n📛 *Pack:* ${packName}\n🔍 *Error:* ${data.description || 'Unknown error'}`);
                }

                const stickerSet = data.result;
                const totalStickers = stickerSet.stickers.length;
                
                if (totalStickers === 0) {
                    return reply('❌ *Empty sticker pack!* No stickers found.');
                }

                // Count sticker types
                const animatedCount = stickerSet.stickers.filter(s => s.is_animated || s.is_video).length;
                const staticCount = totalStickers - animatedCount;

                await reply(`📦 *Sticker Pack Found!*\n\n✨ *Title:* ${stickerSet.title}\n📊 *Total:* ${totalStickers}\n🎨 *Static:* ${staticCount}\n🎬 *Animated:* ${animatedCount}\n⏳ *Downloading...*`);

                let successCount = 0;
                let failedStickers = [];

                for (let i = 0; i < totalStickers; i++) {
                    try {
                        const sticker = stickerSet.stickers[i];
                        const isAnimated = sticker.is_animated || sticker.is_video;
                        
                        // Get file path
                        const fileResponse = await fetch(
                            `https://api.telegram.org/bot${botToken}/getFile?file_id=${sticker.file_id}`,
                            { timeout: 15000 }
                        );
                        
                        if (!fileResponse.ok) {
                            failedStickers.push(i + 1);
                            continue;
                        }
                        
                        const fileData = await fileResponse.json();
                        if (!fileData.ok || !fileData.result.file_path) {
                            failedStickers.push(i + 1);
                            continue;
                        }

                        const filePath = fileData.result.file_path;
                        const stickerResponse = await fetch(
                            `https://api.telegram.org/file/bot${botToken}/${filePath}`,
                            { timeout: 20000 }
                        );
                        
                        if (!stickerResponse.ok) {
                            failedStickers.push(i + 1);
                            continue;
                        }

                        const stickerBuffer = await stickerResponse.buffer();
                        let finalBuffer;

                        if (isAnimated) {
                            // For animated stickers - use direct WebP or convert
                            try {
                                // Check if it's already WebP format
                                if (filePath.endsWith('.webp')) {
                                    // Use directly if it's WebP
                                    const waSticker = new Sticker(stickerBuffer, {
                                        pack: "〆͎𓆪ː͢𝙐𝙍•𝙅𝘼𝙒𝘼𝘿↠ 💀🔥",
                                        author: "",
                                        type: StickerTypes.FULL,
                                        categories: sticker.emoji ? [sticker.emoji] : ["🎬"],
                                        quality: 50,
                                        background: 'transparent'
                                    });
                                    finalBuffer = await waSticker.toBuffer();
                                } else {
                                    // Convert using videoToWebp for other formats
                                    const webpBuffer = await videoToWebp(stickerBuffer);
                                    const waSticker = new Sticker(webpBuffer, {
                                        pack: "〆͎𓆪ː͢𝙐𝙍•𝙅𝘼𝙒𝘼𝘿↠ 💀🔥",
                                        author: "",
                                        type: StickerTypes.FULL,
                                        categories: sticker.emoji ? [sticker.emoji] : ["🎬"],
                                        quality: 50,
                                        background: 'transparent'
                                    });
                                    finalBuffer = await waSticker.toBuffer();
                                }
                            } catch (convertError) {
                                console.error(`Animated conversion failed for sticker ${i + 1}:`, convertError);
                                failedStickers.push(i + 1);
                                continue;
                            }
                        } else {
                            // Static stickers
                            const waSticker = new Sticker(stickerBuffer, {
                                pack: "〆͎𓆪ː͢𝙐𝙍•𝙅𝘼𝙒𝘼𝘿↠ 💀🔥",
                                author: "",
                                type: StickerTypes.FULL,
                                categories: sticker.emoji ? [sticker.emoji] : ["❤️"],
                                quality: 70,
                                background: 'transparent'
                            });
                            finalBuffer = await waSticker.toBuffer();
                        }

                        // Send sticker
                        await conn.sendMessage(mek.chat, { 
                            sticker: finalBuffer 
                        }, { quoted: mek });

                        successCount++;

                        // Progress update
                        if ((i + 1) % 5 === 0) {
                            await reply(`📥 *Progress:* ${i + 1}/${totalStickers}\n✅ *Success:* ${successCount}`);
                        }

                        // Delay
                        await new Promise(resolve => setTimeout(resolve, 2000));

                    } catch (error) {
                        console.error(`Sticker ${i + 1} error:`, error);
                        failedStickers.push(i + 1);
                        continue;
                    }
                }

                // Final result
                let resultMessage = `✅ *Download Complete!*\n\n📦 *Pack:* ${stickerSet.title}\n✅ *Success:* ${successCount}/${totalStickers}`;
                
                if (failedStickers.length > 0) {
                    resultMessage += `\n❌ *Failed:* ${failedStickers.length} stickers`;
                    if (failedStickers.length <= 10) {
                        resultMessage += `\n📝 Failed numbers: ${failedStickers.join(', ')}`;
                    }
                }
                
                resultMessage += `\n✨ *Thank you for using!*`;

                await reply(resultMessage);

            } catch (error) {
                console.error('Telegram API error:', error);
                await reply(`❌ *API Error!* ${error.message}`);
            }

        } catch (error) {
            console.error('Telegram command error:', error);
            await reply('❌ *Unexpected error!* Please try again.');
        }
    }
);
