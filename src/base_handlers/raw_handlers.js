import { Database } from "../storage/db.js";
import { Log } from "../storage/logger.js"
import { checkGroupData, checkMessageData } from "../functions/parsers.js";
import { MessageHandler } from "../chat_handlers/messageHandler.js";
import { syncGroupDBData } from "../functions/setter.js";
import { CommandHandler } from "../chat_handlers/commandHandler.js";

class RawMessageHandlers {
    constructor(bot_instance, type, message) {
        this.bot = bot_instance;
        this.message = message;
        this.type = type;
        this.logger = new Log("./logs/raw_handlers.log");
        this.database_connection = new Database();
    }

    async processMessage() {
        let bot_data = {};
        let group_data = undefined;

        try {
            bot_data.all_chats = this.bot.wa_connection.chats.all();
        } catch (e) {
            this.logger.write(`[${this.type}] Error: ${e}`, 2);
            return;
        }

        if (!this.message.message) return;
        if (!this.message.key && this.message.key.remoteJid == "status@broadcast") return;
        if (this.message.key.fromMe) return;

        bot_data.from = this.message.key.remoteJid;
        bot_data.sender = bot_data.from;
        if(bot_data.sender === this.bot.owner_jid || bot_data.from == this.bot.owner_jid) {
            bot_data.sender_is_owner = true;
        }
        let sender_data = await this.database_connection.get_user_infos(bot_data.sender);
        if (sender_data == null) {
            await this.database_connection.insert("users", {
                jid: bot_data.sender,
                slot_chances: 50
            });
        }
        try {
            bot_data.sender_name = this.bot.wa_connection.contacts[bot_data.sender] ? this.bot.wa_connection.contacts[bot_data.sender].name : bot_data.sender;
        } catch (e) {
            this.logger.write(`[${this.type}] Error: ${e}`, 2);
            return;
        }

        bot_data.is_group = bot_data.sender.endsWith("@g.us");
        if (bot_data.is_group) {
            bot_data.sender = this.message.participant;
            let metadata = undefined;
            try {
                metadata = await this.bot.wa_connection.groupMetadata(bot_data.from);
            } catch (e) {
                this.logger.write(`[${this.type}] Error: ${e}`, 2);
                return;
            }
            group_data = await checkGroupData(metadata, this.bot.bot_number, bot_data.sender);
            await syncGroupDBData(this.database_connection, group_data);
            group_data = await this.database_connection.get_group_infos(group_data.id);
            group_data.members = JSON.parse(group_data.members);
            group_data.admins = JSON.parse(group_data.admins);
        }
        // console.log(group_data);

        const message_data = await checkMessageData(this.message);
        if (message_data.body.startsWith(this.bot.prefix)) {
            console.log(message_data.body);
            await new CommandHandler(this.bot, message_data.body, {bot_data, group_data, message_data}, this.type).process();
            return this.close();
        }
        await new MessageHandler(this.bot, message_data.body, {bot_data, group_data, message_data}, this.type).process();
        return this.close();
    }

    async close() {
        this.bot = undefined;
        this.message = undefined;
        this.type = undefined;
    }
}


export { RawMessageHandlers };