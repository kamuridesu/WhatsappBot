import { Log } from "../storage/logger.js";
import { Database } from "../storage/db.js";
import * as commands from "./functions/commands.js";

class Commands {
    constructor(client, data, command, args, message, options) {
        this.client = client;
        this.message = message;
        this.data = data;
        this.options = options;
        this.command = command;
        this.args = args;
        this.logger = new Log("./logs/commands.log");
        this.database_connection = new Database();
    }

    async processCommand() {
        switch (this.command) {
            /* %$INFO$% */
            case "help":
            case "menu":
            case "ajuda":
                return commands.help(this.client, this.data);
            /* %$INFO$% */
        }
    }

    async close() {
        this.client = undefined;
        this.message = undefined;
        this.data = undefined;
        this.options = undefined;
        this.command = undefined;
        this.args = undefined;
    }
}

export { Commands };