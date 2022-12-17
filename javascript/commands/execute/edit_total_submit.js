// npm install sqlite3@5.1.4
// npm install dotenv@16.0.3

const sqlite3 = require("sqlite3").verbose();
require("dotenv").config();

// local imports
const c = require("../../resources/constants.js");
const getEntryID = require("../../utilities/getEntryID.js");
const updateEmbedField = require("../../utilities/embedCopier.js");

module.exports = (interaction) => {
    let formValue = parseSubmission(interaction);
    if (formValue == null) { return; }

    let entryID = getEntryID(interaction);
    let timestamp = new Date();

    let runSQLpromise = promiseSQL(formValue, timestamp, entryID);
    runSQLpromise.then(
        discordReply(interaction, formValue, timestamp)
    ).catch((err) => {
        console.error(err);
        interaction.reply({ content: "Error updating Total Score.", ephemeral: true});
    });

    function parseSubmission(interaction) {
        let formValue = interaction.fields.getTextInputValue(c.DEV_MODAL_EDIT_TOTAL_TEXT_ID);
        // thanks for the regex https://stackoverflow.com/questions/5917082/
        if (/^(\d+|\d{1,3}(,\d{3})*)(\.\d+)?$/.test(formValue)) {
            formValue = parseInt(formValue.replace(/,/g, ''), 10);
        } else if(formValue != c.JSON_NO_VALUE){
            interaction.reply({
                content: `An invalid total score value of \`${formValue}\` was found in your TOTAL submission!\nPlease try again.`, 
                ephemeral: true
            });
            return;
        }
        return formValue;
    }

    function promiseSQL(formValue, timestamp, entryID) {
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
                    total_score = ${formValue},
                    total_modified = 1,
                    time_modified = "${timestamp.toISOString()}"
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
    
    function discordReply(interaction, formValue, timestamp) {
        const originalEmbed = interaction.message.embeds[0];
        let updateFieldName = c.EMBED_FIELD_TOTAL_SCORE;
        let updateFieldValue = `\`\`\`${formValue.toLocaleString()}\`\`\``;
        let embed = updateEmbedField(originalEmbed, updateFieldName, updateFieldValue, timestamp);

        interaction.message.edit({ embeds: [embed] });
        interaction.reply({ content: 'Total Score was updated on this submission!', ephemeral: true });
    }
}