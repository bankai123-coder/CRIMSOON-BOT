let handler = async (m, { conn }) => {
  const ownerId = global.owner?.[0];
  if (!ownerId) return m.reply('❗ لم يتم تعيين رقم المالك في config.js');

  const botId = conn.user?.jid?.split('@')[0];
  if (!botId) return m.reply('❗ لم يتم العثور على رقم البوت');

  const ownerName = await conn.getName(ownerId + '@s.whatsapp.net').catch(() => 'المطور');
  const botName = await conn.getName(conn.user.jid).catch(() => 'البوت');

  await conn.sendContactArray(m.chat, [
    [
      ownerId,
      ownerName,
      '👑 المطور',
      'مطور هذا البوت',
      'Hilman',
      '🇸🇦 المملكة العربية السعودية',
      '📍 الرياض',
      'مطور واتساب بوت متخصص في إنشاء حلول مبتكرة.'
    ],
    [
      botId,
      botName,
      '🤖 بوت واتساب',
      'أنا بوت آلي، لا تتردد في استخدام أوامري!',
      'CRIMSON - BOT',
      '🇸🇦 المملكة العربية السعودية',
      '📍 خادم سحابي',
      'بوت واتساب متعدد الوظائف لمساعدتك في مهام مختلفة. استخدم .القائمة لعرض الأوامر.'
    ]
  ]);

  await m.reply('هذه هي جهة اتصال مطور البوت. 👨‍💻');
};

handler.help = ['owner', 'creator', 'المالك', 'المطور'];
handler.tags = ['info'];
handler.command = /^(owner|creator|المالك|المطور)$/i;

export default handler;
