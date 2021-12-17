import Sequelize from 'sequelize';
const database = new Sequelize({
    dialect: 'sqlite',
    storage: './database.sqlite',
    logging: false
});


class Database {
    constructor() {
        this.database = database;
        this.group_infos = this.database.define('group_infos', {
            id: {
                type: Sequelize.INTEGER,
                autoIncrement: true,
                primaryKey: true
            },
            jid: {
                type: Sequelize.STRING,
            },
            welcome_on: {
                type: Sequelize.BOOLEAN,
                defaultValue: false
            },
            welcome_message: {
                type: Sequelize.STRING,
                defaultValue: 'Welcome to the group!'
            },
            anti_link_on: {
                type: Sequelize.BOOLEAN,
                defaultValue: false
            },
            nsfw_on: {
                type: Sequelize.BOOLEAN,
                defaultValue: false
            },
        });

        this.users_infos = this.database.define('users_infos', {
            id: {
                type: Sequelize.INTEGER,
                autoIncrement: true,
                primaryKey: true
            },
            jid: {
                type: Sequelize.STRING,
            },
            slot_chances: {
                type: Sequelize.INTEGER,
                defaultValue: 50
            },
        });

        this.bot_infos = this.database.define('bot_infos', {
            id: {
                type: Sequelize.INTEGER,
                autoIncrement: true,
                primaryKey: true
            },
            copypastas_name: {
                type: Sequelize.STRING,
                defaultValue: '',
            },
        });

        this.copypastas = this.database.define('copypastas', {
            id: {
                type: Sequelize.INTEGER,
                autoIncrement: true,
                primaryKey: true
            },
            name: {
                type: Sequelize.STRING,
            },
            content: {
                type: Sequelize.STRING,
            },
        });


    }

    async sync_db() {
        try {
            await this.database.sync();
            return true;
        } catch (err) {
            console.log(err);
            return false;
        }
    }

    async insert(table_name, infos) {
        if(await this.sync_db()) {
            switch (table_name) {
                case 'group_infos':
                    try{
                        const result = await this.group_infos.create({
                            jid: infos.jid,
                            welcome_on: infos.welcome_on,
                            welcome_message: infos.welcome_message,
                            anti_link_on: infos.anti_link_on,
                            nsfw_on: infos.nsfw_on
                        });
                        console.log(result);
                    } catch (err) {
                        console.log(err);
                    }
                    break;
                case 'users_infos':
                    try{
                        const result = await this.users_infos.create({
                            jid: infos.jid,
                            slot_chances: infos.slot_chances
                        });
                        console.log(result);
                    }
                    catch (err) {
                        console.log(err);
                    }
                    break;
                case 'bot_infos':
                    try{
                        const result = await this.bot_infos.create({
                            copypastas_name: infos.copypastas_name
                        });
                        console.log(result);
                    } catch (err) {
                        console.log(err);
                    }
                    break;
                case 'copypastas':
                    try{
                        const result = await this.copypastas.create({
                            name: infos.name,
                            content: infos.content
                        });
                        console.log(result);
                    } catch (err) {
                        console.log(err);
                    }
                    break;
            }
        }
    }

    async update(table_name, infos) {
        if(await this.sync_db()) {
            switch (table_name) {
                case 'group_infos':
                    try{
                        const result = await this.group_infos.update({
                            welcome_on: infos.welcome_on,
                            welcome_message: infos.welcome_message,
                            anti_link_on: infos.anti_link_on,
                            nsfw_on: infos.nsfw_on
                        }, {
                            where: {
                                jid: infos.jid
                            }
                        });
                        console.log(result);
                    } catch (err) {
                        console.log(err);
                    }
                    break;
                case 'users_infos':
                    try{
                        const result = await this.users_infos.update({
                            slot_chances: infos.slot_chances
                        }, {
                            where: {
                                jid: infos.jid
                            }
                        });
                        console.log(result);
                    }
                    catch (err) {
                        console.log(err);
                    }
                    break;
                case 'bot_infos':
                    try{
                        const result = await this.bot_infos.update({
                            copypastas_name: infos.copypastas_name
                        }, {
                            where: {
                                id: 1
                            }
                        });
                        console.log(result);
                    }
                    catch (err) {
                        console.log(err);
                    }
                    break;
                case 'copypastas':
                    try{
                        const result = await this.copypastas.update({
                            name: infos.name,
                            content: infos.content
                        }, {
                            where: {
                                id: infos.id
                            }
                        });
                        console.log(result);
                    }
                    catch (err) {
                        console.log(err);
                    }
                    break;
            }
        }
    }

    async get_group_infos(jid) {
        try {
            const result = await this.group_infos.findOne({
                where: {
                    jid: jid
                }
            });
            return JSON.parse(JSON.stringify(result));
        } catch (err) {
            console.log(err);
            this.sync_db();
            return false;
        }
    }

    async get_users_infos(jid) {
        try {
            const result = await this.users_infos.findOne({
                where: {
                    jid: jid
                }
            });
            return JSON.parse(JSON.stringify(result));
        } catch (err) {
            console.log(err);
            this.sync_db();
            return false;
        }
    }

    async get_bot_infos() {
        try {
            const result = await this.bot_infos.findOne({
                where: {
                    id: 1
                }
            });
            return JSON.parse(JSON.stringify(result));
        } catch (err) {
            console.log(err);
            this.sync_db();
            return false;
        }
    }

    async get_copypastas() {
        try {
            const result = await this.copypastas.findAll();
            return JSON.parse(JSON.stringify(result));
        } catch (err) {
            console.log(err);
            this.sync_db();
            return false;
        }
    }
    
}

export { Database };