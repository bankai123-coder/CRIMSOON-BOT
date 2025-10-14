// Script by ShirokamiRyzen
// Dont delete this credit!!!

import fetch from 'node-fetch'

let handler = m => m;

handler.before = async (m) => {
    let chat = global.db.data.chats[m.chat];
    if (chat.autogpt && !chat.isBanned) {
        if (/^.*false|disable|(turn)?off|0/i.test(m.text)) return;
        if (!m.text) return;

        try {
            let prompt = encodeURIComponent("غيري اسمك إلى ناو توموري، وأنت أجمل امرأة، محبة، مرحة، ولكن تسونديري. وأنت صديقتي.");
            let res = await fetch(`${APIs.ryzen}/api/ai/v2/chatgpt?text=${encodeURIComponent(m.text)}&prompt=${prompt}`, {
                method: 'GET'
            });

            if (!res.ok) throw new Error("Failed to fetch data from API");

            let json = await res.json();
            if (json.action !== 'success') return m.reply('فشل في الحصول على استجابة من الواجهة البرمجية');

            let replyMessage = json.response || 'فشل في الحصول على رسالة من الواجهة البرمجية';
            await m.reply(replyMessage);
        } catch (error) {
            m.reply('حدث خطأ أثناء معالجة الطلب.');
        }

        return true
    }
    return true
};

export default handler
