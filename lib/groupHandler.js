// Credits JawadTechX - KHAN-MD 💜
const { isJidGroup } = require('@whiskeysockets/baileys')
const config = require('../config')

// Normalize JID (lid <-> pn safe)
function normalizeJid(jid = "") {
    if (!jid) return jid
    if (jid.includes('@s.whatsapp.net')) {
        return jid.replace('@s.whatsapp.net', '@s.whatsapp.net')
    } else if (jid.includes('@lid')) {
        return jid.replace('@lid', '@lid')
    }
    return jid
}

// ✅ Bot Owner Check
function isOwnerX(sock, senderId) {
    const botId = sock.user.id.split(':')[0] + '@s.whatsapp.net'
    const sender = normalizeJid(senderId)
    const isMe = botId === sender
    const isOwner = config.OWNER_NUMBER.includes(sender.split('@')[0]) || isMe
    return isOwner
}

// ✅ Check Admin & Bot Admin
async function isAdmin(sock, chatId, senderId) {
    try {
        const groupMetadata = await sock.groupMetadata(chatId)

        const participant = groupMetadata.participants.find(p =>
            p.id === senderId ||
            p.id === senderId.replace('@s.whatsapp.net', '@lid') ||
            p.id === senderId.replace('@lid', '@s.whatsapp.net')
        )

        const botId = sock.user.id.split(':')[0] + '@s.whatsapp.net'
        const bot = groupMetadata.participants.find(p =>
            p.id === botId ||
            p.id === botId.replace('@s.whatsapp.net', '@lid')
        )

        const isBotAdmin = bot && (bot.admin === 'admin' || bot.admin === 'superadmin')
        const isSenderAdmin = participant && (participant.admin === 'admin' || participant.admin === 'superadmin')

        return { isSenderAdmin, isBotAdmin }
    } catch (error) {
        console.error("Error in isAdmin:", error)
        return { isSenderAdmin: false, isBotAdmin: false }
    }
}

// ✅ Get Target (reply / mention / number)
function getTarget(mek, args) {
    let target
    if (mek.message.extendedTextMessage?.contextInfo?.participant) {
        target = mek.message.extendedTextMessage.contextInfo.participant
    } else if (mek.mentionedJid && mek.mentionedJid[0]) {
        target = mek.mentionedJid[0]
    } else if (args[0]) {
        let num = args[0].replace(/[^0-9]/g, '')
        target = num + '@s.whatsapp.net'
    }
    return normalizeJid(target)
}

module.exports = {
    isOwnerX,
    isAdmin,
    isBotAdmin: async (sock, chatId) => {
        const { isBotAdmin } = await isAdmin(sock, chatId, sock.user.id.split(':')[0] + '@s.whatsapp.net')
        return isBotAdmin
    },
    getTarget,
    isGroup: isJidGroup,
    normalizeJid
}
