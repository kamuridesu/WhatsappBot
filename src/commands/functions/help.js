import { MessageSenders } from "../../base_handlers/sendersHandlers.js";

async function help(client, data) {
    return new MessageSenders(client).replyText(data, "Ajuda");
}

export { help };