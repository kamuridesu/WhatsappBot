import { MessageSenders } from "../../base_handlers/sendersHandlers.js";
import  { getAllCommands, getCommandsByCategory, getAjuda } from "../helpers/commands_helpers.js";

async function getHelp(client, data, args) {
    const sender = new MessageSenders(client);
    const all_commands = getAllCommands();
    if (args.length == 0) {
        const commands_by_category = getCommandsByCategory();
        return await sender.replyText(data, commands_by_category);
    } else if (args.length == 1) {
        const command_help = getAjuda(args[0]);
        if (command_help) {
            return await sender.replyText(data, command_help);
        } else {
            return await sender.replyText(data, `Comando ${args[0]} não encontrado!`);
        }
    }
   return await sender.replyText(data, "Erro! Número de argumentos inválido!");
}

export { getHelp };