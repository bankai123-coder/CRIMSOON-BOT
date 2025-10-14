import fs from "fs";
import path from "path";
import url from "url";
import axios from "axios";
import https from "https";

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));
const pluginsDir = path.join(__dirname, "plugins");
const logDir = path.join(__dirname, "logs");
const logPath = path.join(logDir, "plugin_report.txt");

if (!fs.existsSync(logDir)) fs.mkdirSync(logDir);

// 🔐 تجاوز أخطاء SSL
const httpsAgent = new https.Agent({ 
  rejectUnauthorized: false,
  keepAlive: true 
});

// ⚙️ إعدادات axios العالمية
axios.defaults.httpsAgent = httpsAgent;
axios.defaults.timeout = 10000;

// 📎 روابط اختبار صحيحة لكل منصة
const sampleLinks = {
  tiktok: "https://www.tiktok.com/@scout2015/video/6718335390845095173",
  youtube: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
  instagram: "https://www.instagram.com/p/CwV2q4vMZlt/",
  facebook: "https://www.facebook.com/watch/?v=10153231379946729",
  twitter: "https://x.com/elonmusk/status/1703854632157794685",
  pinterest: "https://www.pinterest.com/pin/993607355001677491/",
  reddit: "https://www.reddit.com/r/aww/comments/1f0x5l/cute_cat_video/",
  spotify: "https://open.spotify.com/track/4cOdK2wGLETKBW3PvgPWqT",
  soundcloud: "https://soundcloud.com/aviciiofficial/avicii-wake-me-up",
  pinterest: "https://www.pinterest.com/pin/993607355001677491/"
};

// 🎯 كلمات اختبار لكل نوع من الإضافات
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

// 💬 Fake WhatsApp message محسنة
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
  reply: (text) => {
    console.log(`[Reply] ${text}`);
    return Promise.resolve();
  },
  react: (emoji) => {
    console.log(`[React] ${emoji}`);
    return Promise.resolve();
  }
};

// 💬 Fake connection محسنة
const fakeConn = {
  sendMessage: (chat, content, options = {}) => {
    console.log(`[sendMessage]`, JSON.stringify(content, null, 2));
    return Promise.resolve();
  },
  sendFile: (chat, buffer, filename, caption, quoted) => {
    console.log(`[sendFile] ${filename || 'file'} - ${caption || 'No caption'}`);
    return Promise.resolve();
  },
  sendImage: (chat, buffer, caption, quoted) => {
    console.log(`[sendImage] ${caption || 'No caption'}`);
    return Promise.resolve();
  },
  sendVideo: (chat, buffer, caption, quoted) => {
    console.log(`[sendVideo] ${caption || 'No caption'}`);
    return Promise.resolve();
  },
  sendAudio: (chat, buffer, quoted, ptt = true) => {
    console.log(`[sendAudio]`);
    return Promise.resolve();
  },
  getName: (jid) => 'Test User',
  user: {
    id: '1234567890',
    name: 'Test User',
    jid: '1234567890@s.whatsapp.net'
  }
};

// 🧠 تحليل نوع الإضافة من اسمها
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

// 🎯 الحصول على المدخل المناسب للإضافة
function getTestInput(pluginName, pluginType) {
  // أولاً تحقق من وجود رابط مناسب في اسم الإضافة
  for (const [platform, link] of Object.entries(sampleLinks)) {
    if (pluginName.toLowerCase().includes(platform)) {
      return link;
    }
  }
  
  // ثم استخدم المدخل المناسب لنوع الإضافة
  return testInputs[pluginType] || "hello";
}

// 🧩 اختبار إضافة واحدة
async function testPlugin(filePath) {
  const pluginName = path.basename(filePath);
  const pluginType = getPluginType(pluginName);
  const testInput = getTestInput(pluginName, pluginType);

  console.log(`\n🧪 Testing: ${pluginName}`);
  console.log(`📝 Type: ${pluginType} | Input: ${testInput.substring(0, 50)}...`);

  try {
    // استيراد الإضافة
    const imported = await import(url.pathToFileURL(filePath));
    const plugin = imported.default || imported.handler;
    
    if (typeof plugin !== "function") {
      throw new Error("plugin is not a function");
    }

    // إعداد وسيط الاختبار
    const testContext = {
      conn: fakeConn,
      m: fakeMessage,
      text: testInput,
      args: [testInput],
      command: pluginName.replace('.js', ''),
      prefix: '.',
      axios,
      httpsAgent
    };

    // 🕒 تنفيذ الإضافة مع مهلة
    const result = await Promise.race([
      plugin.call(testContext, testContext.m, testContext),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error("⌛ Timeout (15s)")), 15000)
      )
    ]);

    logResult(`✅ ${pluginName} — Works fine\n`);
    return { success: true, plugin: pluginName };

  } catch (err) {
    const errorMsg = err?.message || String(err);
    let reason = `❗ ${errorMsg}`;

    // تصنيف الأخطاء
    if (errorMsg.includes("ECONNREFUSED")) reason = "❌ Connection refused (API down)";
    else if (errorMsg.includes("Invalid URL")) reason = "⚠️ Invalid URL";
    else if (errorMsg.includes("timeout") || errorMsg.includes("Timeout")) reason = "⌛ Timeout (15s)";
    else if (errorMsg.includes("ENOTFOUND")) reason = "❌ Host not found";
    else if (errorMsg.includes("SSL") || errorMsg.includes("CERT")) reason = "🔒 SSL Error";
    else if (errorMsg.includes("UNABLE_TO_GET_ISSUER_CERT")) reason = "🔒 SSL Certificate Error";
    else if (errorMsg.includes("404")) reason = "❌ 404 Not Found";
    else if (errorMsg.includes("500") || errorMsg.includes("503")) reason = "❌ Server Error";
    else if (errorMsg.includes("429")) reason = "🚫 Rate Limited";

    logResult(`${pluginName}: ${reason}\n`);
    return { success: false, plugin: pluginName, error: reason };
  }
}

// ✍️ تسجيل النتيجة
function logResult(line) {
  const timestamp = new Date().toLocaleTimeString();
  const logLine = `[${timestamp}] ${line}`;
  console.log(logLine.trim());
  fs.appendFileSync(logPath, logLine);
}

// 📊 إنشاء تقرير مفصل
function generateReport(results) {
  const total = results.length;
  const successful = results.filter(r => r.success).length;
  const failed = total - successful;
  
  const report = `
📊 التقرير النهائي لاختبار الإضافات
⏰ وقت التشغيل: ${new Date().toLocaleString()}
📁 إجمالي الإضافات: ${total}
✅ الناجحة: ${successful}
❌ الفاشلة: ${failed}
📈 نسبة النجاح: ${((successful / total) * 100).toFixed(1)}%

🔧 الإضافات الناجحة:
${results.filter(r => r.success).map(r => `✅ ${r.plugin}`).join('\n')}

🚨 الإضافات الفاشلة:
${results.filter(r => !r.success).map(r => `❌ ${r.plugin}: ${r.error}`).join('\n')}
`;

  fs.writeFileSync(path.join(logDir, 'detailed_report.txt'), report);
  console.log(report);
}

// 🚀 تشغيل الفحص على جميع الإضافات
async function testAllPlugins() {
  console.log('🚀 بدء اختبار جميع الإضافات...\n');
  
  fs.writeFileSync(logPath, `🔍 Plugin API Test — ${new Date().toLocaleString()}\n\n`);
  
  const files = fs.readdirSync(pluginsDir)
    .filter(f => f.endsWith(".js"))
    .filter(f => !f.startsWith('_')); // تجاهل الملفات التي تبدأ ب _

  const results = [];
  
  for (const file of files) {
    const result = await testPlugin(path.join(pluginsDir, file));
    results.push(result);
    
    // تأخير بسيط بين الاختبارات لتجنب حمل الخوادم
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  // إنشاء التقرير
  generateReport(results);
  
  console.log(`\n📄 النتائج المفصلة محفوظة في: logs/detailed_report.txt`);
  console.log(`📄 سجل التشغيل محفوظ في: logs/plugin_report.txt`);
}

// تشغيل الاختبار
await testAllPlugins();
