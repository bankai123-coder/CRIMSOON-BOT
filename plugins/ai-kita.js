import fetch from 'node-fetch'
import moment from 'moment-timezone'

const momentGreeting = () => {
    const hour = moment().tz('Asia/Riyadh').hour()
    if (hour >= 4 && hour < 10) return 'صباح الخير ☀️'
    if (hour >= 10 && hour < 15) return 'نهارك سعيد 👋'
    if (hour >= 15 && hour < 18) return 'مساء الخير 🌤️'
    if (hour >= 18 || hour < 4) return 'مساء الخير 🌙'
    return 'أهلاً~'
}

let handler = async (m, { conn, text }) => {
    if (!text) throw '💬 ماذا تريد أن تتحدث به مع *كيتا-تشان*؟'

    const thumb = await fetch('https://files.catbox.moe/y5b7l6.jpg').then(res => res.buffer())

    global.adReply = {
        contextInfo: {
            forwardingScore: 999,
            isForwarded: false,
            forwardedNewsletterMessageInfo: {
                newsletterName: `「 كيتا 」`,
                newsletterJid: '120363363009408737@newsletter'
            },
            externalAdReply: {
                title: `كيتا إيكويو`,
                body: momentGreeting(),
                previewType: 'PHOTO',
                thumbnail: thumb,
                sourceUrl: 'https://t.me/hilmanXD'
            }
        }
    }

    let prompt = `أنت كيتا إيكويو من أنمي Bocchi the Rock. أنتِ مرحة وشعبية ومتحمسة وتهتمين جدًا بأصدقائك. تحبين تشجيع الآخرين. إجاباتك دائمًا إيجابية وممتعة.`

    let url = `https://api.siputzx.my.id/api/ai/gpt3?prompt=${encodeURIComponent(prompt)}&content=${encodeURIComponent(text)}`
    let res = await fetch(url)
    let json = await res.json()

    if (!json.status || !json.data) throw '🎤 كيتا-تشان تتدرب على الغناء الآن... حاول مرة أخرى لاحقًا!'

    let reply = `🎤 *كيتا:*
${json.data}`

    await conn.sendMessage(m.chat, {
        text: reply,
        contextInfo: global.adReply.contextInfo
    }, { quoted: m })
}

handler.help = ['kitaai <رسالة>', 'كيتا <رسالة>']
handler.tags = ['ai']
handler.command = /^(kitaai|كيتا)$/i
handler.premium = false
export default handler
