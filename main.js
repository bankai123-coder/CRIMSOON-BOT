/* Crimson Bot - Merged with Rizal Dev Base */
process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0';

import './config.js'

import path, { join } from 'path'
import { platform } from 'process'
import { fileURLToPath, pathToFileURL } from 'url'
import { createRequire } from 'module'
global.__filename = function filename(pathURL = import.meta.url, rmPrefix = platform !== 'win32') { 
    return rmPrefix ? /file:\/\/\//.test(pathURL) ? fileURLToPath(pathURL) : pathURL : pathToFileURL(pathURL).toString() 
}
global.__dirname = function dirname(pathURL) { return path.dirname(global.__filename(pathURL, true)) }
global.__require = function require(dir = import.meta.url) { return createRequire(dir) }

import {
    readdirSync,
    statSync,
    unlinkSync,
    existsSync,
    readFileSync,
    watch
} from 'fs'

import yargs from 'yargs/yargs'
import { hideBin } from 'yargs/helpers'
const argv = yargs(hideBin(process.argv)).argv

import { spawn } from 'child_process'
import lodash from 'lodash'
import syntaxerror from 'syntax-error'
import chalk from 'chalk'
import { tmpdir } from 'os'
import readline from 'readline'
import { format } from 'util'
import pino from 'pino'
import ws from 'ws'
import qrcode from 'qrcode-terminal'

const {
    useMultiFileAuthState,
    DisconnectReason,
    fetchLatestBaileysVersion,
    makeInMemoryStore,
    makeCacheableSignalKeyStore,
    PHONENUMBER_MCC
} = await import('@adiwajshing/baileys')

import { Low, JSONFile } from 'lowdb'
import { makeWASocket, protoType, serialize } from './lib/simple.js'
import cloudDBAdapter from './lib/cloudDBAdapter.js'
import { mongoDB, mongoDBV2 } from './lib/mongoDB.js'

const { CONNECTING } = ws
const { chain } = lodash
const PORT = process.env.PORT || process.env.SERVER_PORT || 3000

protoType()
serialize()

global.API = (name, path = '/', query = {}, apikeyqueryname) => (name in global.APIs ? global.APIs[name] : name) + path + (query || apikeyqueryname ? '?' + new URLSearchParams(Object.entries({ ...query, ...(apikeyqueryname ? { [apikeyqueryname]: global.APIKeys[name in global.APIs ? global.APIs[name] : name] } : {}) })) : '')
global.Fn = function functionCallBack(fn, ...args) { return fn.call(global.conn, ...args) }
global.timestamp = { start: new Date }

const __dirname = global.__dirname(import.meta.url)

global.opts = new Object(yargs(process.argv.slice(2)).exitProcess(false).parse())
global.prefix = new RegExp('^[' + (opts['prefix'] || '‎xzXZ/i!#$%+£¢€¥^°=¶∆×÷π√✓©®:;?&.\\-').replace(/[|\\{}()[\]^$+*?.\-\^]/g, '\\$&') + ']')

// Database Setup
global.db = new Low(
    /https?:\/\//.test(opts['db'] || '') ?
        new cloudDBAdapter(opts['db']) : /mongodb(\+srv)?:\/\//i.test(opts['db']) ?
            (opts['mongodbv2'] ? new mongoDBV2(opts['db']) : new mongoDB(opts['db'])) :
            new JSONFile(`${opts._[0] ? opts._[0] + '_' : ''}database.json`)
)

global.DATABASE = global.db
global.loadDatabase = async function loadDatabase() {
    if (db.READ) return new Promise((resolve) => setInterval(async function () {
        if (!db.READ) {
            clearInterval(this)
            resolve(db.data == null ? global.loadDatabase() : db.data)
        }
    }, 1 * 1000))
    if (db.data !== null) return
    db.READ = true
    await db.read().catch(console.error)
    db.READ = null
    db.data = {
        users: {},
        chats: {},
        stats: {},
        msgs: {},
        sticker: {},
        settings: {},
        ...(db.data || {})
    }
    global.db.chain = chain(db.data)
}
loadDatabase()

// Store Setup - Optional
const store = makeInMemoryStore ? makeInMemoryStore({ 
    logger: pino().child({ level: 'silent', stream: 'store' }) 
}) : null

const rl = readline.createInterface({ input: process.stdin, output: process.stdout })
rl.setMaxListeners(20)

const { version, isLatest } = await fetchLatestBaileysVersion()
const { state, saveCreds } = await useMultiFileAuthState('./sessions')

const connectionOptions = {
    version,
    logger: pino({ level: 'silent' }),
    printQRInTerminal: false,
    browser: ['Crimson Bot', 'Chrome', '3.0.0'],
    auth: {
        creds: state.creds,
        keys: makeCacheableSignalKeyStore(state.keys, pino().child({
            level: 'silent',
            stream: 'store'
        })),
    },
    getMessage: async key => {
        if (store) {
            const messageData = await store.loadMessage(key.remoteJid, key.id)
            return messageData?.message || undefined
        }
        return { conversation: 'Hi' }
    },
    generateHighQualityLinkPreview: true,
    patchMessageBeforeSending: (message) => {
        const requiresPatch = !!(
            message.buttonsMessage ||
            message.templateMessage ||
            message.listMessage
        )
        if (requiresPatch) {
            message = {
                viewOnceMessage: {
                    message: {
                        messageContextInfo: {
                            deviceListMetadataVersion: 2,
                            deviceListMetadata: {},
                        },
                        ...message,
                    },
                },
            }
        }
        return message
    },
    connectTimeoutMs: 60000,
    defaultQueryTimeoutMs: 0,
    keepAliveIntervalMs: 10000,
    emitOwnEvents: true,
    fireInitQueries: true,
    syncFullHistory: true,
    markOnlineOnConnect: global.markOnlineOnConnect
}

global.conn = makeWASocket(connectionOptions)
conn.isInit = false

if (store) store.bind(conn.ev)

// Auto Reset Limit
async function resetLimit() {
    try {
        let list = Object.entries(global.db.data.users)
        let lim = 25

        list.map(([user, data], i) => {
            if (data.limit <= lim) {
                data.limit = lim
            }
        })

        console.log(chalk.green('✓ Auto Reset Limit Success'))
    } finally {
        setInterval(() => resetLimit(), 1 * 86400000)
    }
}

// Server & Auto Save
if (!opts['test']) {
    (await import('./server.js')).default(PORT)
    setInterval(async () => {
        if (global.db.data) await global.db.write().catch(console.error)
        if (store) store.writeToFile('./store.json')
        clearTmp()
    }, 60 * 1000)
}

function clearTmp() {
    const tmp = [tmpdir(), join(__dirname, './tmp')]
    const filename = []
    tmp.forEach(dirname => readdirSync(dirname).forEach(file => filename.push(join(dirname, file))))
    return filename.map(file => {
        const stats = statSync(file)
        if (stats.isFile() && (Date.now() - stats.mtimeMs >= 1000 * 60 * 3)) return unlinkSync(file)
        return false
    })
}

// Clear Sessions
async function clearSessions(folder = './sessions') {
    try {
        const filenames = await readdirSync(folder)
        const deletedFiles = await Promise.all(filenames.map(async (file) => {
            try {
                const filePath = path.join(folder, file)
                const stats = await statSync(filePath)
                if (stats.isFile() && file !== 'creds.json') {
                    await unlinkSync(filePath)
                    console.log(chalk.yellow(`🗑️  Deleted session: ${filePath}`))
                    return filePath
                }
            } catch (err) {
                console.error(chalk.red(`Error processing ${file}: ${err.message}`))
            }
        }))
        return deletedFiles.filter((file) => file !== null)
    } catch (err) {
        console.error(chalk.red(`Error in Clear Sessions: ${err.message}`))
        return []
    } finally {
        setTimeout(() => clearSessions(folder), 1 * 3600000)
    }
}

// Connection Update Handler
async function connectionUpdate(update) {
    const { receivedPendingNotifications, connection, lastDisconnect, isOnline, isNewLogin, qr } = update
    
    if (qr) {
        console.log(chalk.yellow('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'))
        console.log(chalk.cyan.bold('📱 Scan this QR Code with WhatsApp:'))
        console.log(chalk.yellow('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n'))
        qrcode.generate(qr, { small: true })
        console.log(chalk.yellow('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'))
        console.log(chalk.white('Open WhatsApp > Linked Devices > Link a Device'))
        console.log(chalk.yellow('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n'))
    }
    
    if (isOnline == true) {
        console.log(chalk.green('🟢 Status: Online'))
    } else if (isOnline == false) {
        console.log(chalk.red('🔴 Status: Offline'))
    }

    if (receivedPendingNotifications) {
        console.log(chalk.yellow('📬 Waiting for new messages...'))
    }

    if (connection == 'close') {
        console.log(chalk.red('⏱️  Connection closed, reconnecting...'))
        const statusCode = lastDisconnect?.error?.output?.statusCode
        if (statusCode !== DisconnectReason.loggedOut) {
            await global.reloadHandler(true).catch(console.error)
        } else {
            console.log(chalk.red('❌ Logged out. Please delete sessions folder and restart.'))
        }
    }

    if (connection === 'open') {
        console.log(chalk.green.bold('\n✓ Crimson Bot Successfully Connected!'))
        console.log(chalk.cyan('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'))
        console.log(chalk.white('  Bot Name:'), chalk.green(global.botName || 'Crimson Bot'))
        console.log(chalk.white('  Bot Number:'), chalk.green(conn.user?.id?.split(':')[0] || 'Unknown'))
        console.log(chalk.white('  Owner:'), chalk.green(global.ownerNumber || 'Not Set'))
        console.log(chalk.white('  Prefix:'), chalk.green(global.prefix))
        console.log(chalk.white('  Commands:'), chalk.green(Object.keys(global.plugins).length))
        console.log(chalk.cyan('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n'))
    }

    global.timestamp.connect = new Date

    if (global.db.data == null) {
        await global.loadDatabase()
    }
}

process.on('uncaughtException', console.error)
process.on('unhandledRejection', console.error)

let isInit = true
let handler = await import('./handler.js')
global.reloadHandler = async function (restatConn) {
    try {
        const Handler = await import(`./handler.js?update=${Date.now()}`).catch(console.error)
        if (Object.keys(Handler || {}).length) handler = Handler
    } catch (e) {
        console.error(e)
    }
    if (restatConn) {
        const oldChats = global.conn.chats
        try { global.conn.ws.close() } catch { }
        conn.ev.removeAllListeners()
        global.conn = makeWASocket(connectionOptions, { chats: oldChats })
        if (store) store.bind(conn.ev)
        isInit = true
    }
    if (!isInit) {
        conn.ev.off('messages.upsert', conn.handler)
        conn.ev.off('group-participants.update', conn.participantsUpdate)
        conn.ev.off('groups.update', conn.groupsUpdate)
        conn.ev.off('message.delete', conn.onDelete)
        conn.ev.off('connection.update', conn.connectionUpdate)
        conn.ev.off('creds.update', conn.credsUpdate)
    }

    conn.welcome = `╔═══════════════════════════╗
║   👋 مرحباً بك / Welcome   ║
╚═══════════════════════════╝

مرحباً @user! / Hello @user!
أهلاً بك في *@subject*
Welcome to *@subject*

نتمنى لك وقتاً ممتعاً معنا! 🎉
Hope you have a great time with us! 🎉`

    conn.bye = `╔═══════════════════════════╗
║   👋 وداعاً / Goodbye   ║
╚═══════════════════════════╝

@user غادر المجموعة
@user left the group

نتمنى لك التوفيق! 🌟
Good luck! 🌟`

    conn.spromote = '@user الآن مشرف! / @user is now Admin!'
    conn.sdemote = '@user لم يعد مشرفاً / @user is no longer Admin'
    conn.sDesc = 'تم تغيير الوصف إلى / Description changed to:\n@desc'
    conn.sSubject = 'تم تغيير اسم المجموعة إلى / Group name changed to:\n@subject'
    conn.sIcon = 'تم تغيير أيقونة المجموعة! / Group icon changed!'
    conn.sRevoke = 'تم تغيير رابط المجموعة / Group link changed:\n@revoke'
    conn.sAnnounceOn = 'تم إغلاق المجموعة! / Group closed!\nالآن المشرفون فقط يمكنهم الإرسال / Only admins can send messages'
    conn.sAnnounceOff = 'تم فتح المجموعة! / Group opened!\nالآن الجميع يمكنهم الإرسال / Everyone can send messages'
    conn.sRestrictOn = 'تعديل معلومات المجموعة للمشرفين فقط! / Edit info: Admins only!'
    conn.sRestrictOff = 'تعديل معلومات المجموعة للجميع! / Edit info: Everyone!'

    conn.handler = handler.handler.bind(global.conn)
    conn.participantsUpdate = handler.participantsUpdate.bind(global.conn)
    conn.groupsUpdate = handler.groupsUpdate.bind(global.conn)
    conn.onDelete = handler.deleteUpdate.bind(global.conn)
    conn.connectionUpdate = connectionUpdate.bind(global.conn)
    conn.credsUpdate = saveCreds.bind(global.conn)

    conn.ev.on('call', async (call) => {
        if (global.antiCall && call[0]?.status === 'offer') {
            for (let id of call) {
                await conn.rejectCall(id.id, id.from)
                console.log(chalk.yellow(`📞 Call rejected from: ${id.from}`))
            }
        }
    })

    conn.ev.on('messages.upsert', conn.handler)
    conn.ev.on('group-participants.update', conn.participantsUpdate)
    conn.ev.on('groups.update', conn.groupsUpdate)
    conn.ev.on('message.delete', conn.onDelete)
    conn.ev.on('connection.update', conn.connectionUpdate)
    conn.ev.on('creds.update', conn.credsUpdate)
    
    isInit = false
    return true
}

// Plugin System
const pluginFolder = global.__dirname(join(__dirname, './plugins/index'))
const pluginFilter = filename => /\.js$/.test(filename)
global.plugins = {}

async function filesInit() {
    for (let filename of readdirSync(pluginFolder).filter(pluginFilter)) {
        try {
            let file = global.__filename(join(pluginFolder, filename))
            const module = await import(file)
            global.plugins[filename] = module.default || module
        } catch (e) {
            conn.logger.error(e)
            delete global.plugins[filename]
        }
    }
}
filesInit().then(_ => {
    console.log(chalk.green(`✓ Loaded ${Object.keys(global.plugins).length} plugins`))
}).catch(console.error)

global.reload = async (_ev, filename) => {
    if (pluginFilter(filename)) {
        let dir = global.__filename(join(pluginFolder, filename), true)
        if (filename in global.plugins) {
            if (existsSync(dir)) conn.logger.info(`♻️  Reloading plugin '${filename}'`)
            else {
                conn.logger.warn(`🗑️  Deleted plugin '${filename}'`)
                return delete global.plugins[filename]
            }
        } else conn.logger.info(`📦 Loading new plugin '${filename}'`)
        
        let err = syntaxerror(readFileSync(dir), filename, {
            sourceType: 'module',
            allowAwaitOutsideFunction: true
        })
        if (err) conn.logger.error(`❌ Syntax error in '${filename}'\n${format(err)}`)
        else try {
            const module = (await import(`${global.__filename(dir)}?update=${Date.now()}`))
            global.plugins[filename] = module.default || module
        } catch (e) {
            conn.logger.error(`❌ Error loading plugin '${filename}'\n${format(e)}`)
        } finally {
            global.plugins = Object.fromEntries(Object.entries(global.plugins).sort(([a], [b]) => a.localeCompare(b)))
        }
    }
}
Object.freeze(global.reload)
watch(pluginFolder, global.reload)
await global.reloadHandler()

async function _quickTest() {
    let test = await Promise.all([
        spawn('ffmpeg'),
        spawn('ffprobe'),
        spawn('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-filter_complex', 'color', '-frames:v', '1', '-f', 'webp', '-']),
        spawn('convert'),
        spawn('magick'),
        spawn('gm'),
        spawn('find', ['--version'])
    ].map(p => {
        return Promise.race([
            new Promise(resolve => {
                p.on('close', code => {
                    resolve(code !== 127)
                })
            }),
            new Promise(resolve => {
                p.on('error', _ => resolve(false))
            })
        ])
    }))

    let [ffmpeg, ffprobe, ffmpegWebp, convert, magick, gm, find] = test
    console.log(test)

    let s = global.support = {
        ffmpeg,
        ffprobe,
        ffmpegWebp,
        convert,
        magick,
        gm,
        find
    }

    Object.freeze(global.support)

    if (!s.ffmpeg) {
        conn.logger.warn('⚠️  Please install ffmpeg to send videos')
    }

    if (s.ffmpeg && !s.ffmpegWebp) {
        conn.logger.warn('⚠️  Stickers may not animate without libwebp in ffmpeg')
    }

    if (!s.convert && !s.magick && !s.gm) {
        conn.logger.warn('⚠️  Stickers may not work without imagemagick (pkg install imagemagick)')
    }
}

_quickTest()
    .then(() => conn.logger.info('✓ Quick Test Done'))
    .catch(console.error)
