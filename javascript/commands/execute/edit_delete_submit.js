// npm install sqlite3@5.1.4
// npm install dotenv@16.0.3

const sqlite3 = require("sqlite3").verbose();
require("dotenv").config();

// local imports
const c = require("../../resources/constants.js");
const getEntryID = require("../../utilities/getEntryID.js");
const updateEmbedField = require("../../utilities/embedCopier.js");

module.exports = (interaction) => {
    let entryID = getEntryID(interaction);

    let checkSQLpromise = promiseSQLcheck(entryID);

    checkSQLpromise.then((row) => {
        if (interaction.user.id == row.discord_id) {
            // sorry for promise nesting but it was always faling into the "then" when placed on the outer layer
            promiseSQL(entryID).then(
                discordReply(interaction)
            );
        } else {
            throw "Only the upload user may delete the play!";
        }
    }).catch(error => {
        console.error(error);
        interaction.reply({ content: error.toString(), ephemeral: true });
    });

    function promiseSQLcheck(entryID) {
        return new Promise((resolve, reject) => {
            const db = new sqlite3.Database(process.env.DB_NAME, (err) => {
                if (err) {
                    console.error(err.message);
                    reject(err);
                }
                console.log(`${c.DEBUG_QUERY}: Connected to the database.`);
            });

            let sql = 
                `SELECT CAST(discord_id as TEXT) AS discord_id FROM ${process.env.DB_SCORES_TABLE} WHERE id = ?;`;
            db.get(sql, entryID, (err, row) => {
                if (err) {
                    console.log(err);
                    reject(err);
                } else {
                    console.log(`${c.DEBUG_QUERY}: SELECT query was successful.`);
                    resolve(row);
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
    
    function promiseSQL(entryID) {
        return new Promise((resolve, reject) => {
            const db = new sqlite3.Database(process.env.DB_NAME, (err) => {
                if (err) {
                    console.error(err.message);
                    reject(err);
                }
                console.log(`${c.DEBUG_QUERY}: Connected to the database.`);
            });

            let sql = 
                `DELETE FROM ${process.env.DB_SCORES_TABLE} WHERE id = ?;`;
            db.run(sql, entryID, (err) => {
                if (err) {
                    console.log(err);
                    reject(err);
                } else {
                    console.log(`${c.DEBUG_QUERY}: DELETE query was successful.`);
                }
            });
            
            db.close((err) => {
                if (err) {
                    console.error(err.message);
                    reject(err);
                }
                console.log(`${c.DEBUG_QUERY}: Closed the database connection.`);
                resolve();
            });
        });
    }

    function discordReply(interaction) {
        interaction.message.edit({ content: "*This score has been removed*", embeds: [], components: [] });
        interaction.reply({ content: "Your play has been removed successfully!", ephemeral: true });
    }
}