import { createHash } from 'crypto'

let handler = async function (m, { args }) {
  if (!args[0]) throw 'الرقم التسلسلي فارغ'
  let user = global.db.data.users[m.sender]
  let sn = createHash('md5').update(m.sender).digest('hex')
  if (args[0] !== sn) throw 'الرقم التسلسلي خاطئ'
  user.registered = false
  m.reply('```تم إلغاء التسجيل بنجاح !```')
}
handler.help = ['unreg <الرقم التسلسلي>', 'إلغاء_التسجيل <الرقم التسلسلي>']
handler.tags = ['main']
handler.command = /^(unreg(ister)?|إلغاء_التسجيل)$/i
handler.register = true

export default handler