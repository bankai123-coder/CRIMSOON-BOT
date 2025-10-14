/*
✨ YuriPuki
💫 اسم الميزة: التسجيل
🤖 النوع : إضافة ESM
🔗 المصدر : https://whatsapp.com/channel/0029VbATaq46BIErAvF4mv2c
*/

import { createHash } from 'crypto'
import moment from 'moment-timezone'

let Reg = /^([\w\s\u0600-\u06FF]+),(\d{1,3})$/i

let handler = async function (m, { text, usedPrefix, command, conn }) {
  let namae = conn.getName(m.sender)
  let d = new Date(new Date() + 3600000)
  let locale = 'ar'
  let week = d.toLocaleDateString(locale, { weekday: 'long' })
  let date = d.toLocaleDateString(locale, { day: 'numeric', month: 'long', year: 'numeric' })
  let wibh = moment.tz('Asia/Riyadh').format('HH')
  let wibm = moment.tz('Asia/Riyadh').format('mm')
  let wibs = moment.tz('Asia/Riyadh').format('ss')
  let wktuwib = `${wibh} س ${wibm} د ${wibs} ث`
  let pp
  try {
    pp = await conn.profilePictureUrl(m.sender, 'image')
  } catch {
    pp = './src/avatar_contact.png'
  }

  let user = global.db.data.users[m.sender]
  let sn = createHash('md5').update(m.sender).digest('hex')

  if (user.registered) throw `❗ أنت مسجل بالفعل!\n\nتريد إعادة التسجيل؟\nأرسل:\n${usedPrefix}unreg ${sn}`

  if (!Reg.test(text)) {
    return m.reply(`⚡ اكتب بالشكل الصحيح:\n\n${usedPrefix + command} اسمك,عمرك\n\n📌 مثال:\n${usedPrefix + command} أحمد,18`)
  }

  let [_, name, ageStr] = text.match(Reg)
  let age = parseInt(ageStr)

  if (!name || !age) return m.reply('❌ *الاسم أو العمر غير صحيح!*')
  if (name.length > 100) return m.reply('📛 الاسم يجب أن لا يتجاوز 100 حرف.')
  if (age < 5 || age > 100) return m.reply('🎂 العمر يجب أن يكون بين 5 - 100 سنة.')

  user.name = name.trim()
  user.age = age
  user.regTime = +new Date()
  user.registered = true

  let caption = `
╭─⊷ *🎉 التسجيل مكتمل* 
│ ✅ *الحالة:* مسجل بنجاح
│ 👤 *الاسم:* ${name}
│ 🎂 *العمر:* ${age} سنة
│ 🔑 *الرقم التسلسلي:* ${sn}
│ 
│ 📅 *التاريخ:* ${week}, ${date}
│ ⏰ *الوقت:* ${wktuwib}
╰───

🎊 أهلاً وسهلاً بك في نظام البوت!
تم حفظ بياناتك في قاعدة البيانات بنجاح.
نتمنى لك يوماً سعيداً~! 🌟
`.trim()

  await conn.sendMessage(m.chat, {
    image: { url: pp, path: pp },
    caption,
    footer: 'اختر الزر للمتابعة:',
    buttons: [
      {
        buttonId: '.allmenu',
        buttonText: { displayText: '📂 القائمة الرئيسية' },
        type: 1
      },
      {
        buttonId: '.menu',
        buttonText: { displayText: '🏠 القائمة' },
        type: 1
      }
    ],
    headerType: 4,
    contextInfo: {
      externalAdReply: {
        title: '✅ التسجيل المكتمل',
        body: `مرحباً ${name}!`,
        thumbnailUrl: pp,
        sourceUrl: 'https://whatsapp.com/channel/0029VbATaq46BIErAvF4mv2c',
        mediaType: 1,
        renderLargerThumbnail: true
      }
    }
  }, { quoted: m })
}

handler.help = ['daftar', 'تسجيل', 'register']
handler.tags = ['user']
handler.command = /^(daftar|verify|reg(ister)?|تسجيل|تحقق|سجل)$/i

export default handler
