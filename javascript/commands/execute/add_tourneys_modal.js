// npm install discord.js@14.6.0

const Discord = require("discord.js");

// local imports
const c = require("../../resources/constants.js");

module.exports = (interaction) => {
    const modal = new Discord.ModalBuilder()
        .setCustomId(c.DEV_MODAL_ADD_TOURNEYS_ID)
        .setTitle("Add Tourneys to Tourney Group");

    // Create the action rows which are 1:1 containers of the text input components
    let actionRow = new Discord.ActionRowBuilder().addComponents(
        new Discord.TextInputBuilder()
            .setCustomId(c.DEV_MODAL_ADD_TOURNEYS_TEXT_ID)
            .setLabel("Tourney IDs (to assign to this group only)")
            .setStyle(Discord.TextInputStyle.Paragraph)
            .setPlaceholder("On each line, list an existing Tourney ID within this server to associate with this group.")
    );
    modal.addComponents(actionRow);

    interaction.showModal(modal);
};