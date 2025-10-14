let handler = async (m, { conn, isOwner, text, command, usedPrefix }) => {
    let chats = Object.entries(global.db.data.chats).filter(chat => chat[1].isBanned);
    let isBanned = global.db.data.chats[m.chat].isBanned;
    let chatName = await conn.getName(m.chat);

    if (command === 'banchat' || command === 'حظر_دردشة') {
        if (isBanned) {
            return m.reply(`*هذه الدردشة محظورة بالفعل.*`);
        }
        global.db.data.chats[m.chat].isBanned = true;
        m.reply(`*✅ تم حظر الدردشة ${chatName} بنجاح.*\nلن يستجيب البوت لأي أوامر في هذه المجموعة حتى يتم رفع الحظر.`);
    } else if (command === 'unbanchat' || command === 'رفع_حظر_الدردشة') {
        if (!isBanned) {
            return m.reply(`*هذه الدردشة ليست محظورة.*`);
        }
        global.db.data.chats[m.chat].isBanned = false;
        m.reply(`*✅ تم رفع الحظر عن الدردشة ${chatName} بنجaha.*\nيمكن الآن استخدام البوت بشكل طبيعي.`);
    }
};

handler.help = ['banchat', 'unbanchat', 'حظر_دردشة', 'رفع_حظر_الدردشة'];
handler.tags = ['owner'];
handler.command = /^(banchat|unbanchat|حظر_دردشة|رفع_حظر_الدردشة)$/i;
handler.owner = true;

export default handler;
