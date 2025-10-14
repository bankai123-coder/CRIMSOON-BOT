let handler = async (m, { conn }) => {
    conn.game = conn.game ? conn.game : {}
    let id = 'tebakgame-' + m.chat
    if (!(id in conn.game)) return
    let json = conn.game[id][1]
    m.reply('لمحة : ' + '```' + json.jawaban.replace(/[AIUEOaiueo]/ig, '_') + '```' + '\n\n_*لا ترد على هذه الرسالة ولكن أجب على السؤال*_')
}
handler.command = /^لمحة_لعبة$/i
handler.limit = true
export default handler