/* 
• إضافة: تحميل صوت من يوتيوب (yta فقط)
• مصدر الكود: https://whatsapp.com/channel/0029Vb5EZCjIiRotHCI1213L/377
• المترجم والمعدل: Hilman
*/

import fetch from 'node-fetch';
import { Buffer } from 'buffer';

class Youtubers {
  constructor() {
    this.hex = "C5D58EF67A7584E4A29F6C35BBC4EB12";
  }

  async uint8(hex) {
    const pecahan = hex.match(/[\dA-F]{2}/gi);
    if (!pecahan) throw new Error("تنسيق HEX غير صالح");
    return new Uint8Array(pecahan.map(h => parseInt(h, 16)));
  }

  b64Byte(b64) {
    const bersih = b64.replace(/\s/g, "");
    const biner = Buffer.from(bersih, 'base64');
    return new Uint8Array(biner);
  }

  async key() {
    const raw = await this.uint8(this.hex);
    return await crypto.subtle.importKey("raw", raw, { name: "AES-CBC" }, false, ["decrypt"]);
  }

  async Data(base64Terenkripsi) {
    const byteData = this.b64Byte(base64Terenkripsi);
    if (byteData.length < 16) throw new Error("البيانات المشفرة قصيرة جدًا");

    const iv = byteData.slice(0, 16);
    const data = byteData.slice(16);

    const kunci = await this.key();
    const hasil = await crypto.subtle.decrypt({ name: "AES-CBC", iv }, kunci, data);

    const teks = new TextDecoder().decode(new Uint8Array(hasil));
    return JSON.parse(teks);
  }

  async getCDN() {
    let retries = 5;
    while (retries--) {
      try {
        const res = await fetch("https://media.savetube.me/api/random-cdn");
        const data = await res.json();
        if (data?.cdn) return data.cdn;
      } catch {}
    }
    throw new Error("فشل في الحصول على CDN بعد 5 محاولات");
  }

  async infoVideo(linkYoutube) {
    const cdn = await this.getCDN();
    const res = await fetch(`https://${cdn}/v2/info`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: linkYoutube }),
    });

    const hasil = await res.json();
    if (!hasil.status) throw new Error(hasil.message || "فشل في جلب بيانات الفيديو");

    const isi = await this.Data(hasil.data);
    return { judul: isi.title, durasi: isi.durationLabel, thumbnail: isi.thumbnail, kode: isi.key };
  }

  async getDownloadLink(kodeVideo, kualitas) {
    let retries = 5;
    while (retries--) {
      try {
        const cdn = await this.getCDN();
        const res = await fetch(`https://${cdn}/download`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ downloadType: 'audio', quality: kualitas, key: kodeVideo }),
        });

        const json = await res.json();
        if (json?.status && json?.data?.downloadUrl) return json.data.downloadUrl;
      } catch {}
    }
    throw new Error("فشل في الحصول على رابط التحميل بعد 5 محاولات");
  }

  async downloadAudio(linkYoutube, kualitas = '128') {
    try {
      const data = await this.infoVideo(linkYoutube);
      const linkUnduh = await this.getDownloadLink(data.kode, kualitas);
      return { status: true, judul: data.judul, durasi: data.durasi, url: linkUnduh };
    } catch (err) {
      return { status: false, pesan: err.message };
    }
  }
}

let handler = async (m, { text, conn, usedPrefix, command }) => {
  if (!text) return m.reply(`*يرجى إدخال رابط فيديو يوتيوب.*
*مثال:* ${usedPrefix + command} https://youtu.be/xxxx [128]`);

  const yt = new Youtubers();
  const [link, kualitasArg] = text.trim().split(' ');
  const kualitas = kualitasArg?.replace(/[^0-9]/g, '') || '128';

  await m.react('⏳');

  try {
    const res = await yt.downloadAudio(link, kualitas);
    if (!res.status) throw new Error(res.pesan);

    const caption = `
*「 📥 تحميل صوت يوتيوب 」*

*📝 العنوان:* ${res.judul}
*🕒 المدة:* ${res.durasi}
*🎧 الجودة:* ${kualitas} kbps
    `.trim();

    await conn.sendMessage(m.chat, { 
        audio: { url: res.url }, 
        mimetype: 'audio/mpeg', 
        fileName: res.judul + '.mp3',
        caption: caption 
    }, { quoted: m });

    await m.react('✅');

  } catch (e) {
    await m.react('❌');
    m.reply(`*فشل التحميل:*
${e.message || e}`);
  }
};

handler.help = ['yta <url> [128]', 'صوت <رابط> [128]'];
handler.tags = ['downloader'];
handler.command = /^(yta|ytmp3|audioyt|صوت)$/i;
handler.limit = true;

export default handler;
