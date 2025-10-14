import axios from 'axios'

const supportedLanguages = [
  'JavaScript', 'C#', 'C++', 'Java', 'Ruby', 'Go', 'Python', 'Custom'
]

const supportedModels = [
  'gpt-4o-mini', 'gpt-4o', 'gpt-4-turbo',
  'claude-3-opus', 'claude-3-5-sonnet'
]

async function generateCode(prompt, language = 'JavaScript', model = 'gpt-4o-mini') {
  if (!supportedLanguages.includes(language)) {
    return {
      status: false,
      error: `اللغة غير موجودة. اختر واحدة من: ${supportedLanguages.join(', ')}`
    }
  }

  if (!supportedModels.includes(model)) {
    return {
      status: false,
      error: `نموذج الذكاء الاصطناعي غير موجود. اختر واحدًا من: ${supportedModels.join(', ')}`
    }
  }

  const finalPrompt = language === 'Custom'
    ? prompt
    : `اكتب كودًا بلغة ${language} لـ: ${prompt}`

  try {
    const response = await axios.post(
      'https://best-ai-code-generator.toolzflow.app/api/chat/public',
      {
        chatSettings: {
          model: model,
          temperature: 0.3,
          contextLength: 16385,
          includeProfileContext: false,
          includeWorkspaceInstructions: false,
          includeExampleMessages: false
        },
        messages: [
          {
            role: 'system',
            content: 'أنت مساعد مفيد يكتب التعليمات البرمجية باللغة المطلوبة.'
          },
          {
            role: 'user',
            content: finalPrompt
          }
        ],
        response_format: {
          type: 'json_schema',
          json_schema: {
            name: 'code_response',
            strict: true,
            schema: {
              type: 'object',
              properties: {
                code: { type: 'string', description: 'Generated code' }
              },
              required: ['code']
            }
          }
        }
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Origin': 'https://best-ai-code-generator.toolzflow.app',
          'Referer': 'https://best-ai-code-generator.toolzflow.app/',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
          'Accept': '*/*'
        }
      }
    )

    const rawCode = response.data?.code || ''
    const formattedCode = rawCode
      .replace(/\\n/g, '\n')
      .replace(/\\t/g, '\t')
      .replace(/\\"/g, '"')

    return {
      status: true,
      code: formattedCode.trim() || 'لم يتم إنشاء أي رمز.'
    }
  } catch (e) {
    return {
      status: false,
      error: `فشل الطلب: ${e.message}`
    }
  }
}

// handler command
let handler = async (m, { conn, text, usedPrefix, command }) => {
  await conn.sendMessage(m.chat, { react: { text: "⏳", key: m.key } })

  if (!text) throw `مثال:\n${usedPrefix + command} إنشاء تحقق otp|Python|gpt-4o-mini`

  let [prompt, language = 'JavaScript', model = 'gpt-4o-mini'] = text.split('|').map(v => v.trim())

  let res = await generateCode(prompt, language, model)

  if (!res.status) {
    await conn.sendMessage(m.chat, { react: { text: "❌", key: m.key } })
    throw res.error
  }

  await conn.sendMessage(m.chat, { react: { text: "✅", key: m.key } })
  await conn.reply(m.chat, `*نتيجة الكود:*\n\n\`\`\`${res.code}\`\`\``, m)
}

handler.help = ['aicode'].map(v => v + ' <موجه>|<لغة>|<نموذج>')
handler.tags = ['ai']
handler.command = /^aicode$/i
handler.limit = true
handler.register = true

export default handler