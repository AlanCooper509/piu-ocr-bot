// npm install discord.js@14.6.0

const Discord = require("discord.js");

// local imports
const c = require("../resources/constants.js");
const params = require("../resources/params.js");
const makePaginationButtons = require("./buttonsToPaginate.js");

module.exports = (input, embeds, selectDisabled = false, additionalComponent = null) => {
        // Buttons below the embed for triggering edit actions
        let buttons = makePaginationButtons(embeds.length > 1, selectDisabled);
        if (additionalComponent) {
            buttons.addComponents(additionalComponent);
        }

        // set embed footers to show page numbers
        for (let i = 0; i < embeds.length; i++) {
            embeds[i].setFooter({ text: `Page ${i+1}/${embeds.length}` });
        }

        let embedPromise = null;
        switch (input.constructor.name) {
            case c.COMMAND:
                embedPromise = input.editReply({ embeds: [embeds[0]], components: [buttons], fetchReply: true });
                break;
            case c.MESSAGE:
                embedPromise = input.reply({ embeds: [embeds[0]], components: [buttons], fetchReply: true });
                break;
            case c.SUBMIT:
                embedPromise = input.reply({ embeds: [embeds[0]], components: [buttons], fetchReply: true });
                break;
            default:
                return;
        }

        embedPromise.then((message) => {
            let pageNumber = 0;
            const collector = message.createMessageComponentCollector({ componentType: Discord.ComponentType.Button, time: params.PAGE_TIMEOUT });

            collector.on("collect", async interaction => {
                /*
                let originalUserID = '';
                switch (input.constructor.name) {
                    case c.COMMAND:
                        originalUserID = input.user.id;
                        break;
                    case c.MESSAGE:
                        originalUserID = input.author.id;
                        break;
                    case c.SUBMIT:
                        originalUserID = input.user.id;
                        break;
                }

                if (interaction.user.id !== originalUserID) {
                    interaction.reply({
                        content: `These buttons aren't for you!`,
                        ephemeral: true
                    });
                    return;
                }
                */
                
                if (![c.PAGE_PREV_BUTTON_ID, c.PAGE_NEXT_BUTTON_ID].includes(interaction.customId)) {
                    // SELECT button is handled by the events/interactionCreate class
                    return;
                }

                interaction.deferUpdate().then(() => {
                    // buttons.components[0] should be prev page button, [2] should be next page button
                    switch (interaction.customId) {
                        case c.PAGE_PREV_BUTTON_ID:
                            if (--pageNumber == 0) {
                                buttons.components[0].setDisabled(true);
                            } else {
                                buttons.components[0].setDisabled(false);
                            }
                            buttons.components[2].setDisabled(false);
                            message.edit({ embeds: [embeds[pageNumber]], components: [buttons] });
                            break;
                        case c.PAGE_NEXT_BUTTON_ID:
                            if (++pageNumber == embeds.length - 1) {
                                buttons.components[2].setDisabled(true);
                            } else {
                                buttons.components[2].setDisabled(false);
                            }
                            buttons.components[0].setDisabled(false);
                            message.edit({ embeds: [embeds[pageNumber]], components: [buttons] });
                            break;
                    }
                });

                collector.resetTimer();
            });

            collector.on('end', (collected, reason) => {
                if (reason !== "messageDelete") {
                    // disable the left page turn button
                    buttons.components[0].setDisabled(true);

                    // the SELECT button is actually okay to keep enabled even after...
                    //     expiry, since it only relies on info from the current embed
                    /* buttons.components[1].setDisabled(true); */

                    // disable the right page turn button
                    buttons.components[2].setDisabled(true);
                }
                try {
                    message.edit({ embeds: [embeds[pageNumber]], components: [buttons] });
                } catch (error) {
                    console.error(error);
                }
            });
        });
}