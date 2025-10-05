import fs from 'fs'
const winScore = 4999
async function handler(m) {
    this.game = this.game ? this.game : {}
    let id = 'family100_' + m.chat
    if (id in this.game) return this.reply(m.chat, 'لا يزال هناك اختبار لم تتم الإجابة عليه في هذه الدردشة', this.game[id].msg)
    let src = JSON.parse(fs.readFileSync('./json/family100.json', 'utf-8'))
    let json = src[Math.floor(Math.random() * src.length)]
    let caption = `
*سؤال:* ${json.soal}
هناك *${json.jawaban.length}* إجابات${json.jawaban.find(v => v.includes(' ')) ? `
(بعض الإجابات تحتوي على مسافات)
`: ''}
+${winScore} XP لكل إجابة صحيحة
    `.trim()
    this.game[id] = {
        id,
        msg: await m.reply(caption),
        ...json,
        terjawab: Array.from(json.jawaban, () => false),
        winScore,
    }
}
handler.help = ['family100']
handler.tags = ['game']
handler.command = /^(family100|العائلة100)$/i
handler.onlyprem = true
handler.game = true
export default handler