let handler = async (m, { text }) => {
    let user = global.db.data.users[m.sender]
    user.afk = +new Date()
    user.afkReason = text
    m.reply(`${conn.getName(m.sender)} الآن في وضع بعيد عن لوحة المفاتيح (AFK)${text ? ` - السبب: ${text}` : ''}`)
}
handler.help = ['afk [سبب]', 'غير_متصل [سبب]']
handler.tags = ['main']
handler.command = /^(afk|غير_متصل)$/i

export default handler