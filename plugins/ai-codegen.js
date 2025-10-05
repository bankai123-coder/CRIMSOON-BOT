/*
✨ YuriPuki
💫 اسم الميزة: Codegen
🤖 النوع: مكون إضافي Esm
🔗 المصدر: https://whatsapp.com/channel/0029VbATaq46BIErAvF4mv2c
*/

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
      error: `اللغة غير موجودة. استخدم إحدى اللغات التالية: ${supportedLanguages.join(', ')}`
    }
  }

  if (!supportedModels.includes(model)) {
    return {
      status: false,
      error: `نموذج الذكاء الاصطناعي غير موجود. اختر أحد النماذج التالية: ${supportedModels.join(', ')}`
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
          'User-Agent': 'Mozilla/5.0',
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

const handler = async (m, { text, args }) => {
  const [lang = 'JavaScript', model = 'gpt-4o-mini', ...promptArr] = args
  const prompt = promptArr.join(' ')

  if (!prompt) {
    return m.reply(`✏️ مثال:\n.codegen Python gpt-4o-mini إنشاء دالة التحقق من صحة otp`)
  }

  const result = await generateCode(prompt, lang, model)
  if (!result.status) return m.reply(`❌ ${result.error}`)

  m.reply(`📦 نتيجة إنشاء الكود:\n\n\`\`\`${lang}\n${result.code}\n\`\`\``)
}

handler.help = ['codegen <لغة> <نموذج> <موجه>']
handler.tags = ['tools', 'ai']
handler.command = ['codegen']
handler.limit = true 
handler.register = true

export default handler