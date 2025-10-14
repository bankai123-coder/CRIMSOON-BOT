import fs from 'fs'
let timeout = 120000
let poin = 4999
let handler = async (m, { conn, command, usedPrefix }) => {
    conn.game = conn.game ? conn.game: {}
    let id = 'tebaktebakan-' + m.chat
    if (id in conn.game) return conn.reply(m.chat, 'لا يزال هناك سؤال لم تتم الإجابة عليه في هذه الدردشة', conn.game[id][0])
    let src = JSON.parse(fs.readFileSync('./json/tebaktebakan.json', 'utf-8'))
    let json = src[Math.floor(Math.random() * src.length)]
    let caption = `
${json.soal}

الوقت *${(timeout / 1000).toFixed(2)} ثانية*
اكتب ${usedPrefix}لمحة للحصول على مساعدة
مكافأة: ${poin} XP
`.trim()
    conn.game[id] = [
        await m.reply(caption),
        json, poin,
        setTimeout(() => {
            if (conn.game[id]) conn.reply(m.chat, `انتهى الوقت!\nالإجابة هي *${json.jawaban}*`, conn.game[id][0])
            delete conn.game[id]
        }, timeout)
    ]
}
handler.help = ['تخمين']
handler.tags = ['game']
handler.command = /^(tebaktebakan|تخمين)$/i

handler.onlyprem = true
handler.game = true

export default handler