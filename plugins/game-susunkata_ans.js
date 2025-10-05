import similarity from 'similarity'
const threshold = 0.72
export async function before(m) {
    let id = 'susunkata-' + m.chat
    if (!m.quoted || !m.quoted.fromMe || !/اكتب.*لمحة/i.test(m.quoted.text)) return !0
    this.game = this.game ? this.game : {}
    if (!(id in this.game)) return m.reply('انتهت تلك المسألة')
    if (m.quoted.id == this.game[id][0].id) {
        let json = JSON.parse(JSON.stringify(this.game[id][1]))
        if (m.text.toLowerCase() == json.jawaban.toLowerCase().trim()) {
            global.db.data.users[m.sender].money += this.game[id][2]
            global.db.data.users[m.sender].limit += 1
            m.reply(`*🎉صحيح!🎉*\n+${this.game[id][2]} 💰مال\n+1 🎫حد`)
            clearTimeout(this.game[id][3])
            delete this.game[id]
        } else if (similarity(m.text.toLowerCase(), json.jawaban.toLowerCase().trim()) >= threshold) m.reply(`*اقتربت!*`)
        else m.reply(`*غير صحيح!*`)
    }
    return !0
}
export const exp = 0