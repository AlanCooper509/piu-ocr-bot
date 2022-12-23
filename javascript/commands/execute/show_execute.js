// local imports
const c = require("../../resources/constants.js");
const showPlay = require("./show_play.js");
const showUser = require("./show_user.js");

module.exports = (input) => {
    let subcommand = '';
    switch (input.constructor.name) {
        case c.COMMAND:
            subcommand = input.options.getSubcommand();
            break;
        case c.MESSAGE:
            subcommand = input.content.split(' ')[1];
            break;
    }
    console.log(`a subcommand was interpreted as ${subcommand}`);
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