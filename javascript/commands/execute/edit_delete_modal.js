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
            throw "Only the uploader may **DELETE** the Play!";
        }
    }).catch(error => {
        console.error(error);
        interaction.reply({ content: error.toString(), ephemeral: true });
    });
    
    function discordReplyModal(interaction) {
        const modal = new Discord.ModalBuilder()
            .setCustomId(c.DEV_MODAL_EDIT_DELETE_ID)
            .setTitle("Delete Play?");

        // Create the action rows which are 1:1 containers of the text input components
        let actionRow = new Discord.ActionRowBuilder().addComponents(
            new Discord.TextInputBuilder()
                .setCustomId(c.DEV_MODAL_EDIT_DELETE_TEXT_ID)
                .setLabel("Are you sure you want to delete this entry?")
                .setStyle(Discord.TextInputStyle.Short)
                .setValue("(Press submit to confirm)")
                .setMaxLength(25)
                .setPlaceholder("(Press submit to confirm)")
        );
        modal.addComponents(actionRow);

        interaction.showModal(modal);
    }
};