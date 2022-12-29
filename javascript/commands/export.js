// npm install discord.js@14.6.0

const Discord = require("discord.js");
const c = require("../resources/constants.js");

module.exports = {
    data: new Discord.SlashCommandBuilder()
        .setName(c.COMMAND_EXPORT)
        .setDescription(c.COMMAND_EXPORT_DESC)
};