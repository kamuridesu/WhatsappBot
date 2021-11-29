/* USE ESTE ARQUIVO PARA MANIPULAR MENSSAGENS DE TEXTO, NÃO COMANDOS!
PARA ISSO, CRIE FUNÇÕES PARA CADA MENSSAGEM QUE VOCÊ QUER RESPONDER! 
ADICIONE SUAS FUNÇÕES NO messageHandler APENAS!*/

async function messageHandler(bot, message) {
    await bot.conn.updatePresence(bot.from, Presence.composing);
    getBomDiaMessage(bot, message);
}

async function getBomDiaMessage(bot, message) {
    if(message === "bom dia" || message === "Bom dia") {
        return bot.replyText("BOM DIA!!!!!");
    }
}

export { messageHandler };