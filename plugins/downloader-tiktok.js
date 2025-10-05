/*
* اسم الميزة: تحميل تيك توك
* النوع: إضافة ESM
* المصدر: https://whatsapp.com/channel/0029Vb6Zs8yEgGfRQWWWp639
* المؤلف: ZenzzXD
* المترجم والمعدل: Hilman
 */

import axios from 'axios';
import cheerio from 'cheerio';
import FormData from 'form-data';
import moment from 'moment-timezone';

async function tiktokV1(query) {
  const encodedParams = new URLSearchParams();
  encodedParams.set('url', query);
  encodedParams.set('hd', '1');

  const { data } = await axios.post('https://tikwm.com/api/', encodedParams, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
      'Cookie': 'current_language=en',
      'User-Agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Mobile Safari/537.36'
    }
  });

  return data;
}

async function tiktokV2(query) {
  const form = new FormData();
  form.append('q', query);

  const { data } = await axios.post('https://savetik.co/api/ajaxSearch', form, {
    headers: {
      ...form.getHeaders(),
      'Accept': '*/*',
      'Origin': 'https://savetik.co',
      'Referer': 'https://savetik.co/en2',
      'User-Agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Mobile Safari/537.36',
      'X-Requested-With': 'XMLHttpRequest'
    }
  });

  const rawHtml = data.data;
  const $ = cheerio.load(rawHtml);
  const title = $('.thumbnail .content h3').text().trim();
  const thumbnail = $('.thumbnail .image-tik img').attr('src');
  const video_url = $('video#vid').attr('data-src');

  const slide_images = [];
  $('.photo-list .download-box li').each((_, el) => {
    const imgSrc = $(el).find('.download-items__thumb img').attr('src');
    if (imgSrc) slide_images.push(imgSrc);
  });

  return { title, thumbnail, video_url, slide_images };
}

const handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) return m.reply(`*أين الرابط؟*\nمثال: ${usedPrefix + command} https://vt.tiktok.com/xxxxxx`);

  await m.reply('⏳ جارٍ التحميل، يرجى الانتظار...');

  try {
    let res;
    let images = [];

    const dataV1 = await tiktokV1(text);
    if (dataV1?.data) {
      const d = dataV1.data;
      if (Array.isArray(d.images) && d.images.length > 0) {
        images = d.images;
      }
      res = {
        title: d.title,
        region: d.region,
        duration: d.duration,
        create_time: d.create_time,
        play_count: d.play_count,
        digg_count: d.digg_count,
        comment_count: d.comment_count,
        share_count: d.share_count,
        download_count: d.download_count,
        author: {
          unique_id: d.author?.unique_id,
          nickname: d.author?.nickname
        },
        music_info: {
          title: d.music_info?.title,
          author: d.music_info?.author
        },
        cover: d.cover,
        play: d.play,
        hdplay: d.hdplay,
        wmplay: d.wmplay
      };
    }

    const dataV2 = await tiktokV2(text);
    if ((!res?.play && images.length === 0) && dataV2.video_url) {
      res = res || { play: dataV2.video_url };
    }
    if (Array.isArray(dataV2.slide_images) && dataV2.slide_images.length > 0) {
      images = dataV2.slide_images;
    }

    if (images.length > 0) {
      await m.reply(`✅ تم اكتشاف ${images.length} صورة، جارٍ إرسالها...`);
      for (const img of images) {
        await conn.sendMessage(m.chat, {
          image: { url: img },
          caption: res.title || ''
        }, { quoted: m });
      }
      return;
    }

    const time = res.create_time
      ? moment.unix(res.create_time).tz('Asia/Riyadh').locale('ar').format('dddd، D MMMM YYYY، الساعة HH:mm:ss')
      : '-';

    const caption = `
*「 📥 تحميل تيك توك 」*

*📝 العنوان:* ${res.title || '-'}
*🌍 المنطقة:* ${res.region || 'غير معروف'}
*⏳ المدة:* ${res.duration || '-'} ثانية
*🗓️ تاريخ الرفع:* ${time}

*📊 الإحصائيات:*
- *المشاهدات:* ${res.play_count || 0}
- *الإعجابات:* ${res.digg_count || 0}
- *التعليقات:* ${res.comment_count || 0}
- *المشاركات:* ${res.share_count || 0}
- *التنزيلات:* ${res.download_count || 0}

*👤 المؤلف:*
- *اسم المستخدم:* ${res.author?.unique_id || '-'}
- *الاسم:* ${res.author?.nickname || '-'}
    `.trim();

    const videoUrl = res.play || res.hdplay || res.wmplay;
    if (videoUrl) {
      await conn.sendMessage(m.chat, { video: { url: videoUrl }, caption: caption }, { quoted: m });
    } else {
        m.reply('لم يتم العثور على الفيديو. قد يكون الرابط غير صالح أو أن الفيديو خاص.');
    }

  } catch (e) {
    m.reply(`حدث خطأ: ${e.message}`);
  }
};

handler.command = ['tiktok', 'tt', 'ttdl', 'تيك_توك'];
handler.help = ['tiktok <url>', 'تيك_توك <رابط>'];
handler.tags = ['downloader'];
handler.limit = true;

export default handler;
