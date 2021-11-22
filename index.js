// Imports
const { WAConnection, MessageType } = require('@adiwajshing/baileys');
const fs = require("fs");

class Bot {
    constructor() {
        const owner_data = JSON.parse(fs.readFileSync("config.admin.json"));
        this.conn = undefined;
        this.bot_number = undefined;
        this.prefix = owner_data.prefix;
        this.owner_jid = owner_data.owner;
        this.is_group_admin = false;
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

        this.conn.on('chat-update', chatUpdate => {
            if (chatUpdate.messages && chatUpdate.count) {
                const message = chatUpdate.messages.all()[0];
                this.getTextMessageContent(this.conn, message);
            // } else console.log (chatUpdate);
            }
        })
    }

    async getTextMessageContent(conn, message) {
        console.log(this.owner_data);
        //console.log(message)
        if (!message.message) return false;
        if (message.key && message.key.remoteJid == 'status@broadcast') return false;
        if (message.key.fromMe) return false;
        const is_text_message = Object.keys(message.message)[0] === 'conversation';
        const user_id = message.key.remoteJid;
        if (is_text_message) {
            const text_message = message.message['conversation'];
            if (text_message.startsWith(this.prefix)) {
                return this.commandHandler(conn, user_id, message, text_message);
            }
            console.log(message.message['conversation']);
            console.log(message);
        }
        // const who_said = JSON.parse(JSON.stringify(message)).message.extendedTextMessage;
        // const message_body = message;
    }

    async commandHandler(conn, message_context, user_id, command) {
        command = command.split(this.prefix)[1];
        console.log("Command: " + command);
        switch (command) {
            case "test":
                return this.reply(conn, message_context, user_id, "testando 1 2 3", MessageType.text);
        }
    }

    async reply(conn, message, from, text, message_type) {
        await conn.sendMessage(from, text, message_type, {
            quoted: message
        })
    }
}

let x = new Bot();
x.connectToWa().catch(err => console.log("unexpected error: " + err) );
