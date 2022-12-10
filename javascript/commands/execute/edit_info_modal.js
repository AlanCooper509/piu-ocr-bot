// npm install discord.js@14.6.0

const Discord = require("discord.js");

// local imports
const c = require("../../resources/constants.js");

// define listener(s)
module.exports = (interaction) => {
    const modal = new Discord.ModalBuilder()
        .setCustomId(c.DEV_MODAL_EDIT_INFO_ID)
        .setTitle("Edit User/Chart Info");

    const messageEmbed = interaction.message.embeds[0];
    
    // retrieve chartName, chartType, and chartDiff
    let embedDesc = messageEmbed.description.replace(/\*/g, '').split(/\r?\n/);
    let chartName = embedDesc[0];
    let chartDetails = embedDesc[1];
    let chartType = '';
    let chartDiff = '';
    if (chartDetails.split(' ').length == 2) {
        if (embedDesc[1].split(' ')[0] == "CO-OP") {
            // CO-OP
            chartType = embedDesc[1].split(' ')[0];
            chartDiff = c.JSON_NO_VALUE;
        } else {
            // SINGLE or DOUBLE --> S or D
            chartType = embedDesc[1].split(' ')[0][0];
            chartDiff = embedDesc[1].split(' ')[1];
        }
    } else {
        // SINGLE P. or DOUBLE P. --> SP or DP
        chartType = embedDesc[1].split(' ')[0][0]+'P';
        chartDiff = embedDesc[1].split(' ')[1];
    }
    
    
    // retrieve gameID and grade: relies on the formatting of the field section
    let gameID = c.JSON_NO_VALUE;
    let grade = c.JSON_NO_VALUE;
    const playFieldIndex = messageEmbed.fields.map(e => e.name).indexOf(c.EMBED_FIELD_PLAY_DETAILS);
    const playField = messageEmbed.fields[playFieldIndex].value;
    const fieldLines = playField.replace(/`/g, '').split(/\r?\n/);
    for (let i = 0; i < fieldLines.length; i++) {
        if (fieldLines[i].startsWith(c.EMBED_SUBFIELD_GAME_ID)) {
            gameID = fieldLines[i].split(c.EMBED_SUBFIELD_GAME_ID)[1].replace(/:| /g, '');
        } else if (fieldLines[i].startsWith(c.EMBED_SUBFIELD_GRADE)) {
            grade = fieldLines[i].split(c.EMBED_SUBFIELD_GRADE)[1].replace(/:| /g, '');
        }
    }

    // Create the action rows which are 1:1 containers of the text input components
    let usernameField = new Discord.ActionRowBuilder().addComponents(
        new Discord.TextInputBuilder()
            .setCustomId(c.DEV_MODAL_EDIT_GAMEID_TEXT_ID)
            .setLabel("GAME ID:")
            .setValue(gameID)
            .setStyle(Discord.TextInputStyle.Short)
            .setMaxLength(20)
            .setPlaceholder("PIU profile username"));
    let chartNameField = new Discord.ActionRowBuilder().addComponents(
        new Discord.TextInputBuilder()
            .setCustomId(c.DEV_MODAL_EDIT_CHART_NAME_TEXT_ID)
            .setLabel("CHART NAME:")
            .setValue(chartName)
            .setStyle(Discord.TextInputStyle.Short)
            .setMaxLength(20)
            .setPlaceholder("Chart Name/Title"));
    // Regex: (S|D|SP|DP)\d+|CO-OP
    let chartDiffField = new Discord.ActionRowBuilder().addComponents(
        new Discord.TextInputBuilder()
            .setCustomId(c.DEV_MODAL_EDIT_CHART_DIFF_TEXT_ID)
            .setLabel("CHART TYPE AND DIFFICULTY:")
            .setValue(chartType + chartDiff)
            .setStyle(Discord.TextInputStyle.Short)
            .setMaxLength(5)
            .setPlaceholder("Examples: 'S20' or 'DP18' or 'CO-OP'"));

    modal.addComponents(usernameField, chartNameField, chartDiffField);
    interaction.showModal(modal);
};