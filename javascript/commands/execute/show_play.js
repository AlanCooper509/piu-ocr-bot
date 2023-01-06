// npm install discord.js@14.6.0
// npm install sqlite3@5.1.4
// npm install dotenv@16.0.3

const Discord = require("discord.js");
const sqlite3 = require("sqlite3").verbose();
require("dotenv").config();

// local imports
const c = require("../../resources/constants.js");
const params = require("../../resources/params.js");
const formatPlayDetails = require("../../utilities/embedPlayDetailsFormatter.js");
const formatScores = require("../../utilities/embedJudgementFormatter.js");
const formatDescription = require("../../utilities/embedFormatDescription.js");
const makeEditButtons = require("../../utilities/buttonsToEditPlay.js");
const getEntryID = require("../../utilities/getEntryID.js");
const updateEmbed = require("../../utilities/embedCopier.js");

module.exports = (input, entryID = null) => {
    if (!entryID) { 
        entryID = playParseInput(input);
    };

    entryID = playValidateID(entryID);
    if (entryID == null || entryID == '') { return; }
    
    let runPlaySQLpromise = playPromiseSQL(entryID);
    runPlaySQLpromise.catch((err) => {
        console.error(err);
        throw "Error during Play ID lookup request.";
    }).then(row => {
        if (row == null) { throw "Play ID not found in records."; }
        return playGetAuthor(row, input);
    }).then((retVals) => {
        playDiscordReply(retVals.author, retVals.entry, input);
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
    
    function playParseInput(input) {
        if (![c.COMMAND, c.MESSAGE].includes(input.constructor.name)) {
            console.log(`${input.constructor.name}: Object input type not recognized`);
            return;
        }
        
        let playID = '';
        switch (input.constructor.name) {
            case c.COMMAND:
                playID = input.options.getString(c.COMMAND_SHOW_SUBCOMMAND_PLAY_ID_NAME);
                break;
            case c.MESSAGE:
                if (input.content.split(' ').length < 2) {
                    return;
                };
                playID = input.content.split(' ')[2];
                break;
        }
        return playID;
    }

    function playValidateID(playID) {
        if (!/^\d+$/.test(playID)) {
            let reply = {
                content: "The Play ID should be numbers only!",
                ephemeral: true
            }
            switch (input.constructor.name) {
                case c.COMMAND:
                    input.editReply(reply);
                    break;
                case c.MESSAGE:
                    input.reply(reply);
                    break;
            }
            return;
        }
        
        if (playID.length < 17 || playID.length > 19) {
            let reply = {
                content: "The Play ID should be between 17 to 19 numbers!",
                ephemeral: true
            }
            switch (input.constructor.name) {
                case c.COMMAND:
                    input.editReply(reply);
                    break;
                case c.MESSAGE:
                    input.reply(reply);
                    break;
            }
            return;
        }
        
        return playID;
    }

    function playPromiseSQL(entryID) {
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
                       FROM ${process.env.DB_SCORES_TABLE} WHERE id = ?;`;
            db.get(sql, entryID, (err, row) => {
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

    function playGetAuthor(entry, input) {
        return new Promise((resolve, reject) => {
            input.guild.members.fetch(entry.discord_id).then(member => {
                return member;
            }).catch(error => {
                // "Unknown Member"
                if (error.code == 10007) {
                    return;
                } else {
                    throw error;
                }
            }).then((member) => {
                if (!member) {
                    // If unknown Guild Member, use their Discord Username
                    return input.client.users.fetch(entry.discord_id);
                } else {
                    return member;
                }
            }).then((discPerson) => {
                let author = {};
                switch (discPerson.constructor.name) {
                    case "GuildMember":
                        author = {
                            name: discPerson.nickname ?? discPerson.user.username,
                            iconURL: discPerson.user.avatarURL()
                        };
                        break;
                    case "User":
                        author = {
                            name: discPerson.username,
                            iconURL: discPerson.avatarURL()
                        };
                        break;
                }
                resolve({author: author, entry: entry});
            }).catch(error => {
                console.error(error);
            });
        });
    }

    function playDiscordReply(author, entry, input) {
        let pass = entry.break_on == 1 ? '✅' : entry.break_on == 0 ? '💔' : '';
        let embed = new Discord.EmbedBuilder()
            .setAuthor(author)
            
            .setImage(entry.image_url)
            .setColor(14680086)
            
            // EMBED: use description to display chart information
            .setDescription(formatDescription(entry.chart_name, entry.chart_type, entry.chart_diff, entry.break_on))

            .addFields(
                // EMBED: add fields to display user info and capture date
                {
                    name: c.EMBED_FIELD_RECORD_ID,
                    value: entry.id,
                    inline: false
                },
                {
                    name: (entry.details_modified == 1 ? c.EMBED_FIELD_PLAY_DETAILS + '*' : c.EMBED_FIELD_PLAY_DETAILS),
                    value: "```" + formatPlayDetails(entry.game_id, entry.grade) + "```",
                    inline: false
                },

                // EMBED: add fields to display judgements, combo, and total score
                {
                    name: (entry.scores_modified == 1 ? c.EMBED_FIELD_SCORES + '*' : c.EMBED_FIELD_SCORES),
                    value: "```" + formatScores(entry.perfects, entry.greats, entry.goods, entry.bads, entry.misses) + "```",
                    inline: false
                },
                {
                    name: (entry.combo_modified == 1 ? c.EMBED_FIELD_MAX_COMBO + '*' : c.EMBED_FIELD_MAX_COMBO),
                    value: "```" + entry.max_combo.toString() + "```",
                    inline: true
                },
                {
                    name: (entry.total_modified == 1 ? c.EMBED_FIELD_TOTAL_SCORE + '*' : c.EMBED_FIELD_TOTAL_SCORE),
                    value: "```" + entry.total_score.toLocaleString() + "```",
                    inline: true
                }
            ).setFooter({
                text: 
                    `${c.EMBED_SUBFIELD_UPLOADED}:\t\t` + 
                            new Date(entry.time_uploaded).toLocaleTimeString([], {
                                year: 'numeric',
                                month: '2-digit',
                                day: '2-digit',
                                hour: 'numeric',
                                minute: 'numeric'
                            }) +
                    ((entry.time_modified != null && entry.time_modified != '') ? 
                        `\n${c.EMBED_SUBFIELD_MODIFIED}:\t ` + 
                            new Date(entry.time_modified).toLocaleTimeString([], {
                                year: 'numeric',
                                month: '2-digit',
                                day: '2-digit',
                                hour: 'numeric',
                                minute: 'numeric'
                            })
                    : '')
            });

        // Buttons below the embed for triggering edit actions
        const row = makeEditButtons();

        switch (input.constructor.name) {
            case c.COMMAND:
                input.editReply({ 
                    embeds: [embed], 
                    components: [row], 
                    fetchReply: true 
                }).then((message) => { 
                    collectReactions(message, input);
                });
                break;
            case c.MESSAGE:
                input.reply({ 
                    embeds: [embed], 
                    components: [row], 
                    fetchReply: true  
                }).then((message) => { 
                    collectReactions(message, input);
                });
                break;
            case c.SUBMIT:
                input.reply({ 
                    embeds: [embed], 
                    components: [row], 
                    fetchReply: true  
                }).then((message) => { 
                    collectReactions(message, input);
                });
                break;
            break;
        }
    }
    
    function collectReactions(message, input) {
        message.react('✅').then(() => message.react('💔'))

        let originalUserID = '';
                        switch (input.constructor.name) {
                            case c.COMMAND:
                                originalUserID = input.user.id;
                                break;
                            case c.MESSAGE:
                                originalUserID = input.author.id;
                                break;
                            case c.SUBMIT:
                                originalUserID = input.user.id;
                                break;
                        }

        const collector = message.createReactionCollector({ time: params.REACT_TIMEOUT });
        collector.on('collect', (reaction, user) => {
            if (user.id == originalUserID) {
                const entryID = getEntryID(message, true);
                if (entryID) {
                    let promise = null;
                    switch (reaction.emoji.name) {
                        case '✅':
                            console.log(`${c.DEBUG_INPUT}: user ${user.id} reacted with :white_check_mark:`);
                            promise = reactPromiseSQL(entryID, true);
                            promise.then((entry) => {
                                discordEmbedUpdateBreak(message, entry);
                            });
                            break;
                        case '💔':
                            console.log(`${c.DEBUG_INPUT}: user ${user.id} reacted with :broken_heart:`);
                            promise = reactPromiseSQL(entryID, false);
                            promise.then((entry) => {
                                discordEmbedUpdateBreak(message, entry);
                            });
                            break;
                        default: break;
                    }
                }
            }
        });

        collector.on('end', (collected, reason) => {
            if (reason !== "messageDelete") {
                message.reactions.cache.get('✅').remove();
                message.reactions.cache.get('💔').remove();
            }
        });
    }

    function reactPromiseSQL(entryID, success) {
        return new Promise((resolve, reject) => {
            const db = new sqlite3.Database(process.env.DB_NAME, (err) => {
                if (err) {
                    console.error(err.message);
                    reject(err);
                }
                console.log(`${c.DEBUG_QUERY}: Connected to the database.`);
            });


            db.serialize(() => {
                let sql = `UPDATE ${process.env.DB_SCORES_TABLE} SET break_on = ${success ? 1 : 0} WHERE id = ?;`;
                db.run(sql, entryID, (err) => {
                    if (err) {
                        console.log(err);
                        reject(err);
                    } else {
                        console.log(`${c.DEBUG_QUERY}: UPDATE query was successful.`);
                    }
                });
                sql = `SELECT * FROM ${process.env.DB_SCORES_TABLE} WHERE id = ?;`;
                db.get(sql, entryID, (err, row) => {
                    if (err) {
                        console.log(err);
                        reject(err);
                    } else {
                        console.log(`${c.DEBUG_QUERY}: SELECT query was successful.`);
                        resolve(row);
                    }
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

    function discordEmbedUpdateBreak(message, entry) {
        const originalEmbed = message.embeds[0];
        let updateFieldName = c.EMBED_FIELD_PLAY_DETAILS;
        let updateFieldValue = "```" + formatPlayDetails(entry.game_id, entry.grade, entry.break_on) + "```";
        let embed = updateEmbed(originalEmbed, updateFieldName, updateFieldValue);
        embed.setDescription(formatDescription(entry.chart_name, entry.chart_type, entry.chart_diff, entry.break_on))

        message.edit({ embeds: [embed] });
    }
}