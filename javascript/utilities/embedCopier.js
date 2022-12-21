// npm install discord.js@14.6.0

const Discord = require("discord.js");

// local imports
const c = require("../resources/constants.js");
const update_timestamp = require("./embedUpdateTimestamp.js");

module.exports = (originalEmbed, fieldName, fieldValue, timestamp = new Date()) => {
    // copy over the original embed (Discord requires it to be retrieved, copied, and replaced rather than edited)
    let embed = new Discord.EmbedBuilder()
        .setAuthor({name: originalEmbed.author.name, iconURL: originalEmbed.author.iconURL})
        .setImage(originalEmbed.image.url)
        .setColor(originalEmbed.color)
        .setDescription(originalEmbed.description);
    
    for (let i = 0; i < originalEmbed.fields.length; i++) {
        if (originalEmbed.fields[i].name.includes(fieldName)) {
            // this is the edited part
            embed.addFields({
                name: fieldName.endsWith('*') ? fieldName : fieldName + '*',
                value: fieldValue,
                inline: originalEmbed.fields[i].inline
            });
        } else {
            embed.addFields({
                name: originalEmbed.fields[i].name,
                value: originalEmbed.fields[i].value,
                inline: originalEmbed.fields[i].inline
            });
        }
    }
    
    embed = update_timestamp(embed, originalEmbed, timestamp);
    return embed;
}