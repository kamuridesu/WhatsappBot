import { Log } from "../storage/logger.js";
import { Database } from "../storage/db.js";
import * as commands from "./functions/commands.js";
import { MessageSenders } from "../base_handlers/sendersHandlers.js";

class Commands {
    constructor(client, data, command, args, message, options) {
        this.client = client;
        this.message = message;
        this.data = data;
        this.options = options;
        this.command = command;
        this.args = args;
        this.logger = new Log("./logs/commands.log");
        this.database_connection = new Database();
        this.sender = new MessageSenders(this.client);
    }

    async processCommand() {
        switch (this.command) {
            /* %$INFO$% */
            case "start":
                return this.start();
            case "help":
            case "menu":
            case "ajuda":
                return commands.getHelp(this.client, this.data);
            case "bug":
                return this.bug();
            case "traduzir":
            case "translate":
                return new commands.Translator(this.client).translate(this.data, this.args);
            case "idiomas":
            case "languages":
            case "linguas":
            case "linguagens":
                return new commands.Translator(this.client).getLanguages(this.data);
            case "ping":
                return commands.ping(this.client, this.data);
            /* %$INFO$% */

            /* %$MIDIA$% */
            case "sticker":
            case "f":
            case "figurinha":
                return commands.makeSticker(this.client, this.args, this.data);
            case "musica":
            case "music":
                return new commands.Downloader(this.client, this.data, this.args, "audio").download();
            case "video":
                return new commands.Downloader(this.client, this.data, this.args, "video").download();
            
            /* %$MIDIA$% */
        }
    }

    async start() {
        await this.sender.replyText(this.data, "Olá! Sou um simples bot feito em JavaScript e baseado em classes.\n" +
            "Para saber mais sobre mim, acesse o link abaixo:\n" +
            "https://github.com/kamuridesu/WhatsappBot");
    }

    async bug() {
        await this.sender.sendTextMessage(this.data, "Por favor, envie um bug para o meu criador.\n", this.client.owner_jid);
    }

    async close() {
        this.client = undefined;
        this.message = undefined;
        this.data = undefined;
        this.options = undefined;
        this.command = undefined;
        this.args = undefined;
    }
}

export { Commands };