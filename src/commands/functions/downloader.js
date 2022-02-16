import KamTube from "kamtube";
import { MessageSenders } from "../../base_handlers/sendersHandlers.js";
import { Log } from "../../storage/logger.js";
import { MessageType, Mimetype } from "@adiwajshing/baileys";


class Downloader {
    constructor(bot_instance, data, args, type) {
        this.bot_instance = bot_instance;
        this.data = data;
        this.args = args;
        this.type = type;
        this.sender = new MessageSenders(bot_instance);
        this.logger = new Log("./logs/downloader.log");
        this.kamtube = new KamTube();
    }

    async search(query) {
        try {
            return (await this.kamtube.search(query))[0].videoId; 
        } catch (e) {
            this.logger.write("Erro ao processar media", 2);
            await this.sender.replyText(this.data, "Não foi possível encontrar a midia.");
            return null;
        }
    }

    async download() {
        if (this.args.length < 1) {
            return this.sender.replyText(this.data, "Por favor, envie uma pesquisa ou um link!");
        }
        const video_or_audio = this.type;
        const query = this.args.join(" ");
        const regex = /[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)?/gi;
        let video_data = query;
        if(!regex.test(query)) {
            video_data = await this.search(query);
            if (video_data == null) return;
        }

        this.sender.replyText(this.data, "Baixando...");
        try {
            video_data = (await this.kamtube.download(video_data, video_or_audio == "audio" ? 1 : 0, video_or_audio == "audio" ? undefined : "360"));
        } catch (e) {
            console.log(e);
            this.logger.write("Erro ao baixar media", 2);
            return await this.sender.replyText(this.data, "Não foi possível baixar a midia.");
        }
        
        if (video_data != null) {
            if (video_or_audio == "audio") {
                await this.sender.replyMedia(this.data, video_data.data, MessageType.audio, Mimetype.mp4Audio);
            } else {
                await this.sender.replyMedia(this.data, video_data.data, MessageType.video, Mimetype.mp4);
            }
            return;
        }
        return await this.sender.replyText(this.data, "Não foi possível baixar a midia.");
    }

    async run() {
        await this.download();
    }
}

export { Downloader };