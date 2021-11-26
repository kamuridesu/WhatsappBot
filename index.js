// Imports
import {WAConnection, MessageType, Mimetype} from '@adiwajshing/baileys';
import { checkGroupData, createMediaBuffer } from './functions.js';
import fs from "fs";
class Bot {
    constructor() {
        const owner_data = JSON.parse(fs.readFileSync("config.admin.json"));
        this.conn = undefined;
        this.bot_number = undefined;
        this.prefix = owner_data.prefix;
        this.owner_jid = owner_data.owner;
        this.message_context = undefined;
        this.sender = undefined;
        this.from = undefined;
        this.sender_is_owner = undefined;
        this.is_group = undefined;
        this.group_data = {
            // "group_metadata": undefined,
            "name": undefined,
            "id": undefined,
            "members": undefined,
            "admins": undefined,
            "bot_is_admin": undefined,
            "sender_is_admin": undefined,
            "description": undefined,
            "welcome_on": undefined,
        }
    }

    async connectToWa() {
        this.conn = new WAConnection();
        const config_auth_filename = "config.auth.json";
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
            // } else console.log (chatUpdate);
            }
        })
    }

    async getTextMessageContent(message) {
        this.message_context = message;
        if (!message.message) return false;
        if (message.key && message.key.remoteJid == 'status@broadcast') return false;
        if (message.key.fromMe) return false;
        const is_text_message = Object.keys(message.message)[0] === 'conversation';
        this.from = message.key.remoteJid;
        this.sender = this.from;
        this.is_group = this.sender.endsWith("@g.us");
        if (this.is_group) {
            this.sender = message.participant
            const metadata = await this.conn.groupMetadata(this.from)
            this.group_data = await checkGroupData(metadata, this.bot_number, this.sender);
        }
        if (this.sender === this.owner_jid) {
            this.sender_is_owner = true;
        }
        if (is_text_message) {
            const text_message = message.message['conversation'];
            if (text_message.startsWith(this.prefix)) {
                return this.commandHandler(text_message);
            }
            if (this.is_group) {
                console.log(this.group_data.name + ": " + message.message['conversation']);
            }
        }
    }

    async replyText(text) {
        await this.conn.sendMessage(this.from, text, MessageType.text, {
            quoted: this.message_context
        })
    }

    async replyMedia(media, message_type, mime, caption) {
        if (fs.existsSync(media)) {
            media = fs.readFileSync(media);
        } else {
            media = await createMediaBuffer(media);
            if(media.error) {
                caption = media.error.code,
                media = media.media
            }
        }
        await this.conn.sendMessage(this.from, media, message_type, {
            mimetype: mime,
            caption: (caption != undefined) ? caption : ""
        })
    }

    async commandHandler(cmd) {
        const command = cmd.split(this.prefix)[1].split(" ")[0];
        const args = cmd.split(" ").slice(1);
        let error = "Algo deu errado!";
    
        console.log(args);
        console.log("Command: " + command);
        switch (command) {
            case "start":
                return this.replyText("Hey! Sou um simples bot, porém ainda estou em desevolvimento!\nPara acompanhar meu progresso, acesse: https://github.com/kamuridesu/js-bot");
                break;
            case "test":
                return this.replyText("testando 1 2 3");
                break;
            case "music":
                return this.replyMedia("./config.test/music.mp3", MessageType.audio, Mimetype.mp4Audio)
                
            case "image_from_url":
                if (args.length < 1) {
                    error = "Error! Preciso que uma url seja passad!";
                } else if (args.length > 1) {
                    error = "Error! Muitos argumentos!";
                } else {
                    return this.replyMedia(args[0], MessageType.image, Mimetype.png)
                }
                return this.replyText(error);
        }
    }
}


let x = new Bot();
x.connectToWa().catch(err => console.log("unexpected error: " + err));
