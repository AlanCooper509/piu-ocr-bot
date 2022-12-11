// local imports
const c = require("../../resources/constants.js");
const update_embed = require("../../utilities/embedCopier.js");

module.exports = (interaction) => {
    let formValue = interaction.fields.getTextInputValue(c.DEV_MODAL_EDIT_TOTAL_TEXT_ID);
    // thanks for the regex https://stackoverflow.com/questions/5917082/
    if (/^(\d+|\d{1,3}(,\d{3})*)(\.\d+)?$/.test(formValue)) {
        formValue = parseInt(formValue.replace(/,/g, ''), 10);
    } else if(formValue != c.JSON_NO_VALUE){
        interaction.reply({
            content: `An invalid total score value of \`${formValue}\` was found in your TOTAL submission!\nPlease try again.`, 
            ephemeral: true
        });
        return;
    }

    const originalEmbed = interaction.message.embeds[0];
    let updateFieldName = c.EMBED_FIELD_TOTAL_SCORE;
    let updateFieldValue = `\`\`\`${formValue.toLocaleString()}\`\`\``;
    let embed = update_embed(originalEmbed, updateFieldName, updateFieldValue);

    interaction.message.edit({ embeds: [embed] });
    interaction.reply({ content: 'Total Score was updated on this submission!', ephemeral: true });
}