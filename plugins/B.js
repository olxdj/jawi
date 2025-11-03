const { cmd } = require("../command");
const fs = require("fs");
const path = require("path");

cmd({
  pattern: "caty",
  desc: "Merge all category-based plugin files into one combined file.",
  category: "owner",
  react: "🗂️",
  filename: __filename
}, async (conn, mek, m, { from, q, reply, isCreator }) => {
  try {
    if (!isCreator) return reply("❌ Sirf owner use kar sakda ae!");
    if (!q) return reply("⚙️ Usage: `.caty <category>`\n\nExample:\n.caty download");

    const category = q.trim().toLowerCase();
    const pluginDir = path.join(__dirname, "../plugins");
    const outFile = path.join(__dirname, `../merged_${category}.js`);

    if (!fs.existsSync(pluginDir)) return reply("❌ Plugin folder nahi milia!");

    const pluginFiles = fs.readdirSync(pluginDir).filter(f => f.endsWith(".js"));
    let mergedImports = new Set();
    let mergedCode = "";

    for (const file of pluginFiles) {
      const filePath = path.join(pluginDir, file);
      const content = fs.readFileSync(filePath, "utf8");

      if (content.includes(`category: "${category}"`) || content.includes(`category: '${category}'`)) {
        const importLines = content.match(/^const .*require\(.*\);$/gm);
        if (importLines) importLines.forEach(line => mergedImports.add(line));
        const codeWithoutImports = content.replace(/^const .*require\(.*\);$/gm, "").trim();
        mergedCode += `\n\n// ===== File: ${file} =====\n${codeWithoutImports}`;
      }
    }

    if (!mergedCode) return reply(`⚠️ Koi "${category}" category wala plugin nahi milia!`);

    const finalContent = `${Array.from(mergedImports).join("\n")}\n${mergedCode}`;
    fs.writeFileSync(outFile, finalContent, "utf8");

    await conn.sendMessage(from, {
      document: fs.readFileSync(outFile),
      mimetype: "application/javascript",
      fileName: `merged_${category}.js`,
      caption: `✅ *${category}* category ke sab plugins ek file me merge kar diye gaye hain.\n\n📂 File: merged_${category}.js`
    }, { quoted: mek });

    fs.unlinkSync(outFile);

  } catch (e) {
    console.error(e);
    reply("⚠️ Error: " + e.message);
  }
});
