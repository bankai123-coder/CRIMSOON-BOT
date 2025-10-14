import { spawn } from 'child_process';

let handler = async (m, { conn, isROwner, text }) => {
    if (!process.send) {
        throw 'لا يمكن تنفيذ أمر إعادة التشغيل.\nيجب تشغيل البوت باستخدام `node index.js` لتفعيل هذه الميزة.';
    }
    
    if (global.conn.user.jid === conn.user.jid) {
        await m.reply('⏳ جارٍ إعادة تشغيل البوت...');
        process.send('reset');
    } else {
        throw 'لا يمكن استخدام هذا الأمر إلا من خلال الجلسة الرئيسية للبوت.';
    }
};

handler.help = ['restart', 'إعادة_التشغيل'];
handler.tags = ['owner'];
handler.command = /^(res(tart)?|إعادة_التشغيل)$/i;

handler.rowner = true;

export default handler;
