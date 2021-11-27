import axios from "axios";
import fs from "fs";
import pkg from "fluent-ffmpeg";
const ffmpeg = pkg;
import { exec } from "child_process";
import {MessageType, Mimetype} from '@adiwajshing/baileys';

/**
 * Checks the metadata for one group
 * @param {object} group_metadata 
 * @param {string} bot_number 
 * @param {string} sender 
 * @returns {object} group_data;
 */
async function checkGroupData(group_metadata, bot_number, sender) {
    let group_data = {
        // "group_metadata": undefined,
        "name": undefined,
        "id": undefined,
        "members": undefined,
        "admins": undefined,
        "bot_is_admin": undefined,
        "sender_is_admin": undefined,
        "description": undefined,
        "welcome_on": undefined,
    }
    group_data.name = group_metadata.subject
    group_data.id = group_metadata.id;
    group_data.members = group_metadata.participants;
    const admins = group_metadata.participants.map(member => {
        if (member.isAdmin) {
            return member;
        }
    });
    group_data.admins = admins.filter(element => {
        return element !== undefined;
    });
    group_data.bot_is_admin = group_metadata.participants.includes(bot_number);
    group_data.sender_is_admin = group_data.admins.includes(sender);
    group_data.description = group_metadata.desc;
    return group_data;
}


async function checkMessageData(message) {
    let message_data = {
        context: undefined,
        type: undefined,
        body: undefined,
        is_media: false,
        is_quoted_text: false,
        is_quoted_video: false,
        is_quoted_image: false,
        is_quoted_audio: false,
        is_quoted_sticker: false,

    }
    const type = Object.keys(message.message)[0];
    message_data.type = type;
    message_data.context = message;
    message_data.is_media = (type === 'imageMessage' || type === 'videoMessage');

    let body = '';

    if (type == 'conversation') {
        body = message.message.conversation;
    } else if (type == "imageMessage") {
        body = message.message.imageMessage.caption;
    } else if (type == "videoMessage") {
        body = message.message.videoMessage.caption;
    } else if(type == "extendedTextMessage") {
        body = message.message.extendedTextMessage.text;
    }
    message_data.body = body;
    if (type === "extendedTextMessage") {
        const message_string = JSON.stringify(message.message);
        message_data.is_quoted_text = message_string.includes("conversation");
        message_data.is_quoted_audio = message_string.includes("audioMessage");
        message_data.is_quoted_image = message_string.includes("imageMessage");
        message_data.is_quoted_video = message_string.includes("videoMessage");
        message_data.is_quoted_sticker = message_string.includes("stickerMessage");
    }
    return message_data;
}


async function createMediaBuffer(url, options) {
    try {
        options ? options : {}
        const response = await axios({
            method: "get",
            url,
            headers: {
                "DNT": 1,
                "Upgrade-Insecure-Request": 1
            },
            ...options,
            responseType: 'arraybuffer'
        })
        return response.data
    } catch (e) {
        console.log("errro> " + e);
        return {media: fs.readFileSync("./etc/error_image.png"), error: e}
    }
}


async function addMetadata(author, packname) {
    packname = (packname) ? packname : "kamubot";
    author = (author) ? author.replace(/[^a-zA-Z0-9]/g, '') : "kamubot";
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


async function createStickerFromImage(bot, image) {
    const random_filename = "./sticker" + Math.floor(Math.random() * 1000);
    await ffmpeg(`./${image}`).input(image).on('start', (cmd) => {
        console.log("Command: " + cmd);
    })
    .addOutputOptions(["-vcodec", "libwebp", "-vf", "scale='min(320,iw)':min'(320,ih)':force_original_aspect_ratio=decrease,fps=15, pad=320:320:-1:-1:color=white@0.0, split [a][b]; [a] palettegen=reserve_transparent=on:transparency_color=ffffff [p]; [b][p] paletteuse"])
    .toFormat('webp')
    .save(random_filename)
    .on("error", (err) => {
        console.log("error: " + error);
        fs.unlinkSync(image);
        return {error: err};
    }).on("end", async () => {
        console.log("Finishing sticker...");
        exec(`webpmux -set exif ${ await addMetadata()} ${random_filename} -o ${random_filename}`, async (error) => {
            if(error) {
                console.log(error);
                fs.unlinkSync("./" + image);
                fs.unlinkSync(random_filename);
                return {error: error};
            }
            console.log("Sending sticker: " + random_filename);
            await bot.replyMedia(random_filename, MessageType.sticker, {
                quoted: bot.message_data.context
            });
            console.log("deleting local files")
            fs.unlinkSync("./" + image);
            fs.unlinkSync(random_filename);

        })
    })

}

export { checkGroupData, createMediaBuffer, checkMessageData, createStickerFromImage };
