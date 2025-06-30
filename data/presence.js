// Credits JawadTechX - KHAN-MD 💜
const config = require('../config');

const PresenceControl = async (conn, update) => {
    try {
        // If ALWAYS_ONLINE is true, keep bot online 24/7
        if (config.ALWAYS_ONLINE === "true") {
            await conn.sendPresenceUpdate("available", update.id);
            return;
        }

        // If ALWAYS_ONLINE is false, mirror user's actual presence
        if (update.presence === "available") {
            await conn.sendPresenceUpdate("available", update.id);
        } else if (update.presence === "unavailable") {
            await conn.sendPresenceUpdate("unavailable", update.id);
        }
    } catch (err) {
        console.error('Presence control error:', err);
    }
};

module.exports = PresenceControl;
