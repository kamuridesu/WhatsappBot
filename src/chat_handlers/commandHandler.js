import { Log } from "../storage/loger.js";
import { Database } from "../storage/db.js";


class CommandHandler {
    constructor(client, message, data, options) {
        this.client = client;
        this.message = message;
        this.data = data;
        this.options = options;
        this.logger = new Log("./logger/command_handler.log");
        this.database_connection = new Database();
    }

    async processCommand() {
        const command = this.data.message_data.message.split(" ")[0];
        
    }
}