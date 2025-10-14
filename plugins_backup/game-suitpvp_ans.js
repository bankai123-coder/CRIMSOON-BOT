let handler = m => m

handler.before = async function (m) {
    this.suit = this.suit || {}
    if (!m.sender) return
    if (!global.db.data.users[m.sender]) global.db.data.users[m.sender] = { exp: 0, suit: 0 };
    if (global.db.data.users[m.sender].suit < 0) global.db.data.users[m.sender].suit = 0

    let room = Object.values(this.suit).find(room => room.id && room.status && [room.p, room.p2].includes(m.sender))
    if (room) {
        let win = ''
        let tie = false

        const responses = /^(acc(ept)?|terima|gas|oke?|tolak|gamau|nanti|ga(k.)?bisa|قبول|موافق|رفض|لا)/i
        const rejection = /^(tolak|gamau|nanti|ga(k.)?bisa|رفض|لا)/i

        if (m.sender === room.p2 && responses.test(m.text) && m.isGroup && room.status === 'wait') {
            if (rejection.test(m.text)) {
                this.reply(m.chat, `@${room.p2.split('@')[0]} رفض المباراة، تم إلغاء المباراة.`, m, { mentions: [room.p2] })
                delete this.suit[room.id]
                return true
            }
            room.status = 'play'
            room.asal = m.chat
            clearTimeout(room.waktu)

            this.reply(m.chat, `تم إرسال المباراة إلى:\n@${room.p.split('@')[0]} و @${room.p2.split('@')[0]}\n\nالرجاء اختيار حجر أو ورق أو مقص في الدردشة الخاصة بكل منكم.\nانقر فوق wa.me/${conn.user.jid.split('@')[0]}`, m, { mentions: [room.p, room.p2] })

            const choiceMessage = `الرجاء اختيار *حجر* أو *ورق* أو *مقص*\n\nفوز +${room.poin} XP\nخسارة -${room.poin_lose} XP`
            await this.reply(room.p, choiceMessage, null)
            await this.reply(room.p2, choiceMessage, null)

            room.waktu_milih = setTimeout(() => {
                if (!room.pilih && !room.pilih2) {
                    this.reply(m.chat, `لم يختر كلا اللاعبين.\nتم إلغاء المباراة.`, m)
                } else if (!room.pilih || !room.pilih2) {
                    win = !room.pilih ? room.p2 : room.p
                    const loser = win === room.p ? room.p2 : room.p
                    this.reply(m.chat, `@${loser.split('@')[0]} لم يختر، انتهت اللعبة.`, m, { mentions: [loser] })
                    global.db.data.users[win].exp += room.poin
                    global.db.data.users[loser].exp -= room.poin_lose
                }
                delete this.suit[room.id]
                return true
            }, room.timeout)
            return true
        }

        const choiceRegex = /^(gunting|batu|kertas|حجر|ورق|مقص)/i
        let isPlayer1 = m.sender === room.p
        let isPlayer2 = m.sender === room.p2

        if ((isPlayer1 && !room.pilih) || (isPlayer2 && !room.pilih2)) {
            if (choiceRegex.test(m.text) && !m.isGroup) {
                const choice = choiceRegex.exec(m.text.toLowerCase())[0]
                if (isPlayer1) {
                    room.pilih = choice
                    room.text = m.text
                    m.reply(`لقد اخترت ${m.text}${!room.pilih2 ? '\n\nفي انتظار اختيار الخصم' : ''}`)
                    if (!room.pilih2) this.reply(room.p2, '_لقد اختار الخصم_\nحان دورك الآن', null)
                } else { 
                    room.pilih2 = choice
                    room.text2 = m.text
                    m.reply(`لقد اخترت ${m.text}${!room.pilih ? '\n\nفي انتظار اختيار الخصم' : ''}`)
                    if (!room.pilih) this.reply(room.p, '_لقد اختار الخصم_\nحان دورك الآن', null)
                }
            }
        }

        if (room.pilih && room.pilih2) {
            clearTimeout(room.waktu_milih)

            const rock = /^(batu|حجر)$/i
            const scissors = /^(gunting|مقص)$/i
            const paper = /^(kertas|ورق)$/i

            let p1 = room.pilih
            let p2 = room.pilih2

            if (p1 === p2) {
                tie = true
            } else if (
                (rock.test(p1) && scissors.test(p2)) ||
                (scissors.test(p1) && paper.test(p2)) ||
                (paper.test(p1) && rock.test(p2))
            ) {
                win = room.p
            } else {
                win = room.p2
            }

            this.reply(room.asal,
                `_*نتيجة المباراة*_${tie ? '\nتعادل!' : ''}\n\n` +
                `@${room.p.split('@')[0]} (${room.text}) ${tie ? '' : room.p === win ? `فاز +${room.poin} XP` : `خسر -${room.poin_lose} XP`}\n` +
                `@${room.p2.split('@')[0]} (${room.text2}) ${tie ? '' : room.p2 === win ? `فاز +${room.poin} XP` : `خسر -${room.poin_lose} XP`}\n`
                .trim(), null, { mentions: [room.p, room.p2] }
            )

            if (!tie) {
                const loser = win === room.p ? room.p2 : room.p
                global.db.data.users[win].exp += room.poin
                global.db.data.users[loser].exp -= room.poin_lose
            }
            delete this.suit[room.id]
        }
    }
    return true
}

handler.exp = 0
export default handler
