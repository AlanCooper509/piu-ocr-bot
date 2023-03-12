// local imports
const c = require("../../resources/constants.js");
const tourneyCreate = require("./tourney_create.js");
const tourneyView = require("./tourney_view.js");
const tourneyAll = require("./tourney_all.js");

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
        case c.COMMAND_TOURNEY_SUBCOMMAND_CREATE:
            tourneyCreate(input);
            break;
        case c.COMMAND_TOURNEY_SUBCOMMAND_VIEW:
            tourneyView(input, true);
            break;
        case c.COMMAND_TOURNEY_SUBCOMMAND_ALL:
            tourneyAll(input, true);
            break;
        default:
            console.log(`subcommand ${subcommand} is not found registered`);
            break;
    }
};