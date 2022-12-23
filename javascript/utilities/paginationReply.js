// npm install discord.js@14.6.0

const Discord = require("discord.js");

// local imports
const c = require("../resources/constants.js");
const params = require("../resources/params.js");
const makePaginationButtons = require("./buttonsToPaginate.js");

module.exports = (input, embeds) => {
        // Buttons below the embed for triggering edit actions
        let buttons = makePaginationButtons(embeds.length > 1);

        let embedPromise = null;
        switch (input.constructor.name) {
            case c.COMMAND:
                embedPromise = input.editReply({ embeds: [embeds[0]], components: [buttons], fetchReply: true });
                break;
            case c.MESSAGE:
                embedPromise = input.reply({ embeds: [embeds[0]], components: [buttons], fetchReply: true });
                break;
            default:
                return;
        }

        embedPromise.then((message) => {
            let pageNumber = 0;
            const collector = message.createMessageComponentCollector({ componentType: Discord.ComponentType.Button, time: params.PAGE_TIMEOUT });

            collector.on("collect", interaction => {
                if (interaction.user.id === input.user.id) {
                    interaction.deferUpdate();
                    console.log(`${interaction.user.id} clicked on the ${interaction.customId} button.`);

                    // buttons.components[0] should be prev page button, [2] should be next page button
                    switch (interaction.customId) {
                        case c.PAGE_PREV_BUTTON_ID:
                            if (--pageNumber == 0) {
                                buttons.components[0].setDisabled(true);
                            } else {
                                buttons.components[0].setDisabled(false);
                            }
                            buttons.components[2].setDisabled(false);
                            input.editReply({ embeds: [embeds[pageNumber]], components: [buttons] });
                            break;
                        case c.PAGE_NEXT_BUTTON_ID:
                            if (++pageNumber == embeds.length - 1) {
                                buttons.components[2].setDisabled(true);
                            } else {
                                buttons.components[2].setDisabled(false);
                            }
                            buttons.components[0].setDisabled(false);
                            input.editReply({ embeds: [embeds[pageNumber]], components: [buttons] });
                            break;
                        case c.PAGE_SELECT_BUTTON_ID:
                            console.log("SELECT ROW NOT YET IMPLEMENTED");
                            interaction.reply({
                                content: `These buttons aren't for you!`,
                                ephemeral: true
                            });
                            break;
                    }
                } else {
                    interaction.reply({
                        content: `These buttons aren't for you!`,
                        ephemeral: true
                    });
                }
                collector.resetTimer();
            });

            collector.on('end', (collected, reason) => {
                if (reason !== "messageDelete") {
                    buttons.components[0].setDisabled(true);
                    buttons.components[1].setDisabled(true);
                    buttons.components[2].setDisabled(true);
                }
                input.editReply({ embeds: [embeds[pageNumber]], components: [buttons] });
            });
        });
}