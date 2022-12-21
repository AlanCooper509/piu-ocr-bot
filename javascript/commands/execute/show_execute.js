// npm install discord.js@14.6.0
// npm install sqlite3@5.1.4
// npm install dotenv@16.0.3

const Discord = require("discord.js");
const sqlite3 = require("sqlite3").verbose();
require("dotenv").config();

// local imports
const c = require("../../resources/constants.js");
const format_scores = require("../../utilities/embedJudgementFormatter.js");

// file variables
const c_slashObject = "ChatInputCommandInteraction";
const c_messageObject = "Message";

module.exports = (input) => {
    let subcommand = '';
    switch (input.constructor.name) {
        case c_slashObject:
            subcommand = input.options.getSubcommand();
            break;
        case c_messageObject:
            subcommand = input.content.split(' ')[1];
            break;
    }

    switch (subcommand) {
        case c.COMMAND_SHOW_SUBCOMMAND_PLAY:
            let entryID = playParseInput(input);
            if (entryID == null) { return; }
            
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
                input.reply({ content: error.toString(), ephemeral: true});
            });
            break;
        default:
            input.reply(`The show subcommand "${subcommand}" is not recognized.\nTry \`/show\` to see the list of available subcommands.`);
    }

    function playParseInput(input) {
        if (![c_slashObject, c_messageObject].includes(input.constructor.name)) {
            console.log(`${input.constructor.name}: Object input type not recognized`);
            return;
        }
        
        let playID = '';
        switch (input.constructor.name) {
            case c_slashObject:
                playID = input.options.getString(c.COMMAND_SHOW_SUBCOMMAND_PLAY_ID_NAME);
                break;
            case c_messageObject:
                if (input.content.split(' ').length < 2) {
                    return;
                };
                playID = input.content.split(' ')[2];
                break;
        }
        
        if (!/^\d+$/.test(playID)) {
            input.reply("The Play ID should be numbers only!");
            return;
        }
        
        if (playID.length < 17 || playID.length > 19) {
            input.reply("The Play ID should be between 17 to 19 numbers!");
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
                console.log('Connected to the database.');
            });

            // CAST since retrieving as INT leads to big-int rounding errors
            let sql = `SELECT *, CAST(id as TEXT) as id, CAST(server_id as TEXT) as server_id, CAST(discord_id as TEXT) as discord_id 
                       FROM ${process.env.DB_SCORES_TABLE} WHERE id = ?;`;
            db.get(sql, entryID, (err, row) => {
                if (err) {
                    console.log(err);
                    reject(err);
                } else {
                    console.log("SELECT query was successful.");
                    resolve(row);
                }
            });
            
            db.close((err) => {
                if (err) {
                    console.error(err.message);
                    reject(err);
                }
                console.log('Closed the database connection.');
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
        let embed = new Discord.EmbedBuilder()
            .setAuthor(author)
            
            .setImage(entry.image_url)
            .setColor(14680086)
            
            // EMBED: use description to display chart information
            .setDescription(`**${entry.chart_name}**\n*${entry.chart_type} ${entry.chart_diff}*`)

            .addFields(
                // EMBED: add fields to display user info and capture date
                {
                    name: c.EMBED_FIELD_RECORD_ID,
                    value: entry.id,
                    inline: false
                },
                {
                    name: (entry.details_modified == 1 ? c.EMBED_FIELD_PLAY_DETAILS + '*' : c.EMBED_FIELD_PLAY_DETAILS),
                    value: "```" + 
                        `${c.EMBED_SUBFIELD_GAME_ID}: ${entry.game_id}\n` + 
                        `${c.EMBED_SUBFIELD_GRADE}: ${entry.grade}\n\n` + 
                        "```",
                    inline: false
                },

                // EMBED: add fields to display judgements, combo, and total score
                {
                    name: (entry.scores_modified == 1 ? c.EMBED_FIELD_SCORES + '*' : c.EMBED_FIELD_SCORES),
                    value: "```" + format_scores(entry.perfects, entry.greats, entry.goods, entry.bads, entry.misses) + "```",
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
        const row = new Discord.ActionRowBuilder()
            .addComponents(
                new Discord.ButtonBuilder()
                    .setCustomId(c.DEV_MODAL_EDIT_SCORES_BUTTON_ID)
                    .setLabel('⚖️ SCORES')
                    .setStyle(Discord.ButtonStyle.Success),
                new Discord.ButtonBuilder()
                    .setCustomId(c.DEV_MODAL_EDIT_INFO_BUTTON_ID)
                    .setLabel('📝 CHART/USER')
                    .setStyle(Discord.ButtonStyle.Secondary),
                new Discord.ButtonBuilder()
                    .setCustomId(c.DEV_MODAL_EDIT_COMBO_BUTTON_ID)
                    .setLabel('🔗 COMBO')
                    .setStyle(Discord.ButtonStyle.Secondary),
                new Discord.ButtonBuilder()
                    .setCustomId(c.DEV_MODAL_EDIT_TOTAL_BUTTON_ID)
                    .setLabel('💯 TOTAL')
                    .setStyle(Discord.ButtonStyle.Primary));

        input.reply({ embeds: [embed], components: [row] });
    }
};