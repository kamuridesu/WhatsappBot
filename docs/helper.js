import fs from "fs";
import { quotationMarkParser } from "../src/functions.js";

async function getAllCommands() {
    // console.log();
    const commands = fs.readFileSync(process.cwd() + "/src/command_handlers.js", "utf-8");  // le o arquivo de comandos
    const cases = commands.split("case").slice(1).map((cmd) => {
        // Pega apenas o comando
        return cmd.split(":")[0].replace(/"/g, '').replace(/'/g, '');
    });

    // gera a string
    const document_string = `Jashin-bot
Comandos: 
-|${cases.join("\n-|")}`
    return document_string;
}

function getFileLines(filename) {
    const command_file_content = fs.readFileSync(filename, "utf-8");
    // const command_file_content = fs.readFileSync("../src/command_handlers.js", "utf-8");
    const command_lines = (command_file_content.split("\n"));
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
            // console.log(command_lines[i]);
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

async function getCommandsByCategory() {
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
        });;


        text += `\n\n${category_indexes[i].name}: \n-|` + command_text.join("\n-|");  // gera a string
        category_indexes[i].end = category_ends[i];
    }
    return text;
}

function getCommandComment() {
    const command_lines = getFileLines(process.cwd() + "/src/command_handlers.js");
    let commands = {};
    let is_cmd = false;
    let cmd_name = "";
    for(let i = 0; i < command_lines.length; i++) {
        const line = command_lines[i].trim();
        if (line.startsWith("case")) {
            is_cmd = true;
            cmd_name = line.split("case")[1].split(":")[0].replace(/"/g, '').replace(/'/g, '').trim();
            commands[cmd_name] = {
                description: "",
            };
        }
        if(is_cmd) {
            if(line.includes("// comment")) {
                commands[cmd_name].description = quotationMarkParser(line.split("// comment=")[1].trim())[0];
                is_cmd = false;
            }
        }
    }
    return commands;
}


async function getAjuda(cmd_name) {
    const comments = getCommandComment();
    if(comments[cmd_name]) {
        return comments[cmd_name].description;
    }
}

export { getAllCommands, getCommandsByCategory, getAjuda };
