let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) return m.reply(`📊 اختر لوحة الصدارة التي تريد رؤيتها:\n\n${usedPrefix + command} المستوى\n${usedPrefix + command} الحد\n${usedPrefix + command} الخبرة`)

  let users = Object.entries(global.db.data.users).map(([jid, data]) => {
    return {
      jid,
      name: data.name || jid.split('@')[0],
      level: data.level || 0,
      limit: data.limit || 0,
      exp: data.exp || 0
    }
  })

  if (!users.length) return m.reply('❌ لا توجد بيانات للمستخدم حتى الآن.')

  let list = []
  let title = ''

  switch (text.toLowerCase()) {
    case 'المستوى':
      users.sort((a, b) => b.level - a.level)
      list = users.map((u, i) => `${i + 1}. *${u.name}* — المستوى: *${u.level}*`)
      title = '🏆 *لوحة صدارة المستوى*'
      break
    case 'الحد':
      users.sort((a, b) => b.limit - a.limit)
      list = users.map((u, i) => `${i + 1}. *${u.name}* — الحد: *${u.limit}*`)
      title = '🏆 *لوحة صدارة الحد*'
      break
    case 'الخبرة':
      users.sort((a, b) => b.exp - a.exp)
      list = users.map((u, i) => `${i + 1}. *${u.name}* — الخبرة: *${u.exp}*`)
      title = '🏆 *لوحة صدارة الخبرة*'
      break
    default:
      return m.reply(`❌ اختر واحدة مما يلي:\n• *المستوى*\n• *الحد*\n• *الخبرة*`)
  }

  let you = users.findIndex(u => u.jid === m.sender)
  let yourRank = you !== -1 ? `\n\n📊 ترتيبك: *#${you + 1}*` : ''

  let textRes = `${title}\n\n${list.slice(0, 10).join('\n')}${yourRank}`
  m.reply(textRes)
}

handler.help = ['leaderboard <المستوى|الحد|الخبرة>']
handler.tags = ['game']
handler.command = /^(leaderboard|المتصدرين)$/i

export default handler