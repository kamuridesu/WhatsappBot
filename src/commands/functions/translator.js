import { networkCommunicate } from "../../functions/network.js";
import { MessageSenders } from "../../base_handlers/sendersHandlers.js";
import { Log } from "../../storage/logger.js";
import { getRoutes } from "../../functions/getters.js";


class Translator {
    constructor(bot_instance) {
        this.bot_instance = bot_instance;
        this.logger = new Log("./logs/translator.log");
        this.sender = new MessageSenders(bot_instance);
        this.ROUTES = getRoutes();
        this.HOST = this.ROUTES.host;
        this.PORT = this.ROUTES.port;
    }

    async translate(data, args) {
        if (args.length < 2) {
            return this.sender.replyText(data, "Por favor, especifique o idioma e a frase a ser traduzida.");
        }
        const language = args[0];
        const phrase = args.slice(1).join(" ");
        const url = `http://${this.HOST}:${this.PORT}/translate?text=${phrase}&target=${language}`;
        const response = (await networkCommunicate(url, "json")).data;
        return await this.sender.replyText(data, response.text);
    }

    async getLanguages(data) {
        const url = `http://${this.HOST}:${this.PORT}/languages`;
        const response = (await networkCommunicate(url, "json")).data;
        let output = "";
        for (const language in response.text) {
            output += `${language} - ${response.text[language]}\n`;
        }
        return await this.sender.replyText(data, output);
    }
}


export { Translator };