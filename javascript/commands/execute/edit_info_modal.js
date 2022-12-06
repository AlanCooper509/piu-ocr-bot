// npm install discord.js@14.6.0

const Discord = require("discord.js");

// local imports
const c = require("../../resources/constants.js");

// define listener(s)
module.exports = (interaction) => {
    const modal = new Discord.ModalBuilder()
        .setCustomId(c.DEV_MODAL_EDIT_INFO_ID)
        .setTitle("Edit User/Chart Info");

    // Create the action rows which are 1:1 containers of the text input components
    let usernameField = new Discord.ActionRowBuilder().addComponents(
        new Discord.TextInputBuilder()
            .setCustomId("gameId")
            .setLabel("GAME ID:")
            .setValue("TODO")
            .setStyle(Discord.TextInputStyle.Short)
            .setMaxLength(20)
            .setPlaceholder("PIU profile username"));
    let chartName = new Discord.ActionRowBuilder().addComponents(
        new Discord.TextInputBuilder()
            .setCustomId("chartName")
            .setLabel("CHART NAME:")
            .setValue("TODO")
            .setStyle(Discord.TextInputStyle.Short)
            .setMaxLength(20)
            .setPlaceholder("Chart Name/Title"));
    // Regex: (S|D|SP|DP)\d+|CO-OP
    let chartDiff = new Discord.ActionRowBuilder().addComponents(
        new Discord.TextInputBuilder()
            .setCustomId("chartDiff")
            .setLabel("CHART TYPE AND DIFFICULTY:")
            .setStyle(Discord.TextInputStyle.Short)
            .setMaxLength(5)
            .setPlaceholder("Examples: 'S20' or 'DP18' or 'CO-OP'"));

    modal.addComponents(usernameField, chartName, chartDiff);
    interaction.showModal(modal);
};