import axios from 'axios';

let handler = async (m, { conn, participants, groupMetadata }) => {
  let ppUrl = await conn.profilePictureUrl(m.chat, 'image').catch(_ => 'https://telegra.ph/file/24fa902ead26340f3df2c.png');
  let ppBuffer = await axios.get(ppUrl, { responseType: 'arraybuffer' }).then(res => res.data).catch(_ => null);

  const { isBanned, welcome, detect, sWelcome, sBye, sPromote, sDemote, antiLink, delete: del } = global.db.data.chats[m.chat];
  const groupAdmins = participants.filter(p => p.admin);
  const listAdmin = groupAdmins.map((v, i) => `${i + 1}. @${v.id.split('@')[0]}`).join('\n');
  const owner = groupMetadata.owner || groupAdmins.find(p => p.admin === 'superadmin')?.id || m.chat.split('-')[0] + '@s.whatsapp.net';
  
  let text = `
*「 📊 معلومات المجموعة 」*

*🔖 الاسم:* ${groupMetadata.subject}
*🔩 المعرف:* ${groupMetadata.id}

*📝 الوصف:*
${groupMetadata.desc?.toString() || 'لا يوجد وصف'}

*👥 إجمالي الأعضاء:*
${participants.length} عضو

*👑 مالك المجموعة:*
@${owner.split('@')[0]}

*🛡️ مشرفو المجموعة:*
${listAdmin}

*⚙️ إعدادات المجموعة:*
- *الحظر:* ${isBanned ? ' مفعل' : ' معطل'}
- *الترحيب:* ${welcome ? ' مفعل' : ' معطل'}
- *الكشف:* ${detect ? ' مفعل' : ' معطل'}
- *مضاد الحذف:* ${del ? ' معطل' : ' مفعل'}
- *مضاد الروابط:* ${antiLink ? ' مفعل' : ' معطل'}

*💬 إعدادات الرسائل:*
- *الترحيب:* ${sWelcome}
- *الوداع:* ${sBye}
- *الترقية:* ${sPromote}
- *التخفيض:* ${sDemote}
  `.trim();

  conn.sendFile(m.chat, ppBuffer, 'pp.jpg', text, m, false, { mentions: [...groupAdmins.map(v => v.id), owner] });
}

handler.help = ['infogc', 'معلومات_المجموعة'];
handler.tags = ['group'];
handler.command = /^(gro?upinfo|info(gro?up|gc)|معلومات_المجموعة)$/i;
handler.group = true;

export default handler;
