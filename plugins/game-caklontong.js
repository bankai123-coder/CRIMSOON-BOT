import fs from 'fs'
let timeout = 120000
let poin = 4999
let handler = async (m, { conn, usedPrefix }) => {
    conn.caklontong = conn.caklontong ? conn.caklontong : {}
    let id = m.chat
    if (id in conn.caklontong) return conn.reply(m.chat, 'لا يزال هناك سؤال لم تتم الإجابة عليه في هذه الدردشة', conn.caklontong[id][0])
    let src = JSON.parse(fs.readFileSync('./json/caklontong.json', 'utf-8'))
    let json = src[Math.floor(Math.random() * src.length)]
    let caption = `
${json.soal}

الوقت *${(timeout / 1000).toFixed(2)} ثانية*
اكتب ${usedPrefix}calo للحصول على مساعدة
مكافأة: ${poin} XP
`.trim()
    conn.caklontong[id] = [
        await conn.reply(m.chat, caption, m),
        json, poin,
        setTimeout(async () => {
            if (conn.caklontong[id]) await conn.reply(m.chat, `انتهى الوقت!\nالإجابة هي *${json.jawaban}*\n${json.deskripsi}`, conn.caklontong[id][0])
            delete conn.caklong[id]
        }, timeout)
    ]
}
handler.help = ['caklontong']
handler.tags = ['game']
handler.command = /^(caklontong|لغز)$/i
handler.onlyprem = true
handler.game = true
export default handler