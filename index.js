// Imports
import {WAConnection, MessageType, Mimetype} from '@adiwajshing/baileys';
import { commandHandler } from "./command_handlers.js";
import { checkGroupData, createMediaBuffer, checkMessageData, checkUpdates, updateBot } from './functions.js';
import { getBomDiaMessage } from './chat_handlers.js';
import fs from "fs";


class Bot {
    constructor() {
        const owner_data = JSON.parse(fs.readFileSync("config.admin.json"));
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
        checkUpdates(this);
        this.message_data = await checkMessageData(message);
        // console.log(this.message_data);

        if (!message.message) return false;
        if (message.key && message.key.remoteJid == 'status@broadcast') return false;
        if (message.key.fromMe) return false;

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
        if (this.is_group) {
            console.log(this.group_data.name + ": " + message.message['conversation']);
        }
        if (this.message_data.body.startsWith(this.prefix)) {
            return await commandHandler(this, this.message_data.body);
        } else {
            await getBomDiaMessage(this, this.message_data.body);
        }
        if(this.has_updates) {
            updateBot(this);
        }
    }

    async replyText(text) {
        await this.conn.sendMessage(this.from, text, MessageType.text, {
            quoted: this.message_data.context
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
        if (message_type === MessageType.sticker) {
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

    async sendTextMessage(text, to) {
        let to_who = to ? to : this.from;
        await this.conn.sendMessage(to_who, text, MessageType.text);
    }
}


let x = new Bot();
x.connectToWa().catch(err => console.log("unexpected error: " + err));
