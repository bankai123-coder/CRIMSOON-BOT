import fs from 'fs'
let timeout = 120000
let poin = 4999
let handler = async (m, { conn, usedPrefix }) => {
    conn.tebakmakanan = conn.tebakmakanan ? conn.tebakmakanan: {}
    let id = m.chat
    if (id in conn.tebakmakanan) return conn.reply(m.chat, 'لا يزال هناك سؤال لم تتم الإجابة عليه في هذه الدردشة', conn.tebakmakanan[id][0])
    let src = JSON.parse(fs.readFileSync('./json/tebakmakanan.json', 'utf-8'))
    let json = src[Math.floor(Math.random() * src.length)]
    let caption = `
${json.deskripsi}

الوقت *${(timeout / 1000).toFixed(2)} ثانية*
اكتب ${usedPrefix}لمحة_طعام للمساعدة
مكافأة: ${poin} XP
`.trim()
    conn.tebakmakanan[id] = [
        await conn.sendFile(m.chat, json.img, 'tebakmakanan.jpg', caption, m),
        json, poin, 4,
        setTimeout(() => {
            if (conn.tebakmakanan[id]) conn.reply(m.chat, `انتهى الوقت!\nالإجابة هي *${json.jawaban}*`, conn.tebakmakanan[id][0])
            delete conn.tebakmakanan[id]
        }, timeout)
    ]
}
handler.help = ['خمن_الطعام']
handler.tags = ['game']
handler.command = /^(tebakmakanan|خمن_الطعام)$/i


export default handler