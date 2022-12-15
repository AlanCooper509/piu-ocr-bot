// local imports
const c = require("../resources/constants.js");

module.exports = (interaction) => {
    const messageEmbed = interaction.message.embeds[0];
    const scoresField = messageEmbed.fields.find(e => e.name.includes(c.EMBED_FIELD_RECORD_ID));
    return scoresField.value;
}