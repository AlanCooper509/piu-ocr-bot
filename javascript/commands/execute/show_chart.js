// npm install discord.js@14.6.0
// npm install sqlite3@5.1.4
// npm install dotenv@16.0.3

const Discord = require("discord.js");
const sqlite3 = require("sqlite3").verbose();
require("dotenv").config();

// local imports
const c = require("../../resources/constants.js");
const params = require("../../resources/params.js");
const parseChart = require("../../utilities/parseChart.js");
const parseDiff = require("../../utilities/parseDiff.js");
const condenseChartType = require("../../utilities/condenseChartType.js");
const sendEmbeds = require("../../utilities/paginationReply.js");
const emojiGrade = require("../../utilities/grade2emoji.js");
const emojiBreak = require("../../utilities/gradebreak2emoji.js");

// class variables
const arrow_url = "https://raw.githubusercontent.com/AlanCooper509/piu-ocr-bot/master/javascript/resources/icons/arrow7.png";

module.exports = (input) => {
    let chartName = parseChart(input, c.COMMAND_SHOW_SUBCOMMAND_CHART_TITLE_NAME);
    if (chartName == null) { return; }
    let chartDiff = parseDiff(input, c.COMMAND_SHOW_SUBCOMMAND_CHART_DIFF_NAME);
    let allUploads = parseBool(input);
    if (allUploads === null || allUploads === undefined) {
        // defining default behavior (can be easily changed later)
        allUploads = true;
    }

    input.client.guilds.fetch(input.guildId).then((guild) => {
        return guild.members.fetch();
    }).then((members) => {
        // create list of discord ID's and format as SQL subset
        let ids = [];
        members.forEach(member => {
            ids.push(member.user.id);
        });
        let sqlSubset = allUploads ? `(${ids.join(", ")})` : null;
        
        // run SQL query
        return chartPromiseSQL(input, chartName.replaceAll("...", '%'), chartDiff, sqlSubset)
    }).catch((err) => {
        console.error(err); 
        throw "Error during chart lookup request.";
    }).then(rows => {
        if (rows.length == 0) { 
            if (allUploads) {
                if (!chartDiff) {
                    throw `This Discord server's users do not have any plays recorded on ***${chartName}***.`;
                } else {
                    if (chartDiff.type == "CO-OP") {
                        throw `This Discord server's users do not have any CO-OP plays recorded on ***${chartName}***.`;
                    }
                    throw `This Discord server's users do not have any plays recorded on ***${chartName} ${condenseChartType(chartDiff.type)}${chartDiff.diff}***.`;
                }
            } else {
                if (!chartDiff) {
                    throw `This Discord server does not have any plays recorded on ***${chartName}***.`;
                } else {
                    if (chartDiff.type == "CO-OP") {
                        throw `This Discord server does not have any CO-OP plays recorded on ***${chartName}***.`;
                    }
                    throw `This Discord server does not have any plays recorded on ***${chartName} ${condenseChartType(chartDiff.type)}${chartDiff.diff}***.`;
                }
            }
        }
        chartDiscordReply(rows, input, chartName, chartDiff);
    }).catch(error => {
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
    
    function parseBool(input) {
        if (![c.COMMAND, c.MESSAGE].includes(input.constructor.name)) {
            console.log(`${input.constructor.name}: Object input type not recognized`);
            return;
        }
        
        let bool;
        switch (input.constructor.name) {
            case c.COMMAND:
                bool = input.options.getBoolean(c.COMMAND_SHOW_SUBCOMMAND_CHART_ALL_NAME);
                break;
            case c.MESSAGE:
                let tokens = input.content.split(' ');
                for (let i = 0; i < tokens.length; i++) {
                    if (tokens[i].toLowerCase() == "false") {
                        bool = false;
                        break;
                    } else if (tokens[i].toLowerCase() == "true") {
                        bool = true;
                        break;
                    }

                }
                break;
        }
        
        return bool;
    }
    
    function chartPromiseSQL(input, chartName, chartDiff, sqlSubset) {
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
                       FROM ${process.env.DB_SCORES_TABLE} WHERE chart_name LIKE ? ` + 
                       (sqlSubset ? `AND discord_id IN ${sqlSubset} ` : `AND server_id = "${input.guildId}" `) + 
                       (chartDiff ? `AND chart_type = "${chartDiff.type}" AND chart_diff = ${chartDiff.diff} ` : '') + 
                       `ORDER BY total_score DESC LIMIT 1000 OFFSET 0;`;
            db.all(sql, chartName, (err, rows) => {
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
    
    function chartDiscordReply(rows, input, chartName, chartDetails) {
        embeds = [];
        // create embeds
        for (let i = 0; i < rows.length;) {
            // fill up a single embed (page) at a time with a max of params.PAGE_ROWS entries each
            let fields = [];
            for (let j = 0; i < rows.length && j < params.PAGE_ROWS; j++) {
                let chartType = condenseChartType(rows[i].chart_type);
                let chartDiff = chartType != "CO-OP" ? (rows[i].chart_diff > 0 ? rows[i].chart_diff : c.JSON_NO_VALUE) : '';
                let timestamp = new Date(rows[i].time_uploaded);
                let chartName = rows[i].chart_name.length > params.CHART_NAME_MAX_LENGTH ? 
                                rows[i].chart_name.slice(0, params.CHART_NAME_MAX_LENGTH - 3) + '...' :
                                rows[i].chart_name;
                let gradeBreak = emojiBreak(rows[i].break_on);
                let gradeIcon = emojiGrade(rows[i].grade);
                let prefix = gradeBreak != '' ? (gradeBreak + ' ') : '';
                let suffix = gradeIcon != '' ? (gradeIcon + '\t') : '';
                fields.push({
                    name:  `>>> ${i+1}. __${rows[i].game_id}__` + `\t\t\t\t\t\t\t\t\t\t\t\t${rows[i].total_score.toLocaleString()}\n` + 
                               prefix + suffix + (!chartDetails ? chartType + chartDiff : ''),
                    value: "||```c++\n" + `// ${timestamp.toLocaleDateString()} ${timestamp.toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})}\n` +
                               `Play ID: ${rows[i].id}` +  "```||",
                    inline: false
                });
                i++;
            }
            
            let nextEmbed = new Discord.EmbedBuilder()
                .setColor(14680086)
                .setAuthor({
                    name: `${input.guild.name} Leaderboard`,
                    iconURL: arrow_url
                })
                .setDescription(`**[${chartName}${chartDetails ? (' ' + condenseChartType(chartDetails.type) + chartDetails.diff) : ''}]**`);
            
            for(let j = 0; j < fields.length; j++) {
                nextEmbed.addFields(fields[j]);
            }
            embeds.push(nextEmbed);
        }
        
        // reply to user and setup collector for handling pagination
        sendEmbeds(input, embeds);
    }
}