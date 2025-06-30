const config = require('../config');
const { cmd } = require('../command');

// Presence Control (Online/Offline)
cmd({
  on: "body"
}, async (conn, mek, m, { from, isCmd }) => {
  try {
    // Skip presence update in these cases:
    // 1. If it's a command
    // 2. If it's from the bot itself
    // 3. If it's an ephemeral message (typing, recording, etc.)
    // 4. If AUTO_RECORDING is enabled and active
    // 5. If composing/recording states are active
    const shouldSkipPresenceUpdate = (
      isCmd || 
      mek.key.fromMe || 
      mek.message?.ephemeralMessage ||
      (config.AUTO_RECORDING === "true" && mek.message?.audioMessage) ||
      mek.message?.protocolMessage?.type || // For various protocol messages
      mek.message?.reactionMessage // For reactions
    );

    if (shouldSkipPresenceUpdate) {
      return;
    }

    // If ALWAYS_ONLINE=true → Bot stays online 24/7
    if (config.ALWAYS_ONLINE === "true") {
      await conn.sendPresenceUpdate("available", from);
    }
    // If false, do nothing (let WhatsApp handle presence naturally)
  } catch (e) {
    console.error("[Presence Error]", e);
  }
});
