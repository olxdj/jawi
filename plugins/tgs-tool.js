const { cmd } = require('../command');
const { Sticker, StickerTypes } = require("wa-sticker-formatter");
const Config = require('../config');
const fetch = require('node-fetch');
const Crypto = require("crypto");
const fs = require('fs-extra');
const path = require('path');
const { tmpdir } = require("os");
const { exec } = require('child_process');
const { promisify } = require('util');
const execAsync = promisify(exec);

cmd(
    {
        pattern: 'tg',
        alias: ['tpack', 'tgsticker', 'tgpack'],
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
                    return reply(`❌ *Sticker pack not found!*\n📛 *Pack:* ${packName}`);
                }

                const stickerSet = data.result;
                const totalStickers = stickerSet.stickers.length;
                
                if (totalStickers === 0) {
                    return reply('❌ *Empty sticker pack!* No stickers found.');
                }

                // Count sticker types
                const staticStickers = stickerSet.stickers.filter(s => !s.is_animated && !s.is_video);
                const animatedStickers = stickerSet.stickers.filter(s => s.is_animated);
                const videoStickers = stickerSet.stickers.filter(s => s.is_video);

                await reply(`📦 *Sticker Pack Found!*\n\n✨ *Title:* ${stickerSet.title}\n📊 *Total:* ${totalStickers}\n🎨 *Static:* ${staticStickers.length}\n🌀 *Animated:* ${animatedStickers.length}\n🎬 *Video:* ${videoStickers.length}\n⏳ *Downloading...*`);

                let successCount = 0;
                let failedStickers = [];

                for (let i = 0; i < totalStickers; i++) {
                    try {
                        const sticker = stickerSet.stickers[i];
                        const isAnimated = sticker.is_animated;
                        const isVideo = sticker.is_video;
                        
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
                        const fileExtension = path.extname(filePath).toLowerCase();
                        
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

                        // Handle different sticker types
                        if (isAnimated) {
                            // .tgs format (Lottie animations)
                            finalBuffer = await convertTgsToWebp(stickerBuffer, i);
                        } else if (isVideo) {
                            // .webm format (Video stickers)
                            finalBuffer = await convertWebmToWebp(stickerBuffer, i);
                        } else {
                            // .webp format (Static stickers) - use directly
                            finalBuffer = await convertStaticToWebp(stickerBuffer, i);
                        }

                        if (!finalBuffer) {
                            failedStickers.push(i + 1);
                            continue;
                        }

                        // Create WhatsApp sticker
                        const waSticker = new Sticker(finalBuffer, {
                            pack: "〆͎𓆪ː͢𝙐𝙍•𝙅𝘼𝙒𝘼𝘿↠ 💀🔥",
                            author: "",
                            type: StickerTypes.FULL,
                            categories: sticker.emoji ? [sticker.emoji] : ["✨"],
                            quality: (isAnimated || isVideo) ? 50 : 70,
                            background: 'transparent'
                        });

                        const stickerFinalBuffer = await waSticker.toBuffer();

                        // Send sticker
                        await conn.sendMessage(mek.chat, { 
                            sticker: stickerFinalBuffer 
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
                }
                
                resultMessage += `\n\n🎨 *Static:* ${staticStickers.length} | 🌀 *Animated:* ${animatedStickers.length} | 🎬 *Video:* ${videoStickers.length}\n✨ *Thank you for using!*`;

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

// Conversion functions for different sticker types

/**
 * Convert static .webp stickers (direct use)
 */
async function convertStaticToWebp(stickerBuffer, index) {
    try {
        // Static .webp stickers can be used directly
        return stickerBuffer;
    } catch (error) {
        console.error(`Static conversion failed for sticker ${index + 1}:`, error);
        return null;
    }
}

/**
 * Convert .webm video stickers to .webp
 */
async function convertWebmToWebp(webmBuffer, index) {
    try {
        const tempInput = path.join(tmpdir(), `webm_${Date.now()}_${index}.webm`);
        const tempOutput = path.join(tmpdir(), `webp_${Date.now()}_${index}.webp`);

        // Write webm buffer to temp file
        await fs.writeFile(tempInput, webmBuffer);

        // Convert webm to webp using ffmpeg
        const ffmpegCommand = `ffmpeg -i "${tempInput}" -vcodec libwebp -fs 1M -vf "scale=512:512:flags=lanczos:force_original_aspect_ratio=decrease:force_divisible_by=2,format=rgba,pad=512:512:(ow-iw)/2:(oh-ih)/2:color=0x00000000" -loop 0 -preset default -quality 80 -compression_level 6 -qmin 0 -qmax 50 -an -vsync 0 -r 15 "${tempOutput}"`;

        await execAsync(ffmpegCommand, { timeout: 30000 });

        // Read converted webp
        const webpBuffer = await fs.readFile(tempOutput);

        // Cleanup
        await fs.unlink(tempInput).catch(() => {});
        await fs.unlink(tempOutput).catch(() => {});

        return webpBuffer;

    } catch (error) {
        console.error(`WebM conversion failed for sticker ${index + 1}:`, error);
        
        // Fallback: Try simple conversion
        try {
            return await simpleWebmToWebp(webmBuffer, index);
        } catch (fallbackError) {
            return null;
        }
    }
}

/**
 * Simple WebM to WebP conversion (fallback)
 */
async function simpleWebmToWebp(webmBuffer, index) {
    const tempInput = path.join(tmpdir(), `simple_webm_${Date.now()}_${index}.webm`);
    const tempOutput = path.join(tmpdir(), `simple_webp_${Date.now()}_${index}.webp`);

    await fs.writeFile(tempInput, webmBuffer);

    const ffmpegCommand = `ffmpeg -i "${tempInput}" -vcodec libwebp -lossless 0 -compression_level 6 -q:v 70 -loop 0 -preset default -an -vsync 0 -r 10 "${tempOutput}"`;

    await execAsync(ffmpegCommand, { timeout: 20000 });

    const webpBuffer = await fs.readFile(tempOutput);

    await fs.unlink(tempInput).catch(() => {});
    await fs.unlink(tempOutput).catch(() => {});

    return webpBuffer;
}

/**
 * Convert .tgs animated stickers to .webp
 */
async function convertTgsToWebp(tgsBuffer, index) {
    try {
        const tempInput = path.join(tmpdir(), `tgs_${Date.now()}_${index}.tgs`);
        const tempOutput = path.join(tmpdir(), `tgs_webp_${Date.now()}_${index}.webp`);

        // Write tgs buffer to temp file
        await fs.writeFile(tempInput, tgsBuffer);

        // Method 1: Try using lottie-converter if available
        try {
            // Convert tgs to webp using lottie
            const lottieCommand = `ffmpeg -i "${tempInput}" -vcodec libwebp -vf "scale=512:512:flags=lanczos:force_original_aspect_ratio=decrease,format=rgba,pad=512:512:(ow-iw)/2:(oh-ih)/2:color=0x00000000" -loop 0 -preset default -quality 70 -compression_level 6 -an -vsync 0 -r 12 "${tempOutput}"`;
            
            await execAsync(lottieCommand, { timeout: 30000 });

            const webpBuffer = await fs.readFile(tempOutput);

            await fs.unlink(tempInput).catch(() => {});
            await fs.unlink(tempOutput).catch(() => {});

            return webpBuffer;

        } catch (lottieError) {
            console.log(`Lottie conversion failed, trying alternative for sticker ${index + 1}`);
            
            // Method 2: Alternative conversion
            return await alternativeTgsConversion(tgsBuffer, index);
        }

    } catch (error) {
        console.error(`TGS conversion failed for sticker ${index + 1}:`, error);
        return null;
    }
}

/**
 * Alternative TGS conversion method
 */
async function alternativeTgsConversion(tgsBuffer, index) {
    const tempInput = path.join(tmpdir(), `alt_tgs_${Date.now()}_${index}.tgs`);
    const tempOutput = path.join(tmpdir(), `alt_webp_${Date.now()}_${index}.webp`);

    await fs.writeFile(tempInput, tgsBuffer);

    // Simple conversion command
    const ffmpegCommand = `ffmpeg -i "${tempInput}" -vcodec libwebp -lossless 0 -compression_level 4 -q:v 60 -loop 0 -preset default -an -vsync 0 -r 8 "${tempOutput}"`;

    await execAsync(ffmpegCommand, { timeout: 25000 });

    const webpBuffer = await fs.readFile(tempOutput);

    await fs.unlink(tempInput).catch(() => {});
    await fs.unlink(tempOutput).catch(() => {});

    return webpBuffer;
}
