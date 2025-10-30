// ✅ Coded by JawadTechX
// 📦 Command: dlnpm
// 🔗 Downloads any npm package as .tgz file
// ⚙️ Category: utility

const { cmd } = require('../command');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const config = require('../config');

cmd({
    pattern: "dlnpm",
    alias: ["npmdl", "npmget"],
    react: "📦",
    desc: "Download npm package tarball (.tgz) from npmjs",
    category: "utility",
    use: ".dlnpm <package_name>",
    filename: __filename
}, async (conn, mek, m, { body, args }) => {
    try {
        if (!args[0]) return m.reply("⚠️ Please provide an npm package name.\n\nExample: *.dlnpm express*");

        const pkgName = args[0];
        const apiUrl = `https://registry.npmjs.org/${pkgName}`;

        // Fetch package info
        const res = await axios.get(apiUrl);
        const data = res.data;

        if (!data["dist-tags"]?.latest)
            return m.reply("❌ Package not found on npmjs.org");

        const version = data["dist-tags"].latest;
        const tarballUrl = data.versions[version].dist.tarball;

        m.react("⬇️");

        const filePath = path.join(__dirname, `${pkgName}-${version}.tgz`);
        const writer = fs.createWriteStream(filePath);
        const fileResponse = await axios.get(tarballUrl, { responseType: 'stream' });
        fileResponse.data.pipe(writer);

        writer.on('finish', async () => {
            m.react("✅");
            await conn.sendMessage(m.chat, {
                document: fs.readFileSync(filePath),
                mimetype: "application/gzip",
                fileName: `${pkgName}-${version}.tgz`,
                caption: `📦 *NPM Package Downloader*\n\n📁 *Package:* ${pkgName}\n🔢 *Version:* ${version}\n🌐 *Source:* npmjs.com\n\n_Powered By KHAN-MD_`
            }, { quoted: mek });
            fs.unlinkSync(filePath);
        });

        writer.on('error', (err) => {
            console.error(err);
            m.reply("❌ Failed to download the package.");
        });

    } catch (e) {
        console.error(e);
        m.reply("❌ Package not found or an error occurred.");
    }
});
