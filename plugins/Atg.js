const { cmd } = require('../command');
const { Sticker, StickerTypes } = require("wa-sticker-formatter");
const Config = require('../config');
const fetch = require('node-fetch');
const fs = require('fs-extra');
const path = require('path');
const { tmpdir } = require("os");
const Crypto = require("crypto");

cmd(
    {
        pattern: 'tgsticker',
        alias: ['tg', 'tpack', 'tgpack'],
        desc: 'Download Telegram sticker pack',
        category: 'sticker',
        use: '<telegram_sticker_url>',
        filename: __filename,
    },
    async (conn, mek, m, { quoted, args, q, reply, from }) => {
        try {
            if (!q) {
                return reply(`📦 *Telegram Sticker Download*\n\nUsage: .tgsticker <url>\nExample: .tgsticker https://t.me/addstickers/MyPackName\n\n✨ Download any public Telegram sticker pack!`);
            }

            // Validate URL format
            if (!q.includes('t.me/addstickers/')) {
                return reply('❌ *Invalid URL!*\nPlease use format: https://t.me/addstickers/PackName');
            }

            // Extract pack name from URL
            const packName = q.replace("https://t.me/addstickers/", "").trim();
            if (!packName) {
                return reply('❌ *Invalid pack name!*\nPlease check the URL format.');
            }

            // Telegram bot token (you can replace this with your own)
            const botToken = '7801479976:AAGuPL0a7kXXBYz6XUSR_ll2SR5V_W6Vl4';

            await reply('🔍 *Fetching sticker pack info...*');

            // Fetch sticker pack information
            const stickerResponse = await fetch(
                `https://api.telegram.org/bot${botToken}/getStickerSet?name=${encodeURIComponent(packName)}`
            );

            if (!stickerResponse.ok) {
                return reply('❌ *Sticker pack not found!*\n\nPossible reasons:\n• Pack doesn\'t exist\n• Pack is private\n• Invalid pack name\n• Bot token issue');
            }

            const stickerData = await stickerResponse.json();
            
            if (!stickerData.ok || !stickerData.result) {
                return reply('❌ *Failed to fetch sticker pack!*\nThe pack might be private or unavailable.');
            }

            const stickerSet = stickerData.result;
            const totalStickers = stickerSet.stickers.length;

            if (totalStickers === 0) {
                return reply('❌ *Empty sticker pack!*\nThis pack contains no stickers.');
            }

            // Send pack info
            await reply(`📦 *Sticker Pack Found!*\n\n✨ *Title:* ${stickerSet.title}\n📊 *Stickers:* ${totalStickers}\n⏳ *Downloading...* Please wait!`);

            let successCount = 0;
            let failedCount = 0;

            // Process each sticker
            for (let i = 0; i < totalStickers; i++) {
                try {
                    const sticker = stickerSet.stickers[i];
                    
                    // Get file information
                    const fileResponse = await fetch(
                        `https://api.telegram.org/bot${botToken}/getFile?file_id=${sticker.file_id}`
                    );
                    
                    if (!fileResponse.ok) continue;
                    
                    const fileData = await fileResponse.json();
                    if (!fileData.ok || !fileData.result.file_path) continue;

                    // Download sticker file
                    const fileUrl = `https://api.telegram.org/file/bot${botToken}/${fileData.result.file_path}`;
                    const stickerResponse = await fetch(fileUrl);
                    
                    if (!stickerResponse.ok) {
                        failedCount++;
                        continue;
                    }

                    const stickerBuffer = await stickerResponse.buffer();

                    // Create WhatsApp sticker using your existing formatter
                    const waSticker = new Sticker(stickerBuffer, {
                        pack: stickerSet.title || Config.STICKER_NAME || "Telegram Pack",
                        author: "via Telegram",
                        type: StickerTypes.FULL,
                        categories: sticker.emoji ? [sticker.emoji] : ["❤️"],
                        id: Crypto.randomBytes(4).toString('hex'),
                        quality: 70,
                        background: 'transparent'
                    });

                    const finalBuffer = await waSticker.toBuffer();

                    // Send sticker
                    await conn.sendMessage(mek.chat, { 
                        sticker: finalBuffer 
                    }, { quoted: mek });

                    successCount++;

                    // Send progress every 10 stickers
                    if ((i + 1) % 10 === 0) {
                        await reply(`📥 *Progress:* ${i + 1}/${totalStickers} stickers processed...`);
                    }

                    // Delay to avoid rate limiting
                    await new Promise(resolve => setTimeout(resolve, 1500));

                } catch (error) {
                    console.error(`Error processing sticker ${i + 1}:`, error);
                    failedCount++;
                    continue;
                }
            }

            // Final result message
            const resultMessage = `✅ *Download Complete!*\n\n📦 *Pack:* ${stickerSet.title}\n✅ *Success:* ${successCount} stickers\n❌ *Failed:* ${failedCount} stickers\n📊 *Total:* ${totalStickers} stickers\n\n✨ Enjoy your new stickers!`;

            await reply(resultMessage);

        } catch (error) {
            console.error('Telegram sticker command error:', error);
            
            let errorMessage = '❌ *Failed to download stickers!*';
            
            if (error.message.includes('fetch') || error.message.includes('network')) {
                errorMessage += '\n🌐 *Network error!* Please check your internet connection.';
            } else if (error.message.includes('token')) {
                errorMessage += '\n🔑 *Bot token issue!* The service might be temporarily unavailable.';
            } else {
                errorMessage += '\n💡 *Possible solutions:*\n• Check the URL format\n• Ensure pack is public\n• Try again later';
            }
            
            await reply(errorMessage);
        }
    }
);
