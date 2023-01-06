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
const parseUser = require("../../utilities/parseUser.js");
const parseChart = require("../../utilities/parseChart.js");
const parseDiff = require("../../utilities/parseDiff.js");
const emojiGrade = require("../../utilities/grade2emoji.js");
const emojiBreak = require("../../utilities/gradebreak2emoji.js");

module.exports = (input) => {
    let gameID = parseUser(input, c.COMMAND_SHOW_SUBCOMMAND_USER_ID_NAME, true);
        gameID = gameID ? gameID.toUpperCase() : gameID;
    if (gameID == null) { return; }
    let chartName = parseChart(input, c.COMMAND_SHOW_SUBCOMMAND_USER_TITLE_NAME);
    let chartDiff = parseDiff(input, c.COMMAND_SHOW_SUBCOMMAND_USER_DIFF_NAME);
    
    let runUserSQLpromise = userPromiseSQL(gameID, chartName ? chartName.replaceAll("...", '%') : null, chartDiff);
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

        userDiscordReply(rows, gameID, input, chartName, chartDiff);
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
                       (chartName ? `AND chart_name LIKE "${chartName}" `: '') + 
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
    
    function userDiscordReply(rows, gameID, input, chartFiltered, chartType) {
        let embeds = [];
        let chartDetails = chartType ? (condenseChartType(chartType.type) + (chartType.type != "CO-OP" ? chartType.diff : '')) : '';
        let thumbnail = chartDetails && !chartFiltered ? `${chartDetails}.png` : null;

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
                let gradeBreak = emojiBreak(rows[i].break_on);
                let gradeIcon = emojiGrade(rows[i].grade);
                let prefix = gradeBreak != '' ? (gradeBreak + ' ') : '';
                let suffix = gradeIcon;
                fields.push({
                    name: `>>> ${i+1}. __${chartName}__\t${chartType}${chartDiff}\n` +
                          `${prefix}${suffix} - *${timestamp}*`,
                    value: ">>> ```" + `TOTAL SCORE: ${rows[i].total_score.toLocaleString(undefined, {year: "2-digit", month: "2-digit", day: "2-digit"})}\n` + 
                           `Play ID: ${rows[i].id}` +  "```",
                    inline: false
                });
                i++;
            }
            
            let nextEmbed = new Discord.EmbedBuilder()
                .setColor(14680086)
                .setDescription(`**Showing ${gameID}**${chartFiltered ? "\n> " + chartFiltered + ' ' + chartDetails : (chartDetails ? ("\n> " + chartDetails) : '')}\n\n**[${chartFiltered ? "Best" : "Recent"} Plays]**`);
            
            for(let j = 0; j < fields.length; j++) {
                nextEmbed.addFields(fields[j]);
            }
            if (thumbnail) {
                try {
                    nextEmbed.setThumbnail(`https://raw.githubusercontent.com/AlanCooper509/piu-ocr-bot/master/javascript/resources/icons/${thumbnail}`);
                } catch (error) {}
            }
            embeds.push(nextEmbed);
        }
        
        // reply to user and setup collector for handling pagination
        sendEmbeds(input, embeds);
    }
}