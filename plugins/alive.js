let handler = async (m, { conn }) => {
    try {
        const botVersion = global.version || '1.0.0';
        const botName = global.botname || 'نايت بوت';
        
        const aliveMessage = `╔═══❰ 🤖 ${botName} ❱═══╗
║
║ ✅ *الحالة:* نشط ومتصل
║ 📌 *الإصدار:* ${botVersion}
║ 🌐 *الوضع:* عام للجميع
║
║ ━━━━━━━━━━━━━━
║
║ 🌟 *المميزات الرئيسية:*
║
║ 👥 إدارة المجموعات
║ 🛡️ حماية من الروابط
║ 🎮 أوامر ترفيهية
║ 🤖 ذكاء اصطناعي
║ 📥 تحميل الملفات
║ 🎨 صنع الملصقات
║ 🔊 تحويل الصوتيات
║ 📊 وأكثر من ذلك!
║
║ ━━━━━━━━━━━━━━
║
║ 📜 *للحصول على قائمة الأوامر:*
║ اكتب: *.قائمة* أو *.الاوامر*
║
╚═══════════════════╝`;

        await conn.sendMessage(m.chat, {
            text: aliveMessage,
            contextInfo: {
                forwardingScore: 999,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: '120363161513685998@newsletter',
                    newsletterName: botName,
                    serverMessageId: -1
                }
            }
        }, { quoted: m });

    } catch (error) {
        console.error('خطأ في أمر alive:', error);
        await conn.reply(m.chat, '✅ البوت نشط ويعمل بكفاءة!', m);
    }
};

handler.help = ['نشط', 'حالة', 'بوت'];
handler.tags = ['main'];
handler.command = /^(نشط|حالة|بوت|alive|status|bot)$/i;

export default handler;
