// Imports
import {WAConnection, MessageType, Mimetype, Presence } from '@adiwajshing/baileys';
import { commandHandler } from "./src/command_handlers.js";
import { checkGroupData, createMediaBuffer, checkMessageData, checkUpdates, updateBot } from './src/functions.js';
import { messageHandler } from './src/chat_handlers.js';
import fs from "fs";

// classe Bot, onde as informações vão ser armazenadas e as requisições processadas.
class Bot {
    constructor() {
        // carrega as configurações do bot
        const owner_data = JSON.parse(fs.readFileSync("./config/config.admin.json"));
        this.conn = undefined;
        this.has_updates = false;
        this.bot_number = undefined;
        this.prefix = owner_data.prefix;
        this.owner_jid = owner_data.owner;
        this.sender = undefined;
        this.from = undefined;
        this.sender_is_owner = undefined;
        this.is_group = undefined;
        this.all_chats = undefined;
    }

    async connectToWa() {
        // conecta ao whatsapp
        this.conn = new WAConnection();
        const config_auth_filename = "./config/config.auth.json";
        // carrega as configurações de autenticação
        try{
            this.conn.loadAuthInfo(config_auth_filename);
        } catch (e) {
            this.conn.on("open", () => {
                const authInfo = this.conn.base64EncodedAuthInfo()
                fs.writeFileSync(config_auth_filename, JSON.stringify(authInfo));
            })
        }

        await this.conn.connect();
        this.bot_number = this.conn.user.jid; // pega o numero do bot

        this.conn.on('chat-update', chatUpdate => {
            if (chatUpdate.messages && chatUpdate.count) {
                if(JSON.parse(JSON.stringify(chatUpdate)).messages[0].messageStubType !== "REVOKE"){  // se não for mensagem deletada
                    this.getMessageContent(chatUpdate.messages.all()[0]); // processa a mensagem
                }
            }
        })
    }

    /**
     * processa a mensagem
     * @param {object} message menssagem contendo os dados para processamento
     */
    async getMessageContent(message) {
        // console.log(this.bot_number);
        checkUpdates(this);
        this.all_chats = await this.conn.chats.all();  // pega todos os grupos
        this.message_data = await checkMessageData(message); // pega os dados da mensagem

        if (!message.message) return false; // se não for mensagem, não faz nada.
        if (message.key && message.key.remoteJid == 'status@broadcast') return false; // se for broadcast, não faz nada.
        if (message.key.fromMe) return false; // se for mensagem do bot, não faz nada.

        this.from = message.key.remoteJid;  // pega o remetente da mensagem
        await this.conn.updatePresence(this.from, Presence.available); // atualiza o status do remetente para online.
        await this.conn.chatRead(this.from); // marca a mensagem como lida.
        this.sender = this.from; // pega o remetente da mensagem
        this.is_group = this.sender.endsWith("@g.us"); // verifica se é um grupo

        if (this.is_group) { // se for um grupo
            this.sender = message.participant // pega o remetente da mensagem
            const metadata = await this.conn.groupMetadata(this.from) // pega os dados do grupo
            this.group_data = await checkGroupData(metadata, this.bot_number, this.sender); // processa os dados do grupo
        }
        if (this.sender === this.owner_jid || this.from === this.owner_jid) { // se for o dono do bot
            this.sender_is_owner = true; // define que o remetente é o dono do bot
        }
        if (this.message_data.body.startsWith(this.prefix)) { // se a mensagem começar com o prefixo
            return await commandHandler(this, this.message_data.body); // processa a mensagem como comando
            // retorna se for command, evita que o bot atualize quando tiver recebendo comando.
        } else {
            await messageHandler(this, this.message_data.body); // processa a mensagem como mensagem
        }
        if(this.has_updates) { // se tiver atualizações
            console.log("Atualização dispoível!");
            console.log("Atualizando...");
            await this.conn.updatePresence(this.from, Presence.unavailable);
            updateBot(this); // atualiza o bot
        }
    }

    /**
     * responde via mensagem de texto para o usuario.
     * @param {string} text texto a ser enviado.
     */
    async replyText(text) {
        // envia uma mensagem de texto para o usuario como resposta.
        await this.conn.updatePresence(this.from, Presence.composing); // atualiza o status do remetente para "escrevendo"
        await this.conn.sendMessage(this.from, text, MessageType.text, { // envia a mensagem
            quoted: this.message_data.context // se for uma mensagem de contexto, envia como contexto.
        });
        await this.conn.updatePresence(this.from, Presence.available); // atualiza o status do remetente para online.
    }

    /**
     * reponde enviando uma midia
     * @param {Buffer} media midia a ser enviada
     * @param {MessageType} message_type tipo da mensagem
     * @param {Mimetype} mime mime do arquivo a ser enviado
     * @param {string} caption legenda do arquivo
     */
    async replyMedia(media, message_type, mime, caption) {
        // envia uma midia para o usuario como resposta.
        await this.conn.updatePresence(this.from, Presence.recording); // atualiza o status do remetente para "gravando"
        if (fs.existsSync(media)) { // se o arquivo existir
            // verifica se o arquivo existe localmente, se sim, o envia
            media = fs.readFileSync(media); // le o arquivo
        } else { // se não existir
            // se o arquivo não existir localmente, tenta fazer o download.
            media = await createMediaBuffer(media); // tenta fazer o download
            if(media.error) { // se não conseguir fazer o download
                caption = media.error.code, // pega o erro
                media = media.media // pega a midia do erro
            }
        }
        if (message_type === MessageType.sticker) { // se for um sticker
            // se for sticker, não pode enviar caption nem mime.
            await this.conn.sendMessage(this.from, media, message_type, {
                quoted: this.message_data.context
            })
        } else {
            await this.conn.sendMessage(this.from, media, message_type, { // envia a midia
                mimetype: mime ? mime : '',
                caption: (caption != undefined) ? caption : "",
                quoted: this.message_data.context
            })
        }
        await this.conn.updatePresence(this.from, Presence.available); // atualiza o status do remetente para online.
    }

    /**
     * envia mensagem de texto para alguem sem mencionar
     * @param {string} text texto a ser enviado
     * @param {string} to para quem enviar
     */
    async sendTextMessage(text, to) { // envia mensagem de texto para alguem sem mencionar
        await this.conn.updatePresence(this.from, Presence.composing); // atualiza o status do remetente para "escrevendo"
        const to_who = to ? to : this.from;  // define para quem enviar
        await this.conn.sendMessage(to_who, text, MessageType.text); // envia a mensagem
        await this.conn.updatePresence(to_who, Presence.available); // atualiza o status do remetente para online.
    }

    /**
     * envia mensagem de texto para alguem com menções
     * @param {string} text texto a ser enviado
     * @param {string} mention quem mencionar
     */
     async sendTextMessageWithMention(text, mention) { // envia mensagem de texto para alguem com mencion
        await this.conn.updatePresence(this.from, Presence.composing); // atualiza o status do remetente para "escrevendo"
        await this.conn.sendMessage(this.from, text, MessageType.text, { // envia a mensagem
            contextInfo: {
                "mentionedJid": mention
            }
        });
        await this.conn.updatePresence(mention, Presence.available); // atualiza o status do remetente para online.
    }
}


let x = new Bot();  // cria um novo bot
x.connectToWa().catch(err => console.log("unexpected error: " + err)); // conecta ao whatsapp e inicia o bot.
