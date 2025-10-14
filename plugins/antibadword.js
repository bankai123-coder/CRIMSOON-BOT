let handler = async (m, { conn, text, isAdmin, usedPrefix, command }) => {
    try {
        // التحقق من صلاحيات المشرف
        if (!isAdmin) {
            return conn.reply(m.chat, `╔═══❰ ⚠️ تحذير ❱═══╗
║
║ ❌ هذا الأمر للمشرفين فقط!
║
╚═══════════════════╝`, m);
        }

        if (!text) {
            return conn.reply(m.chat, `╔═══❰ 🚫 منع الكلمات السيئة ❱═══╗
║
║ 📝 *الاستخدام:*
║
║ ${usedPrefix + command} تفعيل
║ ${usedPrefix + command} تعطيل
║ ${usedPrefix + command} الحالة
║
║ ━━━━━━━━━━━━━━
║
║ 🎯 *الإجراءات المتاحة:*
║
║ ${usedPrefix + command} ضبط حذف
║ ${usedPrefix + command} ضبط طرد
║ ${usedPrefix + command} ضبط تحذير
║
║ ━━━━━━━━━━━━━━
║
║ 💡 *ملاحظة:*
║ يمنع استخدام الكلمات البذيئة
║ والمسيئة في المجموعة
║
╚═══════════════════╝`, m);
        }

        const action = text.toLowerCase().trim();
        let db = global.db.data.chats[m.chat] || {};
        
        if (!global.db.data.chats[m.chat]) {
            global.db.data.chats[m.chat] = {};
        }

        switch(action) {
            case 'تفعيل':
            case 'on':
                if (db.antiBadword) {
                    return conn.reply(m.chat, `╔═══❰ ℹ️ معلومات ❱═══╗
║
║ ✅ منع الكلمات السيئة مفعل بالفعل
║
╚═══════════════════╝`, m);
                }
                global.db.data.chats[m.chat].antiBadword = true;
                global.db.data.chats[m.chat].antiBadwordAction = 'delete';
                conn.reply(m.chat, `╔═══❰ ✅ تم التفعيل ❱═══╗
║
║ 🚫 تم تفعيل منع الكلمات السيئة
║ 🎯 الإجراء: حذف الرسالة
║
╚═══════════════════╝`, m);
                break;

            case 'تعطيل':
            case 'off':
                if (!db.antiBadword) {
                    return conn.reply(m.chat, `╔═══❰ ℹ️ معلومات ❱═══╗
║
║ ❌ منع الكلمات السيئة معطل بالفعل
║
╚═══════════════════╝`, m);
                }
                global.db.data.chats[m.chat].antiBadword = false;
                conn.reply(m.chat, `╔═══❰ ❌ تم التعطيل ❱═══╗
║
║ 🚫 تم تعطيل منع الكلمات السيئة
║
╚═══════════════════╝`, m);
                break;

            case 'الحالة':
            case 'status':
                const status = db.antiBadword ? 'مفعل ✅' : 'معطل ❌';
                const actionType = db.antiBadwordAction || 'غير محدد';
                conn.reply(m.chat, `╔═══❰ 📊 الحالة ❱═══╗
║
║ 🚫 منع الكلمات السيئة: ${status}
║ 🎯 الإجراء المحدد: ${actionType}
║
╚═══════════════════╝`, m);
                break;

            default:
                if (action.startsWith('ضبط ') || action.startsWith('set ')) {
                    const setAction = action.split(' ')[1];
                    const validActions = ['حذف', 'delete', 'طرد', 'kick', 'تحذير', 'warn'];
                    
                    if (!validActions.includes(setAction)) {
                        return conn.reply(m.chat, `╔═══❰ ❌ خطأ ❱═══╗
║
║ الإجراءات المتاحة:
║ • حذف / delete
║ • طرد / kick
║ • تحذير / warn
║
╚═══════════════════╝`, m);
                    }

                    const normalizedAction = setAction === 'حذف' ? 'delete' : 
                                           setAction === 'طرد' ? 'kick' : 
                                           setAction === 'تحذير' ? 'warn' : setAction;

                    global.db.data.chats[m.chat].antiBadwordAction = normalizedAction;
                    conn.reply(m.chat, `╔═══❰ ✅ تم الضبط ❱═══╗
║
║ 🎯 تم تغيير الإجراء إلى: ${normalizedAction}
║
╚═══════════════════╝`, m);
                } else {
                    conn.reply(m.chat, `╔═══❰ ❌ خطأ ❱═══╗
║
║ أمر غير صحيح
║ استخدم: ${usedPrefix + command}
║ لعرض المساعدة
║
╚═══════════════════╝`, m);
                }
        }

    } catch (error) {
        console.error('خطأ في antibadword:', error);
        conn.reply(m.chat, `╔═══❰ ⚠️ خطأ ❱═══╗
║
║ حدث خطأ أثناء المعالجة
║
╚═══════════════════╝`, m);
    }
};

handler.help = ['منع-الكلمات <تفعيل/تعطيل>'];
handler.tags = ['group'];
handler.command = /^(منع-الكلمات|منع_الكلمات|antibadword)$/i;
handler.group = true;
handler.admin = true;
handler.botAdmin = true;

export default handler;
