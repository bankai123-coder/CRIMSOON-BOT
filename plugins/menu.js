import fetch from 'node-fetch'
import fs from 'fs'

let handler = async (m, { conn }) => {
  let name = conn.getName(m.sender)

  // Auto greeting Arabic
  let hour = new Date().getHours() + 3 // Adjust for a common Arabic timezone (UTC+3)
  if (hour >= 24) hour -= 24
  let greeting = 'مساء الخير' // Good evening
  if (hour >= 4 && hour < 12) greeting = 'صباح الخير' // Good morning
  else if (hour >= 12 && hour < 17) greeting = 'نهارك سعيد' // Good afternoon

  let caption = `
${greeting}, *${name}!*
إليك معلومات حول هذا البوت:

┏━━  *معلومات البوت*  ━━┓
┃ *✨اسم البوت:* ryo.yamada
┃ *👑المطور:* rizaldev
┃ *⚙️الإصدار:* 7.0.0
┃ *📦النوع:* Plugins ESM
┗━━━━━━━━━━━━━━━━━━━━┛

يرجى تحديد قائمة أدناه أو كتابة الأمر مباشرة.
`.trim()

  // Send message with image & buttons
  await conn.sendMessage(m.chat, {
    image: { url: 'https://files.catbox.moe/aoieok.jpg' },
    caption,
    footer: 'ryo.yamada',
    buttons: [
      { buttonId: '.allmenu', buttonText: { displayText: '✨ كل القوائم' }, type: 1 },
      { buttonId: '.owner', buttonText: { displayText: '👤 المالك' }, type: 1 },
      { buttonId: '.sc', buttonText: { displayText: '📜 السكريبت' }, type: 1 }
    ],
    headerType: 4,
    mentions: [m.sender],
    contextInfo: {
      externalAdReply: {
        title: 'بوت ryo.yamada للواتساب',
        body: 'متعدد الوظائف',
        thumbnailUrl: 'https://files.catbox.moe/3vrpsp.jpeg',
        sourceUrl: 'https://github.com/rizaldev',
        mediaType: 1,
        renderLargerThumbnail: true
      }
    }
  }, { quoted: m })

  // Send voice note
  await conn.sendMessage(m.chat, {
    audio: { url: 'https://files.cloudkuimages.guru/audios/bwxoMr9Q.mp3' },
    mimetype: 'audio/mp4',
    ptt: true
  }, { quoted: m })
}

handler.help = ['menu', 'القائمة']
handler.tags = ['main']
handler.command = /^(menu|القائمة)$/i

export default handler
