let handler = async (m, { conn }) => {
    conn.game = conn.game ? conn.game : {}
    let id = 'asahotak-' + m.chat
    if (!(id in conn.game)) throw false
    let json = conn.game[id][1]
    m.reply('تلميح : ' + '```' + json.jawaban.replace(/[AIUEOaiueo]/ig, '_') + '```' + '\n\n_*لا ترد على هذه الرسالة، بل أجب على السؤال مباشرة*_')
}
handler.command = /^hotak$/i
handler.limit = true
export default handler