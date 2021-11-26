import axios from "axios";
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

export { checkGroupData, createMediaBuffer };
