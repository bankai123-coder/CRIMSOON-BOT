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
const httpsAgent = new https.Agent({ rejectUnauthorized: false });

// 📎 روابط اختبار صحيحة لكل منصة
const sampleLinks = {
  tiktok: "https://www.tiktok.com/@scout2015/video/6718335390845095173",
  youtube: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
  instagram: "https://www.instagram.com/p/CwV2q4vMZlt/",
  facebook: "https://www.facebook.com/watch/?v=10153231379946729",
  twitter: "https://x.com/elonmusk/status/1703854632157794685",
  pinterest: "https://www.pinterest.com/pin/993607355001677491/",
  reddit: "https://www.reddit.com/r/aww/comments/1f0x5l/cute_cat_video/",
};

// 💬 Fake WhatsApp message
const fakeMessage = {
  chat: "123456@s.whatsapp.net",
  sender: "123456@s.whatsapp.net",
  text: "test",
  reply: (text) => console.log(`[Reply] ${text}`)
};

// 💬 Fake connection
const fakeConn = {
  sendMessage: (chat, msg) => console.log(`[sendMessage]`, msg),
  sendFile: (...args) => console.log(`[sendFile]`, args[1]),
};

// 🧠 قائمة الكلمات المفتاحية لملفات تستخدم API
const apiKeywords = [
  "ai", "api", "yt", "you", "insta", "tiktok",
  "fb", "down", "download", "search", "gpt", "art"
];

// 🧩 اختبار إضافة واحدة
async function testPlugin(filePath) {
  const pluginName = path.basename(filePath);

  // ✅ فحص إن كان الملف فعلاً يتعامل مع API
  const isApiFile = apiKeywords.some(k => pluginName.toLowerCase().includes(k));
  if (!isApiFile) return; // تجاهل الإضافات العادية

  try {
    const imported = await import(url.pathToFileURL(filePath));
    const plugin = imported.default || imported.handler;
    if (typeof plugin !== "function") throw new Error("plugin is not a function");

    // 🧠 اختيار رابط الاختبار المناسب
    let testInput = "hello";
    const lowerName = pluginName.toLowerCase();
    for (const [key, link] of Object.entries(sampleLinks)) {
      if (lowerName.includes(key)) {
        testInput = link;
        break;
      }
    }

    // 🕒 تنفيذ الإضافة مع مهلة
    await Promise.race([
      plugin(fakeMessage, { conn: fakeConn, text: testInput, args: [testInput], axios, httpsAgent }),
      new Promise((_, reject) => setTimeout(() => reject(new Error("timeout")), 15000))
    ]);

    logResult(`✅ ${pluginName} — Works fine\n`);
  } catch (err) {
    const msg = err?.message || String(err) || "Unknown error";
    let reason = "❗ " + msg;

    if (msg.includes("ECONNREFUSED")) reason = "❌ Connection refused (API down)";
    else if (msg.includes("Invalid URL")) reason = "⚠️ Invalid URL";
    else if (msg.includes("timeout")) reason = "⌛ Timeout (15s)";
    else if (msg.includes("ENOTFOUND")) reason = "❌ Host not found";
    else if (msg.includes("SSL")) reason = "🔒 SSL Error";

    logResult(`${pluginName}: ${reason}\n`);
  }
}

// ✍️ تسجيل النتيجة
function logResult(line) {
  console.log(line.trim());
  fs.appendFileSync(logPath, line);
}

// 🚀 تشغيل الفحص على جميع الإضافات
async function testAllPlugins() {
  fs.writeFileSync(logPath, `🔍 Plugin API Test — ${new Date().toLocaleString()}\n\n`);
  const files = fs.readdirSync(pluginsDir).filter(f => f.endsWith(".js"));

  for (const file of files) {
    await testPlugin(path.join(pluginsDir, file));
  }

  console.log(`\n📄 Results saved in logs/plugin_report.txt`);
}

await testAllPlugins();
