// npm install discord.js@14.6.0
// npm install sqlite3@5.1.4
// npm install dotenv@16.0.3

const Discord = require("discord.js");
const sqlite3 = require("sqlite3").verbose();
require("dotenv").config();

// local imports
const c = require("../../resources/constants.js");
const params = require("../../resources/params.js");
const parseDiscordId = require("../../utilities/discordId/parse.js");
const validateDiscordId = require("../../utilities/discordId/validate.js");
const condenseChartType = require("../../utilities/condenseChartType.js");
const emojiGrade = require("../../utilities/grade2emoji.js");
const emojiBreak = require("../../utilities/gradebreak2emoji.js");
const sendEmbeds = require("../../utilities/paginationReply.js");

// class variables
const arrow_url = "https://raw.githubusercontent.com/AlanCooper509/piu-ocr-bot/master/javascript/resources/icons/arrow7.png";

module.exports = (input, tourneyCommand, inputID = null, info = null) => {
    if (![c.COMMAND, c.MESSAGE, c.SUBMIT].includes(input.constructor.name)) {
        console.log(`${input.constructor.name}: Object input type not recognized`);
        return;
    }
    
    let tourneyID = inputID ? inputID : parseDiscordId(input, tourneyCommand ? c.COMMAND_TOURNEY_SUBCOMMAND_VIEW_ID_NAME : c.COMMAND_SHOW_SUBCOMMAND_TOURNEY_ID_NAME);
    tourneyID = validateDiscordId(input, tourneyID, true);
    if (tourneyID == null || tourneyID == '') { return; }

    let chartName = null;
    let chartDetails = null;
    let groupName = null;
    let groupID = null;
    let runFindTourneySQLpromise = findTourneyPromiseSQL(input, tourneyID);
    runFindTourneySQLpromise.catch((err) => {
        console.error(err);
        throw "Error during Tourney ID lookup request.";
    }).then(row => {
        if (row == null) {
            // Tourney ID not found in DB_TOURNEY_TABLE, check DB_GROUPS_TABLE
            findTourneyGroupSQL(input, tourneyID).then((row) => {
                if (row == null) { throw "Tourney ID not found in records."; };
                groupName = row.name;
                groupID = row.id;
                return getTourneysSQL(input, tourneyID)
            }).then((tourneys) => {
                if (info) {
                    tourneyGroupDiscordReply(input, tourneys, groupName, groupID);
                } else {
                    // Query all tournaments within this group
                    getTourneyGroupLeaderboardSQL(tourneys).then((rows) => {
                        tourneyLeaderboardDiscordReply(input, rows, groupName, groupID, tourneys);
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
        } else {
            // Tourney ID found in DB_TOURNEY_TABLE
            chartName = row.chart_name;
            chartDetails = {type: row.chart_type, diff: row.chart_diff}
            getTourneyPlaysSQL(row).then((rows) => {
                tourneyDiscordReply(input, rows, tourneyID, chartName, chartDetails);
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

    function findTourneyPromiseSQL(input, tourneyID) {
        return new Promise((resolve, reject) => {
            const db = new sqlite3.Database(process.env.DB_NAME, (err) => {
                if (err) {
                    console.error(err.message);
                    reject(err);
                }
                console.log(`${c.DEBUG_QUERY}: Connected to the database.`);
            });

            // CAST since retrieving as INT leads to big-int rounding errors
            let sql = `SELECT *, CAST(id as TEXT) as id, CAST(server_id as TEXT) as server_id
                       FROM ${process.env.DB_TOURNEY_TABLE}
                       WHERE id = ?
                       AND server_id = ?;`;
            db.get(sql, [tourneyID, input.guild.id], (err, row) => {
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

    function findTourneyGroupSQL(input, tourneyID) {
        return new Promise((resolve, reject) => {
            const db = new sqlite3.Database(process.env.DB_NAME, (err) => {
                if (err) {
                    console.error(err.message);
                    reject(err);
                }
                console.log(`${c.DEBUG_QUERY}: Connected to the database.`);
            });

            // CAST since retrieving as INT leads to big-int rounding errors
            let sql = `SELECT *, CAST(id as TEXT) as id, CAST(server_id as TEXT) as server_id
                       FROM ${process.env.DB_GROUPS_TABLE}
                       WHERE id = ?
                       AND server_id = ?;`;
            db.get(sql, [tourneyID, input.guild.id], (err, row) => {
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

    function getTourneysSQL(input, groupID) {
        return new Promise((resolve, reject) => {
            const db = new sqlite3.Database(process.env.DB_NAME, (err) => {
                if (err) {
                    console.error(err.message);
                    reject(err);
                }
                console.log(`${c.DEBUG_QUERY}: Connected to the database.`);
            });

            // CAST since retrieving as INT leads to big-int rounding errors
            let sql = `SELECT *, CAST(id as TEXT) as id, CAST(server_id as TEXT) as server_id
                       FROM ${process.env.DB_TOURNEY_TABLE}
                       WHERE parent_id = ?
                       AND server_id = ?;`;
            db.all(sql, [groupID, input.guild.id], (err, rows) => {
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

    function getTourneyPlaysSQL(tourney) {
        return new Promise((resolve, reject) => {
            const db = new sqlite3.Database(process.env.DB_NAME, (err) => {
                if (err) {
                    console.error(err.message);
                    reject(err);
                }
                console.log(`${c.DEBUG_QUERY}: Connected to the database.`);
            });

            // CAST since retrieving as INT leads to big-int rounding errors
            let sql = `SELECT *, 
                          CAST(id as TEXT) as id, 
                          CAST(discord_id as TEXT) as discord_id, 
                          CAST(server_id as TEXT) as server_id, 
                          MAX(total_score) as total_score
                       FROM ${process.env.DB_SCORES_TABLE}
                       WHERE server_id = ?
                       AND time_uploaded BETWEEN ? AND ?
                       AND chart_name LIKE ? ` +
                       ((tourney.chart_diff && tourney.chart_type) ? `AND chart_type = "${tourney.chart_type}" AND chart_diff = ${tourney.chart_diff} ` : '') + 
                       `GROUP BY game_id
                       ORDER BY total_score DESC`
            db.all(sql, [tourney.server_id, tourney.time_start, tourney.time_end, tourney.chart_name], (err, rows) => {
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

    function getTourneyGroupLeaderboardSQL(tourneys) {
        return new Promise((resolve, reject) => {
            const db = new sqlite3.Database(process.env.DB_NAME, (err) => {
                if (err) {
                    console.error(err.message);
                    reject(err);
                }
                console.log(`${c.DEBUG_QUERY}: Connected to the database.`);
            });

            // CAST since retrieving as INT leads to big-int rounding errors
            let tourneyFilters = [];
            for (let i = 0; i < tourneys.length; i++) {
                tourneyFilters.push(
                    '(' + 
                        `time_uploaded BETWEEN "${tourneys[i].time_start}" AND "${tourneys[i].time_end}"` + 
                        ` AND chart_name LIKE "${tourneys[i].chart_name}"` + 
                        ((tourneys[i].chart_type && tourneys[i].chart_diff) ? ` AND chart_type = "${tourneys[i].chart_type}" AND chart_diff = ${tourneys[i].chart_diff}` : '') + 
                    ')'
                );
            }
            let filter = '(' + tourneyFilters.join(" OR ") + ')';
            let sql =   `SELECT 
                            game_id,
                            GROUP_CONCAT(total_score) as scores,
                            GROUP_CONCAT(chart_name) as names,
                            GROUP_CONCAT(chart_type) as chart_types,
                            GROUP_CONCAT(chart_diff) as chart_diffs,
                            SUM(total_score) as total_score
                         FROM (
                            SELECT *, 
                                CAST(id as TEXT) as id, 
                                CAST(discord_id as TEXT) as discord_id, 
                                CAST(server_id as TEXT) as server_id, 
                                MAX(total_score) as total_score
                            FROM ${process.env.DB_SCORES_TABLE}
                            WHERE server_id = ?
                            AND ${filter} 
                            GROUP BY game_id, chart_name
                            ORDER BY total_score DESC` + 
                        `) GROUP BY game_id ORDER BY total_score`;
            db.all(sql, [tourneys[0].server_id], (err, rows) => {
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

    function tourneyDiscordReply(input, rows, tourneyID, chartName, chartDetails) {
        let name = `Tourney Leaderboard`;
        let description = `**Chart:\n> ${chartName}${chartDetails ? ' ' + condenseChartType(chartDetails.type) + chartDetails.diff : ''}**\n*Tourney ID: #${tourneyID}*`;
        if (rows.length == 0) {
            let nextEmbed = new Discord.EmbedBuilder()
                .setColor(14680086)
                .setAuthor({
                    name: name,
                    iconURL: arrow_url
                })
                .addFields({
                    name:  `No Valid Entries Yet!`,
                    value: "Waiting for scores to be submitted...",
                    inline: false
                })
                .setDescription(description);
            switch (input.constructor.name) {
                case c.COMMAND:
                    input.editReply({ embeds: [nextEmbed] });
                    break;
                case c.MESSAGE:
                    input.reply({ embeds: [nextEmbed] });
                    break;
                case c.SUBMIT:
                    input.reply({ embeds: [nextEmbed] });
                    break;
                default:
                    return;
            }
            return;
        }

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
                                rows[i].chart_name.slice(0, params.CHART_NAME_MAX_LENGTH) + '...' :
                                rows[i].chart_name;
                let gradeBreak = emojiBreak(rows[i].break_on);
                let gradeIcon = emojiGrade(rows[i].grade);
                let prefix = gradeBreak != '' ? (gradeBreak + ' ') : '';
                let suffix = gradeIcon != '' ? (gradeIcon + '\t') : '';
                fields.push({
                    name:  `>>> ${i+1}. __${rows[i].game_id}__` + `\t\t\t\t\t\t\t\t\t\t\t\t${rows[i].total_score.toLocaleString()}\n` + 
                               prefix + suffix + chartType + chartDiff,
                    value: "||```c++\n" + `// ${timestamp.toLocaleDateString()} ${timestamp.toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})}\n` +
                               `Play ID: ${rows[i].id}` +  "```||",
                    inline: false
                });
                i++;
            }
            
            let nextEmbed = new Discord.EmbedBuilder()
                .setColor(14680086)
                .setAuthor({
                    name: `Tourney Leaderboard`,
                    iconURL: arrow_url
                })
                .setDescription(`**Chart(s):\n> ${chartName}${chartDetails ? ' ' + condenseChartType(chartDetails.type) + chartDetails.diff : ''}**\n*Tourney ID: #${tourneyID}*`);
            for(let j = 0; j < fields.length; j++) {
                nextEmbed.addFields(fields[j]);
            }
            embeds.push(nextEmbed);
        }
        
        // reply to user and setup collector for handling pagination
        sendEmbeds(input, embeds);
    }

    function tourneyGroupDiscordReply(input, tourneys, groupName, groupID) {
        let name = `Tourney Group: ${groupName}`;
        let component = new Discord.ActionRowBuilder()
                        .addComponents(
                            new Discord.ButtonBuilder()
                                .setCustomId(c.DEV_MODAL_ADD_TOURNEYS_BUTTON_ID)
                                .setLabel('🏆 Add Tourneys')
                                .setStyle(Discord.ButtonStyle.Success)
                        );
        if (tourneys.length == 0) {
            let nextEmbed = new Discord.EmbedBuilder()
                .setColor(14680086)
                .setAuthor({
                    name: name,
                    iconURL: arrow_url
                })
                .addFields({
                    name:  `No tourneys in this tourney group yet!`,
                    value: `Add some tourney ID's using the button below.`,
                    inline: false
                })
                .setDescription(`Tourney Listings\n||G. ID: ${groupID}||`);
            
            switch (input.constructor.name) {
                case c.COMMAND:
                    input.editReply({ embeds: [nextEmbed], components: [component] });
                    break;
                case c.MESSAGE:
                    input.reply({ embeds: [nextEmbed], components: [component] });
                    break;
                case c.SUBMIT:
                    input.reply({ embeds: [nextEmbed], components: [component] });
                    break;
                default:
                    return;
            }
            return;
        }

        embeds = [];
        // create embeds
        for (let i = 0; i < tourneys.length;) {
            // fill up a single embed (page) at a time with a max of params.PAGE_ROWS entries each
            let fields = [];
            for (let j = 0; i < tourneys.length && j < params.PAGE_ROWS; j++) {
                let tourneyID = tourneys[i].id;
                let chartName = tourneys[i].chart_name;
                let chartType = tourneys[i].chart_type;
                let chartDiff = tourneys[i].chart_diff;
                let startTime = new Date(tourneys[i].time_start);
                let endTime   = new Date(tourneys[i].time_end);
                startTime = startTime.toLocaleDateString() + ' ' + startTime.toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'});
                endTime   = endTime.toLocaleDateString()   + ' ' +   endTime.toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'});

                // as of 03/11/23, formatting of "T. ID: " coordinates with select_submit.getIDs() (abbreviated to fit on one line)
                fields.push({
                    name:  `>>> ${i+1}. ${chartName} ${condenseChartType(chartType)}${chartDiff}\n` + 
                                `__${startTime} - ${endTime}__` + `\t\t\t\t\t\t\t\t\t\t\t\t\n`,
                    value: "||```c++\n" +
                                `T. ID: ${tourneys[i].id}` +  "```||",
                    inline: false
                });
                i++;
            }
            
            let nextEmbed = new Discord.EmbedBuilder()
                .setColor(14680086)
                .setAuthor({
                    name: name,
                    iconURL: arrow_url
                })
                .setDescription(`Tourney Listings\n||G. ID: ${groupID}||`);
            for(let j = 0; j < fields.length; j++) {
                nextEmbed.addFields(fields[j]);
            }
            embeds.push(nextEmbed);
        }
        
        // reply to user and setup collector for handling pagination
        sendEmbeds(input, embeds, false, component.components[0]);
    }

    function tourneyLeaderboardDiscordReply(input, rows, groupName, groupID, tourneys) {
        let name = `Tourney Group: ${groupName}`;
        let description = `Leaderboard\n||G. ID: ${groupID}||`;
        if (rows.length == 0) {
            let nextEmbed = new Discord.EmbedBuilder()
                .setColor(14680086)
                .setAuthor({
                    name: name,
                    iconURL: arrow_url
                })
                .addFields({
                    name:  `No Valid Entries Yet!`,
                    value: "Waiting for scores to be submitted...",
                    inline: false
                })
                .setDescription(description);
            switch (input.constructor.name) {
                case c.COMMAND:
                    input.editReply({ embeds: [nextEmbed] });
                    break;
                case c.MESSAGE:
                    input.reply({ embeds: [nextEmbed] });
                    break;
                case c.SUBMIT:
                    input.reply({ embeds: [nextEmbed] });
                    break;
                default:
                    return;
            }
            return;
        }
        
        // get charts and ids of tourneys in the tourney group
        let tourneysDetails = [];
        for (let i = 0; i < tourneys.length; i++) {
            tourneysDetails.push(`- ${tourneys[i].chart_name} ${condenseChartType(tourneys[i].chart_type)}${tourneys[i].chart_diff}\n*(T. ID: ${tourneys[i].id})*\n\n`);
        }

        embeds = [];
        // create embeds
        for (let i = 0; i < rows.length;) {
            // fill up a single embed (page) at a time with a max of params.PAGE_ROWS entries each
            let fields = [];
            for (let j = 0; i < rows.length && j < params.PAGE_ROWS; j++) {
                fields.push({
                    name:  `>>> ${i+1}. __${rows[i].game_id}__` + `\t\t\t\t\t\t\t\t\t\t\t\t${rows[i].total_score.toLocaleString()}`,
                    value: "||```c++\n" +
                               `${rows[i].scores}` +  "```||",
                    inline: false
                });
                i++;
            }
            
            let nextEmbed = new Discord.EmbedBuilder()
                .setColor(14680086)
                .setAuthor({
                    name: name,
                    iconURL: arrow_url
                })
                .setDescription(`Tourney List:\n${tourneysDetails.join('')}`);
            for(let j = 0; j < fields.length; j++) {
                nextEmbed.addFields(fields[j]);
            }
            embeds.push(nextEmbed);
        }
        
        // reply to user and setup collector for handling pagination
        sendEmbeds(input, embeds, true);
    }
}