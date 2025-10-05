import yargs from 'yargs'
import cfonts from 'cfonts'
import { fileURLToPath } from 'url'
import { join, dirname } from 'path'
import { createRequire } from 'module'
import { createInterface } from 'readline'
import { setupMaster, fork } from 'cluster'
import { watchFile, unwatchFile } from 'fs'

// Setup console output
const { say } = cfonts
const rl = createInterface(process.stdin, process.stdout)
const __dirname = dirname(fileURLToPath(import.meta.url))
const require = createRequire(__dirname)
const { name, author } = require(join(__dirname, './package.json'))

// Crimson Bot Banner
say('CRIMSON', { 
    font: 'block', 
    align: 'center', 
    gradient: ['red', 'magenta'] 
})

say('WhatsApp Bot Premium', { 
    font: 'console', 
    align: 'center', 
    gradient: ['red', 'magenta'] 
})

console.log('\n╔════════════════════════════════════════════════════════════════╗')
console.log('║                                                                ║')
console.log('║              🤖 Crimson Bot - Premium Edition 🤖              ║')
console.log('║                      Version 3.0.0                            ║')
console.log('║                   Developer: Crimson Team                     ║')
console.log('║                                                                ║')
console.log('╚════════════════════════════════════════════════════════════════╝\n')

console.log('🚀 Starting Crimson Bot...\n')

var isRunning = false

/**
 * Start a js file
 * @param {String} file `path/to/file`
 */
function start(file) {
    if (isRunning) return
    isRunning = true

    let args = [join(__dirname, file), ...process.argv.slice(2)]
    say([process.argv[0], ...args].join(' '), { 
        font: 'console', 
        align: 'center', 
        gradient: ['red', 'magenta'] 
    })
    
    setupMaster({ exec: args[0], args: args.slice(1) })
    let p = fork()

    p.on('message', data => {
        console.log('[📩 RECEIVED]', data)
        switch (data) {
            case 'reset':
                p.kill()
                isRunning = false
                start(file)
                break
            case 'uptime':
                p.send(process.uptime())
                break
            default:
                console.warn('[⚠️ UNRECOGNIZED MESSAGE]', data)
        }
    })

    p.on('exit', (_, code) => {
        isRunning = false
        console.error('[❌ Exited with code:', code + ']')
        
        if (code !== 0) {
            console.log('[🔄 Auto-restart enabled, restarting...]')
            return start(file)
        }
        
        watchFile(args[0], () => {
            unwatchFile(args[0])
            start(file)
        })
    })

    let opts = yargs(process.argv.slice(2)).exitProcess(false).parse()
    
    if (!opts['test']) {
        if (!rl.listenerCount()) {
            rl.on('line', line => {
                p.emit('message', line.trim())
            })
        }
    }
}

// Graceful Shutdown
process.on('SIGINT', () => {
    console.log('\n\n⚠️  Shutting down gracefully...')
    process.exit(0)
})

process.on('SIGTERM', () => {
    console.log('\n\n⚠️  Terminating...')
    process.exit(0)
})

process.on('unhandledRejection', (reason, promise) => {
    console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason)
})

process.on('uncaughtException', (error) => {
    console.error('❌ Uncaught Exception:', error)
})

start('main.js')
