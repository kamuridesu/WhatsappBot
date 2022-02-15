import Sequelize from 'sequelize';

// create our new instance of Sequelize with the database name 
const database = new Sequelize({
    dialect: 'sqlite',
    storage: './databases/database.sqlite',
    logging: false
});


class Database {
    constructor() {
        this.database = database;
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
            }
        });
    }

    async get_group_infos(jid) {
        return await this.models.groups.findOne({
            where: {
                jid: jid
            }
        });
    }

    async get_misc(type) {
        return await this.models.misc.findOne({
            where: {
                _type: type
            }
        });
    }

    async insert(table, data) {
        await this.models[table].create(data);
        return await this.sync();
    }

    async close() {
        await this.database.close();
    }
}

export { Database };