// npm install discord.js@14.6.0

const Discord = require("discord.js");

// local imports
const c = require("../../resources/constants.js");
const getEntryID = require("../../utilities/getEntryID.js");
const sqlGetPlay = require("../../utilities/sqlGetPlay.js");

module.exports = (interaction) => {
    const entryID = getEntryID(interaction);
    let checkSQLpromise = sqlGetPlay(entryID);

    checkSQLpromise.then((row) => {
        if (interaction.user.id == row.discord_id) {
            discordReplyModal(interaction);
        } else {
            throw "Only the uploader may **UPDATE** the Scores info!";
        }
    }).catch(error => {
        console.error(error);
        interaction.reply({ content: error.toString(), ephemeral: true });
    });
    
    function discordReplyModal(interaction) {
        const modal = new Discord.ModalBuilder()
            .setCustomId(c.DEV_MODAL_EDIT_SCORES_ID)
            .setTitle("Edit Scores");

        const messageEmbed = interaction.message.embeds[0];
        const scoresField = messageEmbed.fields.find(e => e.name.includes(c.EMBED_FIELD_SCORES));

        // reliant on embedJudgementFormatter formatting (or formatting of equivilent embed field displayed to user, if that file is moved/edited)
        let scoresSimple = scoresField.value.replaceAll(/-|`| /g, '').split('\n');
        let perfects = scoresSimple[0].substring(scoresSimple[0].indexOf(c.EMBED_SUBFIELD_PERFECT) + c.EMBED_SUBFIELD_PERFECT.length);
        let greats   = scoresSimple[1].substring(scoresSimple[1].indexOf(c.EMBED_SUBFIELD_GREAT)   + c.EMBED_SUBFIELD_GREAT.length);
        let goods    = scoresSimple[2].substring(scoresSimple[2].indexOf(c.EMBED_SUBFIELD_GOOD)    + c.EMBED_SUBFIELD_GOOD.length);
        let bads     = scoresSimple[3].substring(scoresSimple[3].indexOf(c.EMBED_SUBFIELD_BAD)     + c.EMBED_SUBFIELD_BAD.length);
        let misses   = scoresSimple[4].substring(scoresSimple[4].indexOf(c.EMBED_SUBFIELD_MISS)    + c.EMBED_SUBFIELD_MISS.length);

        // Create the action rows which are 1:1 containers of the text input components
        let actionRows = [];
        let judgements = [perfects, greats, goods, bads, misses];
        let labelList = ["PERFECT:", "GREAT:", "GOOD:", "BAD:", "MISS:"];
        for (let i = 0; i < c.DEV_MODAL_EDIT_SCORES_TEXT_IDS.length; i++) {
            actionRows.push(
                new Discord.ActionRowBuilder().addComponents(
                    new Discord.TextInputBuilder()
                        .setCustomId(c.DEV_MODAL_EDIT_SCORES_TEXT_IDS[i])
                        .setLabel(labelList[i])
                        .setValue(judgements[i])
                        .setStyle(Discord.TextInputStyle.Short)
                        .setMaxLength(9)
                        .setPlaceholder(`Number of ${labelList[i].slice(0, -1)}`)
                )
            );
        }
        modal.addComponents(actionRows[0], actionRows[1], actionRows[2], actionRows[3], actionRows[4]);
        interaction.showModal(modal);
    }
};