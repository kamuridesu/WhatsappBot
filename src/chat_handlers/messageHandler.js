import { MessageSenders } from "../base_handlers/sendersHandlers.js";
import { networkCommunicate } from "../functions/network.js";
import { Log } from "../storage/logger.js";

class MessageHandler {
    constructor(client, message, data, options) {
        this.options = options;
        this.client = client;
        this.message = message;
        this.data = data;
        this.logger = new Log("./logs/messageHandler.log");
        this.sender = new MessageSenders(this.client);
        // console.log(data.bot_data.sender);
        if(message != "") {
            this.logger.write(`Message: ${message}` + " from " + data.bot_data.sender + (data.bot_data.is_group ? " on group " + data.group_data.name : ""));
        }
    }

    async getBomDiaMessage() {
        if (["bom dia", "bodia"].includes(this.message.toLowerCase())) {
           return this.sender.replyText(this.data, "Bom dia!");
        }
        return false;
    }

    async antilink() {
        if (/https:\/\/(www\.)?chat.whatsapp.com\/[A-za-z0-9]+/gi.test(this.message)) {
            if(this.data.bot_data.is_group && this.data.group_data.antilink) {
                console.log(this.data.group_data.admins.map(admin => admin.jid));
                await this.sender.replyText(this.data, "É proíbido enviar links aqui! Os admins foram avisados disso!");
                // return bot.replyText("Não pode mandar link!");
                return true;
            }
        }
        return false;
    }

    async chatbot() {
        if(this.data.bot_data.is_group && this.data.group_data.chatbot_on) {
            const chatbot_data = JSON.parse(fs.readFileSync("./config/config.chatbot.json"));
            if(chatbot_data.chatbot_jid == this.data.from_jid) {
                if(this.message.toLowerCase() == "chatbot") {
                    return new this.sender.replyText(this.data, "Olá, eu sou o chatbot, eu sou um bot que fica aí pra conversar com você!");
                }
                if(this.message.toLowerCase() == "chatbot help") {
                    return new this.sender.replyText(this.data, "Eu sou um bot que fica aí pra conversar com você!\n\n" +
                    "Para falar comigo, use o comando /chatbot e me envie uma mensagem.\n\n" +
                    "Para ver os comandos que eu conheço, use o comando /chatbot help");
                }
                if(this.message.toLowerCase() == "chatbot status") {
                    return new this.sender.replyText(this.data, "Eu estou aqui!");
                }
            }
        }
        return false;
    }

    async process() {
        if(this.antilink()) {
            return;
        } else if(this.chatbot()) {
            return;
        } else if(this.getBomDiaMessage()) {
            return;
        }
        await this.close();
    }

    async close() {
        this.options = undefined;
        this.client = undefined;
        this.message = undefined;
        this.data = undefined;
        this.sender = undefined;
    }

}


export { MessageHandler };