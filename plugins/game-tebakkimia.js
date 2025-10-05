import fetch from 'node-fetch'

let handler = async (m, { conn }) => {
  try {
    let res = await fetch('https://api.sxtream.xyz/games/tebakkimia')
    let json = await res.json()

    if (!json || !json.pertanyaan) throw 'لم يتم العثور على بيانات.'

    // Simpan jawaban ke sesi sementara (gunakan global)
    conn.tebakkimia = conn.tebakkimia || {}
    conn.tebakkimia[m.chat] = {
      jawaban: json.jawaban.toLowerCase(),
      timeout: setTimeout(() => {
        if (conn.tebakkimia[m.chat]) {
          m.reply(`⏰ انتهى الوقت!\nالإجابة الصحيحة هي *${json.jawaban}*`)
          delete conn.tebakkimia[m.chat]
        }
      }, 60_000) // 1 menit
    }

    m.reply(`🧪 *خمن الرمز الكيميائي!*\n\n${json.pertanyaan}\n\n⏳ أجب في غضون 60 ثانية بإرسال رمز العنصر.`)

  } catch (e) {
    console.error(e)
    m.reply('❌ فشل في جلب سؤال تخمين الكيمياء.')
  }
}

handler.help = ['خمن_الكيمياء']
handler.tags = ['game']
handler.command = /^(tebakkimia|خمن_الكيمياء)$/i
handler.limit = true

export default handler