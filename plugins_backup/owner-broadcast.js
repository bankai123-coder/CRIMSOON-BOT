const handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) throw `*استخدام خاطئ!*\nمثال: ${usedPrefix + command} مرحبًا بالجميع!`;

  let getGroups = await conn.groupFetchAllParticipating();
  let groups = Object.entries(getGroups).map(entry => entry[1]);
  let groupIds = groups.map(v => v.id);

  let broadcastText = `\n*「 📢 رسالة إذاعية 」*\n\n${text}\n`;

  m.reply(`🚀 جارٍ إرسال الإذاعة إلى *${groupIds.length}* مجموعة...\nالوقت المقدر للانتهاء: *${groupIds.length * 2.5}* ثانية`);

  const quotedMessage = m.quoted ? m.quoted : m;
  const mime = (quotedMessage.msg || quotedMessage).mimetype || '';

  for (let id of groupIds) {
    await new Promise(resolve => setTimeout(resolve, 2500));

    let msg = await conn.cMod(m.chat, quotedMessage, broadcastText, conn.user.id, {
      contextInfo: {
        mentionedJid: conn.parseMention(broadcastText)
      }
    });

    await conn.copyNForward(id, msg, true);
  }

  m.reply(`✅ *تمت الإذاعة بنجاح إلى ${groupIds.length} مجموعة.*`);
};

handler.help = ['إذاعة <نص>', 'bc <نص>'];
handler.tags = ['owner'];
handler.command = /^(broadcast|bc|إذاعة)$/i;
handler.owner = true;

export default handler;
