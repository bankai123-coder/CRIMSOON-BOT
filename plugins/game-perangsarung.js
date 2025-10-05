let handler = async (m, { conn, text }) => {
  if (!m.mentionedJid[0]) return conn.reply(m.chat, `منشن شخص واحد لتحديه في حرب السارونغ!`, m)

  let target = m.mentionedJid[0]
  let player1 = { jid: m.sender, name: conn.getName(m.sender) }
  let player2 = { jid: target, name: conn.getName(target) }

  let players = [player1, player2]

  let intro = `⚔️ *حرب السارونغ تبدأ!!*\n\n${player1.name} ضد ${player2.name}\n\nمن سيفوز؟\n\n*جار التحميل...*`
  await conn.reply(m.chat, intro, m, { mentions: [player1.jid, player2.jid] })

 
  const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))

  await conn.sendPresenceUpdate('composing', m.chat)
  await delay(3000)
  await conn.reply(m.chat, `💥 بدأ كلاهما في تدوير السارونغ بأسلوب النينجا!`, m)

  await conn.sendPresenceUpdate('composing', m.chat)
  await delay(3000)
  await conn.reply(m.chat, `⚡ سمع صوت *\"صفعة!\"* في الهواء...`, m)

  await conn.sendPresenceUpdate('composing', m.chat)
  await delay(2500)

  let winner = players[Math.floor(Math.random() * players.length)]
  let loser = players.find(p => p.jid !== winner.jid)

  await conn.reply(m.chat, `☠️ ${loser.name} سقط بعد أن ضربه سارونغ سجادة المسجد`, m, { mentions: [loser.jid] })
  await delay(2000)
  await conn.reply(m.chat, `🏆 *الفائز هو:* ${winner.name.toUpperCase()}!`, m, { mentions: [winner.jid] })
}

handler.help = ['حرب_السارونغ @مستخدم']
handler.tags = ['game']
handler.command = /^(perangsarung|حرب_السارونغ)$/i
handler.group = true
handler.register = true

export default handler

/*
SCRIPT BY © VYNAA VALERIE 
Modifikasi: By ZenzXD
*/