import axios from "axios";
import fs from "fs";
import { exec } from "child_process";


/* FUNÇOES NECESSÁRIAS PARA O FUNCIONAMENTO IDEAL DO BOT
NÃO PODEM SER MODIFICADAS OU EXLUÍDAS SEM O CONHECIMENTO NECESSÁRIO PARA MODIFICAR AS OUTRAS!
*/

/**
 * Checks for update, compares the actual version with the version on my repo.
 * @param {Bot} bot bot instance
 */
async function checkUpdates(bot) {
    let actual_version = JSON.parse(fs.readFileSync("./package.json")).version;
    try{
        const response = await axios({
            method: "get",
            url: "https://raw.githubusercontent.com/kamuridesu/WhatsappBot/main/package.json",
            headers: {
                "DNT": 1,
                "Upgrade-Insecure-Request": 1
            },
            responseType: 'blob'
        });
        bot.has_updates = (response.data.version != actual_version);
    } catch (e) {
        console.log(e);
    }
}

/**
 * Updates the bot, on fail sends message to bot owner.
 * @param {Bot} bot bot instance
 */
async function updateBot(bot) {
    exec("git pull origin main", (error) => {
        bot.sendTextMessage("Não foi possivel atualizar> " + error, bot.owner_jid);   
    })
}

/**
 * Checks the metadata for one group
 * @param {object} group_metadata 
 * @param {string} bot_number 
 * @param {string} sender 
 * @returns {object} group_data;
 */
async function checkGroupData(group_metadata, bot_number, sender) {
    let group_data = {
        name: undefined,
        id: undefined,
        members: undefined,
        admins: undefined,
        bot_is_admin: undefined,
        sender_is_admin: undefined,
        description: undefined,
        welcome_on: undefined,
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

/**
 * Checks the message data and populate a data object
 * @param {object} message message instance to check data
 * @returns {object} message_data with all retrieved information
 */
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

/**
 * Create buffer from downloaded media
 * @param {string} url url where the media will be downloaded
 * @param {object} options options to download
 * @returns {object} with response data or error
 */
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

export { checkGroupData, createMediaBuffer, checkMessageData, checkUpdates, updateBot };
