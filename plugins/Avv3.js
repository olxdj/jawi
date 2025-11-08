const { cmd } = require("../command");

cmd({
  pattern: "jso",
  alias: ["debug", "structure"],
  desc: "Check message JSON structure",
  category: "utility",
  filename: __filename
}, async (client, message, match, { from }) => {
  try {
    let jsonData = {};
    
    // Check quoted message if exists
    if (match.quoted) {
      jsonData.quoted = {
        mtype: match.quoted.mtype,
        viewOnce: match.quoted.viewOnce,
        text: match.quoted.text,
        mimetype: match.quoted.mimetype,
        // Get all keys to see what properties exist
        allKeys: Object.keys(match.quoted)
      };
    } else {
      jsonData.quoted = "No quoted message";
    }
    
    // Convert to JSON string
    const jsonString = JSON.stringify(jsonData, null, 2);
    
    // Send as file if too long, otherwise as text
    if (jsonString.length > 1000) {
      await client.sendMessage(from, {
        document: Buffer.from(jsonString),
        mimetype: 'application/json',
        fileName: 'message_structure.json'
      }, { quoted: message });
    } else {
      await client.sendMessage(from, {
        text: `📊 Message Structure:\n\`\`\`json\n${jsonString}\n\`\`\``
      }, { quoted: message });
    }
    
  } catch (error) {
    await client.sendMessage(from, {
      text: `❌ Error: ${error.message}`
    }, { quoted: message });
  }
});
