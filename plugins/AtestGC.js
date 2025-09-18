const { cmd } = require('../command')
const { normalizeId, getTarget, isOwnerX, getAdminStatus } = require('../lib/groupHandler')

// 🔇 Mute group
cmd({
    pattern: "mute2",
    react: "🔇",
    desc: "Mute the group (only admins can send)",
    category: "group",
    filename: __filename
}, async (conn, mek, m, { from, isGroup, sender, reply }) => {
    if (!isGroup) return reply("❌ Group command only.")
    const { isSenderAdmin, isBotAdmin } = await getAdminStatus(conn, from, sender)
    if (!isSenderAdmin) return reply("❌ Only admins can mute.")
    if (!isBotAdmin) return reply("❌ Bot must be admin.")

    await conn.groupSettingUpdate(from, "announcement")
    reply("✅ Group muted (admins only).")
})

// 🔊 Unmute group
cmd({
    pattern: "unmute2",
    react: "🔊",
    desc: "Unmute the group",
    category: "group",
    filename: __filename
}, async (conn, mek, m, { from, isGroup, sender, reply }) => {
    if (!isGroup) return reply("❌ Group command only.")
    const { isSenderAdmin, isBotAdmin } = await getAdminStatus(conn, from, sender)
    if (!isSenderAdmin) return reply("❌ Only admins can unmute.")
    if (!isBotAdmin) return reply("❌ Bot must be admin.")

    await conn.groupSettingUpdate(from, "not_announcement")
    reply("✅ Group unmuted (everyone can chat).")
})

// 👢 Kick
cmd({
    pattern: "kick",
    react: "👢",
    desc: "Kick a user",
    category: "group",
    filename: __filename
}, async (conn, mek, m, { from, isGroup, sender, reply }) => {
    if (!isGroup) return reply("❌ Group command only.")
    const { isSenderAdmin, isBotAdmin } = await getAdminStatus(conn, from, sender)
    if (!isSenderAdmin) return reply("❌ Only admins can kick.")
    if (!isBotAdmin) return reply("❌ Bot must be admin.")

    const target = getTarget(mek)
    if (!target) return reply("❌ Mention/reply user to kick.")
    if (isOwnerX(conn, target)) return reply("❌ Can't kick bot/owner.")

    await conn.groupParticipantsUpdate(from, [target], "remove")
    reply(`✅ Kicked: @${target.split('@')[0]}`, { mentions: [target] })
})

// 📈 Promote
cmd({
    pattern: "promote",
    react: "📈",
    desc: "Promote a user",
    category: "group",
    filename: __filename
}, async (conn, mek, m, { from, isGroup, sender, reply }) => {
    if (!isGroup) return reply("❌ Group command only.")
    const { isSenderAdmin, isBotAdmin } = await getAdminStatus(conn, from, sender)
    if (!isSenderAdmin) return reply("❌ Only admins can promote.")
    if (!isBotAdmin) return reply("❌ Bot must be admin.")

    const target = getTarget(mek)
    if (!target) return reply("❌ Mention/reply user to promote.")
    if (isOwnerX(conn, target)) return reply("❌ Can't promote bot/owner.")

    await conn.groupParticipantsUpdate(from, [target], "promote")
    reply(`✅ Promoted: @${target.split('@')[0]}`, { mentions: [target] })
})

// 📉 Demote
cmd({
    pattern: "demote",
    react: "📉",
    desc: "Demote a user",
    category: "group",
    filename: __filename
}, async (conn, mek, m, { from, isGroup, sender, reply }) => {
    if (!isGroup) return reply("❌ Group command only.")
    const { isSenderAdmin, isBotAdmin } = await getAdminStatus(conn, from, sender)
    if (!isSenderAdmin) return reply("❌ Only admins can demote.")
    if (!isBotAdmin) return reply("❌ Bot must be admin.")

    const target = getTarget(mek)
    if (!target) return reply("❌ Mention/reply user to demote.")
    if (isOwnerX(conn, target)) return reply("❌ Can't demote bot/owner.")

    await conn.groupParticipantsUpdate(from, [target], "demote")
    reply(`✅ Demoted: @${target.split('@')[0]}`, { mentions: [target] })
})

// 🔗 Add via invite
cmd({
    pattern: "add",
    react: "🔗",
    desc: "Send group invite link instead of direct add",
    category: "group",
    filename: __filename
}, async (conn, mek, m, { from, isGroup, sender, reply }) => {
    if (!isGroup) return reply("❌ Group command only.")
    const { isSenderAdmin, isBotAdmin } = await getAdminStatus(conn, from, sender)
    if (!isSenderAdmin) return reply("❌ Only admins can generate invite link.")
    if (!isBotAdmin) return reply("❌ Bot must be admin.")

    const inviteCode = await conn.groupInviteCode(from)
    const link = `https://chat.whatsapp.com/${inviteCode}`
    reply(`🔗 Group Invite: ${link}`)
})
