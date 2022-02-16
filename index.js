// Imports
import { WAConnection } from '@adiwajshing/baileys';
import fs from 'fs'
import { Database } from './src/storage/db.js';
import { Log } from './src/storage/logger.js';
import { RawMessageHandlers } from './src/base_handlers/raw_handlers.js';
import { checkUpdates, updateBot } from './src/functions/network.js';


class Bot {
    constructor(config) {
        this.config = config;
        const owner_data = JSON.parse(fs.readFileSync("./config/config.admin.json"));
        this.wa_connection = undefined;
        this.prefix = owner_data.prefix;
        this.owner_jid = owner_data.jid;
        this.database = new Database();
        this.database.sync();
        this.logger = new Log("./logs/main_log.log");
    }

    /**
     * Connects to whatsapp server
    **/
    async connect() {
        this.wa_connection = new WAConnection();
        const auth_config = "./config/config.auth.json";
        try {
            this.wa_connection.loadAuthInfo(auth_config);
        } catch (e) {
            this.wa_connection.on("open", () => {
                const auth_data = this.wa_connection.base64EncodedAuthInfo();
                fs.writeFileSync(auth_config, JSON.stringify(auth_data));
            })
        }
        try {
            await this.wa_connection.connect();
        } catch (e) {
            this.wa_connection.clearAuthInfo();
            fs.writeFileSync(auth_config, "");
        }

        this.bot_jid = this.wa_connection.user.jid;

        this.wa_connection.on("chat-update", async chat_update => {
            if (chat_update.messages && chat_update.count) {
                if (JSON.parse(JSON.stringify(chat_update)).messages[0].messageStubType != "REVOKE") {
                    const raw_msg = new RawMessageHandlers(this, "new-message", chat_update.messages.all()[0]);
                    raw_msg.processMessage();
                }
            }
        });

        this.wa_connection.on("group-participants-update", async group_participants_update => {
            try {
                if (group_participants_update.action == "add") {
                    // this.addMemberListener(group_participants_update.jid, group_participants_update.participants[0]);
                }
            } catch (e) {
                this.logger.write(e, 2);
            }
        });

        if (await checkUpdates()) {
            updateBot(this);
        }
    }
}

const bot = new Bot();
await bot.connect();
