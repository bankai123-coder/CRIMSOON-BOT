import { createHash } from 'crypto'
let handler = async (m, { text, usedPrefix }) => {
let user = global.db.data.users[m.sender]
if(user.registered !== false) throw 'لقد قمت بالتسجيل بالفعل!!\nهل تريد إعادة التسجيل؟ اكتب إلغاء التسجيل'
    user.registered = true
    let sn = createHash('md5').update(m.sender).digest('hex')
    let p = `*تهانينا لقد تم تسجيلك بنجاح ✅*\n•اكتب menu للمتابعة\n\n•الرقم التسلسلي الخاص بك: *${sn}*\n\nتابعنا على واتساب: https://whatsapp.com/channel/0029Vb6gsqN8fewx89iCtV19`
    const arr = [
        { text: `*[ ت ]*\n\n${p}`, timeout: 100 },
        { text:  `*[ تَ ]*\n\n${p}`, timeout: 100 },
        { text:  `*[ تَأْ ]*\n\n${p}`, timeout: 100 },
        { text:  `*[ تَأْكِ ]*\n\n${p}`, timeout: 100 },
        { text:  `*[ تَأْكِي ]*\n\n${p}`, timeout: 100 },
        { text:  `*[ تَأْكِيد ]*\n\n${p}`, timeout: 100 },
        { text:  `*[ تَأْكِيد   ا ]*\n\n${p}`, timeout: 100 },
        { text:  `*[ تَأْكِيد   ال ]*\n\n${p}`, timeout: 100 },
        { text:  `*[ تَأْكِيد   التَّ ]*\n\n${p}`, timeout: 100 },
        { text:  `*[ تَأْكِيد   التَّسْ ]*\n\n${p}`, timeout: 100 },
        { text:  `*[ تَأْكِيد   التَّسْجِ ]*\n\n${p}`, timeout: 100 },
        { text:  `*[ تَأْكِيد   التَّسْجِي ]*\n\n${p}`, timeout: 100 },
        { text:  `*[ تَأْكِيد   التَّسْجِيل ]*\n\n${p}`, timeout: 100 },
    ];

    const lll = await conn.sendMessage(m.chat, { text: 'يتم التحقق....' }, { quoted: m });

    for (let i = 0; i < arr.length; i++) {
        await new Promise(resolve => setTimeout(resolve, arr[i].timeout));
        await conn.relayMessage(m.chat, {
            protocolMessage: {
                key: lll.key,
                type: 14,
                editedMessage: {
                    conversation: arr[i].text
                }
            }
        }, {});
    }
}

handler.help = ['@تأكيد']
handler.tags = ['main']
handler.customPrefix = /^(@تأكيد)$/i
handler.command = new RegExp

export default handler