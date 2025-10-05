import fetch from 'node-fetch';

global.fbTemp = global.fbTemp || {};

let handler = async (m, { conn, args, usedPrefix, command }) => {
  await conn.sendMessage(m.chat, { react: { text: '🕒', key: m.key } });

  if (!args[0]) {
    return m.reply(`*يرجى إدخال رابط فيديو من فيسبوك أو تحديد الجودة المطلوبة.*

*مثال:*
• ${usedPrefix + command} https://www.facebook.com/watch/?v=123456789
• ${usedPrefix + command} 720p

*ملاحظة:* يجب عليك إرسال رابط الفيديو أولاً لبدء التحميل.`);
  }

  const isUrl = args[0].startsWith('http://') || args[0].startsWith('https://');
  const user = m.sender;

  // --- قسم اختيار الجودة ---
  if (!isUrl) {
    const videoList = global.fbTemp[user];
    if (!videoList) throw '⚠️ لم يتم حفظ أي فيديو. يرجى إرسال رابط فيديو أولاً باستخدام *.fb <الرابط>*.';

    const wanted = args.join(' ').toLowerCase();
    const selected = videoList.find(v => v.quality.toLowerCase().includes(wanted));
    if (!selected) throw '❌ الجودة المطلوبة غير متوفرة. يرجى التحقق من قائمة الجودات المتاحة.';

    await conn.sendMessage(m.chat, { react: { text: '⬇️', key: m.key } });
    await conn.sendFile(m.chat, selected.url, `fb-${selected.quality}.mp4`, `🎞️ فيديو بجودة *${selected.quality}*`, m);
    await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });
    delete global.fbTemp[user]; // حذف البيانات المؤقتة بعد التحميل
    return;
  }

  // --- قسم تحميل فيديو جديد ---
  try {
    const api = `https://www.sankavolereii.my.id/download/facebook?apikey=planaai&url=${encodeURIComponent(args[0])}`;
    const res = await fetch(api);
    if (!res.ok) throw '❌ فشل في جلب البيانات من الخادم.';

    const json = await res.json();
    if (!json.status || !json.result || !Array.isArray(json.result.video) || json.result.video.length === 0) throw '❌ لم يتم العثور على الفيديو أو الرابط غير صالح.';

    const { title, duration, video } = json.result;

    global.fbTemp[user] = video; // حفظ قائمة الجودات للجلسة الحالية

    // اختيار أفضل جودة متاحة (يفضل HD)
    const bestQuality = video.find(v => /HD/i.test(v.quality)) || video[video.length - 1];
    if (!bestQuality?.url) throw '❌ لم يتم العثور على رابط صالح للفيديو.';

    let caption = `
*「 📥 تحميل فيسبوك 」*

*📝 العنوان:* ${title}
*⏱️ المدة:* ${duration}

✅ *تم إرسال الفيديو بأفضل جودة متاحة:* *${bestQuality.quality}*

*للحصول على جودة مختلفة، استخدم أحد الأوامر التالية:*`.trim();
    video.forEach(v => { caption += `\n• *${usedPrefix + command} ${v.quality}*`; });

    await conn.sendFile(m.chat, bestQuality.url, `${title.replace(/[^\w\s\-_.]/gi, '')}.mp4`, caption, m);
    await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });

  } catch (e) {
    console.error(e);
    await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
    m.reply(`⚠️ *حدث خطأ أثناء تحميل الفيديو:*\n${e.message}`);
  }
};

handler.help = ['fb <url|quality>', 'فيسبوك <رابط|جودة>'];
handler.tags = ['downloader'];
handler.command = /^(fb|facebook|fesnuk|فيسبوك)$/i;
handler.limit = true;

export default handler;
