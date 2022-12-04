// npm install discord.js@14.6.0

const Discord = require("discord.js");

// local imports
const c = require("../resources/constants.js");
const command_read = require("../commands/read.js");

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
    switch(command) {
        case c.COMMAND_READ:
            console.log(`COMMAND FOUND: ${c.COMMAND_READ}`);
            command_read(message);
            break;
        default:
            console.log(`COMMAND not recognized: ${command}`);
            break;
    }
};