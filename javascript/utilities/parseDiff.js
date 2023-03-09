// local imports
const c = require("../resources/constants.js");
const expandChartType = require("./expandChartType.js");


module.exports = (input, optionID) => {
    if (![c.COMMAND, c.MESSAGE].includes(input.constructor.name)) {
        console.log(`${input.constructor.name}: Object input type not recognized`);
        return;
    }
    
    let diff = '';
    switch (input.constructor.name) {
        case c.COMMAND:
            diff = input.options.getString(optionID);
            if (!diff) { return; }
            break;
        case c.MESSAGE:
            let tokens = input.content.split(' ');
            if (tokens.length < 4) { return; };
            if (tokens[3].toLowerCase() == "type") {
                if (tokens.length < 5) { return; };
                diff = tokens[4];
            } else if (tokens.includes("type")) {
                let idx = tokens.indexOf("type") + 1;
                if (tokens.length - 1 < idx) { return; }
                diff = tokens[idx];
            } else {
                return;
            }
            break;
    }
    
    // tests for S/SP/D/DP together with difficulty (00-29) or variations on co-op/coop.
    if (!/^(S|s|SP|sp|D|d|DP|dp)\d\d?$|^(C|c)(O|o)-?(O|o)(P|p)$/.test(diff)) {
        let reply = {
                content: `An invalid chart difficulty of \`${diff}\` was found in your command!\nPlease try again.`, 
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

    // tests for variations on co-op/coop
    diff = diff.toUpperCase();
    if (/^CO-?OP$/.test(diff)) {
        return {
            type: "CO-OP",
            diff: -1
        }
    } else if (diff.startsWith("DP")) {
        return {
            type: expandChartType("DP"),
            diff: parseInt(diff.split("DP")[1])
        }
    } else if (diff.startsWith("SP")) {
        return {
            type: expandChartType("SP"),
            diff: parseInt(diff.split("SP")[1])
        }
    } else if (diff.startsWith("D")) {
        return {
            type: expandChartType("D"),
            diff: parseInt(diff.split("D")[1])
        }
    } else if (diff.startsWith("S")) {
        return {
            type: expandChartType("S"),
            diff: parseInt(diff.split("S")[1])
        }
    }
    return diff;
}