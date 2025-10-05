let timeout = 60000
let poin = 500
let poin_lose = -100
let handler = async (m, { conn, usedPrefix, command }) => {
  conn.suit = conn.suit ? conn.suit : {}
  if (Object.values(conn.suit).find(room => room.id.startsWith('suit') && [room.p, room.p2].includes(m.sender))) return m.reply('أنهِ مباراتك السابقة أولاً')
  if (Object.values(conn.suit).find(room => room.id.startsWith('suit') && [room.p, room.p2].includes(m.mentionedJid[0]))) return m.reply(`الشخص الذي تحديته يلعب بالفعل مع شخص آخر :(`)
  let musuh = m.mentionedJid[0] ? m.mentionedJid[0] : m.quoted ? m.quoted.sender : false
  if (!musuh) return m.reply(`_من تريد أن تتحداه؟_\nمنشن الشخص.. مثال\n\n${usedPrefix + command} @${m.sender.split('@')[0]}`, m.chat, { contextInfo: { mentionedJid: [m.sender] } })
  let id = 'suit_' + new Date() * 1
  let caption = `
_*حجر ورق مقص: لاعب ضد لاعب*_

@${m.sender.split`@`[0]} يتحدى @${m.mentionedJid[0].split`@`[0]} في جولة حجر ورق مقص

على @${m.mentionedJid[0].split`@`[0]} القبول
`.trim()
  let footer = `\n\nاكتب "قبول" أو "موافق" لبدء اللعبة\nاكتب "رفض" أو "لا" لرفض التحدي`
  conn.suit[id] = {
    chat: await conn.reply(m.chat, caption + footer, m, { mentions: conn.parseMention(caption) }),
    id: id,
    p: m.sender,
    p2: musuh,
    status: 'wait',
    waktu: setTimeout(() => {
      if (conn.suit[id]) conn.reply(m.chat, `_انتهى وقت المباراة_`, m)
      delete conn.suit[id]
    }, timeout), poin, poin_lose, timeout
  }
}
handler.help = ['حجر_ورق_مقص_ضد_لاعب @مستخدم']
handler.tags = ['fun']
handler.command = /^(suitpvp|حجر_ورق_مقص_ضد_لاعب)$/i
handler.group = true
export default handler