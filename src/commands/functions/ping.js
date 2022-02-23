import { MessageSenders } from "../../base_handlers/sendersHandlers.js";
import { Log } from "../../storage/logger.js";


async function ping(bot, data) {
    const sender = new MessageSenders(bot);
    const logger = new Log("./logs/ping.log");
    const time =  data.message_data.context.messageTimestamp - Date.now().toString().slice(0, 10);
    const message = `Pong! Tempo de resposta: ${time}ms`;
    logger.write(`Tempo de responsta em ${time}ms`, 3);
    sender.replyText(data, message);
}

export { ping };