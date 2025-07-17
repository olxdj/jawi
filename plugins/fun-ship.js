cmd({
    pattern: "fing",
    alias: ['fingering', 'hath', 'ungli', 'touch', 'moan'],
    desc: "Funny girl animation (owner only)",
    category: "tools",
    react: "👅",
    filename: __filename
},
async (conn, mek, m, { from, reply }) => {
    try {
        const loadingMessage = await conn.sendMessage(from, { text: '👀 Starting... 🍑💦' });
        
        const animationFrames = [
            "👆🏻 🍑", 
            "👆🏻 🍑", 
            "👆🏻 🍑", 
            "👆🏻 🍑", 
            "👆🏻 🍑", 
            "👆🏻 🍑", 
            "👆🏻🍑", 
            "👉🏻🍑", 
            "👉🏻💦🍑", 
            "👉🏻💦💦🍑", 
            "👉🏻💦💦💦🍑", 
            "💦🍑💦 *Awf 🥵* 😮‍💨"
        ];

        for (const frame of animationFrames) {
            await new Promise(resolve => setTimeout(resolve, 1000)); // 1 second delay
            await conn.relayMessage(
                from,
                {
                    protocolMessage: {
                        key: loadingMessage.key,
                        type: 14,
                        editedMessage: {
                            conversation: frame,
                        },
                    },
                },
                {}
            );
        }
    } catch (e) {
        console.log(e);
        reply(`❌ *Error!* ${e.message}`);
    }
});
