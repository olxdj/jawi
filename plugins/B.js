const { cmd } = require("../command");
const fs = require("fs");
const path = require("path");

cmd({
  pattern: "caty",
  desc: "Merge all plugin files of a given category into one file.",
  category: "owner",
  react: "🗂️",
  filename: __filename
}, async (conn, mek, m, { from, q, reply, isCreator }) => {
  try {
    if (!isCreator) return reply("❌ Sirf bot owner is command ko use kar sakta hai!");
    if (!q) return reply("🧠 Example: `.caty owner`\n\nCategory likho jise merge karna hai.");

    const category = q.trim().toLowerCase();
    const pluginDir = path.join(__dirname);
    const mergedFileName = `merged_${category}.js`;
    const mergedFilePath = path.join(pluginDir, mergedFileName);

    let allCode = "";
    let requireLines = new Set();

    // Read all plugin files
    const pluginFiles = fs.readdirSync(pluginDir).filter(f => f.endsWith(".js"));

    for (const file of pluginFiles) {
      const filePath = path.join(pluginDir, file);
      const content = fs.readFileSync(filePath, "utf8");

      // Match category
      if (content.includes(`category: "${category}"`)) {
        // Collect all require lines
        const requireMatches = content.match(/^const\s+.*require\(.*\);/gm);
        if (requireMatches) {
          requireMatches.forEach(line => requireLines.add(line));
        }

        // Extract cmd parts only
        const cmdBlocks = content.match(/cmd\([\s\S]*?\}\);/gm);
        if (cmdBlocks) {
          cmdBlocks.forEach(block => {
            allCode += "\n\n" + block;
          });
        }
      }
    }

    if (!allCode.trim()) {
      return reply(`❌ Koi plugin category "${category}" nahi mili.`);
    }

    // Merge unique require lines + cmd blocks
    const finalCode = Array.from(requireLines).join("\n") + "\n\n" + allCode;

    // Save merged file
    fs.writeFileSync(mergedFilePath, finalCode, "utf8");

    await conn.sendMessage(from, {
      document: fs.readFileSync(mergedFilePath),
      mimetype: "text/javascript",
      fileName: mergedFileName,
      caption: `🗂️ *Merged all "${category}" commands successfully!*\n📦 File: ${mergedFileName}`
    }, { quoted: mek });

    fs.unlinkSync(mergedFilePath);

  } catch (e) {
    console.error(e);
    reply("❌ Error: " + e.message);
  }
});
