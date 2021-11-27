import {MessageType, Mimetype} from '@adiwajshing/baileys';
import { createStickerFromImage } from './functions.js';


async function commandHandler(bot, cmd) {
	const command = cmd.split(bot.prefix)[1].split(" ")[0];
    const args = cmd.split(" ").slice(1);
    let error = "Algo deu errado!";

    console.log(args);
    console.log("Command: " + command);
    switch (command) {
        case "start":
            return bot.replyText("Hey! Sou um simples bot, porém ainda estou em desevolvimento!\nPara acompanhar meu progresso, acesse: https://github.com/kamuridesu/js-bot");
            break;
        case "test":
            return bot.replyText("testando 1 2 3");
            break;
        case "music":
            return bot.replyMedia("./config.test/music.mp3", MessageType.audio, Mimetype.mp4Audio)
            
        case "image_from_url":
            if (args.length < 1) {
                error = "Error! Preciso que uma url seja passad!";
            } else if (args.length > 1) {
                error = "Error! Muitos argumentos!";
            } else {
                return bot.replyMedia(args[0], MessageType.image, Mimetype.png)
            }
            return bot.replyText(error);
            break;
        case "repeat":
            return bot.sendTextMessage(args.join(" "));
        case 'sticker':
        	let media = undefined;
        	if (bot.message_data.is_media) {
	        	if(bot.message_data.type !== "videoMessage" || bot.message_data.is_quoted_image) {
	        		media = bot.message_data.is_quoted_image ? JSON.parse(JSON.stringify(bot.message_data.context).replace('quotedM', 'm')).message.extendedTextMessage.contextInfo : bot.message_data.context
	        	} else if(bot.message_data.type === "videoMessage" || bot.message_data.is_quoted_video) {
	        		media = bot.message_data.is_quoted_video ? JSON.parse(JSON.stringify(bot.message_data.context).replace('quotedM', 'm')).message.extendedTextMessage.contextInfo : bot.message_data.context
	        	}
	        } else {
	        	
	        }
            const media = await bot.conn.downloadAndSaveMediaMessage(media)
            if(bot.message_data.is_quoted_image)
            createStickerFrommedia(bot, media);
            break
    }
}

export { commandHandler };