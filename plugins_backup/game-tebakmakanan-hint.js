let handler = async (m, { conn }) => {
    conn.tebakmakanan = conn.tebakmakanan ? conn.tebakmakanan : {}
    let id = m.chat
    if (!(id in conn.tebakmakanan)) return
    let json = conn.tebakmakanan[id][1]
    m.reply('لمحة : ' + '```' + json.jawaban.replace(/[AIUEOaiueo]/ig, '_') + '```' + '\n\n_*لا ترد على هذه الرسالة ولكن أجب على السؤال*_')
}
handler.command = /^لمحة_طعام$/i
handler.limit = true
export default handler