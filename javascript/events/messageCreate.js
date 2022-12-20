// npm install discord.js@14.6.0

const Discord = require("discord.js");

// local imports
const c = require("../resources/constants.js");
const read_execute = require("../commands/execute/read_execute.js");
const hey_execute = require("../commands/execute/hey_execute.js");

// define listener(s)
module.exports = (client, message) => {
    if(message.content == '' || message.author.bot) {
        /* Conditions:
         * - empty channel message?
         * - Discord.GatewayIntentBits.MessageContent intent not set
         * - some bot messaged the channel
         */
        return;
    }

    let command = message.content.split(' ')[0];
    switch(command.toLowerCase()) {
        case c.COMMAND_READ:
            read_execute(message);
            break;
        case c.COMMAND_HEY:
            hey_execute(message);
            break;
        default:
            console.log(`COMMAND not recognized: ${command}`);
            break;
    }
};