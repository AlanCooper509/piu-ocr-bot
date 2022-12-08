// npm install discord.js@14.6.0

const Discord = require("discord.js");
const spawn = require("child_process").spawn;

// local imports
const c = require("../../resources/constants.js");
const format_scores = require("../../utilities/embedJudgementFormatter.js");

// define listener(s)
module.exports = (input) => {
    // support for registered Discord slash command and also basic user message command
    const slashObject = "ChatInputCommandInteraction";
    const messageObject = "Message";

    if (![slashObject, messageObject].includes(input.constructor.name)) {
        console.log(`${input.constructor.name}: Object input type not recognized`);
        return;
    }

    let attachmentURL = '';
    switch (input.constructor.name) {
        case slashObject:
            input.deferReply();
            attachmentURL = input.options.getAttachment(c.COMMAND_READ_SCORE_ATTACHMENT_OPTION_NAME).url;
            break;
        case messageObject:
            input.react('🔎');
            if (input.attachments.size == 0) {
                console.log(`${c.COMMAND_READ}: IMAGE NOT FOUND`);
                return;
            }
            attachmentURL = input.attachments.first().url;
            break;
    }

    console.log(`OCR processing: ${attachmentURL}`);
    const pythonProcess = spawn('python', ["../python/readscores.py", attachmentURL]);
    pythonProcess.stdout.on('data', (data) => {
        console.log(`OCR success: ${attachmentURL}`);
        let timestamp = new Date();
        let uploadDate = timestamp.toLocaleDateString();
        let uploadTime = timestamp.toLocaleTimeString();

        // output retrieval from OCR script
        let outputs = JSON.parse(data.toString());

        // user/chart information
        let user     = outputs[c.JSON_TEXT_USER]    != '' ? outputs[c.JSON_TEXT_USER]  : c.JSON_NO_VALUE;
        let chart    = outputs[c.JSON_TEXT_CHART]   != '' ? outputs[c.JSON_TEXT_CHART] : c.JSON_NO_VALUE;
        let type     = outputs[c.JSON_TEXT_TYPE]    != '' ? outputs[c.JSON_TEXT_TYPE]  : c.JSON_NO_VALUE;
        let diff     = outputs[c.JSON_TEXT_DIFF]    != '' ? outputs[c.JSON_TEXT_DIFF]  : c.JSON_NO_VALUE;
        let grade    = outputs[c.JSON_TEXT_GRADE]   != '' ? outputs[c.JSON_TEXT_GRADE] : c.JSON_NO_VALUE;

        // score/judgement information
        let perfects = outputs[c.JSON_TEXT_PERFECT] != '' ? parseInt(outputs[c.JSON_TEXT_PERFECT]) : c.JSON_NO_VALUE;
        let greats   = outputs[c.JSON_TEXT_GREAT]   != '' ? parseInt(outputs[c.JSON_TEXT_GREAT])   : c.JSON_NO_VALUE;
        let goods    = outputs[c.JSON_TEXT_GOOD]    != '' ? parseInt(outputs[c.JSON_TEXT_GOOD])    : c.JSON_NO_VALUE;
        let bads     = outputs[c.JSON_TEXT_BAD]     != '' ? parseInt(outputs[c.JSON_TEXT_BAD])     : c.JSON_NO_VALUE;
        let misses   = outputs[c.JSON_TEXT_MISS]    != '' ? parseInt(outputs[c.JSON_TEXT_MISS])    : c.JSON_NO_VALUE;
        let combo    = outputs[c.JSON_TEXT_COMBO]   != '' ? parseInt(outputs[c.JSON_TEXT_COMBO])   : c.JSON_NO_VALUE;
        let score    = outputs[c.JSON_TEXT_SCORE]   != '' ? parseInt(outputs[c.JSON_TEXT_SCORE])   : c.JSON_NO_VALUE;

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
                value: `\`\`\`GAME ID: ${user}\nGRADE: ${grade}\n\nUPLOADED:\n\t${uploadDate}, ${uploadTime}\`\`\``
            }
        );

        // EMBED: add fields to display judgements, combo, and total score
        format_scores(embed, perfects, greats, goods, bads, misses);
        embed.addFields(
            {
                name: "MAX COMBO",
                value: `\`\`\`${combo.toString()}\`\`\``
            },
            {
                name: "TOTAL SCORE",
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
    });
};