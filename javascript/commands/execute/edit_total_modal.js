// npm install discord.js@14.6.0

const Discord = require("discord.js");

// local imports
const c = require("../../resources/constants.js");

// define listener(s)
module.exports = (interaction) => {
    const modal = new Discord.ModalBuilder()
        .setCustomId(c.DEV_MODAL_EDIT_TOTAL_ID)
        .setTitle("Edit Total Score");

    // Create the action rows which are 1:1 containers of the text input components
    let actionRow = new Discord.ActionRowBuilder().addComponents(
        new Discord.TextInputBuilder()
            .setCustomId("totalInput")
            .setLabel("TOTAL SCORE")
            .setValue("TODO")
            .setStyle(Discord.TextInputStyle.Short)
            .setMaxLength(9)
            .setPlaceholder(`Total Score Value`)
    );
    modal.addComponents(actionRow);

    interaction.showModal(modal);
};