// local imports
const c = require("../../resources/constants.js");

module.exports = (input) => {
    // support for registered Discord slash command and also basic user message command
    const slashObject = "ChatInputCommandInteraction";
    const messageObject = "Message";

    if (![slashObject, messageObject].includes(input.constructor.name)) {
        console.log(`${input.constructor.name}: Object input type not recognized`);
        return;
    }

    switch (input.constructor.name) {
        case slashObject:
            break;
        case messageObject:
            if (input.content.split(' ').length > 1) {
                return;
            }
            break;
    }

    input.reply(c.HEY);
}