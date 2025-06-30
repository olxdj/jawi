// Credits JawadTechX - KHAN-MD 💜
const config = require('../config');

const PresenceControl = async (conn, update) => {
    try {
        // If ALWAYS_ONLINE is true, keep bot online 24/7
        if (config.ALWAYS_ONLINE === "true") {
            await conn.sendPresenceUpdate("available", update.id);
            return;
        }

        // Get the user's actual presence from their device
        const userPresence = update.presences[update.id]?.lastKnownPresence;
        
        // Only update presence if we have valid data
        if (userPresence) {
            // Convert WhatsApp presence to Baileys presence
            let presenceState;
            switch(userPresence) {
                case 'available':
                case 'online':
                    presenceState = 'available';
                    break;
                case 'unavailable':
                case 'offline':
                    presenceState = 'unavailable';
                    break;
                case 'composing':
                case 'recording':
                    // Ignore typing/recording as requested
                    return;
                default:
                    presenceState = 'unavailable';
            }
            
            await conn.sendPresenceUpdate(presenceState, update.id);
        }
    } catch (err) {
        console.error('[Presence Error]', err);
    }
};

// Additional handler to prevent bot activity from affecting presence
const BotActivityFilter = (conn) => {
    // Store original methods
    const originalSendMessage = conn.sendMessage;
    const originalSendPresenceUpdate = conn.sendPresenceUpdate;

    // Override sendMessage to prevent automatic presence updates
    conn.sendMessage = async (jid, content, options) => {
        const result = await originalSendMessage(jid, content, options);
        // Immediately set presence back to actual user state
        await originalSendPresenceUpdate('unavailable', jid);
        return result;
    };

    // Override sendPresenceUpdate to filter bot-initiated presence
    conn.sendPresenceUpdate = async (type, jid) => {
        // Only allow presence updates that come from PresenceControl
        const stack = new Error().stack;
        if (!stack.includes('PresenceControl')) {
            return;
        }
        return originalSendPresenceUpdate(type, jid);
    };
};

module.exports = { PresenceControl, BotActivityFilter };
