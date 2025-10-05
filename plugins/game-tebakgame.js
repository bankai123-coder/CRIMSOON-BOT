import fs from 'fs'
let timeout = 120000
let poin = 4999
let handler = async (m, { conn, command, usedPrefix }) => {
    conn.game = conn.game ? conn.game : {}
    let id = 'tebakgame-' + m.chat
    if (id in conn.game) return conn.reply(m.chat, 'لا يزال هناك سؤال لم تتم الإجابة عليه في هذه الدردشة', conn.game[id][0])
    let src = JSON.parse(fs.readFileSync('./json/tebakgame.json', 'utf-8'))
    let json = src[Math.floor(Math.random() * src.length)]
    let caption = `
أي شعار هذا؟

الوقت *${(timeout / 1000).toFixed(2)} ثانية*
اكتب ${usedPrefix}لمحة_لعبة للمساعدة
مكافأة: ${poin} XP
`.trim()
    conn.game[id] = [
        await conn.sendFile(m.chat, json.img, 'tebakgame.jpg', caption, m),
        json, poin,
        setTimeout(() => {
            if (conn.game[id]) conn.reply(m.chat, `انتهى الوقت!\nالإجابة هي *${json.jawaban}*`, conn.game[id][0])
            delete conn.game[id]
        }, timeout)
    ]
}
handler.help = ['خمن_اللعبة']
handler.tags = ['game']
handler.command = /^(tebakgame|خمن_اللعبة)$/i

handler.onlyprem = true
handler.game = true

export default handler