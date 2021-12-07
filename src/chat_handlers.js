import { Presence } from "@adiwajshing/baileys";

/* USE ESTE ARQUIVO PARA MANIPULAR MENSSAGENS DE TEXTO, NÃO COMANDOS!
PARA ISSO, CRIE FUNÇÕES PARA CADA MENSSAGEM QUE VOCÊ QUER RESPONDER! 
ADICIONE SUAS FUNÇÕES NO messageHandler APENAS!*/


async function messageHandler(bot, message, data) {
    // TODO: Adicione suas funções aqui!
    console.log("Mensagem recebida: " + message);
    await bot.conn.updatePresence(bot.from, Presence.available);
    getBomDiaMessage(bot, message);
}

async function getBomDiaMessage(bot, message, data) {
    if(message === "bom dia" || message === "Bom dia") {
        return bot.replyText("BOM DIA!!!!!");
    }
}

/**
 * Função para detectar links do whatsapp com regex
 * @param {Bot} bot bot instance
 * @param {string} message message to be checked
 * @param {object} data data object
 */
async function getLinkMessage(bot, message) {
    // regex para pegar links no formato https://www.chat.whatsapp.com/32984ydhsfbnj237y
    const regex = /https:\/\/www.chat.whatsapp.com\/[a-zA-Z0-9]+/g;
    const match = message.match(regex);
    if(match) {
        return bot.replyText("Link: " + match[0]);
    }
}

export { messageHandler };