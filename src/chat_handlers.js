import { Presence } from "@adiwajshing/baileys";

/* USE ESTE ARQUIVO PARA MANIPULAR MENSSAGENS DE TEXTO, NÃO COMANDOS!
PARA ISSO, CRIE FUNÇÕES PARA CADA MENSSAGEM QUE VOCÊ QUER RESPONDER! 
ADICIONE SUAS FUNÇÕES NO messageHandler APENAS!*/


async function messageHandler(bot, message, data) {
    // TODO: Adicione suas funções aqui!
    console.log("Mensagem recebida: " + (message ? message : data.message_data.type));
    await bot.conn.updatePresence(bot.from, Presence.available);
    if(await getBomDiaMessage(bot, data, message)) {
        console.log("bon dia")
        return;
    } else if(await getLinkMessage(bot, message, data)) {
        return;
    }
}

async function getBomDiaMessage(bot, message, data) {
    if(message === "bom dia" || message === "Bom dia") {
        await bot.replyText(data, "BOM DIA!!!!!");
        return true;
    }
    return false;
}

/**
 * Função para detectar links do whatsapp com regex
 * @param {Bot} bot bot instance
 * @param {string} message message to be checked
 * @param {object} data data object
 */
async function getLinkMessage(bot, message, data) {
    // regex para pegar links no formato https://www.chat.whatsapp.com/32984ydhsfbnj237y
    const regex = /https:\/\/(www\.)?chat.whatsapp.com\/[A-za-z0-9]+/gi;
    const match = regex.test(message);
    if(match) {
        // sendTextMessageWithMention
        if(data.bot_data.is_group) {
            await bot.replyText(data, "É proíbido enviar links aqui! Os admins foram avisados disso!", data.group_data.admins);
            // return bot.replyText("Não pode mandar link!");
            return true;
        }
    }
    return false;
}

export { messageHandler };