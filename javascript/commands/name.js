// npm install discord.js@14.6.0

const Discord = require("discord.js");
const c = require("../resources/constants.js");

module.exports = {
    data: new Discord.SlashCommandBuilder()
        .setName(c.COMMAND_NAME)
        .setDescription(c.COMMAND_NAME_DESC)
        .addStringOption(option =>
            option
                .setName(c.COMMAND_NAME_SUBCOMMAND_USER_ID_NAME)
                .setDescription(c.COMMAND_NAME_SUBCOMMAND_USER_ID_DESC)
                .setMinLength(1)
                .setMaxLength(20)
                .setRequired(false))
};