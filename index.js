// Imports
const { WAConnection, MessageType } = require('@adiwajshing/baileys');
const { checkGroupData } = require("./functions.js");
const fs = require("fs");

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
            "group_name": undefined,
            "group_id": undefined,
            "group_members": undefined,
            "group_admins": undefined,
            "bot_is_group_admin": undefined,
            "sender_is_group_admin": undefined,
            "group_description": undefined,
            "group_link": undefined,
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
                console.log(this.group_data.group_name + ": " + message.message['conversation']);
            }
        }
    }

    async reply(text, message_type) {
        await this.conn.sendMessage(this.from, text, message_type, {
            quoted: this.message_context
        })
    }

    async commandHandler(cmd) {
        const command = cmd.split(this.prefix)[1];
        console.log("Command: " + command);
        switch (command) {
            case "start":
                return this.reply("Hey! Sou um simples bot, porém ainda estou em desevolvimento!\nPara acompanhar meu progresso, acesse: https://github.com/kamuridesu/js-bot", MessageType.text);
                break;
            case "test":
                return this.reply("testando 1 2 3", MessageType.text);
                break;
        }
    }
}

let x = new Bot();
x.connectToWa().catch(err => console.log("unexpected error: " + err));
