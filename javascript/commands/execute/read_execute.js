// npm install discord.js@14.6.0

const Discord = require("discord.js");
const spawn = require("child_process").spawn;

// local imports
const c = require("../../resources/constants.js");

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

        // Embed for displaying the reply
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
        embed.setDescription('Some description here');
        embed.addFields(
            { name: 'readscores.py', value: data.toString() }
        );

        // Buttons below the embed for triggering edit actions
        const row = new Discord.ActionRowBuilder()
            .addComponents(
                new Discord.ButtonBuilder()
                    .setCustomId(c.DEV_MODAL_EDIT_SCORES_BUTTON_ID)
                    .setLabel('⚖️ SCORES')
                    .setStyle(Discord.ButtonStyle.Success),
                new Discord.ButtonBuilder()
                    .setCustomId(c.DEV_MODAL_EDIT_COMBO_BUTTON_ID)
                    .setLabel('🔗 COMBO')
                    .setStyle(Discord.ButtonStyle.Secondary),
                new Discord.ButtonBuilder()
                    .setCustomId(c.DEV_MODAL_EDIT_TOTAL_BUTTON_ID)
                    .setLabel('💯 TOTAL')
                    .setStyle(Discord.ButtonStyle.Primary)
            );

        switch (input.constructor.name) {
            case slashObject:
                input.editReply({ embeds: [embed], components: [row] });
                break;
            case messageObject:
                input.reply({ embeds: [embed], components: [row] });
        }
    });
};