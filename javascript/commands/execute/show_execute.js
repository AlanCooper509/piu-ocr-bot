// npm install discord.js@14.6.0
// npm install sqlite3@5.1.4
// npm install dotenv@16.0.3

const Discord = require("discord.js");
const sqlite3 = require("sqlite3").verbose();
require("dotenv").config();

// local imports
const c = require("../../resources/constants.js");
const showPlay = require("./show_play.js");

// file variables
const c_slashObject = "ChatInputCommandInteraction";
const c_messageObject = "Message";

module.exports = (input) => {
    let subcommand = '';
    switch (input.constructor.name) {
        case c_slashObject:
            subcommand = input.options.getSubcommand();
            break;
        case c_messageObject:
            subcommand = input.content.split(' ')[1];
            break;
    }

    switch (subcommand) {
        case c.COMMAND_SHOW_SUBCOMMAND_PLAY:
            showPlay(input);
            break;
        default:
            input.reply(`The show subcommand "${subcommand}" is not recognized.\nTry \`/show\` to see the list of available subcommands.`);
    }
};