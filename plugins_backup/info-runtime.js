let handler = async (m, { conn }) => {
  let _muptime = process.uptime() * 1000;
  let muptime = clockString(_muptime);

  await conn.sendMessage(m.chat, {
    image: { url: 'https://files.catbox.moe/x7uf9q.jpg' },
    caption: `*「 🕒 مدة تشغيل البوت 」*\n\n*يعمل البوت منذ:*\n${muptime}`
  }, { quoted: m });
};

handler.help = ['runtime', 'مدة_التشغيل'];
handler.tags = ['info'];
handler.command = ['runtime', 'rt', 'مدة_التشغيل'];

export default handler;

function clockString(ms) {
  if (isNaN(ms)) return '--';

  let d = Math.floor(ms / 86400000);
  let h = Math.floor(ms / 3600000) % 24;
  let mnt = Math.floor(ms / 60000) % 60;
  let s = Math.floor(ms / 1000) % 60;

  return `${d} يوم\n${h} ساعة\n${mnt} دقيقة\n${s} ثانية`;
}
