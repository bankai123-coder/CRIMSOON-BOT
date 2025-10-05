import { cpus as _cpus, totalmem, freemem } from 'os'
import os from 'os'
import { performance } from 'perf_hooks'
import { sizeFormatter } from 'human-readable'
import { readFileSync } from 'fs'

let format = sizeFormatter({
  std: 'JEDEC',
  decimalPlaces: 2,
  keepTrailingZeroes: false,
  render: (literal, symbol) => `${literal} ${symbol}B`,
})

let handler = async (m, { conn }) => {
  let _muptime
  if (process.send) {
    process.send('uptime')
    _muptime = await new Promise(resolve => {
      process.once('message', resolve)
      setTimeout(resolve, 1000)
    }) * 1000
  }
  let muptime = clockString(_muptime)
  const used = process.memoryUsage()

  const cpus = _cpus().map(cpu => {
    cpu.total = Object.values(cpu.times).reduce((a, b) => a + b, 0)
    return cpu
  })

  const cpuAggregated = cpus.reduce((last, cpu, _, { length }) => {
    last.total += cpu.total
    last.speed += cpu.speed / length
    last.times.user += cpu.times.user
    last.times.nice += cpu.times.nice
    last.times.sys += cpu.times.sys
    last.times.idle += cpu.times.idle
    last.times.irq += cpu.times.irq
    return last
  }, {
    speed: 0,
    total: 0,
    times: { user: 0, nice: 0, sys: 0, idle: 0, irq: 0 }
  })

  let avgSpeed = cpuAggregated.speed
  if (!avgSpeed || avgSpeed === 0) {
    try {
      const cpuInfo = readFileSync('/proc/cpuinfo', 'utf8')
      const speedMatches = cpuInfo.split('\n')
        .filter(line => line.startsWith('cpu MHz'))
        .map(line => parseFloat(line.split(':')[1].trim()))
      if (speedMatches.length > 0) {
        avgSpeed = speedMatches.reduce((a, b) => a + b, 0) / speedMatches.length
      }
    } catch (e) {
      avgSpeed = cpus[0] ? cpus[0].speed : 0
    }
  }

  const mainCpuSpeed = cpus[0].speed === 0 ? avgSpeed : cpus[0].speed

  const networkInterfaces = os.networkInterfaces()
  let ipv4Addresses = []
  let ipv6Addresses = []
  Object.values(networkInterfaces).forEach(ifaces => {
    if (ifaces) {
      ifaces.forEach(iface => {
        if (!iface.internal) {
          if (iface.family === 'IPv4') ipv4Addresses.push(iface.address)
          else if (iface.family === 'IPv6') ipv6Addresses.push(iface.address)
        }
      })
    }
  })

  let old = performance.now()
  await m.reply('Checking speed...')
  let neww = performance.now()
  let speed = neww - old

  let result = `───[ BOT SERVER STATUS ]───

Ping       : ${Math.round(speed)} ms
Uptime     : ${muptime}

───[ SERVER INFO ]───
Memory     : ${format(totalmem() - freemem())} / ${format(totalmem())}
OS         : ${os.platform()}
Hostname   : root@shirokami
IPv4       : ${ipv4Addresses.join(', ') || 'N/A'}
IPv6       : ${ipv6Addresses.join(', ') || 'N/A'}

───[ NODEJS MEMORY USAGE ]───
${Object.keys(used).map(k => `${k.padEnd(12)} : ${format(used[k])}`).join('\n')}

${cpus[0] ? `
───[ CPU INFO ]───
Model      : ${cpus[0].model.trim()}
Clock      : ${mainCpuSpeed.toFixed(2)} MHz

${Object.keys(cpus[0].times).map(type =>
  `${type.padEnd(8)} : ${(100 * cpus[0].times[type] / cpus[0].total).toFixed(2)} %`
).join('\n')}
` : ''}

───[ CPU CORES USAGE (${cpus.length} Core) ]───
${cpus.map((cpu, i) =>
  `#${i + 1} ${cpu.model.trim()} (${cpu.speed === 0 ? avgSpeed.toFixed(2) : cpu.speed} MHz)
${Object.keys(cpu.times).map(type =>
  `  - ${type.padEnd(8)} : ${(100 * cpu.times[type] / cpu.total).toFixed(2)} %`
).join('\n')}`
).join('\n\n')}
`

  await conn.sendMessage(m.chat, {
    image: { url: 'https://files.catbox.moe/jjilec.jpg' },
    caption: result
  }, { quoted: m })
}

handler.help = ['ping', 'speed', 'info']
handler.tags = ['info']
handler.command = /^(ping|speed|info)$/i

export default handler

function clockString(ms) {
  if (isNaN(ms)) return '--'
  let d = Math.floor(ms / 86400000)
  let h = Math.floor(ms / 3600000) % 24
  let mnt = Math.floor(ms / 60000) % 60
  let s = Math.floor(ms / 1000) % 60
  return `${d} Days, ${h} Hours, ${mnt} Minutes, ${s} Seconds`
}