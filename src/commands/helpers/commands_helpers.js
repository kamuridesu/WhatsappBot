import fs from "fs";
import { quotationMarkParser } from "../../functions/getters.js";


function getAllCommands() {
    const commands = fs.readFileSync(process.cwd() + "/src/commands/commands.js", "utf8");
    const cases = commands.split("case").slice(1).map((cmd) => {
        return cmd.split(":")[0].replace(/"/g, '').replace(/'/g, '');
    }); 
    const document_string = `Jashin-bot
Comandos:
-|${cases.join("\n-|")}`
    return document_string;
}


function getFileLines(filename) {
    const commands = fs.readFileSync(process.cwd() + "/src/commands/commands.js", "utf8");
    const command_lines = (commands.split("\n"));
    return command_lines;
}


function processCategories(command_lines) {
    let category_indexes = []
    let category_ends = []
    let last_category = undefined;
    let n_of_tags = 0;
    for(let i = 0; i < command_lines.length; i++) {
        const category = command_lines[i].replace(/[^a-zA-Z0-9]/g, '').trim(); // removes all special chars
        if(command_lines[i].trim().includes("$%")) {  // se for uma categoria
            if(category.includes(last_category)) {  // se for uma categoria repetida
                category_ends.push(i);
            } else {  // se for uma categoria nova
                n_of_tags += 1;
                category_indexes.push({
                    name: category,
                    start: i + 1,
                    end: undefined
                });
                last_category = category;
            }
        }
    }
    return [category_indexes, category_ends];
}


function getCommandsByCategory() {
    const command_lines = getFileLines(process.cwd() + "/src/command_handlers.js");
    let category_indexes = []
    let category_ends = []
    let categories = processCategories(command_lines);
    category_indexes = categories[0];
    category_ends = categories[1];
    if(category_ends.length != category_indexes.length) {
        return "Erro! Algumas categorias não possuem tags de fechamento!";
    }

    let text = "--==Jashin-bot==--\n\nComandos:";
    for(let i = 0; i < category_indexes.length; i++) {
        let command_text = command_lines.slice(category_indexes[i].start, category_ends[i]).join("\n").split("case").slice(1).map((cmd) => {
            // Pega apenas o comando
            return cmd.split(":")[0].replace(/"/g, '').replace(/'/g, '');
        });
        text += `\n\n${category_indexes[i].name}:\n-|${command_text.join("\n-|")}`;
    }
    return text;
}


function getCommandComment() {
    const command_lines = getFileLines(process.cwd() + "/src/command_handlers.js");
    let commands = {}
    let is_cmd = false;
    let cmd_name = "";
    for (let i = 0; i < command_lines.length; i++) {
        const line = command_lines[i].trim();
        if(line.startsWith("case")) {
            is_cmd = true;
            cmd_name = (line.split(":")[0].replace(/"/g, '').replace(/'/g, '')).split("case")[1].trim();
            commands[cmd_name] = {
                name: cmd_name,
                description: ""
            };
        }
        if(is_cmd) {
            if (line.includes("description=")) {
                commands[cmd_name].description = quotationMarkParser(line.split("description=")[1].trim())[0];
                is_cmd = false;
            }
        }
    }
    return commands;
}


function getAjuda(msg) {
    const commands = getCommandComment();
    if(commands[msg]) {
        return commands[msg].description;
    }
}


export { getAllCommands, getCommandsByCategory, getCommandComment, getAjuda };