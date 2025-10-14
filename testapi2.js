/**
 * test_plugins_fixed.js
 * Improved plugin tester for CRIMSOON-BOT plugins.
 * Fixed path issues for CRIMSOON-BOT directory structure.
 */

import fs from 'fs';
import path from 'path';
import url from 'url';

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));
// ✅ المسار الصحيح لمجلد plugins
const pluginsDir = path.join(__dirname, 'plugins');
const logDir = path.join(__dirname, 'logs');
const logPath = path.join(logDir, 'plugin_report_fixed.txt');

if (!fs.existsSync(logDir)) fs.mkdirSync(logDir, { recursive: true });

// تأكد من وجود مجلد plugins
if (!fs.existsSync(pluginsDir)) {
    console.error(`❌ مجلد plugins غير موجود في: ${pluginsDir}`);
    console.log('📁 هيكل المجلدات المتوقع:');
    console.log('CRIMSOON-BOT/');
    console.log('  ├── plugins/');
    console.log('  ├── logs/');
    console.log('  └── testapi2.js');
    process.exit(1);
}

console.log(`📁 مجلد plugins موجود في: ${pluginsDir}`);

// SSL bypass for local test environments
import axios from 'axios';
import https from 'https';

const httpsAgent = new https.Agent({ rejectUnauthorized: false, keepAlive: true });
axios.defaults.httpsAgent = httpsAgent;
axios.defaults.timeout = 20000;

// --- Sample links & inputs ---
const sampleLinks = {
    tiktok: "https://www.tiktok.com/@scout2015/video/6718335390845095173",
    youtube: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    instagram: "https://www.instagram.com/p/CwV2q4vMZlt/",
    facebook: "https://www.facebook.com/watch/?v=10153231379946729",
    twitter: "https://x.com/elonmusk/status/1703854632157794685",
    spotify: "https://open.spotify.com/track/4cOdK2wGLETKBW3PvgPWqT"
};

const testInputs = {
    search: "hello",
    download: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    ai: "hello",
    game: "start",
    tool: "test",
    nsfw: "random",
    maker: "test text",
    quotes: "random",
    fun: "test"
};

// --- Robust shims to satisfy plugins expecting runtime globals ---
global.db = {
    data: {
        users: {
            '1234567890@s.whatsapp.net': {
                name: 'Test User',
                limit: 10,
                premium: false,
                registered: true
            }
        },
        chats: {
            '1234567890-1234567890@g.us': {
                isBanned: false,
                welcome: false,
                detect: false
            }
        },
        stats: {},
        settings: {}
    }
};

global.wm = '© CRIMSOON-BOT';
global.opts = {};
global.API = (name) => `https://api.example.com/${name}`;
global.wait = (ms) => new Promise(res => setTimeout(res, ms));

// إصلاح دالة getRandom
if (!Array.prototype.getRandom) {
    Array.prototype.getRandom = function () {
        return this[Math.floor(Math.random() * this.length)];
    };
}

// Enhanced fake message
const fakeMessage = {
    chat: "1234567890-1234567890@g.us",
    sender: "1234567890@s.whatsapp.net",
    from: "1234567890@s.whatsapp.net",
    key: {
        remoteJid: "1234567890-1234567890@g.us",
        fromMe: false,
        id: "test123"
    },
    body: "test",
    text: "test",
    isGroup: true,
    participants: [
        { id: '1234567890@s.whatsapp.net', admin: true },
        { id: '1234567891@s.whatsapp.net', admin: false }
    ],
    mentionedJid: [],
    quoted: null,
    reply: async (text) => {
        console.log(`[Reply] ${String(text).slice(0, 200)}`);
        return Promise.resolve();
    },
    react: async (emoji) => {
        console.log(`[React] ${emoji}`);
        return Promise.resolve();
    },
    getQuotedObj: () => null
};

// Enhanced fake connection with many methods used by plugins
const fakeConn = {
    user: {
        id: '1234567890',
        name: 'Test User',
        jid: '1234567890@s.whatsapp.net'
    },
    sendMessage: async (chat, content, options = {}) => {
        const contentStr = typeof content === 'object' ?
            JSON.stringify(content).slice(0, 200) :
            String(content).slice(0, 200);
        console.log(`[sendMessage] ${contentStr}`);
        return Promise.resolve();
    },
    sendFile: async (chat, buffer, filename, caption, quoted) => {
        console.log(`[sendFile] ${filename || 'file'} - ${caption || 'No caption'}`);
        return Promise.resolve();
    },
    sendImage: async (chat, buffer, caption, quoted) => {
        console.log(`[sendImage] ${caption || 'No caption'}`);
        return Promise.resolve();
    },
    sendVideo: async (chat, buffer, caption, quoted) => {
        console.log(`[sendVideo] ${caption || 'No caption'}`);
        return Promise.resolve();
    },
    sendAudio: async (chat, buffer, quoted, ptt = true) => {
        console.log(`[sendAudio]`);
        return Promise.resolve();
    },
    reply: async (jid, text, quoted = null) => {
        console.log(`[conn.reply] ${String(text).slice(0, 200)}`);
        return Promise.resolve();
    },
    getName: (jid) => 'Test User',
    profilePictureUrl: async (jid, fallback = false) => 'https://i.imgur.com/OZaT7jl.png',
    groupMetadata: async (jid) => ({
        id: jid,
        subject: 'Test Group',
        participants: [
            { id: '1234567890@s.whatsapp.net', admin: true },
            { id: '1234567891@s.whatsapp.net', admin: false }
        ],
        creation: Date.now()
    }),
    groupFetchAllParticipating: async () => ({}),
    sendPresenceUpdate: async () => { },
    updatePresence: async () => { },
    fetchPrivacySettings: async () => ({}),
    on: () => { },
};

// Function to detect plugin type heuristically
function getPluginType(pluginName) {
    const name = pluginName.toLowerCase();
    if (name.includes('search')) return 'search';
    if (name.includes('download') || name.includes('dl')) return 'download';
    if (name.includes('ai') || name.includes('gpt') || name.includes('chat')) return 'ai';
    if (name.includes('game')) return 'game';
    if (name.includes('tool')) return 'tool';
    if (name.includes('nsfw')) return 'nsfw';
    if (name.includes('maker')) return 'maker';
    if (name.includes('quote')) return 'quotes';
    if (name.includes('fun')) return 'fun';
    return 'general';
}

function getTestInput(pluginName, pluginType) {
    for (const [platform, link] of Object.entries(sampleLinks)) {
        if (pluginName.toLowerCase().includes(platform)) return link;
    }
    return testInputs[pluginType] || "hello";
}

function logResult(line) {
    const timestamp = new Date().toLocaleTimeString();
    const logLine = `[${timestamp}] ${line}`;
    console.log(logLine);
    fs.appendFileSync(logPath, logLine + '\n');
}

// Try to call plugin safely: supports several export shapes
async function callPluginExport(exported, context) {
    if (typeof exported === 'function') {
        return await exported.call(context, context.m, context);
    }
    if (exported && typeof exported.handler === 'function') {
        return await exported.handler.call(context, context.m, context);
    }
    if (exported && typeof exported.default === 'function') {
        return await exported.default.call(context, context.m, context);
    }
    if (exported && exported.default && typeof exported.default.handler === 'function') {
        return await exported.default.handler.call(context, context.m, context);
    }
    throw new Error('No callable handler/function found in plugin export');
}

async function testPlugin(filePath) {
    const pluginName = path.basename(filePath);
    const pluginType = getPluginType(pluginName);
    const testInput = getTestInput(pluginName, pluginType);

    logResult(`🧪 Testing ${pluginName} (type: ${pluginType})`);

    try {
        // استيراد البرنامج المساعد
        const imported = await import(url.pathToFileURL(filePath).href + '?update=' + Date.now());
        const exported = imported.default || imported.handler || imported;

        // إنشاء سياق الاختبار
        const context = {
            conn: fakeConn,
            m: Object.assign({}, fakeMessage),
            text: testInput,
            args: [testInput],
            command: pluginName.replace('.js', ''),
            prefix: '.',
            axios,
            httpsAgent,
            global
        };

        // إضافة أسماء مستعارة مفيدة
        context.conn.reply = context.conn.reply || ((jid, text, q) => fakeConn.sendMessage(jid, { text }, { quoted: q }));
        context.m.reply = context.m.reply || ((text) => Promise.resolve(console.log('[m.reply]', text)));
        context.conn.getName = context.conn.getName || fakeConn.getName;

        // تنفيذ البرنامج المساعد
        const result = await Promise.race([
            callPluginExport(exported, context),
            new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout (20s)')), 20000))
        ]);

        logResult(`✅ ${pluginName} — executed without uncaught error`);
        return { success: true, plugin: pluginName };

    } catch (err) {
        const message = err?.message || String(err);
        let reason = message;

        if (/ECONNREFUSED/i.test(message)) reason = 'Connection refused (API down)';
        else if (/Invalid URL/i.test(message)) reason = 'Invalid URL';
        else if (/timeout/i.test(message)) reason = 'Timeout';
        else if (/ENOTFOUND/i.test(message)) reason = 'Host not found';
        else if (/SSL|CERT/i.test(message)) reason = 'SSL/Certificate issue';
        else if (/404/i.test(message)) reason = '404 Not Found';
        else if (/500|503/i.test(message)) reason = 'Server Error';
        else if (/429/i.test(message)) reason = 'Rate Limited';
        else if (/UNABLE_TO_GET_ISSUER_CERT/i.test(message)) reason = 'SSL Certificate Error';

        logResult(`❌ ${pluginName}: ${reason}`);
        return { success: false, plugin: pluginName, error: reason };
    }
}

function generateReport(results) {
    const total = results.length;
    const successful = results.filter(r => r.success).length;
    const failed = total - successful;

    const report = `
📊 Improved Plugin Test Report
⏰ Run at: ${new Date().toLocaleString()}
📁 Total plugins: ${total}
✅ Successful: ${successful}
❌ Failed: ${failed}
📈 Success rate: ${((successful / total) * 100).toFixed(1)}%

✅ Successful plugins:
${results.filter(r => r.success).map(r => ' - ' + r.plugin).join('\n')}

❌ Failed plugins:
${results.filter(r => !r.success).map(r => ' - ' + r.plugin + ': ' + (r.error || 'error')).join('\n')}
`;

    const detailedReportPath = path.join(logDir, 'detailed_report_fixed.txt');
    fs.writeFileSync(detailedReportPath, report);
    console.log(report);
    console.log(`\n📄 Detailed report saved to: ${detailedReportPath}`);
}

async function testAllPlugins() {
    console.log('🚀 Starting improved plugin tests...\n');

    const files = fs.readdirSync(pluginsDir)
        .filter(f => f.endsWith('.js'))
        .filter(f => !f.startsWith('_'));

    console.log(`📁 Found ${files.length} plugin files\n`);

    const results = [];
    let processed = 0;

    for (const file of files) {
        processed++;
        console.log(`[${processed}/${files.length}] Testing: ${file}`);
        
        const filePath = path.join(pluginsDir, file);
        const result = await testPlugin(filePath);
        results.push(result);

        // تأخير بسيط بين الاختبارات
        await new Promise(r => setTimeout(r, 100));
    }

    generateReport(results);
    return results;
}

// إذا تم تنفيذ الملف مباشرة
if (import.meta.url === url.pathToFileURL(process.argv[1]).href) {
    (async () => {
        try {
            await testAllPlugins();
        } catch (error) {
            console.error('❌ Error running tests:', error);
        }
    })();
}

export { testAllPlugins };
