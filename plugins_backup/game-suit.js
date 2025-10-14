let handler = async (m, { text, usedPrefix, command }) => {
    // Define choices in Arabic
    const choices = ['حجر', 'ورق', 'مقص'];
    
    // Create the error message
    let salah = `الخيارات المتاحة\n\n${choices.join(', ')}\n\nمثال: ${usedPrefix + command} مقص\n\nتأكد من كتابة خيارك باللغة العربية.`;

    // Check for valid input
    if (!text || !choices.includes(text.toLowerCase())) {
        throw salah;
    }

    // Map Arabic input to English/Indonesian for logic
    const choiceMap = {
        'حجر': 'batu',
        'ورق': 'kertas',
        'مقص': 'gunting'
    };

    let playerChoice = choiceMap[text.toLowerCase()];

    // Bot's random choice (internal representation)
    let botChoice = '';
    var astro = Math.random();
    if (astro < 0.34) {
        botChoice = 'batu';
    } else if (astro > 0.34 && astro < 0.67) {
        botChoice = 'gunting';
    } else {
        botChoice = 'kertas';
    }
    
    // Map bot's choice to Arabic for display
    const displayMap = {
        'batu': 'حجر',
        'kertas': 'ورق',
        'gunting': 'مقص'
    };
    let botChoiceDisplay = displayMap[botChoice];
    let playerChoiceDisplay = text.toLowerCase();

    // Determine the winner
    if (playerChoice == botChoice) {
        m.reply(`تعادل!\nأنت: ${playerChoiceDisplay}\nالبوت: ${botChoiceDisplay}`);
    } else if (
        (playerChoice == 'batu' && botChoice == 'gunting') ||
        (playerChoice == 'gunting' && botChoice == 'kertas') ||
        (playerChoice == 'kertas' && botChoice == 'batu')
    ) {
        global.db.data.users[m.sender].money += 1000;
        m.reply(`لقد فزت!\n+1000 مال\nأنت: ${playerChoiceDisplay}\nالبوت: ${botChoiceDisplay}`);
    } else {
        m.reply(`لقد خسرت!\nأنت: ${playerChoiceDisplay}\nالبوت: ${botChoiceDisplay}`);
    }
};

handler.help = ['حجر_ورق_مقص [حجر|ورق|مقص]'];
handler.tags = ['game'];
handler.command = /^(suit|حجر_ورق_مقص)$/i;
handler.group = false;
handler.register = true;
handler.private = false;
handler.limit = true;

export default handler;