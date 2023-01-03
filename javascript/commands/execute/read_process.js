// npm install discord.js@14.6.0
// npm install sqlite3@5.1.4
// npm install dotenv@16.0.3

const Discord = require("discord.js");
const sqlite3 = require("sqlite3").verbose();
require("dotenv").config();

// local imports
const c = require("../../resources/constants.js");
const showPlay = require("./show_play.js");

// file variables
let f_discordID = '';
let f_time = '';
let f_user = '';
let f_chart = '';
let f_type = '';
let f_diff = '';
let f_grade = '';
let f_perfects = '';
let f_greats = '';
let f_goods = '';
let f_bads = '';
let f_misses = '';
let f_combo = '';
let f_score = '';

module.exports = (input, results, timestamp, attachmentURL, customID = null) => {
    init(input, results, timestamp);
    let runSQLpromise = promiseSQL(input, attachmentURL);
    runSQLpromise.then((entryID) => {
        showPlay(input, entryID);
    }).catch((err) => {
        console.error(err);
        input.reply({ content: "Error saving score results", ephemeral: true});
    });

    function init(input, results, timestamp) {
        f_discordID = input.constructor.name == c.COMMAND ? input.user.id : 
            input.constructor.name == c.MESSAGE ? input.author.id : c.JSON_NO_VALUE;
        f_time = timestamp.toISOString();

        // user/chart information
        f_user     = results[c.JSON_TEXT_USER]    != '' ? results[c.JSON_TEXT_USER]  : c.JSON_NO_VALUE;
        f_chart    = results[c.JSON_TEXT_CHART]   != '' ? results[c.JSON_TEXT_CHART] : c.JSON_NO_VALUE;
        f_type     = results[c.JSON_TEXT_TYPE]    != '' ? results[c.JSON_TEXT_TYPE]  : c.JSON_NO_VALUE;
        f_diff     = results[c.JSON_TEXT_DIFF]    != '' ? results[c.JSON_TEXT_DIFF]  : c.JSON_NO_VALUE;
        f_grade    = results[c.JSON_TEXT_GRADE]   != '' ? results[c.JSON_TEXT_GRADE] : c.JSON_NO_VALUE;
        
        // score/judgement information
        f_perfects = results[c.JSON_TEXT_PERFECT] != '' ? parseInt(results[c.JSON_TEXT_PERFECT]) : c.JSON_NO_VALUE;
        f_greats   = results[c.JSON_TEXT_GREAT]   != '' ? parseInt(results[c.JSON_TEXT_GREAT])   : c.JSON_NO_VALUE;
        f_goods    = results[c.JSON_TEXT_GOOD]    != '' ? parseInt(results[c.JSON_TEXT_GOOD])    : c.JSON_NO_VALUE;
        f_bads     = results[c.JSON_TEXT_BAD]     != '' ? parseInt(results[c.JSON_TEXT_BAD])     : c.JSON_NO_VALUE;
        f_misses   = results[c.JSON_TEXT_MISS]    != '' ? parseInt(results[c.JSON_TEXT_MISS])    : c.JSON_NO_VALUE;
        f_combo    = results[c.JSON_TEXT_COMBO]   != '' ? parseInt(results[c.JSON_TEXT_COMBO])   : c.JSON_NO_VALUE;
        f_score    = results[c.JSON_TEXT_SCORE]   != '' ? parseInt(results[c.JSON_TEXT_SCORE])   : c.JSON_NO_VALUE;
    }
    
    function promiseSQL(input) {
        let id_fields = ["id", "discord_id", "server_id", "game_id"];
        let play_fields = ["image_url", "chart_name", "chart_type", "chart_diff", "grade", "break_on"];
        let score_fields = ["perfects", "greats", "goods", "bads", "misses", "max_combo", "total_score"];
        let time_field = ["time_uploaded"];
        let fields = id_fields.concat(play_fields).concat(score_fields).concat(time_field);

        return new Promise((resolve, reject) => {
            const db = new sqlite3.Database(process.env.DB_NAME, (err) => {
                if (err) {
                    console.error(err.message);
                    reject(err);
                }
                console.log(`${c.DEBUG_QUERY}: Connected to the database.`);
            });

            // first query:
            let findDefaultIGNquery = `SELECT game_id FROM ${process.env.DB_USERS_TABLE} WHERE id = (?)`
            db.get(findDefaultIGNquery, f_discordID, (err, row) => {
                if (err) {
                    console.error(err.message);
                    reject(err);
                }
                let gameID = row && row.game_id ? row.game_id : '';
                console.log(`${c.DEBUG_QUERY}: SELECT query was successful.`);
                console.log(gameID);
                
                // second query:
                let sql = 
                    `INSERT INTO ${process.env.DB_SCORES_TABLE} (${fields.join(', ')})
                        VALUES (
                            ${customID ? customID : input.id},
                            ${f_discordID},
                            ${input.guild.id},
                            "${gameID != '' ? gameID : f_user}",
                            "${attachmentURL}",
                            "${f_chart}",
                            "${f_type}",
                            ${f_diff != c.JSON_NO_VALUE ? f_diff : -1},
                            "${f_grade}",
                            -1,
                            ${f_perfects},
                            ${f_greats},
                            ${f_goods},
                            ${f_bads},
                            ${f_misses},
                            ${f_combo},
                            ${f_score},
                            "${f_time}"
                        );`;
                db.run(sql, (err) => {
                    if (err) {
                        console.log(err);
                        reject(err);
                    }
                    console.log(`${c.DEBUG_QUERY}: INSERT query was successful.`);
                    resolve(customID ? customID : input.id);
                });
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
};