let handler = async (m, { conn }) => {
    conn.caklontong = conn.caklontong ? conn.caklontong : {}
    let id = m.chat
    if (!(id in conn.caklontong)) throw false
    let json = conn.caklontong[id][1]
    let ans = json.jawaban
    let clue = ans.replace(/[AIUEO]/gi, '_')
    m.reply('```' + clue + '```' + '\n\n*لا ترد على هذه الرسالة، بل أجب على السؤال مباشرة*')
}

handler.command = /^(calo|مساعدة)$/i
handler.limit = true

export default handler