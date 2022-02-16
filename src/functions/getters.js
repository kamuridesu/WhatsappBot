import fs from "fs";

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
        owner: undefined,
        sender_is_group_owner: undefined,
        admins_info: undefined,
        admins_jid: undefined,
        bot_is_admin: undefined,
        sender_is_admin: undefined,
        description: undefined,
        locked: false,
    }

    group_data.name = group_metadata.subject
    group_data.id = group_metadata.id;
    group_data.members = group_metadata.participants;
    group_data.owner = group_metadata.owner;
    group_data.locked = group_metadata.announce !== undefined ? JSON.parse(JSON.stringify(group_metadata.announce).replace(/"/g, '')) : false;  // check if group is locked or not (if it has an announcement)
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
    group_data.members = JSON.stringify(group_data.members);
    group_data.admins_info = JSON.stringify(group_data.admins_info);
    group_data.admins_jid = JSON.stringify(group_data.admins_jid);
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



function checkNumberInMessage(text) {
    const regex = /@[0-9]{12}/g;
    if(regex.test(text)) {
        return text.match(regex).map(number => number.replace("@", "") + "@s.whatsapp.net");
    }
    return "";
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


async function getMedia(client, data) {
    // get media from message
    let media = undefined;
    if (data.message_data.is_media) {
        media = data.message_data.context;
    } else if (data.message_data.is_quoted_image || data.message_data.is_quoted_video) { // verifica se uma imagem foi mencionada
        media = JSON.parse(JSON.stringify(data.message_data.context).replace('quotedM', 'm')).message.extendedTextMessage.contextInfo;
    }
    if (media) {
        return await client.wa_connection.downloadAndSaveMediaMessage(media, "./temp/stickers/" + Math.round(Math.random() * 10000));
    }
    return media;
}


async function getVideoLength(data) {
    if(data.message_data.is_media && data.message_data.type == "videoMessage") {
        return data.message_data.context.message.videoMessage.seconds
    } else if (data.message_data.is_quoted_video) {
        return data.message_data.context.message.extendedTextMessage.contextInfo.quotedMessage.videoMessage.seconds;
    }
    return undefined;
}

function getRoutes() {
    return JSON.parse(fs.readFileSync("./config/routes/routes.json"));
}

export { checkGroupData, checkMessageData, checkNumberInMessage, quotationMarkParser, getMedia, getVideoLength, getRoutes };
