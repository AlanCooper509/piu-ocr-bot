// npm install sqlite3@5.1.4
// npm install dotenv@16.0.3

const sqlite3 = require("sqlite3").verbose();
require("dotenv").config();

// local imports
const c = require("../../resources/constants.js");
const parseChart = require("../../utilities/parseChart.js");
const parseDiff = require("../../utilities/parseDiff.js");

module.exports = (input) => {
    let chartName = parseChart(input, c.COMMAND_SHOW_SUBCOMMAND_CHART_TITLE_NAME);
    console.log(chartName);
    if (chartName == null) { return; }
    let chartDiff = parseDiff(input, c.COMMAND_SHOW_SUBCOMMAND_CHART_DIFF_NAME);
    
    let runChartSQLpromise = chartPromiseSQL(input, chartName, chartDiff);
    runChartSQLpromise.catch((err) => {
        console.error(err); 
        throw "Error during chart lookup request.";
    }).then(rows => {
        console.log(rows.length);
        /*
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
        */
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
    
    function chartPromiseSQL(input, chartName, chartDiff) {
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
                       FROM ${process.env.DB_SCORES_TABLE} WHERE chart_name = ? ` + 
                       `AND server_id = "${input.guildId}" ` + 
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
}