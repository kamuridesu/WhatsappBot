import {MessageType, Mimetype} from '@adiwajshing/baileys';
import { createStickerFromMedia } from './user_functions.js';

/* TODOS OS COMANDOS DEVEM ESTAR NESTE ARQUIVO, MENOS OS COMANDOS SEM PREFIXO.
CASO PRECISE DE FUNÇÕES GRANDES, SIGA A BOA PRÁTICA E ADICIONE ELAS NO ARQUIVO user_functions.js,
DEPOIS FAÇA IMPORT DESSA FUNÇÃO PARA ESTE ARQUIVO E USE NO SEU COMANDO!
*/

/**
 * Handles the commands sent to the bot
 * @param {Bot} bot bot instance
 * @param {string} cmd command sent
 * @returns undefined
 */
async function commandHandler(bot, cmd) {
	const command = cmd.split(bot.prefix)[1].split(" ")[0];
    const args = cmd.split(" ").slice(1);
    let error = "Algo deu errado!";

    console.log(args);
    console.log("Command: " + command);
    switch (command) {
        case "start":
            // retorna uma menssagem de apresentação
            return await bot.replyText("Hey! Sou um simples bot, porém ainda estou em desevolvimento!\nPara acompanhar meu progresso, acesse: https://github.com/kamuridesu/WhatsappBot");
            break;

        case "test":
            // retorna um teste
            return await bot.replyText("testando 1 2 3");
            break;

        case "music":
            // retorna uma musica
            return await bot.replyMedia("./config.test/music.mp3", MessageType.audio, Mimetype.mp4Audio)
            
        case "image_from_url":
            // baixa uma imagem a partir de uma url e baixa a imagem
            if (args.length < 1) {
                error = "Error! Preciso que uma url seja passad!";
            } else if (args.length > 1) {
                error = "Error! Muitos argumentos!";
            } else {
                return await bot.replyMedia(args[0], MessageType.image, Mimetype.png)
            }
            return await bot.replyText(error);
            break;

        case "repeat":
            // repete o que foi dito
            return await bot.sendTextMessage(args.join(" "));

        case 'sticker':
            // cria sticker
            let media = undefined;
            let packname = "kamuribot";
            let author = "kamuridesu";

            if(args.length >= 1) {
                if(["help", "ajuda"].includes(args[0])) {
                    return bot.replyText("Use !sticker para criar um sticker, ou !sticker pacote autor para mudar o pacote e o autor!");
                }
                if(args.length == 2) {
                    packname = args[0];
                    author = args[1];
                }
            }

            if(bot.message_data.is_media) { // verifica se a mensagem é midia
                if((bot.message_data.type == "imageMessage")) {  // verifica se a mensagem é imagem
                    media = bot.message_data.context;
                }  else if (bot.message_data.type == "videoMessage") { // verifica se a mensagem é video
                    if (bot.message_data.context.message.videoMessage.seconds < 11) { // verifica se o video tem menos de 11 segundos
                        media = bot.message_data.context;
                    } else {
                        error = "Video tem mais de 10 segundos!";
                    }
                } else {
                    error = "Midia não suportada!";
                }
            } else if(bot.message_data.is_quoted_image) { // verifica se uma imagem foi mencionada
                media = JSON.parse(JSON.stringify(bot.message_data.context).replace('quotedM', 'm')).message.extendedTextMessage.contextInfo;
            } else if (bot.message_data.is_quoted_video) { // verifica se um video foi mencionado
                if(bot.message_data.context.message.extendedTextMessage.contextInfo.quotedMessage.videoMessage.seconds < 11) { // verifica se um video mencionado tem menos de 11 segundos
                    media = JSON.parse(JSON.stringify(bot.message_data.context).replace('quotedM', 'm')).message.extendedTextMessage.contextInfo;
                }
            } else {
                error = "Não suportado!";
            }
            if (media !== undefined) {
                media = await bot.conn.downloadAndSaveMediaMessage(media);
                return await createStickerFromMedia(bot, media, packname, author);
            }
            return await bot.replyText(error);
    }
}

export { commandHandler };