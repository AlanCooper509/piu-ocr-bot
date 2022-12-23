// local imports
const c = require("../../resources/constants.js");

module.exports = (input) => {
    if (![c.COMMAND, c.MESSAGE].includes(input.constructor.name)) {
        console.log(`${input.constructor.name}: Object input type not recognized`);
        return;
    }

    switch (input.constructor.name) {
        case c.COMMAND:
            break;
        case c.MESSAGE:
            if (input.content.split(' ').length > 1) {
                return;
            }
            break;
    }

    input.reply(c.HEY);
}