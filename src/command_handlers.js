import {MessageType, Mimetype, GroupSettingChange, getGotStream } from '@adiwajshing/baileys';
import { createStickerFromMedia } from './user_functions.js';
import { getAllCommands, getCommandsByCategory } from "../docs/DOC_commands.js";

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

        /* %$INFO$% */

        case "start":
            // retorna uma menssagem de apresentação
            return await bot.replyText("Hey! Sou um simples bot, porém ainda estou em desevolvimento!\nPara acompanhar meu progresso, acesse: https://github.com/kamuridesu/WhatsappBot");

        case "ajuda":
        case "menu":
            return await bot.replyText(await getAllCommands());

        case "todoscmd":
            return await bot.replyText(await getCommandsByCategory());

        case "test":
            // retorna um teste
            return await bot.replyText("testando 1 2 3");

        /* %$ENDINFO$% */

        /* %$MIDIA$% */

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

        /* %$ENDMIDIA$% */

        /* %$VARIADOS$% */

        case "repeat":
            // repete o que foi dito
            return await bot.sendTextMessage(args.join(" "));

        case 'sticker': {
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

        /* %$ENDVARIADOS$% */

        /* %$ADMIN$% */

        case "desc": {
            // muda a descrição do grupo
            if(!bot.is_group) {
                error = "Erro! O chat atual não é um grupo!";
            } else if(args.length < 1) {
                error = "Erro! Preciso de argumentos!";
            } else if(!bot.group_data.sender_is_admin) {
                error = "Erro! Este comando só pode ser usado por admins!";
            } else {
                const description = args.join(" ");
                await bot.conn.groupUpdateDescription(bot.group_data.id, description);
                return await bot.replyText("Atualizado com sucesso!");
            }
            return await bot.replyText(error);
        }

        case "mudanome": {
            // muda o nome do grupo
            if(!bot.is_group) {
                error = "Erro! O chat atual não é um grupo!";
            } else if(args.length < 1) {
                error = "Erro! Preciso de argumentos!";
            } else if(!bot.group_data.sender_is_admin) {
                error = "Erro! Este comando só pode ser usado por admins!";
            } else {
                const name = args.join(" ");
                await bot.conn.groupUpdateSubject(bot.group_data.id, name);
                return await bot.replyText("Atualizado com sucesso!");
            }

            return await bot.replyText(error);
        }

        case "trancar": {
            // fecha o grupo, apenas admins podem falar
            if(!bot.is_group) {
                error = "Erro! O chat atual não é um grupo!";
            } else if(!bot.group_data.sender_is_admin) {
                error = "Erro! Este comando só pode ser usado por admins!";
            } else if(bot.group_data.locked) {
                error = "Erro! O grupo já está fechado!";
            } else {
                await bot.conn.groupSettingChange(bot.group_data.id, GroupSettingChange.messageSend, true);
                return await bot.replyText("Grupo trancado!");
            }
            return await bot.replyText(error);
        }

        case "abrir": {
            // abre o grupo, todos podem falar
            if(!bot.is_group) {
                error = "Erro! O chat atual não é um grupo!";
            } else if(!bot.group_data.sender_is_admin) {
                error = "Erro! Este comando só pode ser usado por admins!";
            } else if(bot.group_data.open) {
                error = "Erro! O grupo já está aberto!";
            } else {
                await bot.conn.groupSettingChange(bot.group_data.id, GroupSettingChange.messageSend, false);
                return await bot.replyText("Grupo aberto!");
            }
            return await bot.replyText(error);
        }

        case "promover":{
            let user_id = undefined;
            if(!bot.is_group) {
                error = "Erro! O chat atual não é um grupo!";
            } else if(!bot.group_data.sender_is_admin) {
                error = "Erro! Este comando só pode ser usado por admins!";
            } else {
                if(bot.message_data.is_quoted_text) {
                    user_id = (JSON.parse(JSON.stringify(bot.message_data.context).replace('quotedM', 'm')).message.extendedTextMessage.contextInfo.participant);
                } else if(args.length === 1) {
                    user_id = args[0];
                } else {
                    error = "Erro! Preciso que algum usuario seja mencionado ou marcado!";
                }
            }
            if(user_id !== undefined) {
                user_id = user_id.split("@")[1] + "@s.whatsapp.net";
                if(bot.group_data.admins_jid.includes(user_id)) {
                    error = "Erro! Usuário já é admin!";
                } else {
                    await bot.conn.groupMakeAdmin(bot.group_data.id, [user_id]);
                    return await bot.replyText("Promovido com sucesso!");
                }
            }
            return await bot.replyText(error);
        }

        case "rebaixar":{
            let user_id = undefined;
            if(!bot.is_group) {
                error = "Erro! O chat atual não é um grupo!";
            } else if(!bot.group_data.sender_is_admin) {
                error = "Erro! Este comando só pode ser usado por admins!";
            } else {
                if(bot.message_data.is_quoted_text) {
                    user_id = (JSON.parse(JSON.stringify(bot.message_data.context).replace('quotedM', 'm')).message.extendedTextMessage.contextInfo.participant);
                } else if(args.length === 1) {
                    user_id = args[0];
                } else {
                    error = "Erro! Preciso que algum usuario seja mencionado ou marcado!";
                }
            }
            if(user_id !== undefined) {
                user_id = user_id.split("@")[1] + "@s.whatsapp.net";
                if(!bot.group_data.admins_jid.includes(user_id)) {
                    error = "Erro! Usuário não é admin!";
                } else {
                    console.log(user_id);
                    await bot.conn.groupDemoteAdmin(bot.group_data.id, [user_id]);
                    return await bot.replyText("Rebaixado com sucesso!");
                }
            }
            return await bot.replyText(error);
        }

        case "link": {
            if(!bot.is_group) {
                error = "Erro! O chat atual não é um grupo!";
            } else if(!bot.group_data.bot_is_admin) {
                error = "Erro! Bot não é admin!";
            } else {
                const group_link = await bot.conn.groupInviteCode(bot.group_data.id);
                return await bot.replyText('https://chat.whatsapp.com/' + group_link);
            }
            return await bot.replyText(error);
        }

        /* %$ENDADMIN$% */

        /* %$BOTOWNER$% */

        case "transmitir": {
            if(args.length < 1) {
                error = "Erro! Preciso de argumentos!";
            } else if(!bot.sender_is_owner) {
                error = "Erro! Só pode ser enviado pelo dono do bot!";
            } else {
                const message = args.join(" ");
                console.log(message);
                for(let chat of bot.all_chats) {
                    bot.sendTextMessage(message, chat.jid);
                }
                return await bot.replyText("Transmissão enviada com sucesso!");
            }
            return await bot.replyText(error);
        }

        /* %$ENDBOTOWNER$% */
    }
}

export { commandHandler };