// npm install discord.js@14.6.0

const Discord = require("discord.js");

// local imports
const c = require("../../resources/constants.js");

// define listener(s)
module.exports = (interaction) => {
    const modal = new Discord.ModalBuilder()
        .setCustomId(c.DEV_MODAL_EDIT_SCORES_ID)
        .setTitle("Edit Scores");

    // Create the action rows which are 1:1 containers of the text input components
    let actionRows = [];
    let labelList = ["PERFECT:", "GREAT:", "GOOD:", "BAD:", "MISS:"];
    for (let i = 0; i < c.DEV_MODAL_EDIT_SCORES_TEXT_IDS.length; i++) {
        actionRows.push(
            new Discord.ActionRowBuilder().addComponents(
                new Discord.TextInputBuilder()
                    .setCustomId(c.DEV_MODAL_EDIT_SCORES_TEXT_IDS[i])
                    .setLabel(labelList[i])
                    .setValue("TODO")
                    .setStyle(Discord.TextInputStyle.Short)
                    .setMaxLength(9)
                    .setPlaceholder(`Number of ${labelList[i].slice(0, -1)}`)
            )
        );
    }
    modal.addComponents(actionRows[0], actionRows[1], actionRows[2], actionRows[3], actionRows[4]);

    interaction.showModal(modal);
};