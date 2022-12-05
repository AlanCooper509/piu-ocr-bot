// npm install discord.js@14.6.0

const Discord = require("discord.js");
const c = require("../resources/constants.js");

module.exports = {
    data: new Discord.SlashCommandBuilder()
        .setName(c.COMMAND_READ)
        .setDescription(c.COMMAND_READ_DESC)
        .addAttachmentOption(option =>
            option.setName(c.COMMAND_READ_SCORE_ATTACHMENT_OPTION_NAME)
                .setDescription(c.COMMAND_READ_SCORE_ATTACHMENT_OPTION_DESC)
                .setRequired(true)
        )
};