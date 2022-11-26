// import modules
const Discord = require("discord.js");
const fs = require("fs");
require("dotenv").config();

const client = new Discord.Client({
    intents: [
        Discord.GatewayIntentBits.Guilds,
        Discord.GatewayIntentBits.GuildMessages,
        Discord.GatewayIntentBits.MessageContent
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