// npm install discord.js@14.6.0
// npm install sqlite3@5.1.4
// npm install dotenv@16.0.3

const Discord = require("discord.js");
const sqlite3 = require("sqlite3").verbose();
require("dotenv").config();

// local imports
const c = require("../../resources/constants.js");
const formatPlayDetails = require("../../utilities/embedPlayDetailsFormatter.js");
const formatScores = require("../../utilities/embedJudgementFormatter.js");
const makeEditButtons = require("../../utilities/buttonsToEditPlay.js");

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
    runSQLpromise.then(
        discordReply(input, attachmentURL)
    ).catch((err) => {
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
        return new Promise((resolve, reject) => {
            const db = new sqlite3.Database(process.env.DB_NAME, (err) => {
                if (err) {
                    console.error(err.message);
                    reject(err);
                }
                console.log(`${c.DEBUG_QUERY}: Connected to the database.`);
            });
            let id_fields = ["id", "discord_id", "server_id", "game_id"];
            let play_fields = ["image_url", "chart_name", "chart_type", "chart_diff", "grade", "break_on"];
            let score_fields = ["perfects", "greats", "goods", "bads", "misses", "max_combo", "total_score"];
            let time_field = ["time_uploaded"];
            let fields = id_fields.concat(play_fields).concat(score_fields).concat(time_field);
            let sql = 
                `INSERT INTO ${process.env.DB_SCORES_TABLE} (${fields.join(', ')})
                                  VALUES (
                                      ${customID ? customID : input.id},
                                      ${f_discordID},
                                      ${input.guild.id},
                                      "${f_user}",
                                      "${attachmentURL}",
                                      "${f_chart}",
                                      "${f_type}",
                                      ${f_diff != c.JSON_NO_VALUE ? f_diff : -1},
                                      "${f_grade}",
                                      0,
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
            });
            
            db.close((err) => {
                if (err) {
                    console.error(err.message);
                    reject(err);
                }
                console.log(`${c.DEBUG_QUERY}: Closed the database connection.`);
                resolve();
            });
        });
    }
    
    function discordReply(input, attachmentURL) {
        let embed = new Discord.EmbedBuilder()
            .setAuthor({
                name: (input.member.nickname ?? input.member.user.username),
                iconURL: input.member.user.avatarURL()})
            .setImage(attachmentURL)
            .setColor(14680086)
            
            // EMBED: use description to display chart information
            .setDescription(`**${f_chart}**\n*${f_type} ${f_diff}*`)

            .addFields(
                // EMBED: add fields to display user info and capture date
                {
                    name: c.EMBED_FIELD_RECORD_ID,
                    value: input.id,
                    inline: false
                },
                {
                    name: c.EMBED_FIELD_PLAY_DETAILS,
                    value: "```" + formatPlayDetails(f_user, f_grade) + "```",
                    inline: false
                },

                // EMBED: add fields to display judgements, combo, and total score
                {
                    name: c.EMBED_FIELD_SCORES,
                    value: "```" + formatScores(f_perfects, f_greats, f_goods, f_bads, f_misses) + "```",
                    inline: false
                },
                {
                    name: c.EMBED_FIELD_MAX_COMBO,
                    value: "```" + f_combo.toString() + "```",
                    inline: true
                },
                {
                    name: c.EMBED_FIELD_TOTAL_SCORE,
                    value: "```" + f_score.toLocaleString() + "```",
                    inline: true
                }
            ).setFooter({
                text: 
                    `${c.EMBED_SUBFIELD_UPLOADED}:\t\t` + 
                            new Date(f_time).toLocaleTimeString([], {
                                year: 'numeric',
                                month: '2-digit',
                                day: '2-digit',
                                hour: 'numeric',
                                minute: 'numeric'
                            })
            });

        // Buttons below the embed for triggering edit actions
        const row = makeEditButtons();

        switch (input.constructor.name) {
            case c.COMMAND:
                input.editReply({ embeds: [embed], components: [row] });
                break;
            case c.MESSAGE:
                input.reply({ embeds: [embed], components: [row] });
        }
    }
};