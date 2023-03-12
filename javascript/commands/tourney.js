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
                        .setName(c.COMMAND_TOURNEY_SUBCOMMAND_CREATE_CHART_TITLE_NAME)
                        .setDescription(c.COMMAND_TOURNEY_SUBCOMMAND_CREATE_CHART_TITLE_DESC)
                        .setMinLength(1)
                        .setMaxLength(100)
                        .setRequired(true))
                .addStringOption(option =>
                    option
                        .setName(c.COMMAND_TOURNEY_SUBCOMMAND_CREATE_CHART_DIFF_NAME)
                        .setDescription(c.COMMAND_TOURNEY_SUBCOMMAND_CREATE_CHART_DIFF_DESC)
                        .setMinLength(2)
                        .setMaxLength(5)
                        .setRequired(true))
                .addStringOption(option =>
                    option
                        .setName(c.COMMAND_TOURNEY_SUBCOMMAND_CREATE_START_NAME)
                        .setDescription(c.COMMAND_TOURNEY_SUBCOMMAND_CREATE_START_DESC)
                        .setMinLength(6)
                        .setMaxLength(19)
                        .setRequired(true))
                .addStringOption(option =>
                    option
                        .setName(c.COMMAND_TOURNEY_SUBCOMMAND_CREATE_END_NAME)
                        .setDescription(c.COMMAND_TOURNEY_SUBCOMMAND_CREATE_END_DESC)
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
                        .setName(c.COMMAND_TOURNEY_SUBCOMMAND_VIEW_ID_NAME)
                        .setDescription(c.COMMAND_TOURNEY_SUBCOMMAND_VIEW_ID_DESC)
                        .setMinLength(17)
                        .setMaxLength(19)
                        .setRequired(true))
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName(c.COMMAND_TOURNEY_SUBCOMMAND_ALL)
                .setDescription(c.COMMAND_TOURNEY_SUBCOMMAND_ALL_DESC)
                .addBooleanOption(option =>
                        option
                            .setName(c.COMMAND_TOURNEY_SUBCOMMAND_ALL_ACTIVE_ONLY_NAME)
                            .setDescription(c.COMMAND_TOURNEY_SUBCOMMAND_ALL_ACTIVE_ONLY_DESC)
                            .setRequired(false))
        )
};