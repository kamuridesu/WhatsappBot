import fs from "fs";

async function getAllCommands() {
    // console.log();
    const commands = fs.readFileSync(process.cwd() + "/src/command_handlers.js", "utf-8");  // le o arquivo de comandos
    const cases = commands.split("case").slice(1).map((cmd) => {
        // Pega apenas o comando
        return cmd.split(":")[0].replace(/"/g, '').replace(/'/g, '');
    });

    // gera a string
    const document_string = `Kamubot
Comandos: 
-|${cases.join("\n-|")}`
    return document_string;
}

export { getAllCommands };
