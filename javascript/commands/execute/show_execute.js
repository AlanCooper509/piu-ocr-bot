// local imports
const c = require("../../resources/constants.js");
const showPlay = require("./show_play.js");
const showUser = require("./show_user.js");
const showChart = require("./show_chart.js");
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
        case c.COMMAND_SHOW_SUBCOMMAND_PLAY:
            showPlay(input);
            break;
        case c.COMMAND_SHOW_SUBCOMMAND_USER:
            showUser(input);
            break;
        case c.COMMAND_SHOW_SUBCOMMAND_CHART:
            showChart(input);
            break;
        case c.COMMAND_SHOW_SUBCOMMAND_TOURNEY:
            tourneyView(input, false);
            break;
        case c.COMMAND_SHOW_SUBCOMMAND_TOURNEYS:
            tourneyAll(input, false);
            break;
        default:
            console.log(`subcommand ${subcommand} is not found registered`);
            break;
    }
};