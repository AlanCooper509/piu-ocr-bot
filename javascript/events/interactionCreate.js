// npm install discord.js@14.6.0

const Discord = require("discord.js");

// local imports
const c = require("../resources/constants.js");

module.exports = (client, interaction) => {
    if (interaction.isChatInputCommand()) {
        // TODO: only registered command so far (template code)
        if (interaction.commandName === "ping") {
            interaction.reply("pong");
        }
        return;
    }
    
    switch (interaction.customId) {
        case c.DEV_MODAL_EDIT_SCORES_BUTTON:
            // TODO: move to separate helper
            const modal = new Discord.ModalBuilder()
                .setCustomId(c.DEV_MODAL_EDIT_SCORES_ID)
                .setTitle('Edit Scores');

            // Create the action rows which are 1:1 containers of the text input components
            let actionRows = [];
            let idList = ["perfectInput", "greatInput", "goodInput", "badInput", "missInput"];
            let labelList = ["PERFECT:", "GREAT:", "GOOD:", "BAD:", "MISS:"];
            for (let i = 0; i < 5; i++) {
                actionRows.push(
                    new Discord.ActionRowBuilder().addComponents(
                        new Discord.TextInputBuilder()
                            .setCustomId(idList[i])
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
            break;
        case c.DEV_MODAL_EDIT_SCORES_ID:
            // TODO: https://discordjs.guide/interactions/modals.html#input-properties
            console.log("DiscordJS: modal submission not yet implemented");
            break;
        default:
            console.log("DiscordJS: an interaction was not found");
            break;
    }
}