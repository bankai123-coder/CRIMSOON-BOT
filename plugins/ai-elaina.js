import fetch from 'node-fetch'
import moment from 'moment-timezone'

function momentGreeting() {
  const hour = moment().tz('Asia/Riyadh').hour()
  if (hour >= 4 && hour < 10) return 'صباح الخير 🌅'
  if (hour >= 10 && hour < 15) return 'نهارك سعيد ☀️'
  if (hour >= 15 && hour < 18) return 'مساء الخير 🌇'
  if (hour >= 18 || hour < 4) return 'طاب مساؤك 🌙'
  return 'أهلاً~'
}

let handler = async (m, { conn, text }) => {
  if (!text) throw '💬 ماذا تريد أن تتحدث مع إلينا، الساحرة الجميلة؟'

  // Ambil thumbnail Elaina sebagai buffer
  const thumb = await fetch('https://files.catbox.moe/oqf3vm.jpg').then(res => res.buffer())

  // Setup adReply global (opsional disimpan global agar reusable)
  global.adReply = {
    contextInfo: {
      forwardingScore: 999,
      isForwarded: false,
      forwardedNewsletterMessageInfo: {
        newsletterName: `「 إيلينا 」`,
        newsletterJid: '120363395114168746@newsletter'
      },
      externalAdReply: {
        title: `ᴇʟᴀɪɴᴀ`,
        body: momentGreeting(),
        previewType: 'PHOTO',
        thumbnail: thumb,
        sourceUrl: 'https://t.me/hilmanXD' // bebas
      }
    }
  }

  let prompt = `أنتِ إيلينا من أنمي Majo no Tabitabi. أنتِ ساحرة شابة أنيقة، ذكية، وواثقة من نفسها. إجاباتك لطيفة ورشيقة.`

  let url = `https://api.siputzx.my.id/api/ai/gpt3?prompt=${encodeURIComponent(prompt)}&content=${encodeURIComponent(text)}`
  let res = await fetch(url)
  let json = await res.json()

  if (!json.status || !json.data) throw '🪄 إيلينا تستكشف حاليًا. حاول أن تسألها مرة أخرى لاحقًا~'

  let reply = `🪄 *إيلينا:*\n${json.data}`

  // Kirim pesan pakai adReply + thumbnail
  await conn.sendMessage(m.chat, {
    text: reply,
    contextInfo: global.adReply.contextInfo
  }, { quoted: m })
}

handler.help = ['elainaai <رسالة>']
handler.tags = ['ai']
handler.command = /^elainaai$/i
handler.premium = false
export default handler