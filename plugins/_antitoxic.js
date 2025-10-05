let badwordRegex = /anj(k|g)|ajn?(g|k)|a?njin(g|k)|bajingan|b(a?n)?gsa?t|ko?nto?l|me?me?(k|q)|pe?pe?(k|q)|meki|titi(t|d)|pe?ler|tetek|toket|ngewe|go?blo?k|to?lo?l|idiot|(k|ng)e?nto?(t|d)|jembut|bego|dajj?al|janc(u|o)k|pantek|puki ?(mak)?|kimak|kampang|lonte|col(i|mek?)|pelacur|henceu?t|nigga|fuck|dick|bitch|tits|bastard|asshole|dontol|kontoi|ontol|كلب|كلبة|حقير|لعين|ممارسة الجنس|غبي|أحمق|أبله|عضو ذكري|شاذ|قحبة|ثدي|وغد|وغد/i // Arabic bad words added

export function before(m, { isBotAdmin }) {
    if (m.isBaileys && m.fromMe) return !0
    let chat = global.db.data.chats[m.chat]
    let user = global.db.data.users[m.sender]
    let isBadword = badwordRegex.exec(m.text)
    console.log(isBadword)

    if (chat.antiBadword && isBadword) {
        user.warning += 1
        m.reply('لا تكن سامًا!!\n' + `لديك ${user.warning} تحذيرات` + '\nلإيقاف هذا، اكتب *.disable antibadword*')
        if (user.warning >= 5) {
            user.banned = false
            user.warning = 0
            if (m.isGroup) {
                if (isBotAdmin) {
                    this.groupParticipantsUpdate(m.chat, [m.sender], "remove")
                }
            }
        }
    }
    return !0
}