const { cmd } = require('../command');

cmd({
    pattern: "structure",
    alias: ["msgstruct", "debug", "raw", "json"],
    desc: "Get complete Baileys message structure as JSON",
    category: "debug",
    react: "🔍",
    filename: __filename
},
async (conn, mek, m, { from, reply, react }) => {
    try {
        await react("📊");
        
        // Create clean JSON string without circular references
        const cleanMessage = JSON.parse(JSON.stringify(mek, (key, value) => {
            // Handle Buffer objects
            if (value && value.type === 'Buffer') {
                return `[Buffer: ${value.data.length} bytes]`;
            }
            return value;
        }, 2));

        const jsonString = JSON.stringify(cleanMessage, null, 2);
        
        // Send as file
        await conn.sendMessage(from, {
            document: Buffer.from(jsonString, 'utf-8'),
            fileName: `message-structure-${Date.now()}.json`,
            mimetype: 'application/json'
        }, { quoted: mek });

        await react("✅");

    } catch (error) {
        console.error("Error in structure command:", error);
        await react("❌");
        await reply("Error generating message structure");
    }
});
