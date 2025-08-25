const config = require('../config');
const { cmd, commands } = require('../command');
const { runtime } = require('../lib/functions');

const commonContextInfo = (sender) => ({
    mentionedJid: [sender],
    forwardingScore: 999,
    isForwarded: true,
    forwardedNewsletterMessageInfo: {
        newsletterJid: '120363354023106228@newsletter',
        newsletterName: config.BOT_NAME,
        serverMessageId: 143
    }
});

cmd({
    pattern: "menux",
    alias: ["help", "start"],
    desc: "Show all bot commands in interactive menu",
    category: "menu",
    react: "⚡",
    filename: __filename
},
async (conn, mek, m, { from, sender, pushname, reply }) => {
    try {
        let totalCommands = Object.keys(commands).length;
        
        // Main menu with interactive buttons
        const mainMenu = {
            text: `*╭────⬡ ${config.BOT_NAME} ⬡────*
*├▢ 🔸 Owner:* ${config.OWNER_NAME}
*├▢ 🔹 Prefix:* ${config.PREFIX}
*├▢ 🔸 Version:* 5.0.0 Beta
*├▢ 🔹 Platform:* Heroku
*├▢ 🔸 Total Commands:* ${totalCommands}
*├▢ 🔹 Runtime:* ${runtime(process.uptime())}
*╰────────────────*

*Select a category from the buttons below:*`,
            footer: config.BOT_NAME,
            buttons: [
                {
                    buttonId: 'ping-btn',
                    buttonText: { displayText: '🏓 Ping' },
                    type: 1
                },
                {
                    buttonId: 'repo-btn',
                    buttonText: { displayText: '📦 Repo' },
                    type: 1
                },
                {
                    buttonId: 'main-menu-btn',
                    buttonText: { displayText: '📜 Main Menu' },
                    type: 1
                },
                {
                    buttonId: 'category-select-btn',
                    buttonText: { displayText: '📂 All Categories' },
                    type: 4,
                    nativeFlowInfo: {
                        name: 'single_select',
                        paramsJson: JSON.stringify({
                            title: 'Select Category',
                            sections: [
                                {
                                    title: 'Bot Categories',
                                    highlight_label: '📁',
                                    rows: [
                                        {
                                            header: 'QURAN',
                                            title: '📖 Quran Menu',
                                            description: 'Islamic commands & Quran',
                                            id: 'quran-menu'
                                        },
                                        {
                                            header: 'SETTINGS',
                                            title: '⚙️ Setting Menu',
                                            description: 'Bot configuration settings',
                                            id: 'settings-menu'
                                        },
                                        {
                                            header: 'AI',
                                            title: '🤖 AI Menu',
                                            description: 'Artificial intelligence commands',
                                            id: 'ai-menu'
                                        },
                                        {
                                            header: 'ANIME',
                                            title: '🎭 Anime Menu',
                                            description: 'Anime-related commands',
                                            id: 'anime-menu'
                                        },
                                        {
                                            header: 'REACTIONS',
                                            title: '😹 Reactions',
                                            description: 'Fun reaction commands',
                                            id: 'reactions-menu'
                                        },
                                        {
                                            header: 'CONVERT',
                                            title: '🔁 Convert Menu',
                                            description: 'File conversion commands',
                                            id: 'convert-menu'
                                        },
                                        {
                                            header: 'FUN',
                                            title: '🎉 Fun Menu',
                                            description: 'Entertainment commands',
                                            id: 'fun-menu'
                                        },
                                        {
                                            header: 'DOWNLOAD',
                                            title: '⬇️ Download Menu',
                                            description: 'Media download commands',
                                            id: 'download-menu'
                                        },
                                        {
                                            header: 'GROUP',
                                            title: '👥 Group Menu',
                                            description: 'Group management commands',
                                            id: 'group-menu'
                                        },
                                        {
                                            header: 'MAIN',
                                            title: '🏠 Main Menu',
                                            description: 'Basic bot commands',
                                            id: 'main-menu'
                                        },
                                        {
                                            header: 'OWNER',
                                            title: '👑 Owner Menu',
                                            description: 'Bot owner commands',
                                            id: 'owner-menu'
                                        },
                                        {
                                            header: 'OTHER',
                                            title: '🧩 Other Menu',
                                            description: 'Miscellaneous commands',
                                            id: 'other-menu'
                                        },
                                        {
                                            header: 'LOGO',
                                            title: '🖌️ Logo Menu',
                                            description: 'Logo maker commands',
                                            id: 'logo-menu'
                                        },
                                        {
                                            header: 'TOOLS',
                                            title: '🛠️ Tools Menu',
                                            description: 'Utility tools commands',
                                            id: 'tools-menu'
                                        }
                                    ]
                                }
                            ]
                        })
                    }
                }
            ],
            headerType: 1,
            viewOnce: true
        };

        const sentMsg = await conn.sendMessage(from, mainMenu, { quoted: mek });
        const messageID = sentMsg.key.id;

        // Button click handler
        const buttonHandler = async (msgData) => {
            const receivedMsg = msgData.messages[0];
            if (!receivedMsg.message) return;

            const senderID = receivedMsg.key.remoteJid;
            const isReplyToBot = receivedMsg.message.buttonsResponseMessage?.contextInfo?.stanzaId === messageID;

            if (isReplyToBot && senderID === from) {
                const buttonId = receivedMsg.message.buttonsResponseMessage.selectedButtonId;
                
                await conn.sendMessage(from, { react: { text: '⬇️', key: receivedMsg.key } });

                switch (buttonId) {
                    case 'ping-btn':
                        await conn.sendMessage(from, {
                            text: `🏓 *PONG!*\nSpeed: ${Date.now() - receivedMsg.messageTimestamp * 1000}ms\nRuntime: ${runtime(process.uptime())}`,
                            contextInfo: commonContextInfo(sender)
                        }, { quoted: receivedMsg });
                        break;

                    case 'repo-btn':
                        await conn.sendMessage(from, {
                            text: `*📦 BOT REPOSITORY*\n\n🔗 *GitHub:* ${config.REPO_URL || 'Not set'}\n👑 *Owner:* ${config.OWNER_NAME}\n⚡ *Version:* 5.0.0 Beta\n\n_Contact owner for source code_`,
                            contextInfo: commonContextInfo(sender)
                        }, { quoted: receivedMsg });
                        break;

                    case 'main-menu-btn':
                        // Show full menu list
                        let fullMenuText = `*╭────⬡ ${config.BOT_NAME} FULL MENU ⬡────*\n`;
                        fullMenuText += `*├▢ Total Commands:* ${totalCommands}\n`;
                        fullMenuText += `*├▢ Runtime:* ${runtime(process.uptime())}\n`;
                        fullMenuText += `*╰────────────────*\n\n`;
                        
                        // Add all categories with commands
                        const categories = {};
                        Object.values(commands).forEach(cmd => {
                            if (!cmd.dontAddCommandList && cmd.pattern) {
                                const category = cmd.category || 'misc';
                                if (!categories[category]) categories[category] = [];
                                categories[category].push(cmd.pattern);
                            }
                        });

                        for (const [category, cmds] of Object.entries(categories)) {
                            fullMenuText += `*╭───⬡ ${category.toUpperCase()} ⬡───*\n`;
                            cmds.forEach(cmd => {
                                fullMenuText += `*├▢ • ${config.PREFIX}${cmd}*\n`;
                            });
                            fullMenuText += `*╰────────────────*\n\n`;
                        }

                        fullMenuText += `> ${config.DESCRIPTION}`;

                        await conn.sendMessage(from, {
                            image: { url: config.MENU_IMAGE_URL },
                            caption: fullMenuText,
                            contextInfo: commonContextInfo(sender)
                        }, { quoted: receivedMsg });
                        break;

                    default:
                        // Handle category selections from dropdown
                        if (receivedMsg.message?.interactiveResponseMessage?.nativeFlowResponseMessage) {
                            const response = JSON.parse(receivedMsg.message.interactiveResponseMessage.nativeFlowResponseMessage.paramsJson);
                            const selectedId = response.id;

                            let menuContent = '';
                            let menuTitle = '';

                            switch (selectedId) {
                                case 'quran-menu':
                                    menuTitle = '📖 QURAN MENU';
                                    menuContent = `*╭────⬡ ${menuTitle} ⬡────*
*├▢ • surah <number>*
*├▢ • ayat <surah:verse>*
*├▢ • tafsir <surah>*
*├▢ • listreciters*
*├▢ • play <reciter> <surah>*
*├▢ • searchquran <query>*
*├▢ • quranpdf <surah>*
*├▢ • prayer <city>*
*├▢ • setlocation <city>*
*├▢ • mylocation*
*├▢ • prayerfull <city>*
*├▢ • prayernext <city>*
*├▢ • hijridate*
*╰────────────────*`;
                                    break;

                                case 'settings-menu':
                                    menuTitle = '⚙️ SETTING MENU';
                                    menuContent = `*╭────⬡ ${menuTitle} ⬡────*
*├▢ • prefix new prefix*
*├▢ • botname new name*
*├▢ • ownername new name*
*├▢ • botimage reply to image*
*├▢ • mode public/private*
*├▢ • autoreact on/off*
*├▢ • autoreply on/off*
*├▢ • autosticker on/off*
*├▢ • autotyping on/off*
*├▢ • autostatusview on/off*
*├▢ • autostatusreact on/off*
*├▢ • autostatusreply on/off*
*├▢ • autorecoding on/off*
*├▢ • alwaysonline on/off*
*├▢ • welcome on/off*
*├▢ • goodbye on/off*
*├▢ • antilink on/off*
*├▢ • antilinkkick on/off*
*├▢ • deletelink on/off*
*├▢ • antibad on/off*
*├▢ • antibot on/off*
*├▢ • read-message on/off*
*├▢ • mention-reply on/off*
*├▢ • admin-action on/off*
*├▢ • creact on/off*
*├▢ • cemojis ❤️,🧡,💛*
*╰────────────────*`;
                                    break;

                                case 'ai-menu':
                                    menuTitle = '🤖 AI MENU';
                                    menuContent = `*╭────⬡ ${menuTitle} ⬡────*
*├▢ • ai*
*├▢ • gpt3*
*├▢ • gpt2*
*├▢ • gptmini*
*├▢ • gpt*
*├▢ • meta*
*├▢ • blackbox*
*├▢ • luma*
*├▢ • dj*
*├▢ • khan*
*├▢ • jawad*
*├▢ • gpt4*
*├▢ • bing*
*├▢ • imagine*
*├▢ • imagine2*
*├▢ • copilot*
*╰────────────────*`;
                                    break;

                                case 'anime-menu':
                                    menuTitle = '🎭 ANIME MENU';
                                    menuContent = `*╭────⬡ ${menuTitle} ⬡────*
*├▢ • fack*
*├▢ • truth*
*├▢ • dare*
*├▢ • dog*
*├▢ • awoo*
*├▢ • garl*
*├▢ • waifu*
*├▢ • neko*
*├▢ • megnumin*
*├▢ • neko*
*├▢ • maid*
*├▢ • loli*
*├▢ • animegirl*
*├▢ • animegirl1*
*├▢ • animegirl2*
*├▢ • animegirl3*
*├▢ • animegirl4*
*├▢ • animegirl5*
*├▢ • anime1*
*├▢ • anime2*
*├▢ • anime3*
*├▢ • anime4*
*├▢ • anime5*
*├▢ • animenews*
*├▢ • foxgirl*
*├▢ • naruto*
*╰────────────────*`;
                                    break;

                                case 'reactions-menu':
                                    menuTitle = '😹 REACTIONS MENU';
                                    menuContent = `*╭────⬡ ${menuTitle} ⬡────*
*├▢ • bully @tag*
*├▢ • cuddle @tag*
*├▢ • cry @tag*
*├▢ • hug @tag*
*├▢ • awoo @tag*
*├▢ • kiss @tag*
*├▢ • lick @tag*
*├▢ • pat @tag*
*├▢ • smug @tag*
*├▢ • bonk @tag*
*├▢ • yeet @tag*
*├▢ • blush @tag*
*├▢ • smile @tag*
*├▢ • wave @tag*
*├▢ • highfive @tag*
*├▢ • handhold @tag*
*├▢ • nom @tag*
*├▢ • bite @tag*
*├▢ • glomp @tag*
*├▢ • slap @tag*
*├▢ • kill @tag*
*├▢ • happy @tag*
*├▢ • wink @tag*
*├▢ • poke @tag*
*├▢ • dance @tag*
*├▢ • cringe @tag*
*╰────────────────*`;
                                    break;

                                case 'convert-menu':
                                    menuTitle = '🔁 CONVERT MENU';
                                    menuContent = `*╭────⬡ ${menuTitle} ⬡────*
*├▢ • sticker*
*├▢ • sticker2*
*├▢ • emojimix*
*├▢ • fancy*
*├▢ • take*
*├▢ • tomp3*
*├▢ • tts*
*├▢ • trt*
*├▢ • base64*
*├▢ • unbase64*
*├▢ • binary*
*├▢ • dbinary*
*├▢ • tinyurl*
*├▢ • urldecode*
*├▢ • urlencode*
*├▢ • url*
*├▢ • repeat*
*├▢ • ask*
*├▢ • readmore*
*╰────────────────*`;
                                    break;

                                case 'fun-menu':
                                    menuTitle = '🎉 FUN MENU';
                                    menuContent = `*╭────⬡ ${menuTitle} ⬡────*
*├▢ • shapar*
*├▢ • rate*
*├▢ • insult*
*├▢ • hack*
*├▢ • ship*
*├▢ • character*
*├▢ • pickup*
*├▢ • joke*
*├▢ • hrt*
*├▢ • hpy*
*├▢ • syd*
*├▢ • anger*
*├▢ • shy*
*├▢ • kiss*
*├▢ • mon*
*├▢ • cunfuzed*
*├▢ • setpp*
*├▢ • hand*
*├▢ • nikal*
*├▢ • hold*
*├▢ • hug*
*├▢ • nikal*
*├▢ • hifi*
*├▢ • poke*
*╰────────────────*`;
                                    break;

                                case 'download-menu':
                                    menuTitle = '⬇️ DOWNLOAD MENU';
                                    menuContent = `*╭────⬡ ${menuTitle} ⬡────*
*├▢ • facebook*
*├▢ • mediafire*
*├▢ • tiktok*
*├▢ • twitter*
*├▢ • insta*
*├▢ • apk*
*├▢ • img*
*├▢ • tt2*
*├▢ • pins*
*├▢ • apk2*
*├▢ • fb2*
*├▢ • pinterest*
*├▢ • spotify*
*├▢ • play*
*├▢ • play2*
*├▢ • audio*
*├▢ • video*
*├▢ • video2*
*├▢ • ytmp3*
*├▢ • ytmp4*
*├▢ • song*
*├▢ • darama*
*├▢ • gdrive*
*├▢ • ssweb*
*├▢ • tiks*
*╰────────────────*`;
                                    break;

                                case 'group-menu':
                                    menuTitle = '👥 GROUP MENU';
                                    menuContent = `*╭────⬡ ${menuTitle} ⬡────*
*├▢ • grouplink*
*├▢ • kickall*
*├▢ • kickall2*
*├▢ • kickall3*
*├▢ • add*
*├▢ • remove*
*├▢ • kick*
*├▢ • promote*
*├▢ • demote*
*├▢ • dismiss*
*├▢ • revoke*
*├▢ • setgoodbye*
*├▢ • setwelcome*
*├▢ • delete*
*├▢ • getpic*
*├▢ • ginfo*
*├▢ • disappear on*
*├▢ • disappear off*
*├▢ • disappear 7D,24H*
*├▢ • allreq*
*├▢ • updategname*
*├▢ • updategdesc*
*├▢ • joinrequests*
*├▢ • senddm*
*├▢ • nikal*
*├▢ • mute*
*├▢ • unmute*
*├▢ • lockgc*
*├▢ • unlockgc*
*├▢ • invite*
*├▢ • tag*
*├▢ • hidetag*
*├▢ • tagall*
*├▢ • tagadmins*
*╰────────────────*`;
                                    break;

                                case 'main-menu':
                                    menuTitle = '🏠 MAIN MENU';
                                    menuContent = `*╭────⬡ ${menuTitle} ⬡────*
*├▢ • ping*
*├▢ • ping2*
*├▢ • speed*
*├▢ • live*
*├▢ • alive*
*├▢ • runtime*
*├▢ • uptime*
*├▢ • repo*
*├▢ • owner*
*├▢ • menu*
*├▢ • menu2*
*├▢ • restart*
*╰────────────────*`;
                                    break;

                                case 'owner-menu':
                                    menuTitle = '👑 OWNER MENU';
                                    menuContent = `*╭────⬡ ${menuTitle} ⬡────*
*├▢ • owner*
*├▢ • menu*
*├▢ • menu2*
*├▢ • vv*
*├▢ • listcmd*
*├▢ • allmenu*
*├▢ • repo*
*├▢ • block*
*├▢ • unblock*
*├▢ • fullpp*
*├▢ • setpp*
*├▢ • restart*
*├▢ • shutdown*
*├▢ • updatecmd*
*├▢ • alive*
*├▢ • ping*
*├▢ • gjid*
*├▢ • jid*
*╰────────────────*`;
                                    break;

                                case 'other-menu':
                                    menuTitle = '🧩 OTHER MENU';
                                    menuContent = `*╭────⬡ ${menuTitle} ⬡────*
*├▢ • timenow*
*├▢ • date*
*├▢ • count*
*├▢ • calculate*
*├▢ • countx*
*├▢ • flip*
*├▢ • coinflip*
*├▢ • rcolor*
*├▢ • roll*
*├▢ • fact*
*├▢ • cpp*
*├▢ • rw*
*├▢ • pair*
*├▢ • pair2*
*├▢ • pair3*
*├▢ • fancy*
*├▢ • logo*
*├▢ • define*
*├▢ • news*
*├▢ • movie*
*├▢ • weather*
*├▢ • srepo*
*├▢ • insult*
*├▢ • save*
*├▢ • wikipedia*
*├▢ • gpass*
*├▢ • githubstalk*
*├▢ • yts*
*├▢ • ytv*
*╰────────────────*`;
                                    break;

                                case 'logo-menu':
                                    menuTitle = '🖌️ LOGO MENU';
                                    menuContent = `*╭────⬡ ${menuTitle} ⬡────*
*├▢ • neonlight*
*├▢ • blackpink*
*├▢ • dragonball*
*├▢ • 3dcomic*
*├▢ • america*
*├▢ • naruto*
*├▢ • sadgirl*
*├▢ • clouds*
*├▢ • futuristic*
*├▢ • 3dpaper*
*├▢ • eraser*
*├▢ • sunset*
*├▢ • leaf*
*├▢ • galaxy*
*├▢ • sans*
*├▢ • boom*
*├▢ • hacker*
*├▢ • devilwings*
*├▢ • nigeria*
*├▢ • bulb*
*├▢ • angelwings*
*├▢ • zodiac*
*├▢ • luxury*
*├▢ • paint*
*├▢ • frozen*
*├▢ • castle*
*├▢ • tatoo*
*├▢ • valorant*
*├▢ • bear*
*├▢ • typography*
*├▢ • birthday*
*╰────────────────*`;
                                    break;

                                case 'tools-menu':
                                    menuTitle = '🛠️ TOOLS MENU';
                                    menuContent = `*╭────⬡ ${menuTitle} ⬡────*
*├▢ • audio effects*
*├▢ • bass*
*├▢ • slow*
*├▢ • fast*
*├▢ • reverse*
*├▢ • baby*
*├▢ • demon*
*├▢ • earrape*
*├▢ • nightcore*
*├▢ • robot*
*├▢ • chipmunk*
*├▢ • radio*
*├▢ • blown*
*├▢ • tupai*
*├▢ • fat*
*├▢ • smooth*
*├▢ • deep*
*╰────────────────*`;
                                    break;

                                default:
                                    menuContent = "Invalid selection. Please try again.";
                            }

                            if (menuContent) {
                                await conn.sendMessage(from, {
                                    image: { url: config.MENU_IMAGE_URL },
                                    caption: menuContent,
                                    contextInfo: commonContextInfo(sender)
                                }, { quoted: receivedMsg });
                            }
                        }
                }
            }
        };

        // Add the button handler
        conn.ev.on("messages.upsert", buttonHandler);

        // Remove listener after 5 minutes
        setTimeout(() => {
            conn.ev.off("messages.upsert", buttonHandler);
        }, 300000);

    } catch (e) {
        console.error(e);
        reply(`❌ Error:\n${e}`);
    }
});
