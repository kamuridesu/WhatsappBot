import axios from "axios";
import fs from "fs";
import { exec } from "child_process";
import { randomBytes } from "crypto";


/* FUNÇOES NECESSÁRIAS PARA O FUNCIONAMENTO IDEAL DO BOT
NÃO PODEM SER MODIFICADAS OU EXLUÍDAS SEM O CONHECIMENTO NECESSÁRIO PARA MODIFICAR AS OUTRAS!
*/

/**
 * Checks for update, compares the actual version with the version on my repo.
 * @param {Bot} bot bot instance
 */
async function checkUpdates(bot) {
    // checks for updates on github
    let actual_version = JSON.parse(fs.readFileSync("./package.json")).version;  // get actual version
    try{
        const response = await axios({
            method: "get",
            url: "https://raw.githubusercontent.com/kamuridesu/Jashin-bot/main/package.json",  // get version from github
            headers: {
                "DNT": 1,
                "Upgrade-Insecure-Request": 1
            },
            responseType: 'blob'
        });
        bot.has_updates = (response.data.version != actual_version);  // check if there is an update
    } catch (e) {
        console.log(e);
    }
}

/**
 * Updates the bot, on fail sends message to bot owner.
 * @param {Bot} bot bot instance
 */
async function updateBot(bot, data) {
    // updates the bot
    exec("git pull origin main", (error) => {
        bot.sendTextMessage(data, "Não foi possivel atualizar> " + error, bot.owner_jid);  // send error message to owner
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
    // checks the metadata for one group
    let group_data = {
        name: undefined,
        id: undefined,
        members: undefined,
        owner: undefined,
        sender_is_group_owner: undefined,
        admins_info: undefined,
        admins_jid: undefined,
        bot_is_admin: undefined,
        sender_is_admin: undefined,
        description: undefined,
        locked: false,
        open: true,
        welcome_on: undefined,
    }

    group_data.name = group_metadata.subject
    group_data.id = group_metadata.id;
    group_data.members = group_metadata.participants;
    group_data.owner = group_metadata.owner;
    group_data.locked = group_metadata.announce !== undefined ? JSON.parse(JSON.stringify(group_metadata.announce).replace(/"/g, '')) : false;  // check if group is locked or not (if it has an announcement)
    group_data.open = !group_data.locked;  // check if group is open or not (if it has an announcement)
    const admins = group_metadata.participants.map(member => {
        // get admins info
        if (member.isAdmin) {
            return member;
        }
    });
    group_data.admins_info = admins.filter(element => {
        // remove undefined values
        return element !== undefined;
    });
    group_data.admins_jid = group_data.admins_info.map(member_id => {
        // get admins jid
        return member_id.jid;
    })
    group_data.bot_is_admin = group_data.admins_jid.includes(bot_number);
    group_data.sender_is_admin = group_data.admins_jid.includes(sender);
    group_data.sender_is_group_owner = group_data.owner == sender;
    group_data.description = group_metadata.desc;
    return group_data;
}

/**
 * Checks the message data and populate a data object
 * @param {object} message message instance to check data
 * @returns {object} message_data with all retrieved information
 */
async function checkMessageData(message) {
    // checks the message data and populate a data object
    let message_data = {
        context: undefined,
        type: undefined,
        body: undefined,
        is_media: false,
        quoted: false,
        is_quoted_text: false,
        is_quoted_video: false,
        is_quoted_image: false,
        is_quoted_audio: false,
        is_quoted_sticker: false,

    }
    const type = Object.keys(message.message)[0];  // get message type (text, image, video, audio, sticker, location, contact, etc)
    message_data.type = type;
    message_data.context = message;
    message_data.is_media = (type === 'imageMessage' || type === 'videoMessage');

    let body = '';

    // get message body
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

    // check if message is a quoted message
    if (type === "extendedTextMessage") {
        const message_string = JSON.stringify(message.message);
        message_data.quoted = true;
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
    // create buffer from downloaded media
    try {
        options ? options : {}
        const response = await axios({
            method: "get",
            url: url,
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
        return {media: fs.readFileSync("./etc/error_image.png"), error: e}  // return error image
    }
}

export { checkGroupData, createMediaBuffer, checkMessageData, checkUpdates, updateBot };
