import {MessageType, Mimetype} from '@adiwajshing/baileys';
import pkg from "fluent-ffmpeg";
const ffmpeg = pkg;
import fs from "fs";
import { exec } from "child_process";

/**
 * adds metadata to sticker pack
 * @param {string} author of the pack
 * @param {string} packname of the pack
 * @returns {string} path of exif data
 */
 async function addMetadata(author, packname) {
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

    const little_endian = Buffer.from([0x49, 0x49, 0x2A, 0x00, 0x08, 0x00, 0x00, 0x00, 0x01, 0x00, 0x41, 0x57, 0x07, 0x00])
    const bytes = [0x00, 0x00, 0x16, 0x00, 0x00, 0x00]

    let info_json_size = info_json.length;
    let last = undefined;

    if(info_json_size > 256) {
        info_json_size = info_json_size - 256;
        bytes.unshift(0x01);
    } else {
        bytes.unshift(0x00);
    }

    last = info_json_size.toString(16);
    if (info_json_size < 16) {
        last = "0" + info_json_size;
    }

    const last_buffer = Buffer.from(last, "hex");
    const buff_from_bytes = Buffer.from(bytes);
    const buff_from_json = Buffer.from(info_json);

    const buffer = Buffer.concat([little_endian, last_buffer, buff_from_bytes, buff_from_json]);

    fs.writeFileSync(file_path, buffer, (error) => {
        return path;
    });

}

/**
 * Create sticker from image or video
 * @param {Bot} bot bot instance
 * @param {*} media media to be converted 
 * @param {string} packname name of sticker package
 * @param {string} author pack author
 */
async function createStickerFromMedia(bot, media, packname, author) {
    const random_filename = "./sticker" + Math.floor(Math.random() * 1000);
    await ffmpeg(`./${media}`).input(media).on('start', (cmd) => {
        console.log("Iniciando comando: " + cmd);
    })
    .addOutputOptions(["-vcodec", "libwebp", "-vf", "scale='min(320,iw)':min'(320,ih)':force_original_aspect_ratio=decrease,fps=15, pad=320:320:-1:-1:color=white@0.0, split [a][b]; [a] palettegen=reserve_transparent=on:transparency_color=ffffff [p]; [b][p] paletteuse"])
    .toFormat('webp')
    .save(random_filename)
    .on("error", (err) => {
        console.log("error: " + err);
        fs.unlinkSync(media);
        return {error: err};
    }).on("end", async () => {
        console.log("Finalizando arquivo...");
        exec(`webpmux -set exif ${ await addMetadata(author, packname)} ${random_filename} -o ${random_filename}`, async (error) => {
            if(error) {
                console.log(error);
                fs.unlinkSync("./" + media);
                fs.unlinkSync(random_filename);
                return {error: error};
            }
            console.log("Enviando sticker: " + random_filename);
            await bot.replyMedia(random_filename, MessageType.sticker);
            console.log("Apagando arquivos locais")
            fs.unlinkSync("./" + media);
            fs.unlinkSync(random_filename);
            console.log("Enviado com sucesso!");

        })
    })

}

export { createStickerFromMedia }