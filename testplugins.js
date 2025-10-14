import fs from 'fs';
import path from 'path';
import url from 'url';

// 📌 __dirname for ES Modules
const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const pluginsDir = path.join(__dirname, 'plugins');

// 🌐 Fake database & conn
global.db = {
  data: {
    users: { '123456@s.whatsapp.net': { limit: 0 } },
    chats: {},
    settings: {}
  }
};

// Fake message & conn objects
const fakeMessage = {
  chat: '123456@s.whatsapp.net',
  isGroup: false,
  mentionedJid: [],
  reply: (text) => console.log(`[Reply] ${text}`)
};

const fakeConn = {
  sendMessage: (chat, msg, opts) => console.log(`[sendMessage to ${chat}]`, msg),
  reply: (chat, text, m, opts) => console.log(`[reply to ${chat}] ${text}`)
};

// 🔍 Test a single plugin safely with timing
async function testPlugin(filePath) {
  const pluginName = path.basename(filePath);
  let result = { name: pluginName, success: false, reason: null, time: 0 };

  const startTime = Date.now();
  try {
    const imported = await import(filePath);
    const plugin = imported.default || imported.handler;

    if (typeof plugin !== 'function') {
      result.reason = 'plugin is not a function';
      return result;
    }

    // Call plugin with fake data
    await plugin(fakeMessage, {
      conn: fakeConn,
      text: 'test',
      args: ['test'],
      command: 'test',
      isOwner: true,
      isRowner: true,
      isAdmin: true,
      isPremium: true,
      usedPrefix: '!'
    });

    result.success = true;
  } catch (error) {
    result.reason = error.message || 'Unknown error';
  } finally {
    result.time = Date.now() - startTime;
  }

  return result;
}

// 🔍 Test all plugins in folder
async function testAllPlugins() {
  const files = fs.readdirSync(pluginsDir).filter(f => f.endsWith('.js'));
  const results = [];

  for (const file of files) {
    const fullPath = path.join(pluginsDir, file);
    const res = await testPlugin(fullPath);
    results.push(res);
    console.log(`${res.success ? '✅' : '❌'} ${res.name} ${res.success ? `(${res.time}ms)` : `: ${res.reason}`}`);
  }

  // Sort by execution time (descending)
  results.sort((a, b) => b.time - a.time);

  // Print summary
  const working = results.filter(r => r.success).length;
  const failed = results.length - working;

  console.log('\n===== SUMMARY =====');
  console.log(`Total plugins: ${results.length}`);
  console.log(`✅ Working: ${working}`);
  console.log(`❌ Failed: ${failed}\n`);

  results.forEach(r => {
    if (!r.success) {
      console.log(`❌ ${r.name} => ${r.reason} (${r.time}ms)`);
    } else {
      console.log(`✅ ${r.name} => Success (${r.time}ms)`);
    }
  });
}

// 🏁 Run tests
//testAllPlugins();
