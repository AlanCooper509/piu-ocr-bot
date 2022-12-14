// npm install sqlite3@5.1.4
// npm install dotenv@16.0.3

const sqlite3 = require("sqlite3").verbose();
require("dotenv").config();

// local imports
const c = require("../../resources/constants.js");
const format_scores = require("../../utilities/embedJudgementFormatter.js");
const update_embed_field = require("../../utilities/embedCopier.js");

module.exports = (interaction) => {
    let formInputValues = parseSubmission(interaction);

    if (formInputValues.length < c.DEV_MODAL_EDIT_SCORES_TEXT_IDS.length) {
        return;
    }
    let entryID = getEntryID(interaction);
    let runSQLpromise = promiseSQL(formInputValues, entryID);
    runSQLpromise.then(
        discordReply(interaction, formInputValues)
    ).catch((err) => {
        console.error(err);
        interaction.reply({ content: "Error updating score results", ephemeral: true});
    });

    function parseSubmission(interaction) {
        let formInputValues = [];
        for (i = 0; i < c.DEV_MODAL_EDIT_SCORES_TEXT_IDS.length; i++) {
            let nextFormEntry = interaction.fields.getTextInputValue(c.DEV_MODAL_EDIT_SCORES_TEXT_IDS[i]);
            if (/^\d+$/.test(nextFormEntry)) {
                formInputValues.push(parseInt(nextFormEntry));
            } else if(nextFormEntry == c.JSON_NO_VALUE){
                formInputValues.push(nextFormEntry);
            } else {
                interaction.reply({
                    content: `An invalid score value of \`${nextFormEntry}\` was found in your SCORES submission!\nPlease try again.`, 
                    ephemeral: true
                });
                break;
            }
        }
        return formInputValues;
    }

    function getEntryID(interaction) {
        const messageEmbed = interaction.message.embeds[0];
        const scoresField = messageEmbed.fields.find(e => e.name.includes(c.EMBED_FIELD_RECORD_ID));
        return scoresField.value;
    }

    function promiseSQL(formInputValues, entryID) {
        return new Promise((resolve, reject) => {
            const db = new sqlite3.Database(process.env.DB_NAME, (err) => {
                if (err) {
                    console.error(err.message);
                    reject(err);
                }
                console.log('Connected to the database.');
            });
            let sql = 
                `UPDATE ${process.env.DB_SCORES_TABLE} SET 
                    perfects = ${formInputValues[0]},
                    greats = ${formInputValues[1]},
                    goods = ${formInputValues[2]},
                    bads = ${formInputValues[3]},
                    misses = ${formInputValues[4]},
                    scores_modified = 1
                WHERE id = ?;`;
            db.run(sql, entryID, (err) => {
                if (err) {
                    console.log(err);
                    reject(err);
                } else {
                    console.log("UPDATE query was successful.");
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
    }

    function discordReply(interaction, formInputValues) {
        const originalEmbed = interaction.message.embeds[0];
        let updateFieldName = c.EMBED_FIELD_SCORES;
        let updateFieldValue = `\`\`\`${format_scores(formInputValues[0], formInputValues[1], formInputValues[2], formInputValues[3], formInputValues[4])}\`\`\``;
        let embed = update_embed_field(originalEmbed, updateFieldName, updateFieldValue);

        interaction.message.edit({ embeds: [embed] });
        interaction.reply({ content: 'Scores were updated on this submission!', ephemeral: true });
    }
}