// npm install discord.js@14.6.0

const Discord = require("discord.js");

// local imports
const c = require("../resources/constants.js");

module.exports = () => {
    // Buttons below the embed for triggering edit actions
    return new Discord.ActionRowBuilder()
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
}