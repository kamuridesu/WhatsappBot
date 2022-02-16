import { Log } from "../storage/logger.js";
import { Database } from "../storage/db.js";
import { Commands } from "../commands/commands.js";

class CommandHandler {
    constructor(client, message, data, options) {
        this.client = client;
        this.message = message;
        this.data = data;
        this.options = options;
        this.logger = new Log("./logs/command_handler.log");
        this.database_connection = new Database();
    }

    async processCommand() {
        const command = this.message.split(" ")[0].split(this.client.prefix)[1];
        const aegs = this.message.split(" ").slice(1);
        await new Commands(this.client, this.data, command, aegs, this.message, this.options).processCommand();
    }

    async process() {
        await this.processCommand();
        await this.close();
    }

    async close() {
        this.client = undefined;
        this.message = undefined;
        this.data = undefined;
        this.options = undefined;
    }

}


export { CommandHandler };