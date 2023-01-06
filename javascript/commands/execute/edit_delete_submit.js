// npm install sqlite3@5.1.4
// npm install dotenv@16.0.3

const sqlite3 = require("sqlite3").verbose();
require("dotenv").config();

// local imports
const c = require("../../resources/constants.js");
const getEntryID = require("../../utilities/getEntryID.js");

module.exports = (interaction) => {
    let entryID = getEntryID(interaction);

    let sqlPromise = promiseSQL(entryID);
    sqlPromise.then(
        discordReply(interaction)
    ).catch(error => {
        console.error(error);
        interaction.reply({ content: error.toString(), ephemeral: true });
    });
    
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
        interaction.message.reactions.removeAll();
        interaction.reply({ content: "Your play has been removed successfully!", ephemeral: true });
    }
}