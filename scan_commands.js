import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// الحصول على __dirname في ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// إعدادات الملفات والمجلدات
const commandsDir = './plugins'; // مجلد الأوامر
const outputFile = './commands_list.txt'; // ملف الإخراج

// قاموس التصنيفات
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

    // استخراج handler.help
    const helpMatches = fileContent.match(/handler\.help\s*=\s*(\[.*?\]|['"`].*?['"`])/g);
    if (helpMatches) {
        helpMatches.forEach(match => {
            const helpValue = match.match(/handler\.help\s*=\s*(\[.*?\]|['"`].*?['"`])/)[1];
            try {
                // استخدام Function بدلاً من eval لأمان أفضل
                const parsed = new Function(`return ${helpValue}`)();
                if (Array.isArray(parsed)) {
                    handlerInfo.help.push(...parsed);
                } else {
                    handlerInfo.help.push(parsed);
                }
            } catch (e) {
                // إذا فشل التحليل، نستخدم القيمة كما هي
                const cleanValue = helpValue.replace(/^['"`]|['"`]$/g, '');
                handlerInfo.help.push(cleanValue);
            }
        });
    }

    // استخراج handler.tags
    const tagsMatches = fileContent.match(/handler\.tags\s*=\s*(\[.*?\]|['"`].*?['"`])/g);
    if (tagsMatches) {
        tagsMatches.forEach(match => {
            const tagsValue = match.match(/handler\.tags\s*=\s*(\[.*?\]|['"`].*?['"`])/)[1];
            try {
                const parsed = new Function(`return ${tagsValue}`)();
                if (Array.isArray(parsed)) {
                    handlerInfo.tags.push(...parsed);
                    // إضافة التصنيفات المترجمة
                    parsed.forEach(tag => {
                        if (categoryNames[tag]) {
                            handlerInfo.categories.push(categoryNames[tag]);
                        }
                    });
                } else {
                    handlerInfo.tags.push(parsed);
                    if (categoryNames[parsed]) {
                        handlerInfo.categories.push(categoryNames[parsed]);
                    }
                }
            } catch (e) {
                const cleanValue = tagsValue.replace(/^['"`]|['"`]$/g, '');
                handlerInfo.tags.push(cleanValue);
            }
        });
    }

    // استخراج handler.command
    const commandMatches = fileContent.match(/handler\.command\s*=\s*(.*?)(?=;|\n|$)/g);
    if (commandMatches) {
        commandMatches.forEach(match => {
            let commandValue = match.replace(/handler\.command\s*=\s*/, '').trim();
            // تنظيف القيمة من الفاصلة المنقوطة في النهاية إذا وجدت
            commandValue = commandValue.replace(/;$/g, '');
            handlerInfo.commands.push(commandValue);
        });
    }

    // استخراج handler.group
    const groupMatch = fileContent.match(/handler\.group\s*=\s*(true|false)/);
    if (groupMatch) {
        handlerInfo.group = groupMatch[1] === 'true';
    }

    // استخراج handler.limit
    const limitMatch = fileContent.match(/handler\.limit\s*=\s*(true|false|\d+)/);
    if (limitMatch) {
        handlerInfo.limit = limitMatch[1];
    }

    return handlerInfo;
}

function scanCommandsDirectory(dirPath) {
    const commands = [];
    
    function scanDirectory(currentPath) {
        if (!fs.existsSync(currentPath)) {
            console.log(`❌ المجلد غير موجود: ${currentPath}`);
            return;
        }
        
        const items = fs.readdirSync(currentPath);
        
        for (const item of items) {
            const fullPath = path.join(currentPath, item);
            const stat = fs.statSync(fullPath);
            
            if (stat.isDirectory()) {
                scanDirectory(fullPath);
            } else if (item.endsWith('.js')) {
                try {
                    const content = fs.readFileSync(fullPath, 'utf8');
                    // التحقق إذا كان الملف يحتوي على handler
                    if (content.includes('handler.') && 
                        (content.includes('handler.help') || content.includes('handler.command'))) {
                        const handlerInfo = extractHandlerInfo(content, item);
                        commands.push(handlerInfo);
                        console.log(`✅ تم معالجة: ${item}`);
                    }
                } catch (error) {
                    console.log(`❌ خطأ في قراءة الملف: ${fullPath} - ${error.message}`);
                }
            }
        }
    }
    
    scanDirectory(dirPath);
    return commands;
}

function generateOutput(commands) {
    let output = '🤖 قائمة جميع الأوامر - البوت\n';
    output += '='.repeat(60) + '\n\n';
    
    // تصنيف الأوامر حسب التصنيفات
    const commandsByCategory = {};
    
    commands.forEach(cmd => {
        if (cmd.categories.length > 0) {
            cmd.categories.forEach(category => {
                if (!commandsByCategory[category]) {
                    commandsByCategory[category] = [];
                }
                commandsByCategory[category].push(cmd);
            });
        } else {
            if (!commandsByCategory['غير مصنف']) {
                commandsByCategory['غير مصنف'] = [];
            }
            commandsByCategory['غير مصنف'].push(cmd);
        }
    });
    
    // عرض الأوامر مصنفة
    Object.keys(commandsByCategory).sort().forEach(category => {
        output += `\n📂 ${category.toUpperCase()}\n`;
        output += '─'.repeat(40) + '\n';
        
        commandsByCategory[category].forEach((cmd, index) => {
            output += `\n${index + 1}. 📄 ${cmd.file}\n`;
            output += `   📖 المساعدة: ${cmd.help.join(' | ') || 'لا يوجد'}\n`;
            output += `   🏷️  التصنيفات: ${cmd.tags.join(', ') || 'لا يوجد'}\n`;
            output += `   ⚡ الأمر: ${cmd.commands.join(' | ') || 'لا يوجد'}\n`;
            output += `   👥 للمجموعات: ${cmd.group ? '✅ نعم' : '❌ لا'}\n`;
            output += `   📊 الحد: ${cmd.limit !== null ? cmd.limit : 'غير محدد'}\n`;
        });
        output += '\n';
    });
    
    // ملخص عام
    output += '\n' + '='.repeat(60) + '\n';
    output += `📊 الملخص:\n`;
    output += `• إجمالي الأوامر: ${commands.length}\n`;
    output += `• عدد التصنيفات: ${Object.keys(commandsByCategory).length}\n`;
    output += `• التصنيفات: ${Object.keys(commandsByCategory).join(', ')}\n`;
    output += `\n🕒 تم الإنشاء في: ${new Date().toLocaleString('ar-SA')}\n`;
    
    return output;
}

// التشغيل الرئيسي
async function main() {
    console.log('🚀 بدء مسح أوامر البوت...\n');
    
    try {
        const allCommands = scanCommandsDirectory(commandsDir);
        
        if (allCommands.length === 0) {
            console.log('❌ لم يتم العثور على أي أوامر!');
            console.log('💡 تأكد من:');
            console.log('   1. وجود مجلد plugins في المسار الصحيح');
            console.log('   2. أن الملفات تحتوي على handler');
            console.log('   3. أن الملفات لها امتداد .js');
            return;
        }
        
        console.log('\n📝 جاري إنشاء ملف الأوامر...');
        const outputContent = generateOutput(allCommands);
        
        fs.writeFileSync(outputFile, outputContent, 'utf8');
        console.log(`\n✅ تم إنشاء الملف بنجاح: ${outputFile}`);
        console.log(`📊 عدد الأوامر المكتشفة: ${allCommands.length}`);
        console.log(`📁 التصنيفات المستخدمة: ${Object.keys(commandsByCategory).length}`);
        
        // عرض عينة من الأوامر
        console.log('\n📋 عينة من الأوامر:');
        allCommands.slice(0, 3).forEach((cmd, i) => {
            console.log(`${i + 1}. ${cmd.file} - ${cmd.help[0] || 'بدون وصف'}`);
        });
        if (allCommands.length > 3) {
            console.log(`... و ${allCommands.length - 3} أمر آخر`);
        }
        
    } catch (error) {
        console.log('❌ حدث خطأ:', error.message);
    }
}

// تشغيل البرنامج
main();
