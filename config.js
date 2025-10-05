import { watchFile, unwatchFile } from 'fs'
import chalk from 'chalk'
import { fileURLToPath } from 'url'
import moment from 'moment-timezone'

/*============= CRIMSON BOT INFO =============*/
global.botName = 'Crimson'
global.ownerNumber = '22232157828'
global.botNumber = '22234001933'
global.whatsappChannel = 'https://whatsapp.com/channel/0029VagJIAr3bbVBCpEkAM07' // أضف رابط القناة

/*============= WAKTU =============*/
let wibh = moment.tz('Africa/Nouakchott').format('HH')
let wibm = moment.tz('Africa/Nouakchott').format('mm')
let wibs = moment.tz('Africa/Nouakchott').format('ss')
let wktuwib = `${wibh} H ${wibm} M ${wibs} S`
let wktugeneral = `${wibh}:${wibm}:${wibs}`

let d = new Date(new Date + 3600000)
let locale = 'ar' // تغيير للعربية
let weton = ['Pahing', 'Pon', 'Wage', 'Kliwon', 'Legi'][Math.floor(d / 84600000) % 5]
let week = d.toLocaleDateString(locale, { weekday: 'long' })
let date = d.toLocaleDateString(locale, {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
})
const more = String.fromCharCode(8206)
const readMore = more.repeat(4001)

/*============= MAIN INFO =============*/
global.owner = [['22232157828', 'Crimson Owner', true]]
global.mods = []
global.prems = []
global.nomorbot = '22234001933'
global.nomorown = '22232157828'
global.autotyping = true // تفعيل
global.autorecording = false // default mati

/*============= WATERMARK =============*/
global.readMore = readMore
global.author = 'Crimson Team'
global.namebot = 'Crimson Bot'
global.wm = 'Crimson Bot - Premium Edition'
global.watermark = wm
global.botdate = `⫹⫺ DATE: ${week} ${date}\n⫹⫺ 𝗧𝗶𝗺𝗲: ${wktuwib}`
global.bottime = `T I M E : ${wktuwib}`
global.stickpack = `Sticker by ${namebot}\n\nCrimson Bot\n+${nomorbot}`
global.stickauth = `Crimson Team`
global.week = `${week} ${date}`
global.wibb = `${wktuwib}`

/*============= SOSMED =============*/
global.sig = 'https://www.instagram.com/crimsonbot'
global.sgh = 'https://github.com/crimson-bot'
global.sgc = 'https://whatsapp.com/channel/0029VagJIAr3bbVBCpEkAM07'
global.sgw = 'https://crimsonbot.com'
global.sdc = 'https://discord.gg/crimson'
global.sfb = 'https://facebook.com/crimsonbot'
global.snh = 'https://t.me/crimsonbot'

/*============= CPANEL (Optional) =============*/
global.egg = "15"
global.nestid = "5"
global.loc = "1"
global.domain = "-"
global.apikey = "-"
global.capikey = "-"

/*============= DONASI =============*/
global.qris = 'https://i.ibb.co/your-qris.png'
global.psaweria = 'https://saweria.co/crimsonbot'

/*============= TAMPILAN =============*/
global.dmenut = '▰▱▱▱▱▱▱▱▱⊰≼' //top
global.dmenub = '┊↬' //body
global.dmenub2 = '┊' //body for info cmd
global.dmenuf = '┗━━━━━━━━━━━━━✦' //footer
global.dashmenu = '▰▱▰▱ *DASHBOARD* ▱▰▱▰'
global.cmenut = '❏――――――――◉' //top
global.cmenuh = '〘――――――――◉' //header
global.cmenub = '┊✦ ' //body
global.cmenuf = '┗━╍╍╍╍╍╍╍╍╍╍╍◉\n' //footer
global.cmenua = '\n⌕ ♢━♢━♢━♢━♢━♢━♢━♢ ⌕\n     '
global.pmenus = '✦'
global.htki = '◉━━━━━━━━'
global.htka = '━━━━━━━━◉'
global.lopr = '◉'
global.lolm = '◉'
global.htjava = '⫹⫺'
global.hsquere = ['⛶', '❏', '⫹⫺']

/*============= RESPON =============*/
global.wait = '⏳ جاري المعالجة...'
global.eror = '❌ حدث خطأ!'
global.success = '✅ تم بنجاح!'

/*============= API ENDPOINTS =============*/
global.APIs = {
    ryzen: 'https://api.ryzendesu.vip',
}

global.APIKeys = {
    // 'https://website': 'apikey'
}

/*============= FILE TYPES =============*/
global.dpptx = 'application/vnd.openxmlformats-officedocument.presentationml.presentation'
global.ddocx = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
global.dxlsx = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
global.dpdf = 'application/pdf'
global.drtf = 'text/rtf'

/*============= THUMBNAILS =============*/
global.thumb = 'https://telegra.ph/file/24fa902ead26340f3df2c.png'
global.imagebot = 'https://telegra.ph/file/24fa902ead26340f3df2c.png'
global.giflogo = 'https://telegra.ph/file/a7ac2b46f82ef7ea083f9.jpg'
global.thumbs = ['https://telegra.ph/file/24fa902ead26340f3df2c.png']
global.thumbnailUrl = [
    'https://telegra.ph/file/24fa902ead26340f3df2c.png'
]
global.fotonya1 = 'https://telegra.ph/file/24fa902ead26340f3df2c.png'
global.fotonya2 = 'https://telegra.ph/file/24fa902ead26340f3df2c.png'

/*============= FLAMINGTEXT TEMPLATES =============*/
global.flaaa2 = [
    "https://flamingtext.com/net-fu/proxy_form.cgi?&imageoutput=true&script=water-logo&script=water-logo&fontsize=90&doScale=true&scaleWidth=800&scaleHeight=500&fontsize=100&fillTextColor=%23000&shadowGlowColor=%23000&backgroundColor=%23000&text=",
    "https://flamingtext.com/net-fu/proxy_form.cgi?&imageoutput=true&script=crafts-logo&fontsize=90&doScale=true&scaleWidth=800&scaleHeight=500&text=",
    "https://flamingtext.com/net-fu/proxy_form.cgi?&imageoutput=true&script=amped-logo&doScale=true&scaleWidth=800&scaleHeight=500&text=",
    "https://www6.flamingtext.com/net-fu/proxy_form.cgi?&imageoutput=true&script=sketch-name&doScale=true&scaleWidth=800&scaleHeight=500&fontsize=100&fillTextType=1&fillTextPattern=Warning!&text=",
]

global.fla = global.flaaa2

global.hwaifu = ['https://telegra.ph/file/a7ac2b46f82ef7ea083f9.jpg']
global.thumblvlup = [
    'https://i.pinimg.com/originals/a0/34/8a/a0348ae908d8ac4ced76df289eb41e1a.jpg',
]

/*============= CRIMSON BOT SETTINGS =============*/
global.prefix = '.'
global.multiPrefix = false
global.prefixes = ['.', '!', '#', '/']
global.timezone = 'Africa/Nouakchott'
global.language = 'ar'

// Features
global.autoRead = true
global.autoTyping = true
global.autoRecording = false
global.presenceUpdate = true
global.markOnlineOnConnect = true
global.processOwnMessages = false
global.antiCall = true
global.rejectCalls = true
global.antiSpam = true
global.antiLink = false
global.autoRestart = true
global.checkUpdates = true
global.verboseLogging = false
global.logLevel = 'silent'

// Limits
global.maxMessageLength = 10000
global.maxMediaSize = 100 * 1024 * 1024
global.commandCooldown = 3
global.maxCommandsPerMinute = 20
global.maxGroupSize = 1000

// Messages
global.messages = {
    wait: '⏳ جاري المعالجة...',
    done: '✅ تم بنجاح!',
    error: '❌ حدث خطأ!',
    ownerOnly: '❌ هذا الأمر للمالك فقط.',
    groupOnly: '❌ هذا الأمر للمجموعات فقط.',
    privateOnly: '❌ هذا الأمر للمحادثات الخاصة فقط.',
    adminOnly: '❌ هذا الأمر للمشرفين فقط.',
    botAdminOnly: '❌ يجب أن أكون مشرفاً لتنفيذ هذا الأمر.',
    premiumOnly: '❌ هذا الأمر للمشتركين المميزين فقط.',
    registeredOnly: '❌ يجب التسجيل أولاً.',
    cooldown: '⏰ يرجى الانتظار قبل استخدام هذا الأمر مرة أخرى.',
    maintenance: '⚠️ البوت في وضع الصيانة حالياً.',
    blacklisted: '🚫 تم حظرك من استخدام البوت.'
}

/*============= FILE WATCHER =============*/
let file = fileURLToPath(import.meta.url)
watchFile(file, () => {
    unwatchFile(file)
    console.log(chalk.redBright("Update 'config.js'"))
    import(`${file}?update=${Date.now()}`)
})

export default {
    botName: global.botName,
    botNumber: global.botNumber,
    ownerNumber: global.ownerNumber,
    owners: [global.ownerNumber],
    prefix: global.prefix,
    timezone: global.timezone,
    language: global.language,
    autoRead: global.autoRead,
    autoTyping: global.autoTyping,
    messages: global.messages
}
