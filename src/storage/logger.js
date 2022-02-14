import fs from 'fs';

class Log {
    constructor(filename) {
        this.filename = filename ? filename : 'logs.log';
        this.log = [];
        this.log_file = fs.existsSync(this.filename) ? fs.readFileSync(this.filename, 'utf8') : '';
        this.log_levels = {
            0: "INFO",
            1: "WARNING",
            2: "ERROR",
            3: "DEBUG"
        };
        this.log_level_colors = {
            0: "\x1b[1;37m", // white
            1: "\x1b[1;33m", // yellow
            2: "\x1b[0;31m", // red
            3: "\x1b[1;34m" // blue
        }
        this.reset_color = "\x1b[0m";
        this.output_enabled = true;
        this.on = true;
    }
    async write(message, level) {
        if(this.on) {
            if(!this.log_levels[level]) {
                level = 0;
            }
            const datetime = new Date().toISOString();
            const fmt_message = `${datetime}  ${this.log_levels[level]}: ${message}`;
            if(this.output_enabled) {
                console.log(this.log_level_colors[level] + fmt_message + this.reset_color);
            }
            this.log_file += `${fmt_message}\n`;
            fs.writeFileSync(this.filename, this.log_file);
        }
    }

    async read(){
        return this.log_file;
    }
}

export { Log };