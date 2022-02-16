import { MessageSenders } from "../../base_handlers/sendersHandlers.js";
import { getMedia, getVideoLength } from "../../functions/getters.js"
import pkg from "fluent-ffmpeg";
const ffmpeg = pkg;
import fs from 'fs';
import { Log } from "../../storage/logger.js";
import { MessageType } from "@adiwajshing/baileys"
import { exec } from "child_process";

class MakeSticker{
    constructor(client, args, data) {
        this.client = client;
        this.data = data;
        this.args = args;
        this.media_sender = new MessageSenders(client);
        this.logger = new Log("./logs/sticker.log");
    }

    async makePack() {
        if (this.args.length == 2) {
            return {packaname: this.args[0], author: this.args[1]};
        }
        return {packaname: "Jashin-bot", author: "kamuridesu"};
    }


    async make() {
        if (this.data.message_data.type == "videoMessage" || this.data.message_data.is_quoted_video){
            if (await getVideoLength(this.data) > 10) {
                return this.media_sender.replyText(this.data, "Video muito longo, não é possível criar um sticker com este video");
            }
        }
        const media = await getMedia(this.client, this.data);
        if (!media) {
            return this.media_sender.replyText(this.data, "Não foi possível baixar a mídia! Verifique se a mensagem foi mencionada");
        }
        const pack = await this.makePack();
        return await this.createSticker(media, pack);
    }

    /**
     * adds metadata to sticker pack
     * @param {string} author of the pack
     * @param {string} packname of the pack
     * @returns {string} path of exif data
     */
    async addMetadata(author, packname) {
        // create exif data
        packname = (packname) ? packname : "kamubot";
        author = (author) ? author.replace(/[^a-zA-Z0-9]/g, '') : "kamubot";  // author cannot have spaces
        const file_path = `./temp/stickers/${author}_${packname}.exif`;
        if(fs.existsSync(file_path)) {
            return file_path;
        }

        const info_json = JSON.stringify({
            "sticker-pack-name": packname,
            "sticker-pack-publisher": author
        });

        const little_endian = Buffer.from([0x49, 0x49, 0x2A, 0x00, 0x08, 0x00, 0x00, 0x00, 0x01, 0x00, 0x41, 0x57, 0x07, 0x00])  // little endian exif header
        const bytes = [0x00, 0x00, 0x16, 0x00, 0x00, 0x00]  // exif header

        let info_json_size = info_json.length;
        let last = undefined;  // last byte of info_json_size

        if(info_json_size > 256) {
            info_json_size = info_json_size - 256;
            bytes.unshift(0x01);  // if info_json_size > 256, then use big endian
        } else {
            bytes.unshift(0x00);  // if info_json_size <= 256, then use little endian
        }

        last = info_json_size.toString(16);  // convert to hex string and get last byte
        if (info_json_size < 16) {
            last = "0" + info_json_size;  // if info_json_size < 16, then add a 0 to the front
        }

        const last_buffer = Buffer.from(last, "hex");  // convert to buffer
        const buff_from_bytes = Buffer.from(bytes);  // convert to buffer from array of bytes
        const buff_from_json = Buffer.from(info_json); // convert to buffer from json string

        const buffer = Buffer.concat([little_endian, last_buffer, buff_from_bytes, buff_from_json]);  // concat buffers to create exif data

        fs.writeFileSync(file_path, buffer, (error) => {
            console.log(error);
        });
        return file_path;
    }

    async createSticker(media, metadata) {
        const random_filename = "./temp/stickers/" + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15) + ".webp";
        ffmpeg(media).input(media).on('start', (cmd) => {
            this.logger.write("Convertendo arquivo para sticker: " + cmd, 3);
        })
        .addOutputOptions(["-vcodec", "libwebp", "-vf", "scale='min(320,iw)':min'(320,ih)':force_original_aspect_ratio=decrease,fps=15, pad=320:320:-1:-1:color=white@0.0, split [a][b]; [a] palettegen=reserve_transparent=on:transparency_color=ffffff [p]; [b][p] paletteuse"])
        .toFormat('webp')
        .save(random_filename)
        .on('error', async (err) => {
            this.logger.write(err, 2);
            fs.unlinkSync(media);
            await this.media_sender.replyText(this.data, "Erro ao converter arquivo para sticker");
            await this.close();
        })
        .on('end', async () => {
            const exif = await this.addMetadata(metadata[1], metadata[0]);
            exec(`webpmux -set exif ${exif} ${random_filename} -o ${random_filename}`, async (error) => {
                if (error) {
                    this.logger.write(error, 2);
                    fs.unlinkSync(random_filename);
                    fs.unlinkSync(media);
                    await this.media_sender.replyText(this.data, "Erro ao criar sticker");
                    await this.close();
                }
                this.logger.write("Arquivo convertido para sticker", 3);
                await this.media_sender.replyMedia(this.data, random_filename, MessageType.sticker);
                fs.unlinkSync(random_filename);
                fs.unlinkSync(media);
                await this.close();
            });
        });
    }

    async close() {
        this.client = undefined;
        this.data = undefined;
        this.args = undefined;
    }
}

async function makeSticker(client, args, data) {
    const sticker = new MakeSticker(client, args, data);
    await sticker.make();
}

export { makeSticker };