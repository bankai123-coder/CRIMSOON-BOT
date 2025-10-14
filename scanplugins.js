import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// 👀 الحصول على __dirname في ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ⚙️ إعدادات الملفات والمجلدات
const commandsDir = './plugins'; // مجلد الأوامر
const outputFile = './commands_list.txt'; // ملف الإخراج

// 🏷️ قاموس التصنيفات (بالعربي)
const categoryNames = {
    'main': 'الرئيسية',
    'ai': 'ميزات الذكاء الاصطناعي',
    'memfess': 'اعترافات',
    'downloader': 'أدوات التحميل',
    'internet': 'الإنترنت',
    'anime': 'أنمي',
    'sticker': 'ملصقات',
    'tools': 'أدوات',
    'group': 'مجموعة',
    'fun': 'ترفيه',
    'search': 'بحث',
    'game': 'ألعاب',
    'info': 'معلومات',
    'owner': 'المالك',
    'quotes': 'اقتباسات',
    'exp': 'خبرة',
    'stalk': 'مطاردة',
    'rpg': 'آر بي جي',
    'sound': 'صوت',
    'random': 'عشوائي',
    'maker': 'صانع',
    'panel': 'لوحة التحكم',
    'nsfw': 'محتوى للبالغين'
};

// 📝 extract handler info from a file
function extractHandlerInfo(fileContent, filename) {
    const handlerInfo = {
        file: filename,
        help: [],
        tags: [],
        commands: [],
        group: false,
        limit: null,
        categories: []
    };

    // 🛠️ extract handler.help
    const helpMatches = fileContent.match(/handler\.help\s*=\s*(\[.*?\]|['"`].*?['"`])/g);
    if (helpMatches) {
        helpMatches.forEach(match => {
            const helpValue = match.match(/handler\.help\s*=\s*(\[.*?\]|['"`].*?['"`])/)[1];
            try {
                const parsed = new Function(`return ${helpValue}`)();
                handlerInfo.help.push(...(Array.isArray(parsed) ? parsed : [parsed]));
            } catch {
                handlerInfo.help.push(helpValue.replace(/^['"`]|['"`]$/g, ''));
            }
        });
    }

    // 🛠️ extract handler.tags
    const tagsMatches = fileContent.match(/handler\.tags\s*=\s*(\[.*?\]|['"`].*?['"`])/g);
    if (tagsMatches) {
        tagsMatches.forEach(match => {
            const tagsValue = match.match(/handler\.tags\s*=\s*(\[.*?\]|['"`].*?['"`])/)[1];
            try {
                const parsed = new Function(`return ${tagsValue}`)();
                const arr = Array.isArray(parsed) ? parsed : [parsed];
                handlerInfo.tags.push(...arr);
                arr.forEach(tag => categoryNames[tag] && handlerInfo.categories.push(categoryNames[tag]));
            } catch {
                handlerInfo.tags.push(tagsValue.replace(/^['"`]|['"`]$/g, ''));
            }
        });
    }

    // 🛠️ extract handler.command
    const commandMatches = fileContent.match(/handler\.command\s*=\s*(.*?)(?=;|\n|$)/g);
    if (commandMatches) {
        commandMatches.forEach(match => {
            let commandValue = match.replace(/handler\.command\s*=\s*/, '').trim().replace(/;$/g, '');
            handlerInfo.commands.push(commandValue);
        });
    }

    // 🛠️ extract handler.group
    const groupMatch = fileContent.match(/handler\.group\s*=\s*(true|false)/);
    if (groupMatch) handlerInfo.group = groupMatch[1] === 'true';

    // 🛠️ extract handler.limit
    const limitMatch = fileContent.match(/handler\.limit\s*=\s*(true|false|\d+)/);
    if (limitMatch) handlerInfo.limit = limitMatch[1];

    return handlerInfo;
}

// 🔍 scan all commands in directory
function scanCommandsDirectory(dirPath) {
    const commands = [];

    function scanDirectory(currentPath) {
        if (!fs.existsSync(currentPath)) {
            console.log(`❌ folder not found: ${currentPath}`);
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
                        commands.push(extractHandlerInfo(content, item));
                        console.log(`✅ processed: ${item}`);
                    }
                } catch (error) {
                    console.log(`❌ error reading file: ${fullPath} - ${error.message}`);
                }
            }
        }
    }

    scanDirectory(dirPath);
    return commands;
}

// 📄 generate the output text
function generateOutput(commands) {
    let output = '🤖 All Bot Commands\n';
    output += '='.repeat(60) + '\n\n';

    // 📂 sort commands by category
    const commandsByCategory = {};
    commands.forEach(cmd => {
        const cats = cmd.categories.length > 0 ? cmd.categories : ['غير مصنف'];
        cats.forEach(category => {
            if (!commandsByCategory[category]) commandsByCategory[category] = [];
            commandsByCategory[category].push(cmd);
        });
    });

    // 📝 loop through sorted categories
    Object.keys(commandsByCategory).sort().forEach(category => {
        output += `\n📂 ${category.toUpperCase()}\n`;
        output += '─'.repeat(40) + '\n';

        commandsByCategory[category].forEach((cmd, idx) => {
            output += `\n${idx + 1}. 📄 ${cmd.file}\n`;
            output += `   📖 Help: ${cmd.help.join(' | ') || 'No info'}\n`;
            output += `   🏷️ Tags: ${cmd.tags.join(', ') || 'No tags'}\n`;
            output += `   ⚡ Commands: ${cmd.commands.join(' | ') || 'No commands'}\n`;
            output += `   👥 For Groups: ${cmd.group ? '✅ Yes' : '❌ No'}\n`;
            output += `   📊 Limit: ${cmd.limit !== null ? cmd.limit : 'Not set'}\n`;
        });
        output += '\n';
    });

    // 📊 summary
    output += '\n' + '='.repeat(60) + '\n';
    output += `📊 Summary:\n`;
    output += `• Total commands: ${commands.length}\n`;
    output += `• Number of categories: ${Object.keys(commandsByCategory).length}\n`;
    output += `• Categories: ${Object.keys(commandsByCategory).join(', ')}\n`;
    output += `\n🕒 Generated at: ${new Date().toLocaleString('en-US')}\n`;

    return output;
}

// 🚀 main function
async function main() {
    console.log('🚀 Starting bot command scan...\n');

    try {
        const allCommands = scanCommandsDirectory(commandsDir);

        if (allCommands.length === 0) {
            console.log('❌ No commands found!');
            console.log('💡 Make sure:');
            console.log('   1. plugins folder exists in the correct path');
            console.log('   2. Files contain a handler');
            console.log('   3. Files have .js extension');
            return;
        }

        console.log('\n📝 Generating commands file...');
        const outputContent = generateOutput(allCommands);

        fs.writeFileSync(outputFile, outputContent, 'utf8');
        console.log(`\n✅ File created successfully: ${outputFile}`);
        console.log(`📊 Total commands found: ${allCommands.length}`);
        console.log(`📁 Categories used: ${Object.keys(allCommands.reduce((acc, cmd) => {
            cmd.categories.forEach(cat => acc[cat] = true);
            return acc;
        }, {})).length}`);

        // show sample commands
        console.log('\n📋 Sample commands:');
        allCommands.slice(0, 3).forEach((cmd, i) => {
            console.log(`${i + 1}. ${cmd.file} - ${cmd.help[0] || 'No description'}`);
        });
        if (allCommands.length > 3) console.log(`... and ${allCommands.length - 3} more commands`);

    } catch (error) {
        console.log('❌ An error occurred:', error.message);
    }
}

// 🏁 run
main();
