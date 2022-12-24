// local imports
const c = require("../resources/constants.js");

module.exports = (interaction) => {
    /**
     * Expected Input:
     *     messageEmbed.Fields[target_index] {
     *         name: "c.EMBED_FIELD_RECORD_ID",
     *         value: "<target record ID>", // no additional formatting on the value
     *         <...>
     *     }
     * }
     **/
    const messageEmbed = interaction.message.embeds[0];
    const scoresField = messageEmbed.fields.find(e => e.name.includes(c.EMBED_FIELD_RECORD_ID));
    return scoresField.value;
}