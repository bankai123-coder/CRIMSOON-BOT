
/*
📌 اسم الميزة: تعديل الصورة
🏷️ النوع: مكون إضافي Esm
🔗 المصدر: https://whatsapp.com/channel/0029Vb6Zs8yEgGfRQWWWp639
🔗 مصدر الكود:
https://whatsapp.com/channel/0029VakezCJDp2Q68C61RH2C
طلب: من ngl
✍️ المؤلف: ZenzzXD
*/

import axios from 'axios'
import FormData from 'form-data'

async function editImage(imageBuffer, prompt) {
  const form = new FormData()
  form.append('image', imageBuffer, {
    filename: 'image.png',
    contentType: 'image/png'
  })
  form.append('prompt', prompt)
  form.append('model', 'gpt-image-1')
  form.append('n', '1')
  form.append('size', '1024x1024')
  form.append('quality', 'medium')

  const response = await axios.post(
    'https://api.openai.com/v1/images/edits',
    form,
    {
      headers: {
        ...form.getHeaders(),
        Authorization: `Bearer `
      }
    }
  )

  const base64 = response.data?.data?.[0]?.b64_json
  if (!base64) throw new Error('لا يوجد استجابة من واجهة برمجة تطبيقات OpenAI')
  return Buffer.from(base64, 'base64')
}

const handler = async (m, { conn, text, command }) => {
  if (!text) return m.reply(`مثال: .editfoto حولها إلى أنمي`)

  let q = m.quoted ? m.quoted : m
  let mime = (q.msg || q).mimetype || ''
  if (!mime.startsWith('image/')) return m.reply(`مثال: .editfoto حولها إلى أنمي`)

  try {
    m.reply('انتظر من فضلك')
    let img = await q.download()
    let resultBuffer = await editImage(img, text)
    await conn.sendFile(m.chat, resultBuffer, 'edit.png', 'تم', m)
  } catch (err) {
    m.reply(`حدث خطأ: ${err.message}`)
  }
}

handler.help = ['editfoto <موجه>']
handler.tags = ['ai']
handler.command = ['editfoto']
handler.limit = true
handler.register = true

export default handler
