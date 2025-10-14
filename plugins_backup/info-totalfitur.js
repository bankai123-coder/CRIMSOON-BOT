let handler = async (m, { conn }) => {
  // حساب إجمالي الميزات (الإضافات التي تحتوي على help و tags)
  const totalFeatures = Object.values(global.plugins).filter(p => p.help && p.tags).length;

  // حساب إجمالي الأوامر من جميع الإضافات
  const totalCommands = Object.values(global.plugins)
    .flatMap(p => p.command ? (Array.isArray(p.command) ? p.command : [p.command]) : [])
    .length;

  const caption = `
*「 🤖 إحصائيات البوت 」*

*⚙️ إجمالي الميزات:* ${totalFeatures} ميزة
*🔩 إجمالي الأوامر:* ${totalCommands} أمر

> لعرض جميع الأوامر، استخدم الأمر *.القائمة*
  `.trim();

  // إرسال صورة مصغرة مع النص
  await conn.sendFile(m.chat, 'https://files.catbox.moe/kthhq6.jpg', 'stats.jpg', caption, m);
};

handler.help = ['totalfitur', 'إجمالي_الميزات'];
handler.tags = ['info'];
handler.command = ['totalfitur', 'إجمالي_الميزات'];

export default handler;
