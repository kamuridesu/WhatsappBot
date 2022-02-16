import { MessageSenders } from "../../base_handlers/sendersHandlers.js";

async function getHelp(client, data) {
    return new MessageSenders(client).replyText(data, "Ajuda");
}

export { getHelp };