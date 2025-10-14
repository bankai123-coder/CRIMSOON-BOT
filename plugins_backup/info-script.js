let handler = async (m, { conn }) => {
  const repoUrl = 'https://github.com/HilmanXd/';

  const messageText = `
*「 📜 شفرة المصدر 」*

هذا البوت مفتوح المصدر ومتاح على GitHub.
يمكنك العثور على شفرة المصدر الكاملة على الرابط التالي:
${repoUrl}

لا تتردد في المساهمة أو استخدامه لمشروعك الخاص.
إذا أعجبك، لا تنسَ أن تضع نجمة ⭐!
  `.trim();

  await conn.sendMessage(m.chat, {
    text: messageText,
    contextInfo: {
      externalAdReply: {
        title: "CRIMSON - BOT | GitHub",
        body: "اضغط هنا للوصول إلى شفرة المصدر",
        thumbnailUrl: "https://files.catbox.moe/kthhq6.jpg",
        sourceUrl: repoUrl,
        mediaType: 1,
        renderLargerThumbnail: true
      }
    }
  }, { quoted: m });
};

handler.help = ['script', 'sc', 'المصدر', 'سكريبت'];
handler.tags = ['info'];
handler.command = /^(sc|script|المصدر|سكريبت)$/i;

export default handler;
