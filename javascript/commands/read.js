// npm install discord.js@14.6.0

const Discord = require("discord.js");
const spawn = require("child_process").spawn;

// local imports
const c = require("../resources/constants.js");

// define listener(s)
module.exports = (message) => {
    if (message.attachments.size == 0) {
        console.log(`${c.COMMAND_READ}: IMAGE NOT FOUND`);
        return;
    }

    let messageAttachment = message.attachments.first().url;
    console.log(`OCR processing: ${messageAttachment}`);
    const pythonProcess = spawn('python', ["../python/readscores.py", messageAttachment]);
    pythonProcess.stdout.on('data', (data) => {
        console.log(`OCR success: ${messageAttachment}`);

        let embed = new Discord.EmbedBuilder();
        embed.setAuthor({
            name: message.author.tag,
            iconURL: message.author.avatarURL()
        });
        embed.setImage(messageAttachment);
        embed.setColor(14680086);
        embed.setDescription('Some description here');
        /*
        embed.addFields(
            { name: 'Regular field title', value: 'Some value here' },
            { name: '\u200B', value: '\u200B' },
            { name: 'Inline field title', value: 'Some value here', inline: true },
            { name: 'Inline field title', value: 'Some value here', inline: true },
        );
        */
        embed.addFields(
            { name: 'readscores.py', value: data.toString() }
        );

        // Button for triggering edits
        const row = new Discord.ActionRowBuilder()
            .addComponents(
                new Discord.ButtonBuilder()
                    .setCustomId(c.DEV_MODAL_EDIT_SCORES_BUTTON)
                    .setLabel('⚖️ SCORES')
                    .setStyle(Discord.ButtonStyle.Success),
                // TODO: not yet implemented in interactionCreate.js
                new Discord.ButtonBuilder()
                    .setCustomId("NOT YET IMPLEMENTED1")
                    .setLabel('🔗 COMBO')
                    .setStyle(Discord.ButtonStyle.Secondary),
                // TODO: not yet implemented in interactionCreate.js
                new Discord.ButtonBuilder()
                    .setCustomId("NOT YET IMPLEMENTED2")
                    .setLabel('💯 TOTAL')
                    .setStyle(Discord.ButtonStyle.Primary)
            );

        message.channel.send({ embeds: [embed], components: [row] });
        message.delete();
    });
};