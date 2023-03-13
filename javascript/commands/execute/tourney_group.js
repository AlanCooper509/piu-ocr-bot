// npm install discord.js@14.6.0
// npm install sqlite3@5.1.4
// npm install dotenv@16.0.3

const Discord = require("discord.js");
const sqlite3 = require("sqlite3").verbose();
require("dotenv").config();

// local imports
const c = require("../../resources/constants.js");
const tourneyView = require("./tourney_view.js");

// class variables
const arrow_url = "https://raw.githubusercontent.com/AlanCooper509/piu-ocr-bot/master/javascript/resources/icons/arrow7.png";

module.exports = (input) => {
    if (![c.COMMAND, c.MESSAGE, c.SUBMIT].includes(input.constructor.name)) {
        console.log(`${input.constructor.name}: Object input type not recognized`);
        return;
    }
    let name = validateName(input, c.COMMAND_TOURNEY_SUBCOMMAND_GROUP_NICKNAME_NAME);
    
    let runcheckGroupSQLpromise = checkGroupPromiseSQL(input, name);
    runcheckGroupSQLpromise.catch((err) => {
        console.error(err);
        throw "Error during tourney group search.";
    }).then((row) => {
        if (row) {
            tourneyView(input, true, row.id, true);
        } else {
            createGroupPromiseSQL(input, name).catch((err) => {
                console.error(err);
                throw "Error during tourney group creation request.";
            }).then((rowID) => {
                discordReply(input, rowID, name);;
            }).catch(error => {
                console.error(error);
                let reply = { content: error.toString(), ephemeral: true };
                switch (input.constructor.name) {
                    case c.COMMAND:
                        input.editReply(reply);
                        return;
                    case c.MESSAGE:
                        input.reply(reply);
                        return;
                    case c.SUBMIT:
                        input.reply(reply);
                        return;
                }
            });
        }
    }).catch(error => {
        console.error(error);
        let reply = { content: error.toString(), ephemeral: true };
        switch (input.constructor.name) {
            case c.COMMAND:
                input.editReply(reply);
                return;
            case c.MESSAGE:
                input.reply(reply);
                return;
            case c.SUBMIT:
                input.reply(reply);
                return;
        }
    });

    function validateName(input, optionID) {
        let nickname = '';
        switch (input.constructor.name) {
            case c.COMMAND:
                nickname = input.options.getString(optionID);
                if (!nickname) { return; }
                break;
            case c.MESSAGE:
                // get the remaining parts of the message as the nickname "tourney group <nickname>"
                let tokens = input.content.split(' ');
                let idx = 2;
                if (idx >= tokens.length) { return; }
                nickname = tokens.slice(idx).join(' ');
                break;
        }

        if (!/^([A-Z|a-z|0-9|_|\s|.]+)$/.test(nickname)) {
            let reply = {
                    content: `An invalid tourney group name of \`${nickname}\` was found in your command!\nPlease try again.`, 
                    ephemeral: true
                };
            switch (input.constructor.name) {
                case c.COMMAND:
                    input.editReply(reply);
                    return;
                case c.MESSAGE:
                    input.reply(reply);
                    return;
            }
        }
        return nickname;
    }

    function checkGroupPromiseSQL(input, name) {
        return new Promise((resolve, reject) => {
            const db = new sqlite3.Database(process.env.DB_NAME, (err) => {
                if (err) {
                    console.error(err.message);
                    reject(err);
                }
                console.log(`${c.DEBUG_QUERY}: Connected to the database.`);
            });

            let fields = ["id", "server_id", "name"];
            let sql = 
                `SELECT *, CAST(id as TEXT) as id, CAST(server_id as TEXT) as server_id FROM ${process.env.DB_GROUPS_TABLE} 
                    WHERE server_id = ${input.guild.id}
                    AND name = "${name}";`;
            db.get(sql, (err, row) => {
                if (err) {
                    console.log(err);
                    reject(err);
                }
                console.log(`${c.DEBUG_QUERY}: SELECT query was successful.`);
                resolve(row);
            });

            db.close((err) => {
                if (err) {
                    console.error(err.message);
                    reject(err);
                }
                console.log(`${c.DEBUG_QUERY}: Closed the database connection.`);
            });
        });
    }

    function createGroupPromiseSQL(input, name) {
        return new Promise((resolve, reject) => {
            const db = new sqlite3.Database(process.env.DB_NAME, (err) => {
                if (err) {
                    console.error(err.message);
                    reject(err);
                }
                console.log(`${c.DEBUG_QUERY}: Connected to the database.`);
            });

            let fields = ["id", "server_id", "name"];
            let sql = 
                `INSERT INTO ${process.env.DB_GROUPS_TABLE} (${fields.join(', ')})
                    VALUES (
                        ${input.id},
                        ${input.guild.id},
                        "${name}"
                    );`;
            db.run(sql, (err) => {
                if (err) {
                    console.log(err);
                    reject(err);
                }
                console.log(`${c.DEBUG_QUERY}: INSERT query was successful.`);
                resolve(input.id);
            });

            db.close((err) => {
                if (err) {
                    console.error(err.message);
                    reject(err);
                }
                console.log(`${c.DEBUG_QUERY}: Closed the database connection.`);
            });
        });
    }

    function discordReply(input, tourneyID, nickname) {
        let row = new Discord.ActionRowBuilder()
                        .addComponents(
                            new Discord.ButtonBuilder()
                                .setCustomId(c.DEV_MODAL_ADD_TOURNEYS_BUTTON_ID)
                                .setLabel('🏆 Add Tourneys')
                                .setStyle(Discord.ButtonStyle.Success)
                        );

        let reply = {
            content: "🏆 A new tournament group has been created 🏆\n" + `> Tourney Name: **${name}**\n` + "||G. ID: " + '`' + tourneyID + '`||',
            components: [row]
        };
        switch (input.constructor.name) {
            case c.COMMAND:
                input.editReply(reply);
                return;
            case c.MESSAGE:
                input.reply(reply);
                return;
        }
    }
}