// local imports
const c = require("../../resources/constants.js");
const getRowNums = require("../../utilities/getRowNums.js");
const showPlay = require("./show_play.js");

module.exports = (modalSubmitInteraction) => {
    // parse embed prior to submission for upcoming validation checks
    let fields = modalSubmitInteraction.message.embeds[0].fields;
    let rowNums = getRowNums(fields);
    let playIDs = getPlayIDs(fields, rowNums);

    // validation checks for finding and matching row numbers to play IDs on the embed
    if (rowNums.length == 0 || playIDs.length == 0 || rowNums.length != playIDs.length) {
        input.reply({
                content: `Trouble finding play IDs to select from on the embed!\nPlease try again.`, 
                ephemeral: true
            });
        return;
    }
    
    // match form value to a row number
    let formValue = parseSubmission(modalSubmitInteraction, rowNums, playIDs);
    if (formValue == null) { return; }
    let index = rowNums.findIndex((num) => num == formValue);
    if (index == -1) {
        input.reply({
                content: `Could not find that row number on the current page! It might have been changed while selecting one.\nPlease try again.`, 
                ephemeral: true
            });
        return;
    }

    // get the play ID and show that play's details to the user
    let targetPlayID = playIDs[index];
    showPlay(modalSubmitInteraction, targetPlayID);

    function getPlayIDs(fields) {
        if (!Array.isArray(fields)) { return []; }
        let playIDs = [];
        for (let i = 0; i < fields.length; i++) {
            let rows = fields[i].value.replaceAll(/>|`/g, '').split('\n');
            for (let j = 0; j < rows.length; j++) {
                let row = rows[j];
                // THE FOLLOWING ASSUMES SPECIFIC EMBED FIELD FORMATTING
                if (row.startsWith("Play ID: ")) {
                    let id = row.split("Play ID: ")[1].replaceAll(/[^0-9]/g, '');
                    playIDs.push(id);
                }
            }
        }
        return playIDs;
    }

    function parseSubmission(msInteraction, rowNums, playIDs) {
        let formValue = msInteraction.fields.getTextInputValue(c.DEV_MODAL_SELECT_PLAY_ID);
        if (/^\d+$/.test(formValue)) {
            formValue = parseInt(formValue);
        } else {
            msInteraction.reply({
                content: `An invalid row input of \`${formValue}\` was found in your SELECT ROW submission!\nPlease try again.`, 
                ephemeral: true
            });
            return;
        }
        rowNum = parseInt(formValue);
        if (rowNum < Math.min(...rowNums)) {
            msInteraction.reply({
                content: `Row number \`${formValue}\` is smaller than the first row (${Math.min(...rowNums)}).\nPlease try again, or navigate to another page!`,
                ephemeral: true
            });
            return;
        }

        if (rowNum > Math.max(...rowNums)) {
            msInteraction.reply({
                content: `Row number \`${formValue}\` is larger than the last row (${Math.max(...rowNums)}).\nPlease try again, or navigate to another page!`, 
                ephemeral: true
            });
            return;
        }
        return formValue;
    }
}