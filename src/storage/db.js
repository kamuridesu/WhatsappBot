import Sequelize from 'sequelize';

// create our new instance of Sequelize with the database name 
const database = new Sequelize({
    dialect: 'sqlite',
    storage: '../../database.sqlite',
    logging: false
});


// creste our database class
class Database {
    constructor() {
        this.database = database; // create our database instance
        this.group_infos = this.database.define('group_infos', { // create our group_infos table
            id: {
                type: Sequelize.INTEGER, // set the type of the id column
                autoIncrement: true, // set the id column to auto increment
                primaryKey: true // set the id column to be the primary key
            },
            jid: {
                type: Sequelize.STRING, // set the type of the jid column
            },
            welcome_on: {
                type: Sequelize.BOOLEAN,    // set the type of the welcome_on column
                defaultValue: false // set the default value of the welcome_on column
            },
            welcome_message: { // set the type of the welcome_message column
                type: Sequelize.STRING, // set the type of the welcome_message column
                defaultValue: 'Welcome to the group!' // set the default value of the welcome_message column
            },
            anti_link_on: {
                type: Sequelize.BOOLEAN,   // set the type of the anti_link_on column
                defaultValue: false // set the default value of the anti_link_on column
            },
            nsfw_on: {
                type: Sequelize.BOOLEAN,   // set the type of the nsfw_on column
                defaultValue: false // set the default value of the nsfw_on column
            },
        });

        this.users_infos = this.database.define('users_infos', { // create our users_infos table
            id: { // set the type of the id column
                type: Sequelize.INTEGER, // set the type of the id column
                autoIncrement: true, // set the id column to auto increment
                primaryKey: true // set the id column to be the primary key
            }, 
            jid: {
                type: Sequelize.STRING, // set the type of the jid column
            },
            slot_chances: { // set the type of the slot_chances column
                type: Sequelize.INTEGER, // set the type of the slot_chances column
                defaultValue: 50 // set the default value of the slot_chances column
            },
        });

        this.bot_infos = this.database.define('bot_infos', { // create our bot_infos table
            id: {
                type: Sequelize.INTEGER, // set the type of the id column
                autoIncrement: true, // set the id column to auto increment
                primaryKey: true // set the id column to be the primary key
            },
            copypastas_name: { // set the type of the copypastas_name column
                type: Sequelize.STRING, // set the type of the copypastas_name column
                defaultValue: '', // set the default value of the copypastas_name column
            },
        });

        this.copypastas = this.database.define('copypastas', { // create our copypastas table
            id: {
                type: Sequelize.INTEGER, // set the type of the id column
                autoIncrement: true, // set the id column to auto increment
                primaryKey: true // set the id column to be the primary key
            },
            name: {
                type: Sequelize.STRING, // set the type of the name column
            },
            content: {
                type: Sequelize.STRING, // set the type of the content column
            },
        });


    }

    async sync_db() { // synchronize the database
        try {
            await this.database.sync({
                force: false
            }); // synchronize the database
            return true; // return true if the database is synchronized
        } catch (err) {
            console.log(err); 
            return false; // return false if the database is not synchronized
        }
    }

    async insert(table_name, infos) { // insert a new row in the database
        console.log(table_name);
        if(await this.sync_db()) { // synchronize the database
            switch (table_name) { // switch on the table name
                case 'group_infos': // if the table name is group_infos
                    try{
                        const result = await this.group_infos.create({ // create a new row in the group_infos table
                            jid: infos.jid, // set the jid column to the jid parameter
                            welcome_on: infos.welcome_on, // set the welcome_on column to the welcome_on parameter 
                            welcome_message: infos.welcome_message, // set the welcome_message column to the welcome_message parameter
                            anti_link_on: infos.anti_link_on, // set the anti_link_on column to the anti_link_on parameter
                            nsfw_on: infos.nsfw_on, // set the nsfw_on column to the nsfw_on parameter
                        });
                        console.log(result);
                    } catch (err) {
                        console.log(err);
                    }
                    break;
                case 'user_infos':
                    console.log(infos)
                    try{
                        const result = await this.users_infos.create({ // create a new row in the users_infos table
                            jid: infos.jid, // set the jid column to the jid parameter
                            slot_chances: infos.slot_chances // set the slot_chances column to the slot_chances parameter
                        });
                        console.log(result);
                    }
                    catch (err) {
                        console.log(err);
                    }
                    break;
                case 'bot_infos':
                    try{
                        const result = await this.bot_infos.create({ // create a new row in the bot_infos table
                            copypastas_name: infos.copypastas_name // set the copypastas_name column to the copypastas_name parameter
                        });
                        console.log(result);
                    } catch (err) {
                        console.log(err);
                    }
                    break;
                case 'copypastas':
                    try{
                        const result = await this.copypastas.create({ // create a new row in the copypastas table
                            name: infos.name, // set the name column to the name parameter
                            content: infos.content // set the content column to the content parameter
                        });
                        console.log(result);
                    } catch (err) {
                        console.log(err);
                    }
                    break;
            }
        }
    }

    async update(table_name, infos) { // update a row in the database
        if(await this.sync_db()) {
            switch (table_name) {
                case 'group_infos':
                    try{
                        const result = await this.group_infos.update({
                            welcome_on: infos.welcome_on,
                            welcome_message: infos.welcome_message,
                            anti_link_on: infos.anti_link_on,
                            nsfw_on: infos.nsfw_on,
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
                case 'user_infos':
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

    async get_user_infos(jid) {
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