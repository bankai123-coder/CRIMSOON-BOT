export async function before(m) {
    try {
        let id = m.chat;
        let timeout = 180000;
        let reward = randomInt(100, 80000);
        let users = global.db.data.users[m.sender];
        let body = typeof m.text == 'string' ? m.text : false;
        this.bomb = this.bomb ? this.bomb : {};
        if (!this.bomb[id]) return !1
        let isSurrender = /^((me)?nyerah|surr?ender|استسلام)$/i.test(m.text);
        if (isSurrender) {
            await this.reply(m.chat, `🚩 استسلمت :(`, m);
            clearTimeout(this.bomb[id][2]);
            delete this.bomb[id];
        }

        if (this.bomb[id] && m.quoted && m.quoted.id == this.bomb[id][3].id && !isNaN(body)) {
            let json = this.bomb[id][1].find(v => v.position == body);
            if (!json) return this.reply(m.chat, `🚩 لفتح صندوق، أرسل رقمًا من 1 إلى 9`, m);

            if (json.emot == '💥') {
                json.state = true;
                let bomb = this.bomb[id][1];
                let teks = `乂 *قنبلة*\n\n`;
                teks += bomb.slice(0, 3).map(v => v.state ? v.emot : v.number).join('') + '\n';
                teks += bomb.slice(3, 6).map(v => v.state ? v.emot : v.number).join('') + '\n';
                teks += bomb.slice(6).map(v => v.state ? v.emot : v.number).join('') + '\n\n';
                teks += `الوقت المتبقي: [ *${((timeout / 1000) / 60)} دقيقة* ]\n`;
                teks += `*انتهت اللعبة!*، الصندوق الذي فتحته يحتوي على قنبلة: (- *${formatNumber(reward)}*)`;

                this.reply(m.chat, teks, m).then(() => {
                    users.exp < reward ? users.exp = 0 : users.exp -= reward;
                    clearTimeout(this.bomb[id][2]);
                    delete this.bomb[id];
                });
            } else if (json.state) {
                return this.reply(m.chat, `🚩 الصندوق ${json.number} مفتوح بالفعل، يرجى اختيار صندوق آخر.`, m);
            } else {
                json.state = true;
                let changes = this.bomb[id][1];
                let open = changes.filter(v => v.state && v.emot != '💥').length;

                if (open >= 8) {
                    let teks = `乂 *قنبلة*\n\n`;
                    teks += `أرسل رقمًا من *1* إلى *9* لفتح *9* صناديق مرقمة أدناه:\n\n`;
                    teks += changes.slice(0, 3).map(v => v.state ? v.emot : v.number).join('') + '\n';
                    teks += changes.slice(3, 6).map(v => v.state ? v.emot : v.number).join('') + '\n';
                    teks += changes.slice(6).map(v => v.state ? v.emot : v.number).join('') + '\n\n';
                    teks += `الوقت المتبقي: [ *${((timeout / 1000) / 60)} دقيقة* ]\n`;
                    teks += `*انتهت اللعبة!* لم يتم فتح الصندوق الذي يحتوي على قنبلة: (+ *${formatNumber(reward)}*)`;

                    this.reply(m.chat, teks, m).then(() => {
                        users.exp += reward;
                        clearTimeout(this.bomb[id][2]);
                        delete this.bomb[id];
                    });
                } else {
                    let teks = `乂 *قنبلة*\n\n`;
                    teks += `أرسل رقمًا من *1* إلى *9* لفتح *9* صناديق مرقمة أدناه:\n\n`;
                    teks += changes.slice(0, 3).map(v => v.state ? v.emot : v.number).join('') + '\n';
                    teks += changes.slice(3, 6).map(v => v.state ? v.emot : v.number).join('') + '\n';
                    teks += changes.slice(6).map(v => v.state ? v.emot : v.number).join('') + '\n\n';
                    teks += `الوقت المتبقي: [ *${((timeout / 1000) / 60)} دقيقة* ]\n`;
                    teks += `لم يتم فتح الصندوق الذي يحتوي على قنبلة: (+ *${formatNumber(reward)}*)`;

                    this.relayMessage(m.chat, {
                    protocolMessage: {
                        key: this.bomb[id][3],
                        type: 14,
                        editedMessage: {
                            conversation: teks
                        }
                    }
                }, {}).then(() => {
                        users.exp += reward;
                    });
                }
            }
        }
    } catch (e) {
      console.log(e)
    }
}

export const exp = 0;

function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function formatNumber(number) {
    return number.toLocaleString();
}