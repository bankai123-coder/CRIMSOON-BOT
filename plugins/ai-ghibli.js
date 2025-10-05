/* 
• مكون إضافي بنمط Ghibli
• المصدر: https://whatsapp.com/channel/0029VakezCJDp2Q68C61RH2C
• مصدر الكود: https://whatsapp.com/channel/0029Vb5EZCjIiRotHCI1213L
*/

import axios from 'axios'
import { fileTypeFromBuffer } from 'file-type'
import CryptoJS from 'crypto-js'

const ghibli = {
  api: {
    base: 'https://ghibli-image-generator.com',
    imageBase: 'https://imgs.ghibli-image-generator.com',
    endpoints: {
      signed: '/api/trpc/uploads.signedUploadUrl?batch=1',
      create: '/api/trpc/ai.create4oImage?batch=1',
      task: '/api/trpc/ai.getTaskInfo?batch=1'
    }
  },

  headers: {
    'accept': 'application/json',
    'content-type': 'application/json',
    'origin': 'https://ghibli-image-generator.com',
    'referer': 'https://ghibli-image-generator.com/',
    'user-agent': 'Mozilla/5.0'
  },

  axiosInstance: axios.create({
    timeout: 30000,
    validateStatus: status => status >= 200 && status < 300
  }),

  async uploadImage(buffer, ext = 'jpg') {
    const hash = `original/${CryptoJS.SHA256(buffer).toString()}_${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`
    const signed = await ghibli.axiosInstance.post(
      `${ghibli.api.base}${ghibli.api.endpoints.signed}`,
      { "0": { "json": { "path": hash, "bucket": "ghibli-image-generator" } } },
      { headers: ghibli.headers }
    ).then(res => res.data?.[0]?.result?.data?.json)

    if (!signed) throw new Error('فشل في الحصول على عنوان URL للتحميل.')

    await ghibli.axiosInstance.put(signed, buffer, {
      headers: { 'Content-Type': `image/${ext}` }
    })

    return `${ghibli.api.imageBase}/${hash}`
  },

  async generate(imageUrl, prompt = "restyle image in studio ghibli style, keep all details", size = "1:1") {
    const res = await ghibli.axiosInstance.post(
      `${ghibli.api.base}${ghibli.api.endpoints.create}`,
      { "0": { "json": { imageUrl, prompt, size } } },
      { headers: ghibli.headers }
    )

    const taskId = res.data?.[0]?.result?.data?.json?.data?.taskId
    if (!taskId) throw new Error('فشل في الحصول على معرف المهمة.')
    return taskId
  },

  async waitForTask(taskId) {
    let tries = 0
    while (tries < 30) {
      const res = await ghibli.axiosInstance.get(
        `${ghibli.api.base}${ghibli.api.endpoints.task}`,
        {
          params: {
            input: JSON.stringify({ "0": { "json": { taskId } } })
          },
          headers: ghibli.headers
        }
      )

      const data = res.data?.[0]?.result?.data?.json?.data
      if (!data) throw new Error("فشل في استرداد حالة المهمة.")

      if (data.status === 'SUCCESS' && data.successFlag === 1)
        return data.response.resultUrls?.[0]

      if (['FAILED', 'GENERATE_FAILED'].includes(data.status))
        throw new Error("فشل في إنشاء الصورة.")

      await new Promise(res => setTimeout(res, 5000))
      tries++
    }
    throw new Error("انتهت المهلة أثناء انتظار نتيجة الصورة.")
  }
}

const handler = async (m, { conn, command, usedPrefix }) => {
  try {
    const quoted = m.quoted ? m.quoted : m
    const mime = (quoted.msg || quoted).mimetype || ''
    const isImage = mime.startsWith('image/')

    if (!isImage) {
      return await conn.sendMessage(m.chat, {
        text: `أرسل أو رد على صورة مع تعليق *${usedPrefix + command}*`
      }, { quoted: m })
    }

    const buffer = await quoted.download?.()
    if (!buffer) throw new Error('فشل في تنزيل الصورة.')

    const type = await fileTypeFromBuffer(buffer)
    if (!type || !['jpg', 'jpeg', 'png', 'webp'].includes(type.ext)) {
      return await conn.sendMessage(m.chat, {
        text: 'تنسيق الصورة غير مدعوم!'
      }, { quoted: m })
    }

    await conn.sendMessage(m.chat, {
      text: '⏳ جاري تحميل ومعالجة الصورة...'
    }, { quoted: m })

    const imageUrl = await ghibli.uploadImage(buffer, type.ext)
    const taskId = await ghibli.generate(imageUrl)
    const resultUrl = await ghibli.waitForTask(taskId)

    return await conn.sendMessage(m.chat, {
      image: { url: resultUrl },
      caption: '✨ تم تحويل الصورة بنجاح إلى نمط Studio Ghibli!'
    }, { quoted: m })

  } catch (err) {
    return await conn.sendMessage(m.chat, {
      text: `❌ حدث خطأ:\n${err.message}`
    }, { quoted: m })
  }
}

handler.help = ['ghibli']
handler.tags = ['ai']
handler.command = /^ghibli$/i

export default handler