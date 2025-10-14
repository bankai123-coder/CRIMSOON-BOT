import axios from 'axios';

let handler = async (m, { conn, text, usedPrefix, command }) => {
    try {
        // التحقق من وجود النص
        if (!text) throw `╔═══❰ 🤖 الذكاء الاصطناعي ❱═══╗
║ 
║ ❌ يرجى كتابة سؤالك!
║ 
║ 📝 مثال:
║ ${usedPrefix + command} اكتب كود HTML
║ ${usedPrefix + command} ما هو الذكاء الاصطناعي؟
║ 
╚═══════════════════╝`;

        // إظهار تفاعل المعالجة
        await conn.sendMessage(m.chat, { react: { text: '🤖', key: m.key } });

        // استدعاء GPT API
        const response = await axios.get(`https://api.dreaded.site/api/chatgpt?text=${encodeURIComponent(text)}`);
        
        if (response.data && response.data.success && response.data.result) {
            const answer = response.data.result.prompt;
            
            const finalMessage = `╔═══❰ 🤖 جي بي تي ❱═══╗
║
${answer.split('\n').map(line => `║ ${line}`).join('\n')}
║
╚═══════════════════╝`;
            
            await conn.reply(m.chat, finalMessage, m);
        } else {
            throw 'فشل في الحصول على رد من الـ API';
        }

    } catch (err) {
        console.error('خطأ في GPT:', err);
        await conn.reply(m.chat, `╔═══❰ ⚠️ خطأ ❱═══╗
║
║ ❌ فشل في الحصول على الرد
║ 🔄 حاول مرة أخرى لاحقاً
║
╚═══════════════════╝`, m);
    }
};

handler.help = ['جيبيتي <سؤال>', 'ذكاء <سؤال>'];
handler.tags = ['ai'];
handler.command = /^(جيبيتي|ذكاء|gpt|chatgpt|ai)$/i;

export default handler;
