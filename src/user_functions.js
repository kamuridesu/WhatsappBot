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
async function createStickerFromMedia(bot, data, media, packname, author) {
    // create sticker from image or video
    const random_filename = "./sticker" + Math.floor(Math.random() * 1000);
    await ffmpeg(`./${media}`).input(media).on('start', (cmd) => {
        bot.logger.write("Iniciando comando: " + cmd, 3);
    })
    .addOutputOptions(["-vcodec", "libwebp", "-vf", "scale='min(320,iw)':min'(320,ih)':force_original_aspect_ratio=decrease,fps=15, pad=320:320:-1:-1:color=white@0.0, split [a][b]; [a] palettegen=reserve_transparent=on:transparency_color=ffffff [p]; [b][p] paletteuse"])
    .toFormat('webp')
    .save(random_filename)
    .on("error", (err) => {
        bot.logger.write("error: " + err, 2);
        fs.unlinkSync(media);
        return {error: err};
    }).on("end", async () => {
        bot.logger.write("Finalizando arquivo...", 3);
        exec(`webpmux -set exif ${ await addMetadata(author, packname)} ${random_filename} -o ${random_filename}`, async (error) => {
            if(error) {
                bot.logger.write(error, 2);
                fs.unlinkSync("./" + media);
                fs.unlinkSync(random_filename);
                return {error: error};
            }
            await bot.replyMedia(data, random_filename, MessageType.sticker);  // send sticker
            fs.unlinkSync("./" + media);
            fs.unlinkSync(random_filename);
            bot.logger.write("Enviado com sucesso!", 3);
        });
    })

}

function quotationMarkParser(text) {
    // separate the text into words, except if inside quotation marks
    if(!text) {
        return [];
    }
    let words = text.split(/\s+/);
    let in_quotes = false;
    let quote_start = 0;
    let quote_end = 0;
    let quote_words = [];;
    for(let i = 0; i < words.length; i++) {
        if(words[i].startsWith("\"")) {
            if(words[i].endsWith("\"")) {
                quote_words.push(words[i].replace(/\"/g, "").trim());
            }
            else if(!in_quotes) {
                in_quotes = true;
                quote_start = i;
            }
        } else if(words[i].endsWith("\"")) {
            in_quotes = false;
            quote_end = i;
            let quote = words.slice(quote_start, quote_end + 1).join(" ");
            quote_words.push(quote.replace(/\"/g, "").trim());
        } else {
            if(!in_quotes) {
                quote_words.push(words[i].trim());
            }
        }
    }
    return quote_words;
}



export { createStickerFromMedia, quotationMarkParser };