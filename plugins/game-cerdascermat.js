/*
- Name : Cerdas Cermat Anak SD
- Deks : Ha
- Follow Bang : https://whatsapp.com/channel/0029Vb6D8o67YSd1UzflqU1d
- Yang Punya Anunya : https://whatsapp.com/channel/0029Vaq9pCUEawdzlDYdYF3p/1118
*/
import axios from 'axios'

const subjects = [
  'bindo', 'tik', 'pkn', 'bing', 'penjas',
  'pai', 'matematika', 'jawa', 'ips', 'ipa'
]

const motivationalPhrases = {
  0: 'يا إلهي، تحتاج إلى الدراسة بجدية أكبر!',
  1: 'لا يزال هناك الكثير لتتعلمه!',
  2: 'ليس سيئًا، ولكن يمكن أن يكون أفضل!',
  3: 'جيد، استمر في ذلك!',
  4: 'نصف الإجابات صحيحة تقريبًا، استمر!',
  5: 'لقد وصلت إلى منتصف الطريق! تحسن أكثر!',
  6: 'جيد جدًا!',
  7: 'ممتاز!',
  8: 'شبه مثالي!',
  9: 'شبه مثالي! القليل فقط متبقي!',
  10: 'مثالي! لقد أتقنت هذا الموضوع حقًا!'
}

let handler = async (m, { conn, args, command }) => {
  conn.cerdasCermat = conn.cerdasCermat || {}
  
  if (conn.cerdasCermat[m.sender]) return m.reply('أنت تلعب حاليًا مسابقة الذكاء، أكمل السؤال أولاً')
  
  const [matapelajaran, jumlahSoal] = args.map(arg => arg.toLowerCase())
  
  if (!subjects.includes(matapelajaran)) return m.reply(`اختر المادة وعدد الأسئلة\n\n*المواد المتاحة*\n- ips (علوم اجتماعية)\n- ipa (علوم طبيعية)\n- bindo (لغة إندونيسية)\n- pai (تربية إسلامية)\n- jawa (لغة جاوية)\n- bing (لغة إنجليزية)\n- penjas (تربية بدنية)\n- matematika (رياضيات)\n- tik (تكنولوجيا المعلومات والاتصالات)\n- pkn (تربية مدنية)\n\n*الحد الأدنى لعدد الأسئلة 5 والحد الأقصى 10*\n\n*مثال:* .مسابقة ipa 5`)
  
  const soalCount = parseInt(jumlahSoal)
  if (isNaN(soalCount)) return m.reply('يجب أن يكون عدد الأسئلة رقمًا!')
  if (soalCount < 5 || soalCount > 10) return m.reply('يجب أن يكون عدد الأسئلة بين 5 و 10!')
  
  try {
    const { data } = await axios.get(`https://api.siputzx.my.id/api/games/cc-sd?matapelajaran=${matapelajaran}&jumlahsoal=${soalCount}`)
    
    conn.cerdasCermat[m.sender] = {
      questions: data.data.soal,
      currentQuestion: 0,
      correctAnswers: 0,
      startTime: Date.now(),
      answered: false
    }
    
    await sendQuestion(conn, m)
    
  } catch (error) {
    console.error(error)
    m.reply('خطأ :>')
  }
}

handler.command = ['cerdascermat', 'cc', 'مسابقة']
handler.tags = ['game', 'education']
handler.help = ['مسابقة <المادة> <عدد_الأسئلة>', 'cc <المادة> <عدد_الأسئلة>']
handler.example = ['مسابقة رياضيات 5', 'cc ipa 7']

handler.before = async (m, { conn }) => {
  if (!m.text || m.isBaileys || m.fromMe) return
  
  conn.cerdasCermat = conn.cerdasCermat || {}
  const session = conn.cerdasCermat[m.sender]
  if (!session) return
  
  const isReply = m.quoted && m.quoted.id === session.lastQuestionId
  
  if (!isReply && !session.answered) return m.reply('يرجى الإجابة على السؤال السابق بالرد على رسالة البوت!')
  
  session.answered = true
  
  const userAnswer = m.text.trim().toLowerCase()
  const currentQuestion = session.questions[session.currentQuestion]
  const correctAnswer = currentQuestion.jawaban_benar.toLowerCase()
  
  const options = currentQuestion.semua_jawaban.map(j => Object.keys(j)[0].toLowerCase())
  if (!options.includes(userAnswer)) return m.reply(`إجابة غير صالحة. اختر واحدة من: ${options.join(', ')}`)
  
  if (userAnswer === correctAnswer) {
    session.correctAnswers++
    await m.reply('إجابة صحيحة!')
  } else {
    await m.reply(`إجابة خاطئة! الإجابة الصحيحة هي ${correctAnswer.toUpperCase()}`)
  }
  
  session.currentQuestion++
  
  if (session.currentQuestion < session.questions.length) {
    await sendQuestion(conn, m)
    session.answered = false
  } else {
    const totalQuestions = session.questions.length
    const score = session.correctAnswers
    const percentage = Math.round((score / totalQuestions) * 100)
    const phraseKey = Math.min(score, 10)
    
    await m.reply(`
نتيجة مسابقة الذكاء
    
الإجابات الصحيحة: ${score}/${totalQuestions}
الدرجة: ${percentage}%
    
${motivationalPhrases[phraseKey]}
    `.trim())
    
    delete conn.cerdasCermat[m.sender]
  }
}

async function sendQuestion(conn, m) {
  const session = conn.cerdasCermat[m.sender]
  const questionData = session.questions[session.currentQuestion]
  
  let questionText = `السؤال ${session.currentQuestion + 1}/${session.questions.length}\n\n${questionData.pertanyaan}\n\n`
  questionData.semua_jawaban.forEach(option => {
    const [key, value] = Object.entries(option)[0]
    questionText += `${key.toUpperCase()}. ${value}\n`
  })
  
  const sentMsg = await conn.sendMessage(m.chat, {
    text: questionText + '\nالرجاء الرد على هذه الرسالة للإجابة على الخيار المتاح [أ ، ب ، ج ، د]',
    replyTo: m.id
  })
  
  session.lastQuestionId = sentMsg.key.id
}

export default handler