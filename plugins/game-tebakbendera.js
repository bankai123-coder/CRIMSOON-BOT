import fetch from 'node-fetch'

let timeout = 120000
let poin = 4999

let handler = async (m, { conn, usedPrefix }) => {
  let res = await fetch('https://api.sxtream.xyz/games/tebakbendera')
  let json = await res.json()

  if (!json || !json.jawaban || !json.url) throw '❌ السؤال غير متوفر.'

  conn.tebakbendera = conn.tebakbendera || {}
  conn.tebakbendera[m.chat] = {
    jawaban: json.jawaban.toLowerCase(),
    expired: Date.now() + timeout,
    poin,
    timeout: setTimeout(() => {
      if (conn.tebakbendera[m.chat]) {
        m.reply(`⏰ انتهى الوقت!\nالإجابة هي *${json.jawaban}*`)
        delete conn.tebakbendera[m.chat]
      }
    }, timeout)
  }

  await conn.sendFile(m.chat, json.url, 'bendera.jpg', `
🏳️ *خمن العلم*

من فضلك خمن العلم في الأعلى...
الوقت *${(timeout / 1000).toFixed(2)} ثانية*
اكتب *${usedPrefix}لمحة_علم* للمساعدة
مكافأة: ${poin} XP
`.trim(), m)
}

handler.help = ['خمن_العلم']
handler.tags = ['game']
handler.command = /^(tebakbendera|خمن_العلم)$/i
handler.limit = true
handler.group = true

export default handler