import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// 📌 Get __dirname in ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ⚙️ Configuration
const commandsDir = './plugins';
const outputFile = './commands_list.txt';

// 📂 Category names (Arabic/English mix for display)
const CATEGORY_NAMES = {
  main: 'Main',
  ai: 'AI Features',
  memfess: 'Confessions',
  downloader: 'Download Tools',
  internet: 'Internet',
  anime: 'Anime',
  sticker: 'Stickers',
  tools: 'Tools',
  group: 'Group',
  fun: 'Entertainment',
  search: 'Search',
  game: 'Games',
  info: 'Info',
  owner: 'Owner',
  quotes: 'Quotes',
  exp: 'Experience',
  stalk: 'Stalk',
  rpg: 'RPG',
  sound: 'Sound',
  random: 'Random',
  maker: 'Maker',
  panel: 'Control Panel',
  nsfw: 'Adult Content'
};

// 📝 Extract plugin info from file
function extractPluginInfo(fileContent, filename) {
  const info = {
    file: filename,
    help: [],
    tags: [],
    commands: [],
    categories: [],
    owner: false,
    rowner: false,
    premium: false,
    premiumTime: false,
    private: false,
    main: false,
    group: false,
    admin: false
  };

  const parseValue = (val) => {
    try {
      const parsed = new Function(`return ${val}`)();
      return Array.isArray(parsed) ? parsed : [parsed];
    } catch {
      return [val.replace(/^['"`]|['"`]$/g, '')];
    }
  };

  // handler.help
  (fileContent.match(/handler\.help\s*=\s*(\[.*?\]|['"`].*?['"`])/g) || [])
    .forEach(m => info.help.push(...parseValue(m.match(/handler\.help\s*=\s*(\[.*?\]|['"`].*?['"`])/)[1])));

  // handler.tags & categories
  (fileContent.match(/handler\.tags\s*=\s*(\[.*?\]|['"`].*?['"`])/g) || [])
    .forEach(m => {
      const arr = parseValue(m.match(/handler\.tags\s*=\s*(\[.*?\]|['"`].*?['"`])/)[1]);
      info.tags.push(...arr);
      arr.forEach(tag => CATEGORY_NAMES[tag] && info.categories.push(CATEGORY_NAMES[tag]));
    });

  // handler.command
  (fileContent.match(/handler\.command\s*=\s*(.*?)(?=;|\n|$)/g) || [])
    .forEach(m => info.commands.push(m.replace(/handler\.command\s*=\s*/, '').trim().replace(/;$/, '')));

  // Permissions
  info.owner = !!fileContent.match(/handler\.owner\s*=\s*true/);
  info.rowner = !!fileContent.match(/handler\.rowner\s*=\s*true/);
  info.premium = !!fileContent.match(/handler\.premium\s*=\s*true/);
  info.premiumTime = !!fileContent.match(/\.premiumTime/);
  info.private = !!fileContent.match(/handler\.private\s*=\s*true/);
  info.group = !!fileContent.match(/handler\.group\s*=\s*true/);
  info.admin = !!fileContent.match(/handler\.admin\s*=\s*true/);

  // ✅ Correct Main/Public determination
  info.main = !info.private && !info.group && !info.owner && !info.rowner && !info.admin;

  return info;
}

// 🔍 Scan directory recursively
function scanCommandsDirectory(dirPath) {
  const commands = [];

  function scanDirectory(currentPath) {
    if (!fs.existsSync(currentPath)) {
      console.log(`❌ Folder not found: ${currentPath}`);
      return;
    }

    const items = fs.readdirSync(currentPath);
    for (const item of items) {
      const fullPath = path.join(currentPath, item);
      const stat = fs.statSync(fullPath);

      if (stat.isDirectory()) scanDirectory(fullPath);
      else if (item.endsWith('.js')) {
        try {
          const content = fs.readFileSync(fullPath, 'utf8');
          if (content.includes('handler.') &&
              (content.includes('handler.help') || content.includes('handler.command'))) {
            commands.push(extractPluginInfo(content, item));
            console.log(`✅ Processed: ${item}`);
          }
        } catch (err) {
          console.log(`❌ Error reading file: ${fullPath} - ${err.message}`);
        }
      }
    }
  }

  scanDirectory(dirPath);
  return commands;
}

// 📄 Generate output
function generateOutput(commands) {
  let output = '🤖 Bot Commands List\n' + '='.repeat(70) + '\n\n';

  // group by category
  const commandsByCategory = {};
  commands.forEach(cmd => {
    const cats = cmd.categories.length ? cmd.categories : ['Uncategorized'];
    cats.forEach(cat => {
      if (!commandsByCategory[cat]) commandsByCategory[cat] = [];
      commandsByCategory[cat].push(cmd);
    });
  });

  Object.keys(commandsByCategory).sort().forEach(cat => {
    output += `\n📂 ${cat.toUpperCase()}\n` + '─'.repeat(50) + '\n';
    commandsByCategory[cat].forEach((cmd, idx) => {
      output += `${idx + 1}. 📄 ${cmd.file}\n`;
      output += `   📖 Help: ${cmd.help.join(' | ') || 'No info'}\n`;
      output += `   🏷️ Tags: ${cmd.tags.join(', ') || 'No tags'}\n`;
      output += `   ⚡ Commands: ${cmd.commands.join(' | ') || 'No commands'}\n`;
      output += `   🔑 Owner: ${cmd.owner ? '✅' : '❌'} | Rowner: ${cmd.rowner ? '✅' : '❌'}\n`;
      output += `   💎 Premium: ${cmd.premium ? '✅' : '❌'} | ⏱️ PremiumTime: ${cmd.premiumTime ? '✅' : '❌'}\n`;
      output += `   📨 Private: ${cmd.private ? '✅' : '❌'} | 🌐 Main/Public: ${cmd.main ? '✅' : '❌'}\n`;
      output += `   👥 Group: ${cmd.group ? '✅' : '❌'} | 🛡️ Admin: ${cmd.admin ? '✅' : '❌'}\n\n`;
    });
  });

  // Summary
  output += '='.repeat(70) + '\n';
  output += `📊 Summary:\n`;
  output += `• Total commands: ${commands.length}\n`;
  output += `• Categories: ${Object.keys(commandsByCategory).join(', ')}\n`;
  output += `🕒 Generated at: ${new Date().toLocaleString('en-US')}\n`;

  return output;
}

// 🚀 Main
async function main() {
  console.log('🚀 Starting bot command scan...\n');

  const allCommands = scanCommandsDirectory(commandsDir);

  if (allCommands.length === 0) {
    console.log('❌ No commands found!');
    console.log('💡 Ensure: plugins folder exists, files have handler, .js extension');
    return;
  }

  console.log('\n📝 Generating commands file...');
  const outputContent = generateOutput(allCommands);

  fs.writeFileSync(outputFile, outputContent, 'utf8');
  console.log(`\n✅ File created successfully: ${outputFile}`);
  console.log(`📊 Total commands found: ${allCommands.length}`);
}

// 🏁 Run
//main();
