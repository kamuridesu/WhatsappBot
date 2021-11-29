/* THIS FILE HAS FUNCTIONS TO HANDLE TEXT MESSAGES, NOT COMMANDS! 
IF YOU DON'T HAVE SURE OF WHAT YOU'RE DOING, DON'T DO ANYTHING! */

async function getBomDiaMessage(bot, message) {
    if(message === "bom dia" || message === "Bom dia") {
        return bot.replyText("BOM DIA!!!!!");
    }
}

export { getBomDiaMessage };