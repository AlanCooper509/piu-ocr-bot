// npm install sqlite3@5.1.4
// npm install dotenv@16.0.3

const sqlite3 = require("sqlite3").verbose();
require("dotenv").config();

// local imports
const c = require("../../resources/constants.js");

module.exports = (input, results, timestamp, imageURL) => {
    // support for registered Discord slash command and also basic user message command
    const slashObject = "ChatInputCommandInteraction";
    const messageObject = "Message";

    let id = input.id;
    let discordID = input.constructor.name == slashObject ? input.user.id : input.author.id;
    let time = timestamp.toISOString();

    // user/chart information
    let user     = results[c.JSON_TEXT_USER]    != '' ? results[c.JSON_TEXT_USER]  : c.JSON_NO_VALUE;
    let chart    = results[c.JSON_TEXT_CHART]   != '' ? results[c.JSON_TEXT_CHART] : c.JSON_NO_VALUE;
    let type     = results[c.JSON_TEXT_TYPE]    != '' ? results[c.JSON_TEXT_TYPE]  : c.JSON_NO_VALUE;
    let diff     = results[c.JSON_TEXT_DIFF]    != '' ? results[c.JSON_TEXT_DIFF]  : -1;
    let grade    = results[c.JSON_TEXT_GRADE]   != '' ? results[c.JSON_TEXT_GRADE] : c.JSON_NO_VALUE;

    // score/judgement information
    let perfects = results[c.JSON_TEXT_PERFECT] != '' ? parseInt(results[c.JSON_TEXT_PERFECT]) : c.JSON_NO_VALUE;
    let greats   = results[c.JSON_TEXT_GREAT]   != '' ? parseInt(results[c.JSON_TEXT_GREAT])   : c.JSON_NO_VALUE;
    let goods    = results[c.JSON_TEXT_GOOD]    != '' ? parseInt(results[c.JSON_TEXT_GOOD])    : c.JSON_NO_VALUE;
    let bads     = results[c.JSON_TEXT_BAD]     != '' ? parseInt(results[c.JSON_TEXT_BAD])     : c.JSON_NO_VALUE;
    let misses   = results[c.JSON_TEXT_MISS]    != '' ? parseInt(results[c.JSON_TEXT_MISS])    : c.JSON_NO_VALUE;
    let combo    = results[c.JSON_TEXT_COMBO]   != '' ? parseInt(results[c.JSON_TEXT_COMBO])   : c.JSON_NO_VALUE;
    let score    = results[c.JSON_TEXT_SCORE]   != '' ? parseInt(results[c.JSON_TEXT_SCORE])   : c.JSON_NO_VALUE;
    
    return new Promise((resolve, reject) => {
        const db = new sqlite3.Database(process.env.DB_NAME, (err) => {
            if (err) {
                console.error(err.message);
                reject(err);
            }
            console.log('Connected to the database.');
        });

        let sql = 
            `INSERT INTO ${process.env.DB_SCORES_TABLE} (
                                  time_modified,
                                  time_uploaded,
                                  total_score,
                                  max_combo,
                                  misses,
                                  bads,
                                  goods,
                                  greats,
                                  perfects,
                                  break_on,
                                  grade,
                                  chart_diff,
                                  chart_type,
                                  chart_name,
                                  image_url,
                                  game_id,
                                  server_id,
                                  discord_id,
                                  id
                              )
                              VALUES (
                                  "${time}",
                                  "${time}",
                                  ${score},
                                  ${combo},
                                  ${misses},
                                  ${bads},
                                  ${goods},
                                  ${greats},
                                  ${perfects},
                                  0,
                                  "${grade}",
                                  ${diff},
                                  "${type}",
                                  "${chart}",
                                  "${imageURL}",
                                  "${user}",
                                  ${input.guild.id},
                                  ${discordID},
                                  ${id}
                              );`;
        
        db.run(sql, (err) => {
            if (err) {
                console.log(err);
                reject(err);
            } else {
                console.log("INSERT query was successful.");
            }
        });

        db.close((err) => {
            if (err) {
                console.error(err.message);
                reject(err);
            }
            console.log('Closed the database connection.');
            resolve();
        });
    });
};