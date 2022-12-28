// npm install discord.js@14.6.0
// npm install sqlite3@5.1.4
// npm install dotenv@16.0.3

const Discord = require("discord.js");
const sqlite3 = require("sqlite3").verbose();
require("dotenv").config();

// local imports
const c = require("../../resources/constants.js");
const parseUser = require("../../utilities/parseUser.js");

module.exports = (input) => {
    let gameID = parseUser(input, c.COMMAND_SHOW_SUBCOMMAND_USER_ID_NAME, false);
    if (gameID == null) { return; }

    let discordID = input.constructor.name == c.COMMAND ? input.user.id : 
            input.constructor.name == c.MESSAGE ? input.author.id : c.JSON_NO_VALUE;
    let timestamp = new Date();
    let runSQLpromise = namePromiseSQL(discordID, gameID, timestamp);
    runSQLpromise.then(
        discordReply(input, discordID, gameID)
    ).catch((err) => {
        console.error(err);
        input.reply({ content: "Error setting default Game ID", ephemeral: true});
    });

    // TODO: also need to add a query in /save of a score after this is implemented


    function namePromiseSQL(discordID, gameID, timestamp) {
        return new Promise((resolve, reject) => {
            const db = new sqlite3.Database(process.env.DB_NAME, (err) => {
                if (err) {
                    console.error(err.message);
                    reject(err);
                }
                console.log(`${c.DEBUG_QUERY}: Connected to the database.`);
            });

            // CAST since retrieving as INT leads to big-int rounding errors
            let sql = `INSERT OR REPLACE INTO ${process.env.DB_USERS_TABLE} (id, game_id, status, last_active) ` + 
                        `VALUES (
                            ${discordID},
                            "${gameID}",
                            (SELECT status from DiscordPlayers WHERE id = ${discordID}),
                            "${timestamp.toISOString()}"
                        );`
            db.run(sql, (err) => {
                if (err) {
                    console.log(err);
                    reject(err);
                } else {
                    console.log(`${c.DEBUG_QUERY}: INSERT OR REPLACE query was successful.`);
                    resolve();
                }
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
    
    function discordReply(input, discordID, gameID) {
        input.reply(`${discordID}'s default username is now ${gameID}`);
    }
}