/*
* لا تقم بإزالة العلامة المائية.
*
* إضافة تحميل من انستقرام (ESM)*
*
* تدعم الفيديو والصور *
*
* [المصدر] *
* https://whatsapp.com/channel/0029Vb3u2awADTOCXVsvia28
*
* [مصدر الكود] *
* Rian
* [المترجم والمعدل] *
* Hilman
*/

import axios from 'axios';
import crypto from 'crypto';

// --- Funciones de la API (sin cambios) ---
async function tm() {
    try {
        const { data } = await axios.get('https://sssinstagram.com/msec');
        return Math.floor(data.msec * 1000);
    } catch (error) {
        console.error('Error fetching time:', error);
        return Date.now();
    }
}

async function generateSignature(url, secretKey) {
    const time = await tm();
    const ab = Date.now() - (time ? Date.now() - time : 0);
    const hashString = `${url}${ab}${secretKey}`;
    const signature = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(hashString))
      .then(buffer => Array.from(new Uint8Array(buffer)).map(b => b.toString(16).padStart(2, '0')).join(''));
    return { signature, ab, time };
}

async function ssig(url) {
    const secretKey = '19e08ff42f18559b51825685d917c5c9e9d89f8a5c1ab147f820f46e94c3df26';
    const { signature, ab, time } = await generateSignature(url, secretKey);
    const requestData = { url, ts: ab, _ts: Date.now(), _tsc: time ? Date.now() - time : 0, _s: signature };
    const headers = {
        'Accept': 'application/json, text/plain, */*',
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Referer': 'https://sssinstagram.com/',
        'Origin': 'https://sssinstagram.com/'
    };
    try {
        const { data } = await axios.post('https://sssinstagram.com/api/convert', requestData, { headers });
        return data;
    } catch (error) {
        console.error('Error en ssig:', error.response ? error.response.data : error.message);
        return { error: 'فشل في جلب البيانات' };
    }
}
// --- Fin de las funciones de la API ---

const handler = async (m, { conn, args, usedPrefix, command }) => {
    if (!args[0]) return m.reply(`*يرجى إدخال رابط انستقرام.*\n*مثال:* ${usedPrefix + command} https://www.instagram.com/p/xxxxx/`);

    await m.react('⏳');

    try {
        const result = await ssig(args[0]);
        if (result.error) throw new Error(result.error);

        const mediaArray = Array.isArray(result) ? result : [result];
        let captionSent = false;

        for (const item of mediaArray) {
            const meta = item.meta || {};
            const caption = captionSent ? '' : `
*「 📥 تحميل انستقرام 」*

*👤 اسم المستخدم:* ${meta.username || '-'}
*❤️ الإعجابات:* ${meta.like_count || 0}
*💬 التعليقات:* ${meta.comment_count || 0}

*📝 الوصف:* ${(meta.title || '-').slice(0, 500)}
            `.trim();

            const url = item.url?.[0]?.url || item.thumb;
            if (!url) continue;

            if (item.url?.[0]?.ext === 'mp4') {
                await conn.sendMessage(m.chat, { video: { url }, caption }, { quoted: m });
            } else {
                await conn.sendMessage(m.chat, { image: { url }, caption }, { quoted: m });
            }
            captionSent = true;
            await new Promise(resolve => setTimeout(resolve, 1000)); // تأخير بسيط بين الرسائل
        }

        await m.react('✅');

    } catch (error) {
        console.error(error);
        await m.react('❌');
        m.reply(`*حدث خطأ!*\nيرجى التحقق من الرابط أو المحاولة مرة أخرى لاحقًا.\n*الخطأ:* ${error.message}`);
    }
};

handler.help = ['igdl <url>', 'انستقرام <رابط>'];
handler.command = ['igdl', 'ig', 'instagram', 'انستقرام', 'انستا'];
handler.tags = ['downloader'];
handler.limit = true;

export default handler;
