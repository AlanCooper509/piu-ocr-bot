// npm install discord.js@14.6.0
// npm install sqlite3@5.1.4
// npm install dotenv@16.0.3

const Discord = require("discord.js");
const sqlite3 = require("sqlite3").verbose();
require("dotenv").config();

// local imports
const c = require("../../resources/constants.js");
const params = require("../../resources/params.js");
const condenseChartType = require("../../utilities/condenseChartType.js");
const sendEmbeds = require("../../utilities/paginationReply.js");

// class variables
const arrow_url = "https://raw.githubusercontent.com/AlanCooper509/piu-ocr-bot/master/javascript/resources/icons/arrow7.png";

module.exports = (input, tourneyCommand) => {
    if (![c.COMMAND, c.MESSAGE, c.SUBMIT].includes(input.constructor.name)) {
        console.log(`${input.constructor.name}: Object input type not recognized`);
        return;
    }
    let activeOnly = parseOptionalBool(input, tourneyCommand ? c.COMMAND_TOURNEY_SUBCOMMAND_ALL_ACTIVE_ONLY_NAME : c.COMMAND_SHOW_SUBCOMMAND_TOURNEYS_ACTIVE_ONLY_NAME);
    let runFindTourneysSQLpromise = findTourneysPromiseSQL(input, activeOnly);
    runFindTourneysSQLpromise.catch((err) => {
        console.error(err);
        throw "Error during Tourneys lookup request.";
    }).then(rows => {
        tourneysDiscordReply(input, rows, activeOnly);
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

    function parseOptionalBool(input, optionID) {
        // default to true
        let bool = true;
        switch (input.constructor.name) {
            case c.COMMAND:
                bool = input.options.getBoolean(optionID);
                if (bool == null) bool = true;
                break;
            case c.MESSAGE:
                if (input.content.split(' ').length < 3) {
                    break;
                };
                // "tourney all <true/false>" or "show tourneys <true/false>"
                bool = input.content.split(' ')[2];
                break;
        }
        return /^true$/i.test(bool);
    }

    function findTourneysPromiseSQL(input, activeOnly) {
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
                       WHERE server_id = ?` + 
                       (activeOnly ? ` AND time_start < "${(new Date()).toISOString()}" AND time_end > "${(new Date()).toISOString()} "` : ' ') +
                       `ORDER BY time_start DESC`;
            db.all(sql, [input.guild.id], (err, rows) => {
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

    function tourneysDiscordReply(input, rows, activeOnly) {
        let name = `${activeOnly ? "Active " : ""}Tourneys`;
        if (rows.length == 0) {
            let nextEmbed = new Discord.EmbedBuilder()
                .setColor(14680086)
                .setAuthor({
                    name: name,
                    iconURL: arrow_url
                })
                .addFields({
                    name:  `No ${activeOnly ? "active " : ''}tourneys in this server yet!`,
                    value: "Create one with " + '`' + '/' + c.COMMAND_TOURNEY + ' ' + c.COMMAND_TOURNEY_SUBCOMMAND_CREATE + '`',
                    inline: false
                });
            
            switch (input.constructor.name) {
                case c.COMMAND:
                    input.editReply({ embeds: [nextEmbed] });
                    break;
                case c.MESSAGE:
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
                let tourneyID = rows[i].id;
                let chartName = rows[i].chart_name;
                let chartType = rows[i].chart_type;
                let chartDiff = rows[i].chart_diff;
                let startTime = new Date(rows[i].time_start);
                let endTime   = new Date(rows[i].time_end);
                startTime = startTime.toLocaleDateString() + ' ' + startTime.toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'});
                endTime   = endTime.toLocaleDateString()   + ' ' +   endTime.toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'});

                // as of 03/11/23, formatting of "T. ID: " coordinates with select_submit.getIDs() (abbreviated to fit on one line)
                fields.push({
                    name:  `>>> ${i+1}. ${chartName} ${condenseChartType(chartType)}${chartDiff}\n` + 
                                `__${startTime} - ${endTime}__` + `\t\t\t\t\t\t\t\t\t\t\t\t\n`,
                    value: "||```c++\n" +
                                `T. ID: ${rows[i].id}` +  "```||",
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
                .setDescription(`Tourney Listings`);
            for(let j = 0; j < fields.length; j++) {
                nextEmbed.addFields(fields[j]);
            }
            embeds.push(nextEmbed);
        }
        
        // reply to user and setup collector for handling pagination
        sendEmbeds(input, embeds);
    }
}