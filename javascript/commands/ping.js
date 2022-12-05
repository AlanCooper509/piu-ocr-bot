// npm install discord.js@14.6.0

const Discord = require('discord.js');

module.exports = {
    data: new Discord.SlashCommandBuilder()
        .setName('ping')
        .setDescription('Replies with Pong!')
};