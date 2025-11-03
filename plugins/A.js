const { cmd } = require("../command");
const fs = require("fs");
const path = require("path");
const AdmZip = require("adm-zip");

cmd({
  pattern: "pak",
  desc: "Replace '../command' path in all plugin files and export as plugin.zip",
  category: "owner",
  react: "📦",
  filename: __filename
},
async (conn, mek, m, { from, q, reply, sender, isCreator }) => {
  try {
    // Creator restriction
    if (!isCreator) return reply("❌ Only owner can use this command!");

    if (!q) return reply("⚙️ Usage: `.setpath \"../lib.newpath\"`\n\nExample:\n.setpath \"../lib.ok\"");

    const newPath = q.trim().replace(/['"]+/g, ""); // remove extra quotes
    const pluginDir = path.join(__dirname, "../plugins");
    const tempDir = path.join(__dirname, "../temp_plugins");
    const zipPath = path.join(__dirname, "../plugin.zip");

    if (!fs.existsSync(pluginDir)) return reply("❌ Plugin folder not found!");

    // Create temp directory
    if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir);

    const pluginFiles = fs.readdirSync(pluginDir).filter(file => file.endsWith(".js"));
    let replacedCount = 0;

    for (const file of pluginFiles) {
      const filePath = path.join(pluginDir, file);
      let content = fs.readFileSync(filePath, "utf8");

      // Replace both ' and " versions
      const updated = content
        .replace(/require\(["']\.\.\/command["']\)/g, `require("${newPath}")`);

      if (updated !== content) replacedCount++;

      const newFilePath = path.join(tempDir, file);
      fs.writeFileSync(newFilePath, updated, "utf8");
    }

    // Zip all modified files
    const zip = new AdmZip();
    zip.addLocalFolder(tempDir);
    zip.writeZip(zipPath);

    await conn.sendMessage(from, {
      document: fs.readFileSync(zipPath),
      mimetype: "application/zip",
      fileName: "plugin.zip",
      caption: `✅ *Path successfully replaced in ${replacedCount} files!*\n📦 *plugin.zip created and sent.*\n\n> Path used: \`${newPath}\``
    }, { quoted: mek });

    // Clean up
    fs.rmSync(tempDir, { recursive: true, force: true });
    fs.unlinkSync(zipPath);

  } catch (e) {
    console.error(e);
    reply("⚠️ Error: " + e.message);
  }
});
