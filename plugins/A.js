const { cmd } = require("../command");
const fs = require("fs");
const path = require("path");
const AdmZip = require("adm-zip");

cmd({
  pattern: "caty",
  desc: "Merge all plugin files from a specific category and send as zip.",
  category: "owner",
  react: "🗂️",
  filename: __filename
},
async (conn, mek, m, { from, q, reply, isCreator }) => {
  try {
    if (!isCreator) return reply("❌ Sirf owner use kar sakda ae!");
    if (!q) return reply("⚙️ Usage: `.caty <category>`\n\nExample:\n.caty download");

    const category = q.trim().replace(/['"]+/g, "");
    const pluginDir = path.join(__dirname, "../plugins");
    const tempDir = path.join(__dirname, "../temp_plugins");
    const zipPath = path.join(__dirname, "../plugin.zip");

    if (!fs.existsSync(pluginDir)) return reply("❌ Plugin folder not found!");

    if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir);

    const pluginFiles = fs.readdirSync(pluginDir).filter(f => f.endsWith(".js"));
    let mergedImports = new Set();
    let mergedCode = "";

    for (const file of pluginFiles) {
      const filePath = path.join(pluginDir, file);
      const content = fs.readFileSync(filePath, "utf8");

      // match category: "xyz" OR category: 'xyz'
      if (content.includes(`category: "${category}"`) || content.includes(`category: '${category}'`)) {
        const importLines = content.match(/^const .*require\(.*\);$/gm);
        if (importLines) importLines.forEach(line => mergedImports.add(line));
        const codeWithoutImports = content.replace(/^const .*require\(.*\);$/gm, "").trim();
        mergedCode += `\n\n// ===== File: ${file} =====\n${codeWithoutImports}`;
      }
    }

    if (!mergedCode) {
      fs.rmSync(tempDir, { recursive: true, force: true });
      return reply(`⚠️ Koi "${category}" category wala plugin nahi milia!`);
    }

    const finalContent = `${Array.from(mergedImports).join("\n")}\n${mergedCode}`;
    const mergedFilePath = path.join(tempDir, `merged_${category}.js`);
    fs.writeFileSync(mergedFilePath, finalContent, "utf8");

    // zip create
    const zip = new AdmZip();
    zip.addLocalFolder(tempDir);
    zip.writeZip(zipPath);

    await conn.sendMessage(from, {
      document: fs.readFileSync(zipPath),
      mimetype: "application/zip",
      fileName: `merged_${category}.zip`,
      caption: `✅ *${category}* category ke sab plugins ek file me merge kar diye gaye hain.\n📦 *plugin.zip created and sent.*`
    }, { quoted: mek });

    // cleanup
    fs.rmSync(tempDir, { recursive: true, force: true });
    fs.unlinkSync(zipPath);

  } catch (e) {
    console.error(e);
    reply("⚠️ Error: " + e.message);
  }
});
