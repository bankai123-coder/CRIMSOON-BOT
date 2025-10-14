import fs from 'fs'
import moment from 'moment-timezone'
let handler = m => m

handler.all = async function (m) {
  global.wm = 'CRIMSON - BOT'

  let thumb
  try {
    thumb = fs.readFileSync('./thumbnail.jpg')
  } catch (e) {
    thumb = await (await fetch("https://files.catbox.moe/hwnuo9.jpg")).buffer()
  }

  global.adReply = {
    contextInfo: {
      forwardingScore: 999,
      isForwarded: true,
      forwardedNewsletterMessageInfo: {
        newsletterName: `rizal-dev | 2022-2025 」`,
        newsletterJid: "120363363009408737@newsletter"
      },
      externalAdReply: {
        title: `CRIMSON - BOT`,
        body: `${momentGreeting()}`,
        previewType: "PHOTO",
        thumbnail: thumb
        
      }
    }
  }
}

export default handler

function momentGreeting() {
  const hour = moment.tz('Asia/Riyadh').hour()
  if (hour >= 18) return 'مساء الخير🍃'
  if (hour >= 15) return 'مساء الخير🌾'
  if (hour > 10) return 'نهاركم سعيد🍂'
  if (hour >= 4) return 'صباح الخير🌿'
  return 'تصبح على خير🪷'
}