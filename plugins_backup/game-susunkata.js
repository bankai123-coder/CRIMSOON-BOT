import fs from 'fs'
let timeout = 180000
let money = 5000
let limit = 1
let handler = async (m, { conn, usedPrefix, command }) => {
    conn.game = conn.game ? conn.game: {}
    let id = 'susunkata-' + m.chat
    if (!(id in conn.game)) {
        let src = JSON.parse(fs.readFileSync('./json/susunkata.json', 'utf-8'))
        let json = src[Math.floor(Math.random() * src.length)]
        let caption = `
${json.soal}

📮 النوع: ${json.tipe}
⏳ الوقت: *${(timeout / 1000).toFixed(2)} ثانية*
💬 اكتب ${usedPrefix}لمحة للمساعدة
➕ المكافأة: ${money} مال
🎟️ الحد: ${limit} حد
`.trim()
        conn.game[id] = [
            await conn.reply(m.chat, caption, m),
            json, money,
            setTimeout(() => {
                if (conn.game[id]) conn.reply(m.chat, `انتهى الوقت!\n📑الإجابة هي *${json.jawaban}*`, conn.game[id][0])
                delete conn.game[id]
            }, timeout)
        ]
    } else conn.reply(m.chat, '*لا يزال هناك سؤال لم تتم الإجابة عليه في هذه الدردشة!!* ', conn.game[id][0])

}
handler.help = ['رتب_الكلمات']
handler.tags = ['game']
handler.command = /^(susunkata|sskata|رتب_الكلمات)$/i

handler.limit = true
handler.game = true
handler.onlyprem = true

export default handler