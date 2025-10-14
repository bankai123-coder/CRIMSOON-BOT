/*
Colorify AI image to ghibli+anime, bisa pake promt juga

type : plugins esm 
sumber :
https://whatsapp.com/channel/0029VbAYjQgKrWQulDTYcg2K
sumber scrape :
https://whatsapp.com/channel/0029VbANq6v0VycMue9vPs3u/224
*/

import ws from 'ws'
import { randomBytes } from 'crypto'

const changestyle = async (buffer, style = 'anime', prompt = '(masterpiece), best quality') => {
  const _style = {
    anime: [],
    ghibli: ['ghibli_style_offset:0.8']
  }

  if (!buffer || !Buffer.isBuffer(buffer)) throw new Error('❌ مخزن الصور المؤقت مطلوب')
  if (!Object.keys(_style).includes(style)) throw new Error(`❌ الأنماط المتاحة: ${Object.keys(_style).join(', ')}`)

  const session_hash = randomBytes(8).toString('hex')
  const socket = new ws('wss://colorifyai.art/demo-auto-coloring/queue/join')

  return new Promise((resolve, reject) => {
    socket.on('message', (data) => {
      const d = JSON.parse(data.toString('utf8'))

      if (d.msg === 'send_hash') {
        socket.send(JSON.stringify({ session_hash }))
      } else if (d.msg === 'send_data') {
        socket.send(JSON.stringify({
          data: {
            lora: _style[style],
            source_image: `data:image/jpeg;base64,${buffer.toString('base64')}`,
            prompt,
            request_from: 10
          }
        }))
      } else if (d.msg === 'process_completed') {
        socket.close()
        resolve(`https://temp.colorifyai.art/${d.output.result[0]}`)
      } else if (d.msg === 'queue_full') {
        socket.close()
        reject(new Error('❌ قائمة الانتظار ممتلئة، حاول مرة أخرى بعد قليل.'))
      }
    })

    socket.on('error', (err) => {
      reject(err)
    })
  })
}

let handler = async (m, { conn, args, usedPrefix, command }) => {
  try {
    if (!m.quoted || !/image/.test(m.quoted.mimetype)) {
      return m.reply(`📸 قم بالرد على الصورة بالأمر:\n${usedPrefix + command} [anime/ghibli] [موجه اختياري]\n\nمثال:\n${usedPrefix + command} ghibli مشهد غروب الشمس الجميل`)
    }

    await conn.sendMessage(m.chat, { react: { text: '⏳', key: m.key } })

    const qimg = await m.quoted.download()
    const style = (args[0] || 'anime').toLowerCase()
    const prompt = args.slice(1).join(' ') || '(masterpiece), best quality'

    const result = await changestyle(qimg, style, prompt)

    await conn.sendMessage(m.chat, {
      image: { url: result },
      caption: `✅ نمط *${style}*\n🎨 موجه: ${prompt}`
    }, { quoted: m })

    await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } })
  } catch (e) {
    console.error(e)
    await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } })
    m.reply(e.message)
  }
}

handler.help = ['colorify [anime/ghibli] [prompt]']
handler.tags = ['ai', 'image']
handler.command = /^colorify$/i
handler.limit = true
handler.register = true

export default handler