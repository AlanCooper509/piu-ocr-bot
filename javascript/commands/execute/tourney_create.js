// npm install sqlite3@5.1.4
// npm install dotenv@16.0.3

const sqlite3 = require("sqlite3").verbose();
require("dotenv").config();

// local imports
const c = require("../../resources/constants.js");
const condenseChartType = require("../../utilities/condenseChartType.js");
const parseChart = require("../../utilities/parseChart.js");
const parseDiff = require("../../utilities/parseDiff.js");
const parseDate = require("../../utilities/parseDate.js");

module.exports = (input) => {
    if (![c.COMMAND, c.MESSAGE].includes(input.constructor.name)) {
        console.log(`${input.constructor.name}: Object input type not recognized`);
        return;
    }
    
    let chartName = parseChart(input, c.COMMAND_TOURNEY_SUBCOMMAND_CREATE_CHART_TITLE_NAME);
        console.log(c.COMMAND_TOURNEY_SUBCOMMAND_CREATE_CHART_TITLE_NAME);
    if (chartName == null) { return; }
    let chartDiff = parseDiff(input, c.COMMAND_TOURNEY_SUBCOMMAND_CREATE_CHART_DIFF_NAME);
    let startDate = parseDate(input, c.COMMAND_TOURNEY_SUBCOMMAND_CREATE_START_NAME, "startDate");
    if (startDate == null) { return; }
    let endDate = parseDate(input, c.COMMAND_TOURNEY_SUBCOMMAND_CREATE_END_NAME, "endDate");
    if (endDate == null) { return; }
    let retVal = validateDates(startDate, endDate);
    if (retVal == null) { return; }
    let runTourneySQLpromise = tourneyPromiseSQL(input, chartName, chartDiff.type, chartDiff.diff, startDate.toISOString(), endDate.toISOString());
    runTourneySQLpromise.catch((err) => {
        console.error(err);
        throw "Error during tourney creation.";
    }).then((tourney_id) => {
        tourneyDiscordReply(input, tourney_id, chartName);
    });
    
    function validateDates(startDate, endDate) {
        let retVal = true;
        if (Date.parse(startDate) > Date.parse(endDate)) {
            let reply = {
                content: "The end date `" + endDate.toLocaleString() + "` must be after the start date `" + startDate.toLocaleString() + "`\nPlease try again.", 
                ephemeral: true
            };
            switch (input.constructor.name) {
                case c.COMMAND:
                    input.editReply(reply);
                    return;
                case c.MESSAGE:
                    input.reply(reply);
                    return;
            }
        }

        if (Date.parse(new Date()) > Date.parse(endDate)) {
            let reply = {
                content: "The end date `" + endDate.toLocaleString() + "` must be after the current datetime `" + (new Date()).toLocaleString() + "`\nPlease try again.", 
                ephemeral: true
            };
            switch (input.constructor.name) {
                case c.COMMAND:
                    input.editReply(reply);
                    return;
                case c.MESSAGE:
                    input.reply(reply);
                    return;
            }
        }
        return retVal;
    }

    function tourneyPromiseSQL(input, chartName, chartType, chartDiff, startISOtime, endISOtime) {
        return new Promise((resolve, reject) => {
            const db = new sqlite3.Database(process.env.DB_NAME, (err) => {
                if (err) {
                    console.error(err.message);
                    reject(err);
                }
                console.log(`${c.DEBUG_QUERY}: Connected to the database.`);
            });

            let fields = ["id", "server_id", "parent_id", "chart_name", "chart_type", "chart_diff", "time_start", "time_end"];
            let sql = 
                `INSERT INTO ${process.env.DB_TOURNEY_TABLE} (${fields.join(', ')})
                    VALUES (
                        ${input.id},
                        ${input.guild.id},
                        NULL,
                        "${chartName}",
                        ${chartType != null ? '"' + chartType + '"' : NULL},
                        ${chartDiff != null ? chartDiff : NULL},
                        "${startISOtime}",
                        "${endISOtime}"
                    );`;
            db.run(sql, (err) => {
                if (err) {
                    console.log(err);
                    reject(err);
                }
                console.log(`${c.DEBUG_QUERY}: INSERT query was successful.`);
                resolve(input.id);
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

    function tourneyDiscordReply(input, tourney_id, chartName) {
        let reply = {
            content: "🏆 A new tournament 🏆\n" + `> **${tourney_id}**\n\n` + "...has been created for the chart `" + `${chartName} ${condenseChartType(chartDiff.type)}${chartDiff.diff}` + '`'
        };
        switch (input.constructor.name) {
            case c.COMMAND:
                input.editReply(reply);
                return;
            case c.MESSAGE:
                input.reply(reply);
                return;
        }
    }
}