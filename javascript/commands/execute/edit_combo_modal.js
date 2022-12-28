// npm install discord.js@14.6.0

const Discord = require("discord.js");

// local imports
const c = require("../../resources/constants.js");
const getEntryID = require("../../utilities/getEntryID.js");
const sqlGetPlay = require("../../utilities/sqlGetPlay.js");

module.exports = (interaction) => {
    const entryID = getEntryID(interaction);
    let checkSQLpromise = sqlGetPlay(entryID);

    checkSQLpromise.then((row) => {
        if (interaction.user.id == row.discord_id) {
            discordReplyModal(interaction);
        } else {
            throw "Only the uploader may **UPDATE** the Max Combo!";
        }
    }).catch(error => {
        console.error(error);
        interaction.reply({ content: error.toString(), ephemeral: true });
    });
    
    function discordReplyModal(interaction) {
        const modal = new Discord.ModalBuilder()
            .setCustomId(c.DEV_MODAL_EDIT_COMBO_ID)
            .setTitle("Edit Max Combo");

        const messageEmbed = interaction.message.embeds[0];
        const comboField = messageEmbed.fields.find(e => e.name.includes(c.EMBED_FIELD_MAX_COMBO));

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
    }
};