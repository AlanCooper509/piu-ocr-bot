// local imports
const c = require("../resources/constants.js");

module.exports = (input, optionID) => {
    if (![c.COMMAND, c.MESSAGE].includes(input.constructor.name)) {
        console.log(`${input.constructor.name}: Object input type not recognized`);
        return;
    }
    
    let chartName = '';
    switch (input.constructor.name) {
        case c.COMMAND:
            chartName = input.options.getString(optionID);
            if (!chartName) { return; }
            break;
        case c.MESSAGE:
            let tokens = input.content.split(' ');
            // remove the token "type" with the corresponding, adjacent difficulty specifier if present
            if (tokens.includes("type")) {
                let idx = tokens.indexOf("type");
                tokens.splice(idx, 1); // remove one item only
                if (idx < tokens.length) {
                    tokens.splice(idx, 1); // remove one item only
                }
            }
            // get the remaining parts of the message as the chart name
            if (!tokens.includes("chart")) { return; }
            let idx = tokens.indexOf("chart") + 1;
            if (idx >= tokens.length) { return; }
            chartName = tokens.slice(idx).join(' ');
            break;
    }
    
    if (!/^([A-Z|a-z|0-9|_|\s]+)$/.test(chartName)) {
        let reply = {
                content: `An invalid chart name of \`${chartName}\` was found in your "/${c.COMMAND_SHOW}" command!\nPlease try again.`, 
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
    }

    return chartName;
}