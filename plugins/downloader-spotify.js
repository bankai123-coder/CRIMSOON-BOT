/*
* لا تقم بإزالة العلامة المائية
*
* إضافة تشغيل سبوتيفاي (ESM)*
*
* [المصدر]
* https://whatsapp.com/channel/0029Vb3u2awADTOCXVsvia28
*
* [مصدر الكود]
* https://whatsapp.com/channel/0029Vaf07jKCBtxAsekFFk3i
* [المترجم والمعدل]
* Hilman
*/

import axios from "axios";

// تحويل المللي ثانية إلى تنسيق دقائق:ثواني
function convert(ms) {
   const minutes = Math.floor(ms / 60000);
   const seconds = ((ms % 60000) / 1000).toFixed(0);
   return minutes + ":" + (seconds < 10 ? "0" : "") + seconds;
}

// تحميل الأغنية من الرابط
async function downloadTrack(url) {
   const BASEURL = "https://api.fabdl.com";
   const headers = {
      "Accept": "application/json, text/plain, */*",
      "Content-Type": "application/json",
      "User-Agent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Mobile Safari/537.36",
   };

   try {
      const { data: info } = await axios.get(`${BASEURL}/spotify/get?url=${url}`, { headers });
      const { gid, id } = info.result;

      const { data: download } = await axios.get(`${BASEURL}/spotify/mp3-convert-task/${gid}/${id}`, { headers });
      if (download.result.download_url) {
         return `${BASEURL}${download.result.download_url}`;
      }
      throw new Error('فشل في الحصول على رابط التحميل.');
   } catch (error) {
      console.error("خطأ في تحميل أغنية سبوتيفاي:", error.message);
      throw new Error(error.message);
   }
}

// الحصول على رمز الدخول لـ Spotify API
async function getSpotifyToken() {
   try {
      const { data } = await axios.post(
         "https://accounts.spotify.com/api/token",
         "grant_type=client_credentials",
         {
            headers: {
               Authorization: "Basic " + Buffer.from("4c4fc8c3496243cbba99b39826e2841f:d598f89aba0946e2b85fb8aefa9ae4c8").toString("base64"),
            },
         }
      );
      return data.access_token;
   } catch (e) {
      throw new Error('لا يمكن إنشاء رمز الدخول لسبوتيفاي!');
   }
}

// البحث عن الأغنية وتحميلها
async function searchAndDownload(query) {
   const token = await getSpotifyToken();
   const { data: searchData } = await axios.get(`https://api.spotify.com/v1/search?query=${query}&type=track&offset=0&limit=1`, {
      headers: { Authorization: "Bearer " + token },
   });

   const track = searchData.tracks?.items?.[0];
   if (!track) {
      throw new Error('لم يتم العثور على الأغنية!');
   }

   const audioUrl = await downloadTrack(track.external_urls.spotify);

   const metadata = {
      title: track.name,
      artist: track.album.artists.map(artist => artist.name).join(', '),
      album: track.album.name,
      duration: convert(track.duration_ms),
      popularity: `${track.popularity}%`,
      url: track.external_urls.spotify,
      thumbnail: track.album.images[0].url,
   };

   return { metadata, audioUrl };
}

const handler = async (m, { conn, text, usedPrefix, command }) => {
   if (!text) {
      return m.reply(`*يرجى إدخال اسم الأغنية أو الفنان للبحث!*\n*مثال:* ${usedPrefix + command} Alan Walker`);
   }

   await m.react('⏳');

   try {
      const { metadata, audioUrl } = await searchAndDownload(text);

      const caption = `
*「 🎵 مشغل سبوتيفاي 」*

*🔖 العنوان:* ${metadata.title}
*🎤 الفنان:* ${metadata.artist}
*📀 الألبوم:* ${metadata.album}
*⏳ المدة:* ${metadata.duration}
*⭐ الشعبية:* ${metadata.popularity}
*🔗 الرابط:* ${metadata.url}
      `.trim();

      await conn.sendMessage(m.chat, {
         image: { url: metadata.thumbnail },
         caption: caption,
         contextInfo: {
             externalAdReply: {
                 title: metadata.title,
                 body: metadata.artist,
                 thumbnail: { url: metadata.thumbnail },
                 mediaType: 1,
                 renderLargerThumbnail: true,
                 sourceUrl: metadata.url
             }
         }
      }, { quoted: m });

      await conn.sendMessage(m.chat, { audio: { url: audioUrl }, mimetype: "audio/mpeg" }, { quoted: m });
      await m.react('✅');

   } catch (error) {
      await m.react('❌');
      m.reply(`*حدث خطأ:* ${error.message}`);
   }
};

handler.help = ['spotify <song>', 'سبوتيفاي <اغنية>'];
handler.tags = ['downloader'];
handler.command = /^(spotify|سبوتيفاي)$/i;
handler.limit = true;

export default handler;
