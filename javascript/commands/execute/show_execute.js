// local imports
const c = require("../../resources/constants.js");
const showPlay = require("./show_play.js");
const showUser = require("./show_user.js");

// file variables
const c_slashObject = "ChatInputCommandInteraction";
const c_messageObject = "Message";

module.exports = (input) => {
    let subcommand = '';
    switch (input.constructor.name) {
        case c_slashObject:
            subcommand = input.options.getSubcommand();
            break;
        case c_messageObject:
            subcommand = input.content.split(' ')[1];
            break;
    }

    switch (subcommand) {
        case c.COMMAND_SHOW_SUBCOMMAND_PLAY:
            showPlay(input);
            break;
        case c.COMMAND_SHOW_SUBCOMMAND_USER:
            showUser(input);
            break;
        default:
            break;
    }
};