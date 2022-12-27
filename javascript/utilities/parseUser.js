// local imports
const c = require("../resources/constants.js");

module.exports = (input, optionID, deferred) => {
    if (![c.COMMAND, c.MESSAGE].includes(input.constructor.name)) {
        console.log(`${input.constructor.name}: Object input type not recognized`);
        return;
    }
    
    let gameID = '';
    switch (input.constructor.name) {
        case c.COMMAND:
            gameID = input.options.getString(optionID);
            break;
        case c.MESSAGE:
            let tokens = input.content.split(' ');

            // Note: expected to be used by "/show" and "/name" with same arg prefix name for grabbing gameID
            if (!tokens.includes(c.COMMAND_SHOW_SUBCOMMAND_USER)) { return; }

            let idx = tokens.indexOf(c.COMMAND_SHOW_SUBCOMMAND_USER) + 1;
            if (idx >= tokens.length) { return; }
            gameID = tokens[idx];

            if (tokens[0] == c.COMMAND_NAME && tokens.length > 2) {
                // this should be invalid due to space, handle in below validation
                gameID = tokens.slice(idx).join(' ');
            }
            break;
    }

    
    if (!/^([A-Z|a-z|0-9|_]+)$/.test(gameID)) {
        let reply = {
            content: `An invalid Game ID of \`${gameID}\` was entered!\nPlease try again.`, 
            ephemeral: true
        }
        switch (input.constructor.name) {
            case c.COMMAND:
                if (deferred) { input.editReply(reply); }
                else { input.reply(reply); }
                return;
            case c.MESSAGE:
                input.reply(reply);
                return;
        }
    }

    return gameID;
}