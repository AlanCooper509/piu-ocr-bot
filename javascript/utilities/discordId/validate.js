// local imports
const c = require("../../resources/constants.js");

module.exports = (input, id, deferred) => {
    if (![c.COMMAND, c.MESSAGE, c.SUBMIT].includes(input.constructor.name)) {
        console.log(`${input.constructor.name}: Object input type not recognized`);
        return;
    }
    
    if (!/^\d+$/.test(id)) {
        let reply = {
            content: "The ID to lookup " + '`' + (id ? id : "(none entered)") + '`' + " should be numbers only!",
            ephemeral: true
        }
        switch (input.constructor.name) {
            case c.COMMAND:
                if (deferred) { input.editReply(reply); }
                else { input.reply(reply); }
                break;
            case c.MESSAGE:
                input.reply(reply);
                break;
            case c.SUBMIT:
                if (deferred) { input.editReply(reply); }
                else { input.reply(reply); }
                break;
        }
        return;
    }
    
    if (id.length < 17 || id.length > 19) {
        let reply = {
            content: "The ID to lookup should be between 17 to 19 numbers!",
            ephemeral: true
        }
        switch (input.constructor.name) {
            case c.COMMAND:
                if (deferred) { input.editReply(reply); }
                else { input.reply(reply); }
                break;
            case c.MESSAGE:
                input.reply(reply);
                break;
            case c.SUBMIT:
                if (deferred) { input.editReply(reply); }
                else { input.reply(reply); }
                break;
        }
        return;
    }
    
    return id;
}