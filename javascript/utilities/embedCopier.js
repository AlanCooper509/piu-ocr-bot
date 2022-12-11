// npm install discord.js@14.6.0

const Discord = require("discord.js");

// local imports
const c = require("../resources/constants.js");
const update_timestamp = require("./embedUpdateTimestamp.js");

// define listener(s)
module.exports = (originalEmbed, fieldName, fieldValue) => {
    // copy over the original embed (Discord requires it to be retrieved, copied, and replaced rather than edited)
    let embed = new Discord.EmbedBuilder();
    embed.setAuthor({name: originalEmbed.author.name, iconURL: originalEmbed.author.iconURL});
    embed.setImage(originalEmbed.image.url);
    embed.setColor(originalEmbed.color);
    embed.setDescription(originalEmbed.description);
    
    for (let i = 0; i < originalEmbed.fields.length; i++) {
        if (originalEmbed.fields[i].name == fieldName) {
            // this is the edited part
            if (fieldName == c.EMBED_FIELD_PLAY_DETAILS) {
                let playField = {
                    name: fieldName,
                    value: fieldValue
                }
                update_timestamp(embed, playField);
            } else {
                embed.addFields({
                    name: fieldName,
                    value: fieldValue
                });
            }
        } else if (originalEmbed.fields[i].name == c.EMBED_FIELD_PLAY_DETAILS) {
            // add or update the last modified date
            update_timestamp(embed, originalEmbed.fields[i]);
        } else {
            embed.addFields({
                name: originalEmbed.fields[i].name,
                value: originalEmbed.fields[i].value
            });
        }
    }
    
    return embed;
}