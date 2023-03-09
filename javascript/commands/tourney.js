// npm install discord.js@14.6.0

const Discord = require("discord.js");
const c = require("../resources/constants.js");

module.exports = {
    data: new Discord.SlashCommandBuilder()
        .setName(c.COMMAND_TOURNEY)
        .setDescription(c.COMMAND_TOURNEY_DESC)
        .addSubcommand(subcommand =>
            subcommand
                .setName(c.COMMAND_TOURNEY_SUBCOMMAND_CREATE)
                .setDescription(c.COMMAND_TOURNEY_SUBCOMMAND_CREATE_DESC)
                .addStringOption(option =>
                    option
                        .setName(c.COMMAND_TOURNEY_SUBCOMMAND_CHART_TITLE_NAME)
                        .setDescription(c.COMMAND_TOURNEY_SUBCOMMAND_CHART_TITLE_DESC)
                        .setMinLength(1)
                        .setMaxLength(100)
                        .setRequired(true))
                .addStringOption(option =>
                    option
                        .setName(c.COMMAND_TOURNEY_SUBCOMMAND_CHART_DIFF_NAME)
                        .setDescription(c.COMMAND_TOURNEY_SUBCOMMAND_CHART_DIFF_DESC)
                        .setMinLength(2)
                        .setMaxLength(5)
                        .setRequired(true))
                .addStringOption(option =>
                    option
                        .setName(c.COMMAND_TOURNEY_SUBCOMMAND_START_NAME)
                        .setDescription(c.COMMAND_TOURNEY_SUBCOMMAND_START_DESC)
                        .setMinLength(6)
                        .setMaxLength(19)
                        .setRequired(true))
                .addStringOption(option =>
                    option
                        .setName(c.COMMAND_TOURNEY_SUBCOMMAND_END_NAME)
                        .setDescription(c.COMMAND_TOURNEY_SUBCOMMAND_END_DESC)
                        .setMinLength(6)
                        .setMaxLength(19)
                        .setRequired(true))
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName(c.COMMAND_TOURNEY_SUBCOMMAND_VIEW)
                .setDescription(c.COMMAND_TOURNEY_SUBCOMMAND_VIEW_DESC)
                .addStringOption(option =>
                    option
                        .setName(c.COMMAND_TOURNEY_SUBCOMMAND_CHART_TITLE_NAME)
                        .setDescription(c.COMMAND_TOURNEY_SUBCOMMAND_CHART_TITLE_DESC)
                        .setMinLength(1)
                        .setMaxLength(100)
                        .setRequired(true))
                .addStringOption(option =>
                    option
                        .setName(c.COMMAND_TOURNEY_SUBCOMMAND_CHART_DIFF_NAME)
                        .setDescription(c.COMMAND_TOURNEY_SUBCOMMAND_CHART_DIFF_DESC)
                        .setMinLength(2)
                        .setMaxLength(5)
                        .setRequired(true))
        )
};