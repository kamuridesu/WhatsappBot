import Sequelize from 'sequelize';

// create our new instance of Sequelize with the database name 


class Database {
    constructor() {
        this.database  = new Sequelize({
            dialect: 'sqlite',
            storage: './databases/database.sqlite',
            logging: false
        });
        this.models = {};
        this.models.users = this.database.define('Users', {
            id: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                autoIncrement: true
            },
            jid: {
                type: Sequelize.STRING,
            },
            slot_chances: {
                type: Sequelize.INTEGER,
                defaultValue: 50
            }
        });
        this.models.groups = this.database.define('Groups', {
            id : {
                type: Sequelize.INTEGER,
                primaryKey: true,
                autoIncrement: true
            },
            jid: {
                type: Sequelize.STRING,
            },
            name: {
                type: Sequelize.STRING,
            },
            welcome: {
                type: Sequelize.BOOLEAN,
                defaultValue: false
            },
            welcome_message: {
                type: Sequelize.STRING,
                defaultValue: ""
            },
            antilink: {
                type: Sequelize.BOOLEAN,
                defaultValue: false
            },
            chatbot: {
                type: Sequelize.BOOLEAN,
                defaultValue: false
            },
            nsfw: {
                type: Sequelize.BOOLEAN,
                defaultValue: false
            },
            members: {
                type: Sequelize.STRING,
                defaultValue: ""
            },
            admins: {
                type: Sequelize.STRING,
                defaultValue: ""
            }, 
            locked: {
                type: Sequelize.BOOLEAN,
                defaultValue: false
            },
            description: {
                type: Sequelize.STRING,
                defaultValue: ""
            },
            owner: {
                type: Sequelize.STRING,
                defaultValue: ""
            },
            sender_is_group_owner: {
                type: Sequelize.BOOLEAN,
                defaultValue: false
            },
            sender_is_admin: {
                type: Sequelize.BOOLEAN,
                defaultValue: false
            },
            bot_is_admin: {
                type: Sequelize.BOOLEAN,
                defaultValue: false
            }
        });
        this.models.misc = this.database.define('Misc', {
            id: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                autoIncrement: true
            },
            _type: {
                type: Sequelize.STRING,
            },
            data: {
                type: Sequelize.STRING,
            }
        });
    }

    async sync() {
        await this.database.sync();
    }

    async get_user_infos(jid) {
        return await this.models.users.findOne({
            where: {
                jid: jid
            },
            logging: false
        });
    }

    async get_group_infos(jid) {
        return await this.models.groups.findOne({
            where: {
                jid: jid
            },
            logging: false
        });
    }

    async get_misc(type) {
        return await this.models.misc.findOne({
            where: {
                _type: type
            },
            logging: false
        });
    }

    async insert(table, data) {
        this.database.options.logging = false;
        await this.models[table].create(data);
        return await this.sync();
    }

    async update(table, data, where) {
        this.database.options.logging = false;
        await this.models[table].update(data, {
            where: where,
            logging: false
        });
        return await this.sync();
    }

    async close() {
        await this.database.close();
    }
}

export { Database };