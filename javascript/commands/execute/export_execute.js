// npm install discord.js@14.6.0
// npm install json2csv@5.0.7
// npm install sqlite3@5.1.4
// npm install dotenv@16.0.3

const Discord = require("discord.js");
const json2csv = require("json2csv");
const sqlite3 = require("sqlite3").verbose();
require("dotenv").config();

// local imports
const c = require("../../resources/constants.js");

module.exports = (input) => {
    if (![c.COMMAND, c.MESSAGE].includes(input.constructor.name)) {
        console.log(`${input.constructor.name}: Object input type not recognized`);
        return;
    }

    let discordID = input.constructor.name == c.COMMAND ? input.user.id : 
        input.constructor.name == c.MESSAGE ? input.author.id : c.JSON_NO_VALUE;

    let runSQLpromise = promiseSQL(discordID);
    runSQLpromise.catch((err) => {
        console.error(err);
        throw "Error during Discord ID lookup request.";
    }).then(rows => {
        if (rows.length == 0) {
            throw `No uploaded scores found!`;
        } else {
            const parser = new json2csv.Parser();
            const csv = parser.parse(rows);
            const buffer = Buffer.from(csv, 'utf-8');
            let builder = new Discord.AttachmentBuilder(buffer);
            input.reply({ 
                files: [{
                    attachment: builder.attachment,
                    name: 'PIU_player_scores.csv'
                }],
                ephemeral: true 
            });
        }
    }).catch(error => {
        console.error(error);
        input.reply({ content: error.toString(), ephemeral: true });
    });
    
    function promiseSQL(discordID) {
        return new Promise((resolve, reject) => {
            const db = new sqlite3.Database(process.env.DB_NAME, (err) => {
                if (err) {
                    console.error(err.message);
                    reject(err);
                }
                console.log(`${c.DEBUG_QUERY}: Connected to the database.`);
            });

            // CAST since retrieving as INT leads to big-int rounding errors
            let sql = `SELECT *, CAST(id as TEXT) as id, CAST(server_id as TEXT) as server_id, CAST(discord_id as TEXT) as discord_id 
                       FROM ${process.env.DB_SCORES_TABLE} WHERE discord_id = ? ` + 
                       `ORDER BY time_uploaded;`;
            db.all(sql, discordID, (err, rows) => {
                if (err) {
                    console.log(err);
                    reject(err);
                } else {
                    console.log(`${c.DEBUG_QUERY}: SELECT query was successful.`);
                    resolve(rows);
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
}