let handler = async (m, { conn, usedPrefix }) => {
  let user = global.db.data.users[m.sender];
  let name = await conn.getName(m.sender);
  let premium = user.premiumTime > 0 ? 'مميز' : 'عادي';

  let limit = user.limit;
  let text = `
*「 💳 حد الاستخدام 」*

👤 *الاسم:* ${name}
✨ *العضوية:* ${premium}

- *الحد المتبقي لديك:* *${limit}*

*ملاحظة:*
الحدود تُستخدم للوصول إلى ميزات معينة في البوت. يتم إعادة تعيينها يوميًا.
يمكنك الحصول على حد يومي مجاني باستخدام الأمر *${usedPrefix}يومي*.
  `.trim();

  conn.reply(m.chat, text, m);
};

handler.help = ['limit', 'حد'];
handler.tags = ['main'];
handler.command = /^(limit|حد|الحد)$/i;
handler.limit = false;

export default handler;
