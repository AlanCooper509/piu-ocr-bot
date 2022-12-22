// npm install discord.js@14.6.0
// npm install sqlite3@5.1.4
// npm install dotenv@16.0.3

const Discord = require("discord.js");
const sqlite3 = require("sqlite3").verbose();
require("dotenv").config();

// local imports
const c = require("../../resources/constants.js");
const params = require("../../resources/params.js");
const sendEmbeds = require("../../utilities/paginationReply.js");

// file variables
const c_slashObject = "ChatInputCommandInteraction";
const c_messageObject = "Message";

module.exports = (input) => {
    let gameID = userParseInput(input);
    if (gameID == null) { return; }
    
    let runUserSQLpromise = userPromiseSQL(gameID);
    runUserSQLpromise.catch((err) => {
        console.error(err);
        throw "Error during Game ID lookup request.";
    }).then(rows => {
        if (rows.length == 0) { throw `${gameID} not found in records.`; }
        userDiscordReply(rows, gameID, input);
    }).catch(error => {
        console.error(error);
        input.reply({ content: error.toString(), ephemeral: true});
    });;
    
    function userParseInput(input) {
        if (![c_slashObject, c_messageObject].includes(input.constructor.name)) {
            console.log(`${input.constructor.name}: Object input type not recognized`);
            return;
        }
        
        let gameID = '';
        switch (input.constructor.name) {
            case c_slashObject:
                gameID = input.options.getString(c.COMMAND_SHOW_SUBCOMMAND_USER_ID_NAME);
                break;
            case c_messageObject:
                if (input.content.split(' ').length < 2) {
                    return;
                };
                gameID = input.content.split(' ')[2];
                break;
        }
        
        if (!/^([A-Z|a-z|0-9|_]+)$/.test(gameID)) {
            interaction.reply({
                content: `An invalid game ID of \`${gameID}\` was found in your CHART/USER submission!\nPlease try again.`, 
                ephemeral: true
            });
            return;
        }

        return gameID;
    }
    
    function userPromiseSQL(gameID) {
        return new Promise((resolve, reject) => {
            const db = new sqlite3.Database(process.env.DB_NAME, (err) => {
                if (err) {
                    console.error(err.message);
                    reject(err);
                }
                console.log('Connected to the database.');
            });

            // CAST since retrieving as INT leads to big-int rounding errors
            let sql = `SELECT *, CAST(id as TEXT) as id, CAST(server_id as TEXT) as server_id, CAST(discord_id as TEXT) as discord_id 
                       FROM ${process.env.DB_SCORES_TABLE} WHERE game_id = ? ORDER BY time_uploaded DESC LIMIT 10 OFFSET 0;`;
            db.all(sql, gameID, (err, rows) => {
                if (err) {
                    console.log(err);
                    reject(err);
                } else {
                    console.log("SELECT query was successful.");
                    resolve(rows);
                }
            });
            
            db.close((err) => {
                if (err) {
                    console.error(err.message);
                    reject(err);
                }
                console.log('Closed the database connection.');
            });
        });
    }
    
    function userDiscordReply(rows, gameID, input) {
        embeds = [];
        // create embeds
        for (let i = 0; i < rows.length;) {
            // fill up a single embed (page) at a time with a max of params.PAGE_ROWS entries each
            let content = '';
            for (let j = 0; i < rows.length && j < params.PAGE_ROWS; j++) {
                content += `${rows[i].id}: ${rows[i].chart_name}`;
                if (i < rows.length - 1) { content += '\n'; }
                i++;
            }
            embeds.push(new Discord.EmbedBuilder()
                .setColor(14680086)
                .setDescription(`**${gameID}**`)
                .addFields(
                    {
                        name: c.EMBED_FIELD_RECENT,
                        value: content,
                        inline: false
                    }
                )
            );
        }
        
        // reply to user and setup collector for handling pagination
        sendEmbeds(input, embeds);
    }
}