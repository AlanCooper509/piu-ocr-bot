// local imports
const c = require("../../resources/constants.js");
const update_embed = require("../../utilities/embedCopier.js");

module.exports = (interaction) => {
    let formValueGameID = interaction.fields.getTextInputValue(c.DEV_MODAL_EDIT_GAMEID_TEXT_ID);
    let formValueGrade = interaction.fields.getTextInputValue(c.DEV_MODAL_EDIT_GRADE_TEXT_ID);
    let formValueName = interaction.fields.getTextInputValue(c.DEV_MODAL_EDIT_CHART_NAME_TEXT_ID);
    let formValueDiff = interaction.fields.getTextInputValue(c.DEV_MODAL_EDIT_CHART_DIFF_TEXT_ID);

    if (!/^([A-Z|a-z|0-9|_]+)$/.test(formValueGameID)) {
        interaction.reply({
            content: `An invalid game ID of \`${formValueGameID}\` was found in your CHART/USER submission!\nPlease try again.`, 
            ephemeral: true
        });
        return;
    }
    
    if (!/^[A-DFS]$|^SS$|^SSS$/.test(formValueGrade)) {
        interaction.reply({
            content: `An invalid grade of \`${formValueGrade}\` was found in your CHART/USER submission!\nPlease try again.`, 
            ephemeral: true
        });
        return;
    }
    
    if (!/^[S|D][P]?[0-9][0-9]?$|^CO-OP$/.test(formValueDiff)) {
        interaction.reply({
            content: `An invalid Chart Type/Difficulty of \`${formValueDiff}\` was found in your TOTAL submission!\nPlease try again.`, 
            ephemeral: true
        });
        return;
    }
    
    // grabbing the upload time to copy over as part of the new embed 'play details' field value
    let messageEmbed = interaction.message.embeds[0];
    let playFieldIndex = messageEmbed.fields.map(e => e.name).indexOf(c.EMBED_FIELD_PLAY_DETAILS);
    let playField = messageEmbed.fields[playFieldIndex].value;
    let fieldLines = playField.replace(/`|\t/g, '').split(/\r?\n/);
    let uploaded = '';
    for (let i = 0; i < fieldLines.length - 1; i++) {
        if (fieldLines[i].startsWith(c.EMBED_SUBFIELD_UPLOADED)) {
            uploaded = fieldLines[i+1];
        }
    }

    const originalEmbed = interaction.message.embeds[0];
    let updateFieldName = c.EMBED_FIELD_PLAY_DETAILS;
    let updateFieldValue = `\`\`\`${c.EMBED_SUBFIELD_GAME_ID}: ${formValueGameID}\n${c.EMBED_SUBFIELD_GRADE}: ${formValueGrade}\n\nUPLOADED:\n\t${uploaded}\`\`\``
    let embed = update_embed(originalEmbed, updateFieldName, updateFieldValue);
    
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
    embed.setDescription(`**${formValueName}**\n*${chartType} ${chartDiff}*`);

    interaction.message.edit({ embeds: [embed] });
    interaction.reply({ content: 'Chart/User information was updated on this submission!', ephemeral: true });
}