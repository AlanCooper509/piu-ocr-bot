// npm install discord.js@14.6.0

const Discord = require("discord.js");

// local imports
const c = require("../../resources/constants.js");

// define listener(s)
module.exports = (interaction) => {
    let formInputValues = [];
    for (i = 0; i < c.DEV_MODAL_EDIT_SCORES_TEXT_IDS.length; i++) {
        let nextFormEntry = interaction.fields.getTextInputValue(c.DEV_MODAL_EDIT_SCORES_TEXT_IDS[i]);
        if(/[0-9]+/.test(nextFormEntry)) {
            formInputValues.push(nextFormEntry);
        } else {
            interaction.reply({
                content: `An invalid score value of \`${nextFormEntry}\` was found in your SCORES submission!\nPlease try again.`, 
                ephemeral: true
            });
            return;
        }
    }

    // update the original embed (Discord requires it to be copied and replaced rather than edited)
    console.log(formInputValues);
    const originalEmbed = interaction.message.embeds[0];
    const originalFields = originalEmbed.fields;
    console.log(originalFields);
    let newEmbed = Discord.EmbedBuilder.from(originalEmbed)
        .setTitle('New scores');
    /* .addFields(
		{ name: 'Regular field title', value: 'Some value here' },
		{ name: '\u200B', value: '\u200B' },
		{ name: 'Inline field title', value: 'Some value here', inline: true },
		{ name: 'Inline field title', value: 'Some value here', inline: true },
	)*/
    interaction.message.edit({ embeds: [newEmbed] });
    interaction.reply({ content: 'Your scores are updated!', ephemeral: true });
}