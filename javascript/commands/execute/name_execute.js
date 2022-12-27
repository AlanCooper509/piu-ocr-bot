// local imports
const c = require("../../resources/constants.js");
const parseUser = require("../../utilities/parseUser.js");

module.exports = (input) => {
    let gameID = parseUser(input, c.COMMAND_SHOW_SUBCOMMAND_USER_ID_NAME, false);
    if (gameID == null) { return; }
    input.reply("Not Yet Implemented");
    // TODO: also need to add a query in /save of a score after this is implemented
    console.log(gameID);
}