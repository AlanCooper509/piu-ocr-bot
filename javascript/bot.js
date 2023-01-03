// npm install discord.js@14.6.0
// npm install dotenv@16.0.3

const Discord = require("discord.js");
const fs = require("fs");
require("dotenv").config();

const client = new Discord.Client({
    intents: [
        Discord.GatewayIntentBits.Guilds,
        Discord.GatewayIntentBits.GuildMessages,
        Discord.GatewayIntentBits.MessageContent,
        Discord.GatewayIntentBits.GuildMessageReactions
    ]
});

// define listener(s)
fs.readdir("./events/", (err, files) => {
    files.forEach((file) => {
        const eventHandler = require(`./events/${file}`);
        const eventName = file.split(".")[0];
        client.on(eventName, (arg) => eventHandler(client, arg));
    });
});

// login to server
client.login(process.env.BOT_TOKEN);