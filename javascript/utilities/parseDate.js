// local imports
const c = require("../resources/constants.js");


module.exports = (input, optionID, messagePrefix = null) => {
    if (![c.COMMAND, c.MESSAGE].includes(input.constructor.name)) {
        console.log(`${input.constructor.name}: Object input type not recognized`);
        return;
    }
    let dateInput = '';
    switch (input.constructor.name) {
        case c.COMMAND:
            dateInput = input.options.getString(optionID);
            if (!dateInput) { return; }
            break;
        case c.MESSAGE:
            let tokens = input.content.split(' ');
            // example usage: startDate 01/01/2000 where "startDate" is the agreed upon messagePrefix
            // this allows for "startDate" and "endDate" dates to be retrieved in separate method calls (more flexible)
            if (tokens.includes(messagePrefix)) {
                let idx = tokens.indexOf(messagePrefix) + 1;
                if (tokens.length - 1 < idx) { return; }
                dateInput = tokens[idx];
            } else {
                return;
            }
            break;
    }

    let date = new Date(dateInput);
    if (isNaN(date.getTime())) {
        let reply = {
            content: `An invalid date of \`${dateInput}\` was found in your command!\nPlease try again.`, 
            ephemeral: true
        };
        switch (input.constructor.name) {
            case c.COMMAND:
                input.editReply(reply);
                return;
            case c.MESSAGE:
                input.reply(reply);
                return;
        }
        date = null;
    }
    return date;
}