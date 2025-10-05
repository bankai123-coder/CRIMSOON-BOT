let handler = m => m;

handler.before = async function (m) {
    // Check if the message is sent in a group
    if (m.isGroup) {
        // Ignore messages in groups
        return;
    }

    // Check if the user is banned
    let user = global.db.data.users[m.sender];
    if (user.banned === true) {
        // Get the current timestamp
        let now = Date.now();
        // Check if the user has been notified in the last 24 hours (86400000 milliseconds)
        if (!user.lastNotified || now - user.lastNotified > 86400000) {
            // Update the last notified timestamp
            user.lastNotified = now;
            let banReason = user.banReason || 'لم يتم تقديم أي سبب.';
            m.reply(`عذراً، تم حظر رقمك من استخدام هذا البوت.\n\nالسبب: ${banReason}`);
        }
        return;
    }
}

export default handler;
