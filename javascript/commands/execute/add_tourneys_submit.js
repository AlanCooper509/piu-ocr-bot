// npm install sqlite3@5.1.4
// npm install dotenv@16.0.3

const sqlite3 = require("sqlite3").verbose();
require("dotenv").config();

// local imports
const c = require("../../resources/constants.js");
const tourneyView = require("./tourney_view.js");

module.exports = (interaction) => {
    let rows = parseSubmission(interaction);
    if (rows == null || rows.length == 0) { return; }
    let groupID = getGroupID(interaction, "G.");
    if (groupID == null || groupID == '') { return; }
    
    let runAddTourneysSQLpromise = addTourneysPromiseSQL(rows, groupID);
    runAddTourneysSQLpromise.then(
        tourneyView(interaction, true, groupID, true)
    ).catch((err) => {
        console.error(err);
        interaction.reply({ content: "Error adding tourneys to tourney group.", ephemeral: true});
    });
    
    function parseSubmission(interaction) {
        let formValue = interaction.fields.getTextInputValue(c.DEV_MODAL_ADD_TOURNEYS_TEXT_ID);
        let formRows = formValue.split('\n');
        let rows = [];
        for (let i = 0; i < formRows.length; i++) {
            if (/^\d{17,19}$/.test(formRows[i])) {
                rows.push(formRows[i]);
            } else if (formRows[i] == '' || formRows[i] == null) {
                continue;
            } else {
                interaction.reply({
                    content: `An invalid tourney ID of \`${formRows[i]}\` was found in your Add Tourney submission!\nPlease try again.\n\nUser Input:\n` + "```\n" + formValue + "\n```", 
                    ephemeral: true
                });
                return;
            }
        }
        return rows;
    }

    function getGroupID(interaction, idType) {
        let messageRows = interaction.message.content.replaceAll(/>|`/g, '').split('\n');
        if (interaction.message.embeds.length > 0) {
            messageRows = interaction.message.embeds[0].description.split('\n');
        }
        for (let i = 0; i < messageRows.length; i++) {
            // THE FOLLOWING ASSUMES SPECIFIC EMBED FIELD FORMATTING
            // curious why the above replaceAll regex isn't picking up...
            let row = messageRows[i].split('>').join('').split('|').join('').split('`').join('');
            if (row.startsWith(`${idType} ID: `) || row.startsWith(`${idType} ID: `)) {
                let id = row.split(`${idType} ID: `)[1].replaceAll(/[^0-9]/g, '');
                return id;
            }
        }
        interaction.reply({
            content: `The Tourney Group ID was not found in the original message!\nPlease try again.`, 
            ephemeral: true
        });
        return;
    }

    function addTourneysPromiseSQL(entries, groupID) {
        return new Promise((resolve, reject) => {
            const db = new sqlite3.Database(process.env.DB_NAME, (err) => {
                if (err) {
                    console.error(err.message);
                    reject(err);
                }
                console.log(`${c.DEBUG_QUERY}: Connected to the database.`);
            });

            let sql = 
                `UPDATE ${process.env.DB_TOURNEY_TABLE} SET 
                    parent_id = ${groupID}
                    WHERE id IN (${entries.join(',')});`;
            db.run(sql, (err) => {
                if (err) {
                    console.log(err);
                    reject(err);
                } else {
                    console.log(`${c.DEBUG_QUERY}: UPDATE query was successful.`);
                }
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

    function discordReply(interaction, formValue, timestamp) {
        const originalEmbed = interaction.message.embeds[0];
        let updateFieldName = c.EMBED_FIELD_MAX_COMBO;
        let updateFieldValue = `\`\`\`${formValue.toString()}\`\`\``;
        let embed = updateEmbedField(originalEmbed, updateFieldName, updateFieldValue, timestamp);

        interaction.message.edit({ embeds: [embed] });
        interaction.reply({ content: 'Max Combo was updated on this submission!', ephemeral: true });
    }
}