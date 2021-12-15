import {MessageType, Mimetype, GroupSettingChange } from '@adiwajshing/baileys';
import { createStickerFromMedia, quotationMarkParser } from './user_functions.js';
import{ createMediaBuffer, postDataToUrl } from './functions.js';
import { getAllCommands, getCommandsByCategory } from "../docs/DOC_commands.js";
import { exec } from 'child_process';
import fs from 'fs';

/* TODOS OS COMANDOS DEVEM ESTAR NESTE ARQUIVO, MENOS OS COMANDOS SEM PREFIXO.
CASO PRECISE DE FUNÇÕES GRANDES, SIGA A BOA PRÁTICA E ADICIONE ELAS NO ARQUIVO user_functions.js,
DEPOIS FAÇA IMPORT DESSA FUNÇÃO PARA ESTE ARQUIVO E USE NO SEU COMANDO!
*/

/**
 * Handles the commands sent to the bot
 * @param {Bot} bot bot instance
 * @param {string} cmd command sent
 * @param {object} data
 * @returns undefined
 */
async function commandHandler(bot, cmd, data) {
	const command = cmd.split(bot.prefix)[1].split(" ")[0]; // get the command
    if(command.length == 0) return; // if the command is empty, return
    const args = cmd.split(" ").slice(1); // get the arguments (if any) from the command
    console.log("\x1b[0;31mComando: " + command + (args.length < 1 ? '' : ", with args: " + args.join(" ")) + " from " + data.bot_data.from + "\x1b[0m") ; // log the command
    let error = "Algo deu errado!"; // default error message

    switch (command) {

        /* %$INFO$% */

        case "start":
            // retorna uma menssagem de apresentaçãov
            return await bot.replyText(data, "Hey! Sou um simples bot, porém ainda estou em desevolvimento!\nPara acompanhar meu progresso, acesse: https://github.com/kamuridesu/Jashin-bot");

        case "ajuda":
        case "menu":
        case "todoscmd":
            // retorna uma menssagem de apresentação
            return await bot.replyText(data, await getCommandsByCategory());

        case "bug": {
            // retorna um bug
            if (args.length < 1) {
                return await bot.replyText(data, "Por favor, digite o bug que você está reportando!");
            }
            const bug = args.join(" ");
            const sender = "wa.me/" + data.bot_data.sender.split("@")[0];
            await bot.sendTextMessage(data, "Bug reportado por: " + sender +"\n\n" + bug, bot.owner_jid);
            return await bot.replyText(data, "Bug reportado com sucesso! O abuso desse comando pode ser punido!");
        }

        case "test":
            // retorna um teste
            return await bot.replyText(data, "testando 1 2 3");

        /* %$ENDINFO$% */

        /* %$MIDIA$% */

        case "image_from_url":{
            // retorna uma imagem de uma url
            // baixa uma imagem a partir de uma url e baixa a imagem
            if (args.length < 1) {
                error = "Error! Preciso que uma url seja passad!";
            } else if (args.length > 1) {
                error = "Error! Muitos argumentos!";
            } else {
                return await bot.replyMedia(data, args[0], MessageType.image, Mimetype.png);
            }
            return await bot.replyText(data, error);
        }

        case "perfil": {
            if(args.length == 0) {
                error = "Preciso que um user seja mencionado!";
            } else if(data.message_data.context.message.extendedTextMessage) {
                let mention = data.message_data.context.message.extendedTextMessage.contextInfo.mentionedJid[0]
                let profile_pic = "./etc/default_profile.png";
                try{
                    profile_pic = await bot.conn.getProfilePicture(mention);
                } catch (e) {
                    //
                }
                return bot.replyMedia(data, profile_pic, MessageType.image, Mimetype.png);
            }
            return bot.replyText(data, error);
        }

        /* %$ENDMIDIA$% */

        /* %$DIVERSAO$% */

        case "repeat":
            // repete uma menssagem
            return await bot.sendTextMessage(data, args.join(" "));

        case 'sticker': {
            // retorna um sticker
            let media = undefined;
            let packname = "kamuribot";
            let author = "kamuridesu";

            if(args.length >= 1) {
                // se o usuário passou um argumento, é o nome do pack de stickers que ele quer usar (se existir)
                if(["help", "ajuda"].includes(args[0])) {
                    return bot.replyText("Use !sticker para criar um sticker, ou !sticker pacote autor para mudar o pacote e o autor!");
                }
                if(args.length == 2) {
                    packname = args[0];
                    author = args[1];
                }
            }

            if(data.message_data.is_media) { // verifica se a mensagem é midia
                if((data.message_data.type == "imageMessage")) {  // verifica se a mensagem é imagem
                    media = data.message_data.context;
                }  else if (data.message_data.type == "videoMessage") { // verifica se a mensagem é video
                    if (data.message_data.context.message.videoMessage.seconds < 11) { // verifica se o video tem menos de 11 segundos
                        media = data.message_data.context;
                    } else {
                        error = "Video tem mais de 10 segundos!";
                    }
                } else {
                    error = "Midia não suportada!";
                }
            } else if(data.message_data.is_quoted_image) { // verifica se uma imagem foi mencionada
                // pega a imagem mencionada e transforma em objeto json para poder usar o contextInfo do objeto json (que é a imagem)
                media = JSON.parse(JSON.stringify(data.message_data.context).replace('quotedM', 'm')).message.extendedTextMessage.contextInfo;
            } else if (data.message_data.is_quoted_video) { // verifica se um video foi mencionado
                // pega o video mencionado e transforma em objeto json para poder usar o contextInfo do objeto json (que é o video)
                if(data.message_data.context.message.extendedTextMessage.contextInfo.quotedMessage.videoMessage.seconds < 11) { // verifica se um video mencionado tem menos de 11 segundos
                    media = JSON.parse(JSON.stringify(data.message_data.context).replace('quotedM', 'm')).message.extendedTextMessage.contextInfo;
                }
            } else {
                error = "Não suportado!";
            }
            if (media !== undefined) {
                media = await bot.conn.downloadAndSaveMediaMessage(media, "file" + Math.round(Math.random() * 10000));  // baixa a midia
                return await createStickerFromMedia(bot, data, media, packname, author);  // cria um sticker a partir da midia
            }
            return await bot.replyText(data, error);
        }


        /* %$ENDDIVERSAO$% */

        /* %$ADMIN$% */

        case "desc": {
            // muda a descrição do grupo
            if(!data.bot_data.is_group) {
                error = "Erro! O chat atual não é um grupo!";
            } else if(args.length < 1) {
                error = "Erro! Preciso de argumentos!";
            } else if(!data.group_data.sender_is_admin) {
                error = "Erro! Este comando só pode ser usado por admins!";
            } else {
                const description = args.join(" ");
                await bot.conn.groupUpdateDescription(data.group_data.id, description);  // muda a descrição do grupo
                return await bot.replyText(data, "Atualizado com sucesso!");
            }
            return await bot.replyText(data, error);
        }

        case "mudanome": {
            // muda o nome do grupo
            if(!data.bot_data.is_group) {
                error = "Erro! O chat atual não é um grupo!";
            } else if(args.length < 1) {
                error = "Erro! Preciso de argumentos!";
            } else if(!data.group_data.sender_is_admin) {
                error = "Erro! Este comando só pode ser usado por admins!";
            } else if(!data.group_data.bot_is_admin){
                error = "Erro! O bot precisa ser admin!";
            } else {
                const name = args.join(" ");
                await bot.conn.groupUpdateSubject(data.group_data.id, name);  // muda o nome do grupo
                return await bot.replyText(data, "Atualizado com sucesso!");
            }

            return await bot.replyText(data, error);
        }

        case "trancar": {
            // fecha o grupo, apenas admins podem falar
            if(!data.bot_data.is_group) {
                error = "Erro! O chat atual não é um grupo!";
            } else if(!data.group_data.sender_is_admin) {
                error = "Erro! Este comando só pode ser usado por admins!";
            } else if(!data.group_data.bot_is_admin){
                error = "Erro! O bot precisa ser admin!";
            } else if(data.group_data.locked) {
                error = "Erro! O grupo já está fechado!";
            } else {
                await bot.conn.groupSettingChange(data.group_data.id, GroupSettingChange.messageSend, true);  // fecha o grupo
                return await bot.replyText(data, "Grupo trancado!");
            }
            return await bot.replyText(data, error);
        }

        case "abrir": {
            // abre o grupo, todos podem falar
            if(!data.bot_data.is_group) {
                error = "Erro! O chat atual não é um grupo!";
            } else if(!data.group_data.sender_is_admin) {
                error = "Erro! Este comando só pode ser usado por admins!";
            } else if(!data.group_data.bot_is_admin){
                error = "Erro! O bot precisa ser admin!";
            } else if(data.group_data.open) {
                error = "Erro! O grupo já está aberto!";
            } else {
                await bot.conn.groupSettingChange(data.group_data.id, GroupSettingChange.messageSend, false);  // abre o grupo
                return await bot.replyText(data, "Grupo aberto!");
            }
            return await bot.replyText(data, error);
        }

        case "promover":{
            let user_id = undefined;
            if(!data.bot_data.is_group) {
                error = "Erro! O chat atual não é um grupo!";
            } else if(!data.group_data.sender_is_admin) {
                error = "Erro! Este comando só pode ser usado por admins!";
            } else if(!data.group_data.bot_is_admin){
                error = "Erro! O bot precisa ser admin!";
            } else {
                if(data.message_data.is_quoted) {
                    user_id = (JSON.parse(JSON.stringify(data.message_data.context).replace('quotedM', 'm')).message.extendedTextMessage.contextInfo.participant);  // pega o id do usuário mencionado
                } else if(args.length === 1) {
                    user_id = args[0];
                } else {
                    error = "Erro! Preciso que algum usuario seja mencionado ou marcado!";
                }
            }
            if(user_id !== undefined) {
                user_id = user_id.split("@")[1] + "@s.whatsapp.net";  // transforma o id do usuário em um formato válido
                if(data.group_data.admins_jid.includes(user_id)) {
                    error = "Erro! Usuário já é admin!";
                } else {
                    await bot.conn.groupMakeAdmin(data.group_data.id, [user_id]);  // promove o usuário
                    return await bot.replyText(data, "Promovido com sucesso!");
                }
            }
            return await bot.replyText(data, error);
        }

        case "rebaixar":{
            let user_id = undefined;
            if(!data.bot_data.is_group) {
                error = "Erro! O chat atual não é um grupo!";
            } else if(!data.group_data.sender_is_admin) {
                error = "Erro! Este comando só pode ser usado por admins!";
            } else if(!data.group_data.bot_is_admin){
                error = "Erro! O bot precisa ser admin!";
            } else {
                if(data.message_data.is_quoted) {
                    user_id = (JSON.parse(JSON.stringify(data.message_data.context).replace('quotedM', 'm')).message.extendedTextMessage.contextInfo.participant);  // pega o id do usuário mencionado
                } else if(args.length === 1) {
                    user_id = args[0];
                } else {
                    error = "Erro! Preciso que algum usuario seja mencionado ou marcado!";
                }
            }
            if(user_id !== undefined) {
                user_id = user_id.split("@")[1] + "@s.whatsapp.net";  // transforma o id do usuário em um formato válido
                if(!data.group_data.admins_jid.includes(user_id)) {
                    error = "Erro! Usuário não é admin!";
                } else {
                    await bot.conn.groupDemoteAdmin(data.group_data.id, [user_id]);  // rebaixa o usuário
                    return await bot.replyText(data, "Rebaixado com sucesso!");
                }
            }
            return await bot.replyText(data, error);
        }

        case "link": {
            if(!data.bot_data.is_group) {
                error = "Erro! O chat atual não é um grupo!";
            } else if(!data.group_data.bot_is_admin) {
                error = "Erro! Bot não é admin!";
            } else {
                const group_link = await bot.conn.groupInviteCode(data.group_data.id);  // pega o link do grupo
                return await bot.replyText(data, 'https://chat.whatsapp.com/' + group_link);
            }
            return await bot.replyText(data, error);
        }

        case "todos": {
            if(!data.bot_data.is_group) {
                error = "Erro! O chat atual não é um grupo!";
            } else if (args.length === 0) {
                error = "Erro! Preciso de alguma mensagem!";
            } else if(!data.group_data.sender_is_admin) {
                error = "Erro! Este comando só pode ser usado por admins!";
            } else {   
                let message = args.join(" ");
                let members_id = data.group_data.members.map(member => member.jid);  // pega os ids dos membros do grupo
                return await bot.sendTextMessageWithMention(data, message, members_id);  // envia a mensagem para todos
            }
            return await bot.replyText(data, error);
        }


        /* %$ENDADMIN$% */

        /* %$BOTOWNER$% */

        case "transmitir": {
            if(args.length < 1) {
                error = "Erro! Preciso de argumentos!";
            } else if(!data.bot_data.sender_is_owner) {
                error = "Erro! Só pode ser enviado pelo dono do bot!";
            } else {
                const message = "[TRANSMISSÃO]\n\n" + args.join(" ");
                for(let chat of data.bot_data.all_chats) {
                    // envia a mensagem para todos os chats
                    bot.sendTextMessage(data, message, chat.jid);
                }
                return await bot.replyText(data, "Transmissão enviada com sucesso!");
            }
            return await bot.replyText(data, error);
        }
        
        /* %$ENDBOTOWNER$% */
    }
}

export { commandHandler };