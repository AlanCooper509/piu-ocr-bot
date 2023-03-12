// npm install discord.js@14.6.0

const Discord = require("discord.js");

// local imports
const c = require("../../resources/constants.js");
const params = require("../../resources/params.js");
const getRowNums = require("../../utilities/getRowNums.js");

module.exports = (interaction) => {
    // Note: the information to select is entirely dependent on the field formatting
    let fields = interaction.message.embeds[0].fields;
    let rowNums = getRowNums(fields);

    if (rowNums.length > 0) {
        const modal = new Discord.ModalBuilder()
            .setCustomId(c.DEV_MODAL_SELECT_ID)
            .setTitle(`Get Details for a Row`);

        // Create the action rows which are 1:1 containers of the text input components
        let textField = new Discord.ActionRowBuilder().addComponents(
            new Discord.TextInputBuilder()
                .setCustomId(c.DEV_MODAL_SELECT_PLAY_ID)
                .setLabel(`Choose a row to display: (${rowNums[0]} - ${rowNums[rowNums.length - 1]}):`)
                .setValue(rowNums[0])
                .setMinLength(rowNums[0].length)
                .setMaxLength(rowNums[rowNums.length - 1].length)
                .setStyle(Discord.TextInputStyle.Short)
                .setPlaceholder("Which row do you want to get?"));
        
        modal.addComponents(textField);
        interaction.showModal(modal);
    }
}