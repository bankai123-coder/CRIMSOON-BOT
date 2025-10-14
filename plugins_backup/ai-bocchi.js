import fetch from 'node-fetch'
import moment from 'moment-timezone'

function momentGreeting() {
  const hour = moment().tz('Asia/Jakarta').hour()
  if (hour >= 4 && hour < 10) return 'صباح الخير 🌅'
  if (hour >= 10 && hour < 15) return 'نهارك سعيد ☀️'
  if (hour >= 15 && hour < 18) return 'مساء الخير 🌇'
  if (hour >= 18 || hour < 4) return 'طاب مساؤك 🌙'
  return 'أهلاً~'
}

let handler = async (m, { conn, text }) => {
  if (!text) throw '💬 ماذا تريد أن تتحدث به مع بوتشي-تشان؟'

  const thumb = await fetch('https://files.catbox.moe/8o5zc7.jpg').then(res => res.buffer()) // Ganti kalau ada link lain

  global.adReply = {
    contextInfo: {
      forwardingScore: 999,
      isForwarded: false,
      forwardedNewsletterMessageInfo: {
        newsletterName: `「 بوتشي 」`,
        newsletterJid: '120363395114168746@newsletter'
      },
      externalAdReply: {
        title: `ʙᴏᴄᴄʜɪ ᴛʜᴇ ʀᴏᴄᴋ`,
        body: momentGreeting(),
        previewType: 'PHOTO',
        thumbnail: thumb,
        sourceUrl: 'https://t.me/hilmanXD'
      }
    }
  }

  let prompt = `أنتِ بوتشي من أنمي Bocchi the Rock. أنتِ خجولة جدًا، وقلقة، وتصابين بالذعر كثيرًا. لكنكِ تحبين العزف على الجيتار. ردي بأسلوبك العصبي المميز.`

  let url = `https://api.siputzx.my.id/api/ai/gpt3?prompt=${encodeURIComponent(prompt)}&content=${encodeURIComponent(text)}`
  let res = await fetch(url)
  let json = await res.json()

  if (!json.status || !json.data) throw '😰 بوتشي تختبئ تحت الطاولة الآن...'

  let reply = `🎸 *بوتشي:*\n${json.data}`
  await conn.sendMessage(m.chat, {
    text: reply,
    contextInfo: global.adReply.contextInfo
  }, { quoted: m })
}

handler.help = ['bocchiai <نص>']
handler.tags = ['ai']
handler.command = /^bocchiai$/i
handler.premium = false
export default handler