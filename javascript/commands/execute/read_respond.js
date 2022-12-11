// npm install discord.js@14.6.0

const Discord = require("discord.js");

// local imports
const c = require("../../resources/constants.js");
const format_scores = require("../../utilities/embedJudgementFormatter.js");

module.exports = (input, results, timestamp, attachmentURL) => {
    // support for registered Discord slash command and also basic user message command
    const slashObject = "ChatInputCommandInteraction";
    const messageObject = "Message";

    let uploadDate = timestamp.toLocaleDateString();
    let uploadTime = timestamp.toLocaleTimeString();

    // user/chart information
    let user     = results[c.JSON_TEXT_USER]    != '' ? results[c.JSON_TEXT_USER]  : c.JSON_NO_VALUE;
    let chart    = results[c.JSON_TEXT_CHART]   != '' ? results[c.JSON_TEXT_CHART] : c.JSON_NO_VALUE;
    let type     = results[c.JSON_TEXT_TYPE]    != '' ? results[c.JSON_TEXT_TYPE]  : c.JSON_NO_VALUE;
    let diff     = results[c.JSON_TEXT_DIFF]    != '' ? results[c.JSON_TEXT_DIFF]  : c.JSON_NO_VALUE;
    let grade    = results[c.JSON_TEXT_GRADE]   != '' ? results[c.JSON_TEXT_GRADE] : c.JSON_NO_VALUE;

    // score/judgement information
    let perfects = results[c.JSON_TEXT_PERFECT] != '' ? parseInt(results[c.JSON_TEXT_PERFECT]) : c.JSON_NO_VALUE;
    let greats   = results[c.JSON_TEXT_GREAT]   != '' ? parseInt(results[c.JSON_TEXT_GREAT])   : c.JSON_NO_VALUE;
    let goods    = results[c.JSON_TEXT_GOOD]    != '' ? parseInt(results[c.JSON_TEXT_GOOD])    : c.JSON_NO_VALUE;
    let bads     = results[c.JSON_TEXT_BAD]     != '' ? parseInt(results[c.JSON_TEXT_BAD])     : c.JSON_NO_VALUE;
    let misses   = results[c.JSON_TEXT_MISS]    != '' ? parseInt(results[c.JSON_TEXT_MISS])    : c.JSON_NO_VALUE;
    let combo    = results[c.JSON_TEXT_COMBO]   != '' ? parseInt(results[c.JSON_TEXT_COMBO])   : c.JSON_NO_VALUE;
    let score    = results[c.JSON_TEXT_SCORE]   != '' ? parseInt(results[c.JSON_TEXT_SCORE])   : c.JSON_NO_VALUE;

    // EMBED: for displaying the reply
    let embed = new Discord.EmbedBuilder();
    switch (input.constructor.name) {
        case slashObject:
            embed.setAuthor({
                name: input.user.username,
                iconURL: input.user.avatarURL()
            });
            break;
        case messageObject:
            embed.setAuthor({
                name: input.author.username,
                iconURL: input.author.avatarURL()
            });
            break;
    }
    embed.setImage(attachmentURL);
    embed.setColor(14680086);

    // EMBED: use description to display chart information
    embed.setDescription(`**${chart}**\n*${type} ${diff}*`);

    // EMBED: add fields to display user info and capture date
    embed.addFields(
        {
            name: c.EMBED_FIELD_PLAY_DETAILS,
            value: `\`\`\`${c.EMBED_SUBFIELD_GAME_ID}: ${user}\n${c.EMBED_SUBFIELD_GRADE}: ${grade}\n\n${c.EMBED_SUBFIELD_UPLOADED}:\n\t${uploadDate}, ${uploadTime}\`\`\``
        }
    );

    // EMBED: add fields to display judgements, combo, and total score
    let judgements = format_scores(perfects, greats, goods, bads, misses);
    embed.addFields(
        {
            name: c.EMBED_FIELD_SCORES,
            value: `\`\`\`${judgements}\`\`\``
        },
        {
            name: c.EMBED_FIELD_MAX_COMBO,
            value: `\`\`\`${combo.toString()}\`\`\``
        },
        {
            name: c.EMBED_FIELD_TOTAL_SCORE,
            value: `\`\`\`${score.toLocaleString()}\`\`\``
        }
    );

    // Buttons below the embed for triggering edit actions
    const row = new Discord.ActionRowBuilder()
        .addComponents(
            new Discord.ButtonBuilder()
                .setCustomId(c.DEV_MODAL_EDIT_SCORES_BUTTON_ID)
                .setLabel('⚖️ SCORES')
                .setStyle(Discord.ButtonStyle.Success),
            new Discord.ButtonBuilder()
                .setCustomId(c.DEV_MODAL_EDIT_INFO_BUTTON_ID)
                .setLabel('📝 CHART/USER')
                .setStyle(Discord.ButtonStyle.Secondary),
            new Discord.ButtonBuilder()
                .setCustomId(c.DEV_MODAL_EDIT_COMBO_BUTTON_ID)
                .setLabel('🔗 COMBO')
                .setStyle(Discord.ButtonStyle.Secondary),
            new Discord.ButtonBuilder()
                .setCustomId(c.DEV_MODAL_EDIT_TOTAL_BUTTON_ID)
                .setLabel('💯 TOTAL')
                .setStyle(Discord.ButtonStyle.Primary));

    switch (input.constructor.name) {
        case slashObject:
            input.editReply({ embeds: [embed], components: [row] });
            break;
        case messageObject:
            input.reply({ embeds: [embed], components: [row] });
    }
};