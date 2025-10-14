import similarity from 'similarity'

const threshold = 0.72

export async function before(m) {
    let id = m.chat

    if (m.fromMe) return
    if (!m.quoted || !m.quoted.fromMe || !m.text || !/اكتب.*لمحة_طعام/i.test(m.quoted.text) || /.*لمحة_طعام/i.test(m.text)) {
        return true
    }

    this.tebakmakanan = this.tebakmakanan || {}
    const setting = global.db?.data?.settings?.[m.sender] || {}

    if (setting.composing) {
        await this.sendPresenceUpdate('composing', m.chat)
    }
    if (setting.autoread) {
        await this.readMessages([m.key])
    }

    if (!(id in this.tebakmakanan)) {
        return m.reply('انتهت تلك المسألة')
    }

    if (m.quoted.id && m.quoted.id === this.tebakmakanan[id][0].id) {
        let isSurrender = /^((me)?nyerah|surr?ender|استسلم)$/i.test(m.text)

        if (isSurrender) {
            clearTimeout(this.tebakmakanan[id][4])
            delete this.tebakmakanan[id]
            return m.reply('*آه، استسلمت :( !*')
        }

        let json = this.tebakmakanan[id][1]
        let jawaban = json.jawaban.toLowerCase().trim()

        if (m.text.toLowerCase() === jawaban) {
            global.db.data.users[m.sender].exp += this.tebakmakanan[id][2]
            m.reply(`*صحيح!*\n+${this.tebakmakanan[id][2]} XP`)
            clearTimeout(this.tebakmakanan[id][4])
            delete this.tebakmakanan[id]
        } else if (similarity(m.text.toLowerCase(), jawaban) >= threshold) {
            m.reply(`*اقتربت!*`)
        } else if (--this.tebakmakanan[id][3] === 0) {
            clearTimeout(this.tebakmakanan[id][4])
            delete this.tebakmakanan[id]
            this.reply(m.chat, `*انتهت الفرص!*\nالإجابة: *${json.jawaban}*`, m)
        } else {
            m.reply(`*إجابة خاطئة!*\nلا يزال لديك ${this.tebakmakanan[id][3]} فرصة`)
        }
    }

    return true
}

export const exp = 0