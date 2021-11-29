import fs from "fs";

async function getAllCommands() {
    const commands = fs.readFileSync("../src/command_handlers.js", "utf-8");
    const cases = commands.split("case").slice(1).map((cmd) => {
        return cmd.split(":")[0].replace(/"/g, '').replace(/'/g, '');
    })

    const document_string = `Kamubot
    Comandos: 
    -|${commands.join("\n-|")}
    `
    return document_string;
}

export { getAllCommands };
