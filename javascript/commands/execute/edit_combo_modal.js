// npm install discord.js@14.6.0

const Discord = require("discord.js");

// local imports
const c = require("../../resources/constants.js");

module.exports = (interaction) => {
    const modal = new Discord.ModalBuilder()
        .setCustomId(c.DEV_MODAL_EDIT_COMBO_ID)
        .setTitle("Edit Max Combo");

    const messageEmbed = interaction.message.embeds[0];
    const comboFieldIndex = messageEmbed.fields.map(e => e.name).indexOf(c.EMBED_FIELD_MAX_COMBO);
    const comboField = messageEmbed.fields[comboFieldIndex];

    // Create the action rows which are 1:1 containers of the text input components
    let actionRow = new Discord.ActionRowBuilder().addComponents(
        new Discord.TextInputBuilder()
            .setCustomId(c.DEV_MODAL_EDIT_COMBO_TEXT_ID)
            .setLabel("MAX COMBO")
            .setValue(comboField.value.replaceAll(/`/g, ''))
            .setStyle(Discord.TextInputStyle.Short)
            .setMaxLength(9)
            .setPlaceholder("Max Combo Value")
    );
    modal.addComponents(actionRow);

    interaction.showModal(modal);
};