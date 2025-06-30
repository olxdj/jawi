// Credits JawadTechX - KHAN-MD 💜
const config = require('../config');

const PresenceControl = async (conn, update) => {
    try {
        // If ALWAYS_ONLINE=true → Bot stays online 24/7
        if (config.ALWAYS_ONLINE === "true") {
            await conn.sendPresenceUpdate("available", update.id);
            return;
        }

        // If ALWAYS_ONLINE=false → Mirror user's real WhatsApp presence
        const presenceType = update.presences[update.id]?.lastKnownPresence || 'unavailable';
        await conn.sendPresenceUpdate(presenceType === 'online' ? 'available' : 'unavailable', update.id);
        
    } catch (err) {
        console.error('[Presence Error]', err);
    }
};

module.exports = PresenceControl;
