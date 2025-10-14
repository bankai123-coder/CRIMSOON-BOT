import axios from "axios";
import yts from "yt-search";

// Supported audio and video formats (internal use)
const formatAudio = ['mp3', 'm4a', 'webm', 'acc', 'flac', 'opus', 'ogg', 'wav'];
const formatVideo = ['360', '480', '720', '1080', '1440', '4k'];

// Downloader utility
const ddownr = {
  download: async (url, format) => {
    if (!formatAudio.includes(format) && !formatVideo.includes(format)) {
      throw new Error('التنسيق غير مدعوم.');
    }
    const { data } = await axios.get(`https://p.oceansaver.in/ajax/download.php?format=${format}&url=${encodeURIComponent(url)}&api=dfcb6d76f2f6a9894gjkege8a4ab232222`, { headers: { 'User-Agent': 'Mozilla/5.0' } });
    if (data && data.success) {
      const { id, title, info } = data;
      const downloadUrl = await ddownr.cekProgress(id);
      return { id, title, image: info.image, downloadUrl };
    } else {
      throw new Error('فشل في جلب تفاصيل الفيديو.');
    }
  },
  cekProgress: async (id) => {
    while (true) {
      const { data } = await axios.get(`https://p.oceansaver.in/ajax/progress.php?id=${id}`, { headers: { 'User-Agent': 'Mozilla/5.0' } });
      if (data && data.success && data.progress === 1000) {
        return data.download_url;
      }
      await new Promise(resolve => setTimeout(resolve, 3000)); // Wait 3 seconds before checking again
    }
  }
};

const handler = async (m, { conn, usedPrefix, text, command }) => {
  if (!text) {
    return conn.sendMessage(m.chat, { text: `*يرجى إدخال اسم الأغنية التي تبحث عنها.*\n*مثال:* ${usedPrefix + command} Shape of You` }, { quoted: m });
  }

  try {
    await m.react('⏳');
    const search = await yts(text);
    const video = search.videos[0];
    if (!video) {
      await m.react('❌');
      return conn.sendMessage(m.chat, { text: 'لم يتم العثور على الأغنية.' }, { quoted: m });
    }

    const detail = `
*「 ▶️ تشغيل يوتيوب 」*

*🔖 العنوان:* ${video.title}
*👀 المشاهدات:* ${video.views.toLocaleString()}
*👤 المؤلف:* ${video.author.name}
*🗓️ تاريخ النشر:* ${video.ago}
*🔗 الرابط:* ${video.url}

*📥 جاري تحميل الصوت، يرجى الانتظار...*`.trim();

    await conn.sendMessage(m.chat, {
      text: detail,
      contextInfo: {
        externalAdReply: {
          title: video.title,
          body: `تشغيل بواسطة CRIMSON - BOT`,
          thumbnailUrl: video.image,
          mediaType: 1,
          renderLargerThumbnail: true,
          sourceUrl: video.url
        }
      }
    }, { quoted: m });

    const result = await ddownr.download(video.url, "mp3");
    if (!result.downloadUrl) {
      await m.react('❌');
      return conn.sendMessage(m.chat, { text: 'فشل تحميل الصوت.' }, { quoted: m });
    }

    await conn.sendMessage(m.chat, {
      audio: { url: result.downloadUrl },
      mimetype: 'audio/mpeg',
    }, { quoted: m });

    await m.react('✅');

  } catch (error) {
    await m.react('❌');
    conn.sendMessage(m.chat, { text: `حدث خطأ:\n${error.message}` }, { quoted: m });
  }
};

handler.help = ['play <query>', 'تشغيل <بحث>'];
handler.tags = ['downloader'];
handler.command = ['play', 'song', 'تشغيل', 'اغنية'];
handler.limit = true;

export default handler;
