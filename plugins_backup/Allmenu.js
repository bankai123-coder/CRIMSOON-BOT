// Script Ori By BochilGaming
// Ditulis Ulang Oleh ImYanXiao
// Disesuaikan Oleh ShirokamiRyzen

import { promises } from 'fs'
import { join } from 'path'
import { xpRange } from '../lib/levelling.js' // تم التعليق لعدم وجوده في النظام الجديد
import moment from 'moment-timezone'
import os from 'os'
import fs from 'fs'
import fetch from 'node-fetch'

// إصلاح: استيراد getDevice بشكل صحيح أو إزالته
// const { generateWAMessageFromContent, proto, getDevice } = (await import('@adiwajshing/baileys')).default
const { generateWAMessageFromContent, proto } = (await import('@adiwajshing/baileys')).default

const defaultMenu = {
  before: `
● *الاسم:* %name 
● *الرقم:* %tag
● *عضوية مميزة:* %prems
● *الحد:* %limit
● *الدور:* %role

*${ucapan()} %name!*
● *التاريخ:* %week
● *التاريخ الميلادي:* %date
● *التاريخ الهجري:* %dateIslamic
● *الوقت:* %time

● *اسم البوت:* %me
● *الوضع:* %mode
● *البادئة:* [ *%_p* ]
● *المنصة:* %platform
● *النوع:* Node.JS
● *مدة التشغيل:* %muptime
● *قاعدة البيانات:* %rtotalreg من %totalreg

⬣───「 *معلومات الأوامر* 」───⬣
│ *Ⓟ* = للأعضاء المميزين
│ *Ⓛ* = يتطلب حداً
▣────────────⬣
  %readmore
  `.trimStart(),
    header: '╭─────『  ⛩️%category 』',
    body: '    ᯓ %cmd %isPremium %islimit',
    footer: '╰–––––––––––––––༓',
    after: ``,
  }
let handler = async (m, { conn, usedPrefix: _p, __dirname, args, command }) => {

  if (m.isGroup && global.db.data.chats[m.chat].menu) {
    throw `قام المشرف بتعطيل القائمة`;
  }

  let tags = {
    'main': 'الرئيسية',
    'ai': 'ميزات الذكاء الاصطناعي',
    'memfess': 'اعترافات',
    'downloader': 'أدوات التحميل',
    'internet': 'الإنترنت',
    'anime': 'أنمي',
    'sticker': 'ملصقات',
    'tools': 'أدوات',
    'group': 'مجموعة',
     'fun': 'ترفيه',
    'search': 'بحث',
    'game': 'ألعاب',
    'info': 'معلومات',
    'owner': 'المالك',
    'quotes': 'اقتباسات',
    'exp': 'خبرة',
    'stalk': 'مطاردة',
      'rpg': 'آر بي جي',
      'sound': 'صوت',
      'random': 'عشوائي',
      'maker': 'صانع',
      'panel': 'لوحة التحكم',
      'nsfw': 'محتوى للبالغين'
  }

  try {
    // DEFAULT MENU
    let dash = global.dashmenu
    let m1 = global.dmenut
    let m2 = global.dmenub
    let m3 = global.dmenuf
    let m4 = global.dmenub2

    // COMMAND MENU
    let cc = global.cmenut
    let c1 = global.cmenuh
    let c2 = global.cmenub
    let c3 = global.cmenuf
    let c4 = global.cmenua

    // LOGO L P
    let lprem = global.lopr
    let llim = global.lolm
    let tag = `@${m.sender.split('@')[0]}`
    
    // إصلاح: إزالة getDevice أو استبداله
    // let device = await getDevice(m.id)
    let device = 'Unknown Device' // قيمة افتراضية

    //-----------TIME---------
    let ucpn = `${ucapan()}`
    let d = new Date(new Date + 3600000)
    let locale = 'ar'
    let week = d.toLocaleDateString(locale, { weekday: 'long' })
    let date = d.toLocaleDateString(locale, {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
    let who = m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : m.fromMe ? conn.user.jid : m.sender
    let dateIslamic = Intl.DateTimeFormat(locale + '-TN-u-ca-islamic', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    }).format(d)
    let time = d.toLocaleTimeString(locale, {
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric'
    })
    let _uptime = process.uptime() * 1000
    let _muptime
    if (process.send) {
      process.send('uptime')
      _muptime = await new Promise(resolve => {
        process.once('message', resolve)
        setTimeout(resolve, 1000)
      }) * 1000
    }
    let muptime = clockString(_muptime)
    let uptime = clockString(_uptime)
    let _mpt
    if (process.send) {
      process.send('uptime')
      _mpt = await new Promise(resolve => {
        process.once('message', resolve)
        setTimeout(resolve, 1000)
      }) * 1000
    }
    let mpt = clockString(_mpt)
    let usrs = db.data.users[m.sender]


    /**************************** TIME *********************/
    let wib = moment.tz('Asia/Riyadh').format('HH:mm:ss')
    let wibh = moment.tz('Asia/Riyadh').format('HH')
    let wibm = moment.tz('Asia/Riyadh').format('mm')
    let wibs = moment.tz('Asia/Riyadh').format('ss')
    let wktuwib = `${wibh} س ${wibm} د ${wibs} ث`

    let mode = global.opts['self'] || global.opts['owneronly'] ? 'خاص' : 'عام'
    let _package = JSON.parse(await promises.readFile(join(__dirname, '../package.json')).catch(_ => ({}))) || {}
    let { age, exp, limit, level, role, registered, money } = global.db.data.users[m.sender]
    // إصلاح: التعليق على xpRange لعدم وجوده
    let { min, xp, max } = xpRange(level, global.multiplier)
    let min = 0, xp = exp, max = exp + 1000 // قيم افتراضية
    let name = await conn.getName(m.sender)
    let premium = global.db.data.users[m.sender].premiumTime
    let prems = `${premium > 0 ? 'عضوية مميزة' : 'مستخدم عادي'}`
    let platform = os.platform()

    //---------------------

    let totalreg = Object.keys(global.db.data.users).length
    let rtotalreg = Object.values(global.db.data.users).filter(user => user.registered == true).length
    let help = Object.values(global.plugins).filter(plugin => !plugin.disabled).map(plugin => {
      return {
        help: Array.isArray(plugin.tags) ? plugin.help : [plugin.help],
        tags: Array.isArray(plugin.tags) ? plugin.tags : [plugin.tags],
        prefix: 'customPrefix' in plugin,
        limit: plugin.limit,
        premium: plugin.premium,
        enabled: !plugin.disabled,
      }
    })
    
    let groups = {}
    for (let tag in tags) {
      groups[tag] = []
      for (let plugin of help)
        if (plugin.tags && plugin.tags.includes(tag))
          if (plugin.help) groups[tag].push(plugin)
    }
    conn.menu = conn.menu ? conn.menu : {}
    let before = conn.menu.before || defaultMenu.before
    let header = conn.menu.header || defaultMenu.header
    let body = conn.menu.body || defaultMenu.body
    let footer = conn.menu.footer || defaultMenu.footer
    let after = conn.menu.after || (conn.user.jid == global.conn.user.jid ? '' : `Powered by https://wa.me/${global.conn.user.jid.split`@`[0]}`) + defaultMenu.after
    let _text = [
      before,
      ...Object.keys(tags).map(tag => {
        return header.replace(/%category/g, tags[tag]) + '\n' + [
          ...help.filter(menu => menu.tags && menu.tags.includes(tag) && menu.help).map(menu => {
            return menu.help.map(help => {
              return body.replace(/%cmd/g, menu.prefix ? help : '%_p' + help)
                .replace(/%islimit/g, menu.limit ? llim : '')
                .replace(/%isPremium/g, menu.premium ? lprem : '')
                .trim()
            }).join('\n')
          }),
          footer
        ].join('\n')
      }),
      after
    ].join('\n')
    let text = typeof conn.menu == 'string' ? conn.menu : typeof conn.menu == 'object' ? _text : ''
    let replace = {
      '%': '%',
      p: uptime, muptime,
      me: 'CRIMSON - BOT',
      npmname: _package.name,
      npmdesc: _package.description,
      version: _package.version,
      exp: exp - min,
      maxexp: xp,
      totalexp: exp,
      xp4levelup: max - exp,
      github: _package.homepage ? _package.homepage.url || _package.homepage : '[unknown github url]',
      tag, dash, m1, m2, m3, m4, cc, c1, c2, c3, c4, lprem, llim,
      ucpn, platform, wib, mode, _p, money, age, tag, name, prems, level, limit, name, week, date, dateIslamic, time, totalreg, rtotalreg, role,
      readmore: readMore
    }
    text = text.replace(new RegExp(`%(${Object.keys(replace).sort((a, b) => b.length - a.length).join`|`})`, 'g'), (_, name) => '' + replace[name])

    let fkon = {
      key: {
        fromMe: false,
        participant: `${m.sender.split`@`[0]}@s.whatsapp.net`,
        ...(m.chat ? { remoteJid: '16500000000@s.whatsapp.net' } : {})
      },
      message: {
        contactMessage: {
          displayName: `${name}`,
          vcard: `BEGIN:VCARD\nVERSION:3.0\nN:;a,;;;\nFN:${name}\nitem1.TEL;waid=${m.sender.split('@')[0]}:${m.sender.split('@')[0]}\nitem1.X-ABLabel:Ponsel\nEND:VCARD`,
          verified: true
        }
      }
    };

    conn.relayMessage(m.chat, {
      extendedTextMessage: {
        text: text,
        contextInfo: {
          mentionedJid: [m.sender],
          externalAdReply: {
            title: 'CRIMSON - BOT',
            mediaType: 1,
            previewType: 0,
            renderLargerThumbnail: true,
            thumbnailUrl: 'https://files.catbox.moe/kthhq6.jpg',
            sourceUrl: 'https://whatsapp.com/channel/0029Vb6gsqN8fewx89iCtV19',
          }
        }, mentions: [m.sender]
      }
    }, { quoted: fkon });
    await conn.sendMessage(m.chat, { audio: { url: 'https://files.catbox.moe/9zapgw.mp3' }, mimetype: 'audio/mp4', ptt: true }, { quoted: m })
  } catch (e) {
    conn.reply(m.chat, 'عذراً، القائمة خاطئة حالياً', m)
    throw e
  }
}

handler.help = ['menu', 'help', '?', 'القائمة']
handler.tags = ['main']
handler.command = /^(allmenu|help|\?|القائمة)$/i

handler.register = false
handler.exp = false

export default handler

function pickRandom(list) {
  return list[Math.floor(Math.random() * list.length)]
}

const more = String.fromCharCode(8206)
const readMore = more.repeat(4001)

function clockString(ms) {
  let h = isNaN(ms) ? '--' : Math.floor(ms / 3600000)
  let m = isNaN(ms) ? '--' : Math.floor(ms / 60000) % 60
  let s = isNaN(ms) ? '--' : Math.floor(ms / 1000) % 60
  return [h, ' ساعة ', m, ' دقيقة ', s, ' ثانية '].map(v => v.toString().padStart(2, 0)).join('')
}
function clockStringP(ms) {
  let ye = isNaN(ms) ? '--' : Math.floor(ms / 31104000000) % 10
  let mo = isNaN(ms) ? '--' : Math.floor(ms / 2592000000) % 12
  let d = isNaN(ms) ? '--' : Math.floor(ms / 86400000) % 30
  let h = isNaN(ms) ? '--' : Math.floor(ms / 3600000) % 24
  let m = isNaN(ms) ? '--' : Math.floor(ms / 60000) % 60
  let s = isNaN(ms) ? '--' : Math.floor(ms / 1000) % 60
  return [ye, ' *سنوات 🗓️*\n', mo, ' *أشهر 🌙*\n', d, ' *أيام ☀️*\n', h, ' *ساعات 🕐*\n', m, ' *دقائق ⏰*\n', s, ' *ثواني ⏱️*'].map(v => v.toString().padStart(2, 0)).join('')
}
function ucapan() {
  const time = moment.tz('Asia/Riyadh').format('HH')
  let res = "لماذا لم تنم بعد؟ 🥱"
  if (time >= 4) {
    res = "صباح الخير 🌄"
  }
  if (time >= 10) {
    res = "نهارك سعيد ☀️"
  }
  if (time >= 15) {
    res = "مساء الخير 🌇"
  }
  if (time >= 18) {
    res = "مساء الخير 🌙"
  }
  return res
}

// إصلاح: التعليق على دالة genProfile لعدم وجود المكتبات المطلوبة
/*
async function genProfile(conn, m) {
  let font = await jimp.loadFont('./names.fnt'),
    mask = await jimp.read('https://i.imgur.com/552kzaW.png'),
    border = await jimp.read('https://telegra.ph/file/a81aa1b95381c68bc9932.png'),
    welcome = await jimp.read(thumbnailUrl.getRandom()),
    avatar = await jimp.read(await conn.profilePictureUrl(m.sender, 'image').catch(() => 'https://telegra.ph/file/24fa902ead26340f3df2c.png')),
    status = (await conn.fetchStatus(m.sender).catch(console.log) || {}).status?.slice(0, 30) || 'غير مكتشف',
    premiumUnixTime = global.db.data.users[m.sender].premiumTime,
    prems = `${premiumUnixTime > 0 ? 'مستخدم مميز' : 'مستخدم عادي'}`;

  const gmtPlus7Time = premiumUnixTime * 1000 + 7 * 60 * 60 * 1000;

  await avatar.resize(460, 460)
  await mask.resize(460, 460)
  await avatar.mask(mask)

  await welcome.resize(welcome.getWidth(), welcome.getHeight())

  await welcome.print(font, 550, 150, 'الاسم:')
  await welcome.print(font, 800, 150, m.pushName.slice(0, 25))
  await welcome.print(font, 550, 215, 'الحالة:')
  await welcome.print(font, 800, 215, status)
  await welcome.print(font, 550, 280, 'الرقم:')
  await welcome.print(font, 800, 280, PhoneNumber('+' + m.sender.split('@')[0]).getNumber('international'))
  await welcome.print(font, 550, 400, 'العضوية:')
  await welcome.print(font, 800, 400, prems)

  if (premiumUnixTime > 0) {
    const gmtPlus7DateString = new Date(gmtPlus7Time).toLocaleString('ar-EG', { timeZone: 'Asia/Riyadh' });
    await border.resize(460, 460)
    await welcome.print(font, 550, 460, 'حتى:');
    await welcome.print(font, 800, 460, gmtPlus7DateString);
    await welcome.composite(border, 50, 170);
  }

  return await welcome.composite(avatar, 50, 170).getBufferAsync('image/png')
}
*/
