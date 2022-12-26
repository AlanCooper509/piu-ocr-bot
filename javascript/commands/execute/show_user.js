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
const condenseChartType = require("../../utilities/condenseChartType.js");
const parseChart = require("../../utilities/parseChart.js");
const parseDiff = require("../../utilities/parseDiff.js");

module.exports = (input) => {
    let gameID = userParseInput(input);
    if (gameID == null) { return; }
    let chartName = parseChart(input, c.COMMAND_SHOW_SUBCOMMAND_USER_TITLE_NAME);
    let chartDiff = parseDiff(input, c.COMMAND_SHOW_SUBCOMMAND_USER_DIFF_NAME);
    
    let runUserSQLpromise = userPromiseSQL(gameID, chartName, chartDiff);
    runUserSQLpromise.catch((err) => {
        console.error(err);
        throw "Error during Game ID lookup request.";
    }).then(rows => {
        if (rows.length == 0) { 
            if (!chartName && !chartDiff) {
                throw `User ${gameID} not found in records.`;
            } else if (chartName && !chartDiff) {
                throw `${gameID} does not have any plays on ${chartName}.`;
            } else if (chartDiff && !chartName) {
                if (chartDiff.type == "CO-OP") {
                    throw `${gameID} does not have any CO-OP plays.`;
                }
                throw `${gameID} does not have any ${chartDiff.type} ${chartDiff.diff} plays.`;
            } else if (chartDiff && chartName) {
                if (chartDiff.type == "CO-OP") {
                    throw `${gameID} does not have any CO-OP plays on ${chartName}.`;
                }
                throw `${gameID} does not have any ${chartDiff.type} ${chartDiff.diff} plays on ${chartName}.`;
            }
        }

        if (rows.length == 0) { throw `No results for ${gameID} playing ${chartName}.`; }

        userDiscordReply(rows, gameID, input, chartName != null);
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
        }
    });
    
    function userParseInput(input) {
        if (![c.COMMAND, c.MESSAGE].includes(input.constructor.name)) {
            console.log(`${input.constructor.name}: Object input type not recognized`);
            return;
        }
        
        let gameID = '';
        switch (input.constructor.name) {
            case c.COMMAND:
                gameID = input.options.getString(c.COMMAND_SHOW_SUBCOMMAND_USER_ID_NAME);
                break;
            case c.MESSAGE:
                if (input.content.split(' ').length < 2) {
                    return;
                };
                gameID = input.content.split(' ')[2];
                break;
        }
        
        if (!/^([A-Z|a-z|0-9|_]+)$/.test(gameID)) {
            let reply = {
                content: `An invalid game ID of \`${gameID}\` was found in your CHART/USER submission!\nPlease try again.`, 
                ephemeral: true
            }
            switch (input.constructor.name) {
                case c.COMMAND:
                    input.editReply(reply);
                    return;
                case c.MESSAGE:
                    input.Reply(reply);
                    return;
            }
        }

        return gameID;
    }
    
    function userPromiseSQL(gameID, chartName, chartDiff) {
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
                       FROM ${process.env.DB_SCORES_TABLE} WHERE game_id = ? ` + 
                       (chartName ? `AND chart_name = "${chartName}" `: '') + 
                       (chartDiff ? `AND chart_type = "${chartDiff.type}" AND chart_diff = ${chartDiff.diff} ` : '') + 
                       `ORDER BY ` + (chartName ? "total_score " : "time_uploaded ") + 
                       `DESC LIMIT 1000 OFFSET 0;`;
            db.all(sql, gameID, (err, rows) => {
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
    
    function userDiscordReply(rows, gameID, input, byBestPlays) {
        embeds = [];
        // create embeds
        for (let i = 0; i < rows.length;) {
            // fill up a single embed (page) at a time with a max of params.PAGE_ROWS entries each
            let fields = [];
            for (let j = 0; i < rows.length && j < params.PAGE_ROWS; j++) {
                let chartType = condenseChartType(rows[i].chart_type);
                let chartDiff = rows[i].chart_diff > 0 ? rows[i].chart_diff : c.JSON_NO_VALUE;
                let timestamp = new Date(rows[i].time_uploaded).toLocaleDateString();
                let chartName = rows[i].chart_name.length > params.CHART_NAME_MAX_LENGTH ? 
                                rows[i].chart_name.slice(0, params.CHART_NAME_MAX_LENGTH) + '...' :
                                rows[i].chart_name;
                fields.push({
                    name: `> ${i+1}. __${chartName}__\t${chartType}${chartDiff}`,
                    value: ">>> ```" + `${timestamp}${' '.repeat(15)}${rows[i].total_score.toLocaleString()}\n` +
                           `Play ID: ${rows[i].id}` +  "```",
                    inline: false
                });
                i++;
            }
            
            let nextEmbed = new Discord.EmbedBuilder()
                .setColor(14680086)
                .setDescription(`**${gameID}**\n\n**[${byBestPlays ? "Best" : "Recent"} Plays]**`);
            
            for(let j = 0; j < fields.length; j++) {
                nextEmbed.addFields(fields[j]);
            }
            embeds.push(nextEmbed);
        }
        
        // reply to user and setup collector for handling pagination
        sendEmbeds(input, embeds);
    }
}