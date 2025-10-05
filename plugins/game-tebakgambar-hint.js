let handler = async (m, { conn }) => {
    conn.game = conn.game ? conn.game : {}
    let id = 'tebakgambar-' + m.chat
    if (!(id in conn.game)) throw false
    let json = conn.game[id][1]
    m.reply('لمحة : ' + '```' + json.jawaban.replace(/[AIUEOaiueo]/ig, '_') + '```' + '\n\n_*لا ترد على هذه الرسالة ولكن أجب على السؤال*_')
}
handler.command = /^لمحة_صورة$/i
handler.limit = true
export default handler