// npm install discord.js@14.6.0

const Discord = require("discord.js");

// local imports
const c = require("../resources/constants.js");
const read_execute = require("../commands/execute/read_execute.js");
const show_execute = require("../commands/execute/show_execute.js");
const name_execute = require("../commands/execute/name_execute.js");
const tourney_execute = require("../commands/execute/tourney_execute.js");
const export_execute = require("../commands/execute/export_execute.js");
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
            console.log(`${c.DEBUG_INPUT}: user ${message.author.id} input a /${c.COMMAND_READ} COMMAND`)
            read_execute(message);
            break;
        case c.COMMAND_SHOW:
            console.log(`${c.DEBUG_INPUT}: user ${message.author.id} input a /${c.COMMAND_SHOW} COMMAND`)
            show_execute(message);
            break;
        case c.COMMAND_NAME:
            console.log(`${c.DEBUG_INPUT}: user ${message.author.id} input a /${c.COMMAND_NAME} COMMAND`)
            name_execute(message);
            break;
        case c.COMMAND_TOURNEY:
            console.log(`${c.DEBUG_INPUT}: user ${message.author.id} input a /${c.COMMAND_TOURNEY} COMMAND`)
            tourney_execute(message);
            break;
        case c.COMMAND_EXPORT:
            console.log(`${c.DEBUG_INPUT}: user ${message.author.id} input a /${c.COMMAND_EXPORT} COMMAND`)
            export_execute(message);
            break;
        case c.COMMAND_HEY:
            console.log(`${c.DEBUG_INPUT}: user ${message.author.id} input a /${c.COMMAND_HEY} COMMAND`)
            hey_execute(message);
            break;
        default:
            break;
    }
};