// local imports
const c = require("../../resources/constants.js");
const format_scores = require("../../utilities/embedJudgementFormatter.js");
const update_embed_field = require("../../utilities/embedCopier.js");

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

    const originalEmbed = interaction.message.embeds[0];
    let updateFieldName = c.EMBED_FIELD_SCORES;
    let updateFieldValue = `\`\`\`${format_scores(formInputValues[0], formInputValues[1], formInputValues[2], formInputValues[3], formInputValues[4])}\`\`\``;
    let embed = update_embed_field(originalEmbed, updateFieldName, updateFieldValue);

    interaction.message.edit({ embeds: [embed] });
    interaction.reply({ content: 'Scores were updated on this submission!', ephemeral: true });
}