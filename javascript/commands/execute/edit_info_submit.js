// npm install sqlite3@5.1.4
// npm install dotenv@16.0.3

const sqlite3 = require("sqlite3").verbose();
require("dotenv").config();

// local imports
const c = require("../../resources/constants.js");
const getEntryID = require("../../utilities/getEntryID.js");
const formatPlayDetails = require("../../utilities/embedPlayDetailsFormatter.js");
const formatDescription = require("../../utilities/embedFormatDescription.js");
const update_embed = require("../../utilities/embedCopier.js");

module.exports = (interaction) => {
    let formInputValues = parseSubmission(interaction);
    if (formInputValues.length < c.DEV_MODAL_EDIT_SCORES_TEXT_IDS.length) { return; }

    let entryID = getEntryID(interaction);
    let uploaded = getUploaded(interaction);
    let modified = new Date();

    let runSQLpromise = promiseSQL(formInputValues, modified, entryID);
    runSQLpromise.then((row) => {
        discordReply(interaction, row, uploaded, modified)
    }).catch((err) => {
        console.error(err);
        interaction.editReply({ content: "Error updating Total Score.", ephemeral: true});
    });
    
    function parseSubmission(interaction) {
        let formValueGameID = interaction.fields.getTextInputValue(c.DEV_MODAL_EDIT_GAMEID_TEXT_ID);
        let formValueGrade = interaction.fields.getTextInputValue(c.DEV_MODAL_EDIT_GRADE_TEXT_ID);
        let formValueName = interaction.fields.getTextInputValue(c.DEV_MODAL_EDIT_CHART_NAME_TEXT_ID);
        let formValueDiff = interaction.fields.getTextInputValue(c.DEV_MODAL_EDIT_CHART_DIFF_TEXT_ID);
        
        if (!/^([A-Z|a-z|0-9|_]+)$/.test(formValueGameID)) {
            interaction.editReply({
                content: `An invalid game ID of \`${formValueGameID}\` was found in your CHART/USER submission!\nPlease try again.`, 
                ephemeral: true
            });
            return [];
        }
        
        if (!/^[A-DFS]$|^SS$|^SSS$/.test(formValueGrade)) {
            interaction.editReply({
                content: `An invalid grade of \`${formValueGrade}\` was found in your CHART/USER submission!\nPlease try again.`, 
                ephemeral: true
            });
            return [];
        }
        
        if (/('|"|`)+/.test(formValueName)) {
            interaction.editReply({
                content: `An invalid Chart Name of \`${formValueName}\` was found in your CHART/USER submission!\nPlease try again.`, 
                ephemeral: true
            });
            return [];
        }
        
        if (!/^[S|D][P]?[0-9][0-9]?$|^CO-OP$/.test(formValueDiff)) {
            interaction.editReply({
                content: `An invalid Chart Type/Difficulty of \`${formValueDiff}\` was found in your TOTAL submission!\nPlease try again.`, 
                ephemeral: true
            });
            return [];
        }
        
        let chartType = "";
        let chartDiff = "";
        if (formValueDiff == "CO-OP") {
            chartType = "CO-OP";
            chartDiff = c.JSON_NO_VALUE;
        } else if (formValueDiff.startsWith("D")) {
            if (formValueDiff.startsWith("DP")) {
                chartType = "DOUBLE P.";
                chartDiff = formValueDiff.split("DP")[1];
            } else {
                chartType = "DOUBLE";
                chartDiff = formValueDiff.split('D')[1];
            }
        } else if (formValueDiff.startsWith("S")) {
            if (formValueDiff.startsWith("SP")) {
                chartType = "SINGLE P.";
                chartDiff = formValueDiff.split("SP")[1];
            } else {
                chartType = "SINGLE";
                chartDiff = formValueDiff.split('S')[1];
            }
        }
        
        return [formValueGameID, formValueGrade, formValueName, chartType, chartDiff];
    }

    function getUploaded(interaction) {
        // grabbing the upload time to copy over as part of the new embed 'play details' field value
        let messageEmbed = interaction.message.embeds[0];
        const playField = messageEmbed.fields.find(e => e.name.includes(c.EMBED_FIELD_PLAY_DETAILS));
        let fieldLines = playField.value.replace(/`|\t/g, '').split(/\r?\n/);
        let uploaded = '';
        for (let i = 0; i < fieldLines.length - 1; i++) {
            // note, this relies on specific formatting of the 'play details' field
            if (fieldLines[i].startsWith(c.EMBED_SUBFIELD_UPLOADED)) {
                uploaded = fieldLines[i+1];
            }
        }
        return new Date(uploaded);
    }

    function promiseSQL(formInputValues, timestamp, entryID) {
        let [formValueGameID, formValueGrade, formValueName, chartType, chartDiff] = formInputValues;
        
        return new Promise((resolve, reject) => {
            const db = new sqlite3.Database(process.env.DB_NAME, (err) => {
                if (err) {
                    console.error(err.message);
                    reject(err);
                }
                console.log(`${c.DEBUG_QUERY}: Connected to the database.`);
            });

            db.serialize(() => {
                let sql = 
                    `UPDATE ${process.env.DB_SCORES_TABLE} SET 
                        game_id = "${formValueGameID}",
                        grade = "${formValueGrade}",
                        chart_name = "${formValueName}",
                        chart_type = "${chartType}",
                        chart_diff = ${chartDiff != c.JSON_NO_VALUE ? chartDiff : -1},
                        details_modified = 1,
                        time_modified = "${timestamp.toISOString()}"
                    WHERE id = ?;`;
                db.run(sql, entryID, (err) => {
                    if (err) {
                        console.log(err);
                        reject(err);
                    } else {
                        console.log(`${c.DEBUG_QUERY}: UPDATE query was successful.`);
                    }
                });
                sql = `SELECT * FROM ${process.env.DB_SCORES_TABLE} WHERE id = ?`
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

    function discordReply(interaction, entry, uploaded, modified) {
        let uploadDate = uploaded.toLocaleDateString();
        let uploadTime = uploaded.toLocaleTimeString();

        const originalEmbed = interaction.message.embeds[0];
        let updateFieldName = c.EMBED_FIELD_PLAY_DETAILS;
        let updateFieldValue = "```" + formatPlayDetails(entry.game_id, entry.grade, entry.break_on) + "```";
        let embed = update_embed(originalEmbed, updateFieldName, updateFieldValue, modified);
        embed.setDescription(formatDescription(entry.chart_name, entry.chart_type, entry.chart_diff, entry.break_on))

        interaction.message.edit({ embeds: [embed] });
        interaction.editReply({ content: 'Chart/User information was updated on this submission!', ephemeral: true });
    }
}