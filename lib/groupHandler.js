// Credits JawadTechX - KHAN-MD 💜
const { jidNormalizedUser } = require('@whiskeysockets/baileys')
const config = require('../config')

// 🔹 Normalize ID (jid/lid/pin sab handle kare)
function normalizeId(id = '') {
    if (!id) return null
    if (id.includes('@lid')) return id.replace('@lid', '@s.whatsapp.net')
    return jidNormalizedUser(id)
}

// 🔹 Extract Target (reply/tagged user)
function getTarget(mek) {
    let target
    if (mek.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0]) {
        target = mek.message.extendedTextMessage.contextInfo.mentionedJid[0]
    } else if (mek.message?.extendedTextMessage?.contextInfo?.participant) {
        target = mek.message.extendedTextMessage.contextInfo.participant
    }
    return normalizeId(target)
}

// 🔹 Check Owner
function isOwnerX(conn, sender) {
    const botId = normalizeId(conn.user.id)
    const senderId = normalizeId(sender)
    const botOwnerNumber = config.OWNER_NUMBER || [] // array hona chahiye
    const ownerIds = botOwnerNumber.map(no => no.replace(/[^0-9]/g, '') + '@s.whatsapp.net')
    return ownerIds.includes(senderId) || senderId === botId
}

// 🔹 Check Admins
async function getAdminStatus(conn, chatId, sender) {
    try {
        const metadata = await conn.groupMetadata(chatId)
        const participants = metadata.participants || []

        const botId = normalizeId(conn.user.id)
        const senderId = normalizeId(sender)

        const participant = participants.find(p => 
            p.id === senderId || 
            p.id === senderId.replace('@s.whatsapp.net', '@lid')
        )
        const bot = participants.find(p => 
            p.id === botId || 
            p.id === botId.replace('@s.whatsapp.net', '@lid')
        )

        const isSenderAdmin = participant && (participant.admin === 'admin' || participant.admin === 'superadmin')
        const isBotAdmin = bot && (bot.admin === 'admin' || bot.admin === 'superadmin')

        return { isSenderAdmin, isBotAdmin }
    } catch (e) {
        console.error('getAdminStatus error:', e)
        return { isSenderAdmin: false, isBotAdmin: false }
    }
}

module.exports = {
    normalizeId,
    getTarget,
    isOwnerX,
    getAdminStatus
                }
