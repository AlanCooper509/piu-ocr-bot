// npm install discord.js@14.6.0

const Discord = require("discord.js");

// local imports
const c = require("../resources/constants.js");
const read_execute = require("../commands/execute/read_execute.js");
const show_execute = require("../commands/execute/show_execute.js");
const hey_execute = require("../commands/execute/hey_execute.js");
const edit_scores_modal = require("../commands/execute/edit_scores_modal.js");
const edit_scores_submit = require("../commands/execute/edit_scores_submit.js");
const edit_combo_modal = require("../commands/execute/edit_combo_modal.js");
const edit_combo_submit = require("../commands/execute/edit_combo_submit.js");
const edit_total_modal = require("../commands/execute/edit_total_modal.js");
const edit_total_submit = require("../commands/execute/edit_total_submit.js");
const edit_info_modal = require("../commands/execute/edit_info_modal.js");
const edit_info_submit = require("../commands/execute/edit_info_submit.js");

// define listener(s)
module.exports = (client, interaction) => {
    if (interaction.isChatInputCommand()) {
        switch(interaction.commandName) {
            case c.COMMAND_READ:
                read_execute(interaction);
                break;
            case c.COMMAND_SHOW:
                show_execute(interaction);
                break;
            case c.COMMAND_HEY:
                hey_execute(interaction);
                break;
            default:
                console.log(`COMMAND not recognized: ${interaction.commandName}`)
                break;
        }
        return;
    }
    
    if (interaction.isButton()) {
        switch (interaction.customId) {
            case c.DEV_MODAL_EDIT_SCORES_BUTTON_ID:
                edit_scores_modal(interaction);
                break;
            case c.DEV_MODAL_EDIT_COMBO_BUTTON_ID:
                edit_combo_modal(interaction);
                break;
            case c.DEV_MODAL_EDIT_TOTAL_BUTTON_ID:
                edit_total_modal(interaction);
                break;
            case c.DEV_MODAL_EDIT_INFO_BUTTON_ID:
                edit_info_modal(interaction);
                break;
            case c.DEV_MODAL_PREV_PAGE_BUTTON_ID:
                // handled as collector in another file
                break;
            case c.DEV_MODAL_NEXT_PAGE_BUTTON_ID:
                // handled as collector in another file
                break;
            case c.DEV_MODAL_SELECT_ROW_BUTTON_ID:
                // handled as collector in another file
                break;
            default:
                console.log("Button ID not recognized: ${interaction.customId}");
                break;
        }
        return;
    }

    if (interaction.isModalSubmit()) {
        switch(interaction.customId) {
            case c.DEV_MODAL_EDIT_SCORES_ID:
                edit_scores_submit(interaction);
                break;
            case c.DEV_MODAL_EDIT_COMBO_ID:
                edit_combo_submit(interaction);
                break;
            case c.DEV_MODAL_EDIT_TOTAL_ID:
                edit_total_submit(interaction);
                break;
            case c.DEV_MODAL_EDIT_INFO_ID:
                edit_info_submit(interaction);
                break;
            default:
                console.log(`Modal ID not recognized: ${interaction.customId}`)
        }
        return;
    }
}