let handler = async (m, { conn }) => {
    conn.bomb = conn.bomb || {};
    let id = m.chat,
        timeout = 180000;
    if (id in conn.bomb) return conn.reply(m.chat, '*^ هذه الجلسة لم تنته بعد!*', conn.bomb[id][0]);
    const bom = ['💥', '✅', '✅', '✅', '✅', '✅', '✅', '✅', '✅'].sort(() => Math.random() - 0.5);
    const number = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣'];
    const array = bom.map((v, i) => ({
        emot: v,
        number: number[i],
        position: i + 1,
        state: false
    }));
    let teks = `乂 *قنبلة*\n\nأرسل رقمًا من *1* إلى *9* لفتح *9* صناديق مرقمة أدناه:\n\n`;
    for (let i = 0; i < array.length; i += 3) teks += array.slice(i, i + 3).map(v => v.state ? v.emot : v.number).join('') + '\n';
    teks += `\nالوقت المتبقي: [ *${((timeout / 1000) / 60)} دقيقة* ]\nإذا حصلت على صندوق يحتوي على قنبلة، فسيتم خصم نقاطك.`;
    let msg = await conn.reply(m.chat, teks, m);
    let { key } = msg

    let v;
    conn.bomb[id] = [
        msg,
        array,
        setTimeout(() => {
            v = array.find(v => v.emot == '💥');
            if (conn.bomb[id]) conn.reply(m.chat, `*انتهى الوقت!*، القنبلة كانت في الصندوق رقم ${v.number}.`, conn.bomb[id][0].key);
            delete conn.bomb[id];
        }, timeout),
        key
    ];

};

handler.help = ["bomb"];
handler.tags = ["game"];
handler.command = /^(bomb|قنبلة)$/i;

export default handler;