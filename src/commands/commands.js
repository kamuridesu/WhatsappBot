import { Log } from "../storage/logger.js";
import { Database } from "../storage/db.js";
import * as commands from "./functions/commands.js";
import { MessageSenders } from "../base_handlers/sendersHandlers.js";
import { networkCommunicate } from "../functions/network.js";
import { MessageType, Mimetype } from "@adiwajshing/baileys";
import { getMention } from "../functions/getters.js";
import fs from 'fs';

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
            case "start": // description="Mostra uma mensagem de apresentação"
                return this.start();
            case "help": // description="Mostra uma mensagem de ajuda, uso: !help [comando]"
            case "menu":  // description="Mostra uma mensagem de ajuda, uso: !menu [comando]"
            case "ajuda": // description="Mostra uma mensagem de ajuda, uso: !ajuda [comando]"
                return commands.getHelp(this.client, this.data, this.args);
            case "bug":  // description="Envia um bug para o meu criador, uso: !bug mensagem"
                return this.bug();
            case "traduzir":  // description="Traduz um texto, uso: !traduzir linguagem texto"
            case "translate": // description="Traduz um texto, uso: !translate llinguagem texto"
                return new commands.Translator(this.client).translate(this.data, this.args);
            case "idiomas":  // description="Mostra os idiomas disponíveis, uso: !idiomas"
            case "languages":  // description="Mostra os idiomas disponíveis, uso: !languages"
            case "linguas":  // description="Mostra os idiomas disponíveis, uso: !linguas"
            case "linguagens":   // description="Mostra os idiomas disponíveis, uso: !linguagens"
                return new commands.Translator(this.client).getLanguages(this.data);
            case "ping":  // description="Mostra o tempo de resposta do bot, uso: !ping"
                return commands.ping(this.client, this.data);
            /* %$INFO$% */

            /* %$MIDIA$% */
            case "sticker":  // description="Transforma uma imagen, video ou gif em um sticker, uso: !sticker (mencioando uma imagem, video ou gif)"
            case "f": // description="Transforma uma imagen, video ou gif em um sticker, uso: !f (mencioando uma imagem, video ou gif)"
            case "figurinha":  // description="Transforma uma imagen, video ou gif em um sticker, uso: !figurinha (mencioando uma imagem, video ou gif)"
                return commands.makeSticker(this.client, this.args, this.data);
            case "musica":  // description="Baixa uma musica do youtube, uso: !musica (enviando o link do youtube ou o nome da musica)"
            case "music":  // description="Baixa uma musica do youtube, uso: !music (enviando o link do youtube ou o nome da musica)"
                return new commands.Downloader(this.client, this.data, this.args, "audio").download();
            case "video":  // description="Baixa um video do youtube, uso: !video (enviando o link do youtube ou o nome do video)"
                return new commands.Downloader(this.client, this.data, this.args, "video").download();
            case "dlimage": // description="Baixa uma imagem a partir do link, uso: !dlimage (enviando o link da imagem)"
                if (this.args.length < 1) return await this.sender.replyText(this.data, "Por favor, envie um link para eu baixar.");
                return this.sender.replyMedia(this.data, await networkCommunicate(this.args.join(" "), "bytearray"), MessageType.image);
            case "perfilimg": // description="Baixa uma imagem do perfil do usuário, uso: !perfilimg @Jashi-bot"
                if (this.args.length < 1) return await this.sender.replyText(this.data, "Por favor, envie um usuário para eu baixar o seu perfil.");
                const mention = getMention(this.data);
                if (mention.length < 1) return await this.sender.replyText(this.data, "Por favor, envie um usuário para eu baixar o seu perfil.");
                let ppic = undefined;
                try {ppic = await this.client.wa_connection.getProfilePicture(mention);} catch (e) { ppic = fs.readFileSync(process.cwd() + "/etc/default_profile.png"); }
                console.log(ppic);
                return this.sender.replyMedia(this.data, ppic, MessageType.image);
            /* %$MIDIA$% */
        }
    }

    async start() {
        await this.sender.replyText(this.data, "Olá! Sou um simples bot feito em JavaScript e baseado em classes.\n" +
            "Para saber mais sobre mim, acesse o link abaixo:\n" +
            "https://github.com/kamuridesu/WhatsappBot");
    }

    async bug() {
        if (this.args.length < 1) {
            return await this.sender.replyText(this.data, "Por favor, envie um bug para o meu criador.\n");
        }
        const output = "Bug enviado por " + "wa.me/" + this.data.bot_data.sender.split("@")[0] + "\n\n" + this.args.join(" ");
        await this.sender.sendTextMessage(this.data, output, this.client.owner_jid);
        return await this.sender.replyText(this.data, "Bug enviado com sucesso!\n");
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