/*
لا تحذف Wm Bang

* مكونات إضافية لصور Ai ثلاثية الأبعاد Esm *

لا تنس تثبيت وحدة Bing-translate-api أولاً، لماذا؟ لكي تكون دقيقة، لا يمكنك أن تطلب صورة دجاجة وتظهر قردًا

* [المصدر] *
https://whatsapp.com/channel/0029Vb3u2awADTOCXVsvia28

* [مصدر الكشط] *

https://whatsapp.com/channel/0029VamzFetC6ZvcD1qde90Z/4044
*/

import axios from "axios";
import { translate } from 'bing-translate-api';

async function Ai3dGenerator(prompt) {
  try {
    let { data } = await axios.get(`https://api.artvy.ai:444/image_search?query=${encodeURIComponent(prompt + " 3D render, ultra-detailed, cinematic lighting")}`, {
      headers: {
        "Accept": "application/json, text/plain, */*",
        "Content-Type": "application/json",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Cache-Control": "no-cache",
        "Pragma": "no-cache",
        "Accept-Encoding": "gzip, deflate, br",
        "Accept-Language": "en-US,en;q=0.9",
        "Connection": "keep-alive"
      }
    });
    return JSON.stringify(data, null, 2);
  } catch (error) {
    console.error("Error fetching data:", error.response ? error.response.data : error.message);
    return null;
  }
}

const handler = async (m, { conn, text }) => {
  const inputText = text.trim();
  if (!inputText) return m.reply("الرجاء إدخال موجه!\nمثال: .ai3d امرأة تشاهد شروق الشمس");

  try {
    const translatedText = await translate(inputText, null, 'en');
    const englishPrompt = translatedText.translation;

    const jsonResponse = await Ai3dGenerator(englishPrompt);
    if (!jsonResponse) throw new Error("فشل في معالجة الطلب");

    const parsedData = JSON.parse(jsonResponse);
    if (!Array.isArray(parsedData)) throw new Error("استجابة API غير صالحة");
    if (parsedData.length === 0) throw new Error("لم يتم العثور على نتائج");

    const firstImage = parsedData[0]?.image;
    if (!firstImage) throw new Error("لم يتم العثور على عنوان URL للصورة");

    await conn.sendMessage(m.chat, {
      image: { url: firstImage },
      caption: `🎨 عرض ثلاثي الأبعاد: ${inputText}`
    }, { quoted: m });

  } catch (error) {
    console.error("Error:", error);
    m.reply(`❌ خطأ: ${error.message}`);
  }
};

handler.help = ['ai3d <نص>'];
handler.command = ['ai3d'];
handler.tags = ['ai'];
handler.limit = true;
handler.register = true

export default handler;