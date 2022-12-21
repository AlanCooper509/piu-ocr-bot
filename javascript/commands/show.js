// npm install discord.js@14.6.0

const Discord = require("discord.js");
const c = require("../resources/constants.js");

module.exports = {
    data: new Discord.SlashCommandBuilder()
        .setName(c.COMMAND_SHOW)
        .setDescription(c.COMMAND_SHOW_DESC)
        .addSubcommand(subcommand =>
                subcommand
                    .setName(c.COMMAND_SHOW_SUBCOMMAND_PLAY)
                    .setDescription(c.COMMAND_SHOW_SUBCOMMAND_PLAY_DESC)
                    .addStringOption(option =>
                        option
                            .setName(c.COMMAND_SHOW_SUBCOMMAND_PLAY_ID_NAME)
                            .setDescription(c.COMMAND_SHOW_SUBCOMMAND_PLAY_ID_DESC)
                            .setMinLength(17)
                            .setMaxLength(19)
                            .setRequired(true)))
};