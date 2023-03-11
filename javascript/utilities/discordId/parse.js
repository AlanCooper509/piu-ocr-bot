// local imports
const c = require("../../resources/constants.js");

module.exports = (input, optionID) => {
    if (![c.COMMAND, c.MESSAGE].includes(input.constructor.name)) {
        console.log(`${input.constructor.name}: Object input type not recognized`);
        return;
    }
    
    let id = '';
    switch (input.constructor.name) {
        case c.COMMAND:
            id = input.options.getString(optionID);
            break;
        case c.MESSAGE:
            if (input.content.split(' ').length < 2) {
                return;
            };
            // "show play <id>" or "show tourney <id>" or "tourney view <id>"
            id = input.content.split(' ')[2];
            break;
    }
    
    return id;
}
