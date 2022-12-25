// npm install discord.js@14.6.0

const Discord = require("discord.js");

// local imports
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
                            .setRequired(true))
        )
        .addSubcommand(subcommand =>
                subcommand
                    .setName(c.COMMAND_SHOW_SUBCOMMAND_USER)
                    .setDescription(c.COMMAND_SHOW_SUBCOMMAND_USER_DESC)
                    .addStringOption(option =>
                        option
                            .setName(c.COMMAND_SHOW_SUBCOMMAND_USER_ID_NAME)
                            .setDescription(c.COMMAND_SHOW_SUBCOMMAND_USER_ID_DESC)
                            .setMinLength(1)
                            .setMaxLength(20)
                            .setRequired(true))
                    .addStringOption(option =>
                        option
                            .setName(c.COMMAND_SHOW_SUBCOMMAND_CHART_TITLE_NAME)
                            .setDescription(c.COMMAND_SHOW_SUBCOMMAND_CHART_TITLE_DESC)
                            .setMinLength(1)
                            .setMaxLength(100)
                            .setRequired(false))
                    .addStringOption(option =>
                        option
                            .setName(c.COMMAND_SHOW_SUBCOMMAND_CHART_DIFF_NAME)
                            .setDescription(c.COMMAND_SHOW_SUBCOMMAND_CHART_DIFF_DESC)
                            .setMinLength(2)
                            .setMaxLength(5)
                            .setRequired(false))
        )
};