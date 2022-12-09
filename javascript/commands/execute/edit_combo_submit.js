// local imports
const c = require("../../resources/constants.js");
const update_embed_field = require("../../utilities/embedCopier.js");

// define listener(s)
module.exports = (interaction) => {
    let formValue = interaction.fields.getTextInputValue(c.DEV_MODAL_EDIT_COMBO_TEXT_ID);
    if (/^\d+$/.test(formValue)) {
        formValue = parseInt(formValue);
    } else if(formValue != c.JSON_NO_VALUE){
        interaction.reply({
            content: `An invalid max combo value of \`${formValue}\` was found in your COMBO submission!\nPlease try again.`, 
            ephemeral: true
        });
        return;
    }

    const originalEmbed = interaction.message.embeds[0];
    let updateFieldName = c.EMBED_FIELD_MAX_COMBO;
    let updateFieldValue = `\`\`\`${formValue.toString()}\`\`\``;
    let embed = update_embed_field(originalEmbed, updateFieldName, updateFieldValue);

    interaction.message.edit({ embeds: [embed] });
    interaction.reply({ content: 'Max Combo was updated on this submission!', ephemeral: true });
}