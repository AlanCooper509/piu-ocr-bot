// npm install discord.js@14.6.0

const Discord = require("discord.js");

// local imports
const c = require("../../resources/constants.js");
const format_scores = require("../../utilities/embedJudgementFormatter.js");
const update_timestamp = require("../../utilities/embedUpdateTimestamp.js");

// define listener(s)
module.exports = (interaction) => {
    let formInputValues = [];
    for (i = 0; i < c.DEV_MODAL_EDIT_SCORES_TEXT_IDS.length; i++) {
        let nextFormEntry = interaction.fields.getTextInputValue(c.DEV_MODAL_EDIT_SCORES_TEXT_IDS[i]);
        if (/^\d+$/.test(nextFormEntry)) {
            formInputValues.push(parseInt(nextFormEntry));
        } else if(nextFormEntry == c.JSON_NO_VALUE){
            formInputValues.push(nextFormEntry);
        } else {
            interaction.reply({
                content: `An invalid score value of \`${nextFormEntry}\` was found in your SCORES submission!\nPlease try again.`, 
                ephemeral: true
            });
            return;
        }
    }

    // copy over the original embed (Discord requires it to be retrieved, copied, and replaced rather than edited)
    const originalEmbed = interaction.message.embeds[0];
    let embed = new Discord.EmbedBuilder();
    embed.setAuthor({name: originalEmbed.author.name, iconURL: originalEmbed.author.iconURL});
    embed.setImage(originalEmbed.image.url);
    embed.setColor(originalEmbed.color);
    embed.setDescription(originalEmbed.description);
    
    for (let i = 0; i < originalEmbed.fields.length; i++) {
        if(originalEmbed.fields[i].name == c.EMBED_FIELD_SCORES) {
            // this is the edited part
            format_scores(embed, formInputValues[0], formInputValues[1], formInputValues[2], formInputValues[3], formInputValues[4]);
        } else if (originalEmbed.fields[i].name == c.EMBED_FIELD_PLAY_DETAILS){
            // add or update the last modified date
            update_timestamp(embed, originalEmbed.fields[i]);
        } else {
            embed.addFields({
                name: originalEmbed.fields[i].name,
                value: originalEmbed.fields[i].value
            });
        }
    }

    interaction.message.edit({ embeds: [embed] });
    interaction.reply({ content: 'Scores were updated on this submission!', ephemeral: true });
}