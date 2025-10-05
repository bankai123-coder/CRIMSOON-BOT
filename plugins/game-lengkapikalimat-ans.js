import similarity from 'similarity'
const threshold = 0.72
export async function before(m) {
    let id = m.chat
    if (!m.quoted || !m.quoted.fromMe || !m.quoted.isBaileys || !m.text || !/Ketik.*hlen/i.test(m.quoted.text) || /.*hlen/i.test(m.text))
        return !0
    this.lengkapikalimat = this.lengkapikalimat ? this.lengkapikalimat : {}
    if (!(id in this.lengkapikalimat))
        return m.reply('انتهى هذا السؤال')
    if (m.quoted.id == this.lengkapikalimat[id][0].id) {
        let isSurrender = /^((me)?nyerah|surr?ender|استسلام)$/i.test(m.text)
        if (isSurrender) {
            clearTimeout(this.lengkapikalimat[id][3])
            delete this.lengkapikalimat[id]
            return m.reply('*آه, استسلمت :( !*')
        }
        let json = JSON.parse(JSON.stringify(this.lengkapikalimat[id][1]))
        // m.reply(JSON.stringify(json, null, '\t'))
        if (m.text.toLowerCase() == json.jawaban.toLowerCase().trim()) {
            global.db.data.users[m.sender].exp += this.lengkapikalimat[id][2]
            m.reply(`*صحيح!*\n+${this.lengkapikalimat[id][2]} XP`, m)
            clearTimeout(this.lengkapikalimat[id][3])
            delete this.lengkapikalimat[id]
        } else if (similarity(m.text.toLowerCase(), json.jawaban.toLowerCase().trim()) >= threshold)
            m.reply(`*قريب جدا!*`)
        else
            m.reply(`*خطأ!*`, m)
    }
    return !0
}
export const exp = 0