import axios from "axios";
import { exec } from "child_process";
import { Log } from "../storage/logger.js";
import fs from 'fs';

async function networkCommunicate(url, responsetype, method, header, data, options) {
    url = encodeURI(url);
    const logger = new Log("./logger/functions.log");
    try {
        options = options ? options : {}
        const response = await axios({
            method: method ? method : "get",
            url,
            headers: header ? header : {},
            data : data ? data : {},
            responseType: responsetype,
            ...options
        });
        return response
    } catch (e) {
        logger.write(e, 2)
        return {media: fs.readFileSync("./etc/error_image.png"), error: e}  // return error image
    }
}

/**
 * Checks for update, compares the actual version with the version on my repo.
 * @param {Bot} bot bot instance
 */
 async function checkUpdates(bot) {
    // checks for updates on github
    const actual_version = JSON.parse(fs.readFileSync("./package.json")).version;  // get actual version
    const response = await networkCommunicate("https://raw.githubusercontent.com/kamuridesu/WhatsappBot/main/package.json", "blob", "GET");
    return (response.data.version != actual_version);  // check if there is an update
}

/**
 * Updates the bot, on fail sends message to bot owner.
 * @param {Bot} bot bot instance
 */
async function updateBot(bot) {
    // updates the bot
    Log("./logger/functions.log").write("Updating bot", 3);
    exec("git pull origin main", (error) => {
        bot.logger.write("Rodando git pull", 3);
        if(error){
            Log("./logger/functions.log").write(error + " while updating!", 2);
            bot.sendTextMessage(undefined, "Não foi possivel atualizar! " + error, bot.owner_jid);  // send error message to owner
        }
    });
}

export { networkCommunicate, checkUpdates, updateBot }