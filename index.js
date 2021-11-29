// Imports
import {WAConnection, MessageType, Mimetype, Presence } from '@adiwajshing/baileys';
import { commandHandler } from "./src/command_handlers.js";
import { checkGroupData, createMediaBuffer, checkMessageData, checkUpdates, updateBot } from './src/functions.js';
import { messageHandler } from './src/chat_handlers.js';
import fs from "fs";

// classe Bot, onde as informações vão ser armazenadas e as requisições processadas.
class Bot {
    constructor() {
        // pegar e guardar as informações necessárias.
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
        this.group_data = {
            name: undefined,
            id: undefined,
            members: undefined,
            admins: undefined,
            bot_is_admin: undefined,
            sender_is_admin: undefined,
            description: undefined,
            locked: false,
            open: true,
            welcome_on: undefined,
        }
        this.message_data = {
            context: undefined,
            type: undefined,
            body: undefined,
            is_media: false,
            is_quoted_text: false,
            is_quoted_video: false,
            is_quoted_image: false,
            is_quoted_audio: false,
            is_quoted_sticker: false,
        }
    }

    async connectToWa() {
        this.conn = new WAConnection();
        const config_auth_filename = "./config/config.auth.json";
        try{
            this.conn.loadAuthInfo(config_auth_filename);
        } catch (e) {
            this.conn.on("open", () => {
                const authInfo = this.conn.base64EncodedAuthInfo()
                fs.writeFileSync(config_auth_filename, JSON.stringify(authInfo));
            })
        }

        await this.conn.connect();
        this.bot_number = this.conn.user.jid;

        this.conn.on('chat-update', chatUpdate => {
            if (chatUpdate.messages && chatUpdate.count) {
                this.getTextMessageContent(chatUpdate.messages.all()[0]);
            }
        })
    }

    /**
     * processa a mensagem
     * @param {object} message menssagem contendo os dados para processamento
     */
    async getTextMessageContent(message) {
        // console.log(message);
        checkUpdates(this);
        this.message_data = await checkMessageData(message);

        if (!message.message) return false;
        if (message.key && message.key.remoteJid == 'status@broadcast') return false;
        if (message.key.fromMe) return false;

        this.from = message.key.remoteJid;
        await this.conn.updatePresence(this.from, Presence.available);
        await this.conn.chatRead(this.from);
        this.sender = this.from;
        this.is_group = this.sender.endsWith("@g.us");

        if (this.is_group) {
            this.sender = message.participant
            const metadata = await this.conn.groupMetadata(this.from)
            this.group_data = await checkGroupData(metadata, this.bot_number, this.sender);
        }
        if (this.sender === this.owner_jid || this.from === this.owner_jid) {
            this.sender_is_owner = true;
        }
        if (this.is_group) {
            console.log(this.group_data.name + ": " + message.message['conversation']);
        }
        if (this.message_data.body.startsWith(this.prefix)) {
            return await commandHandler(this, this.message_data.body);
            // retorna se for command, evita que o bot atualize quando tiver recebendo comando.
        } else {
            await messageHandler(this, this.message_data.body);
        }
        if(this.has_updates) {
            console.log("Atualização dispoível!");
            console.log("Atualizando...");
            await this.conn.updatePresence(this.from, Presence.unavailable);
            updateBot(this);
        }
    }

    /**
     * responde via mensagem de texto para o usuario.
     * @param {string} text texto a ser enviado.
     */
    async replyText(text) {
        await this.conn.updatePresence(this.from, Presence.composing);
        await this.conn.sendMessage(this.from, text, MessageType.text, {
            quoted: this.message_data.context
        })
    }

    /**
     * reponde enviando uma midia
     * @param {Buffer} media midia a ser enviada
     * @param {MessageType} message_type tipo da mensagem
     * @param {Mimetype} mime mime do arquivo a ser enviado
     * @param {string} caption legenda do arquivo
     */
    async replyMedia(media, message_type, mime, caption) {
        await this.conn.updatePresence(this.from, Presence.recording);
        if (fs.existsSync(media)) {
            // verifica se o arquivo existe localmente, se sim, o envia
            media = fs.readFileSync(media);
        } else {
            // se o arquivo não existir localmente, tenta fazer o download.
            media = await createMediaBuffer(media);
            if(media.error) {
                caption = media.error.code,
                media = media.media
            }
        }
        if (message_type === MessageType.sticker) {
            // se for sticker, não pode enviar caption nem mime.
            await this.conn.sendMessage(this.from, media, message_type, {
                quoted: this.message_data.context
            })
        } else {
            await this.conn.sendMessage(this.from, media, message_type, {
                mimetype: mime ? mime : '',
                caption: (caption != undefined) ? caption : "",
                quoted: this.message_data.context
            })
        }
    }

    /**
     * envia mensagem de texto para alguem sem mencionar
     * @param {string} text texto a ser enviado
     * @param {string} to para quem enviar
     */
    async sendTextMessage(text, to) {
        await this.conn.updatePresence(this.from, Presence.composing);
        const to_who = to ? to : this.from;  // se não for definido para quem enviar, vai enviar para quem enviou o comando.
        await this.conn.sendMessage(to_who, text, MessageType.text);
    }
}


let x = new Bot();
x.connectToWa().catch(err => console.log("unexpected error: " + err));
