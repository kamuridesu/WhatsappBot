import { networkCommunicate } from "../functions/network.js";
import { MessageType, Mimetype, Presence } from "@adiwajshing/baileys"
import fs from 'fs';
import { checkNumberInMessage } from "../functions/getters.js";
import { Log } from "../storage/logger.js";
import { Database } from "../storage/db.js";

class MessageSenders {
    constructor(bot_instance) {
        this.bot = bot_instance;
        this.logger = new Log("./logs/senders_handlers.log");
        this.database_connection = new Database();
    }

    async replyText(data, message, mention) {
        const recipient = data.bot_data.from;
        const context = data.message_data.context;
        try {
            await this.bot.wa_connection.updatePresence(recipient, Presence.composing);
            if(!mention) {
                mention = checkNumberInMessage(message);
            }
            await this.bot.wa_connection.sendMessage(recipient, message, MessageType.text, {
                quoted: context,
                contextInfo: {
                    mentionedJid: mention ? mention : ""
                }
            });
            await this.bot.wa_connection.updatePresence(recipient, Presence.online);
        } catch (e) {
            this.logger.write(`[${data.type}] Error: ${e}`);
            return;
        } finally {
            await this.close();
        }
    }

    async replyMedia(data, media, message_type, mime, caption) {
        const recipient = data.bot_data.from;
        const context = data.message_data.context;
        try {
            await this.bot.wa_connection.updatePresence(recipient, Presence.recording);
            if(fs.existsSync(media)) {
                media = fs.readFileSync(media);
            } else if(typeof(media) == "string") {
                media = await networkCommunicate(media);
                if (media.error) {
                    caption = media.error.message,
                    message_type = MessageType.image,
                    mime = Mimetype.png,
                    media = media.media
                }
            }
            let mention = "";
            if (caption) {
                mention = checkNumberInMessage(caption);
            }
            await this.bot.wa_connection.sendMessage(recipient, media, message_type, {
                mimetype: mime ? mime : "",
                caption,
                quoted: context,
                contextInfo: {
                    mentionedJid: mention ? mention : ""
                }
            });
            await this.bot.wa_connection.updatePresence(recipient, Presence.online);
        } catch (e) {
            this.logger.write(`[${data.type}] Error: ${e}`);
            return;
        } finally {
            await this.close();
        }
    }

    async sendTextMessage(data, text, to_who) {
        const recipient = data.bot_data.from;
        let mention = checkNumberInMessage(text);
        try {
            to_who = to_who ? to_who : (recipient ? recipient : "");
            if (to_who == "") return;
            await this.bot.wa_connection.sendMessage(to_who, text, MessageType.text, {
                contextInfo: {
                    mentionedJid: mention ? mention : ""
                }
            });
        } catch (e) {
            this.logger.write(`[${data.type}] Error: ${e}`);
            return;
        } finally {
            await this.close();
        }
    }

    async close() {
        this.bot = undefined;
    }

}


export { MessageSenders };