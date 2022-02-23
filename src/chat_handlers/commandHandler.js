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
        const args = this.message.split(" ").slice(1);
        let output = `Command ${command} from ${this.data.bot_data.sender}`;
        output += args.length > 0 ? ` with arguments: ${args.join(", ")}` : "";
        output += this.data.bot_data.is_group ? ` in group ${this.data.group_data.name}` : "";
        this.logger.write(output, 3);
        await new Commands(this.client, this.data, command, args, this.message, this.options).processCommand();
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