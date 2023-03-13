// npm install discord.js@14.6.0

const Discord = require("discord.js");

// local imports
const c = require("../resources/constants.js");

module.exports = (isMultiPage, selectDisabled) => {
    // Buttons below the embed for triggering edit actions
    return new Discord.ActionRowBuilder()
        .addComponents(
            new Discord.ButtonBuilder()
                .setCustomId(c.PAGE_PREV_BUTTON_ID)
                .setLabel('↙️')
                .setStyle(Discord.ButtonStyle.Primary)
                .setDisabled(true),
            new Discord.ButtonBuilder()
                .setCustomId(c.PAGE_SELECT_BUTTON_ID)
                .setLabel('SELECT')
                .setStyle(Discord.ButtonStyle.Success)
                .setDisabled(selectDisabled),
            new Discord.ButtonBuilder()
                .setCustomId(c.PAGE_NEXT_BUTTON_ID)
                .setLabel('↘️')
                .setStyle(Discord.ButtonStyle.Primary)
                .setDisabled(!isMultiPage));
}