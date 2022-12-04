// npm install discord.js@14.6.0

const Discord = require("discord.js");
const spawn = require("child_process").spawn;

// define listener(s)
module.exports = (message) => {
    if (message.attachments.size == 0) {
        console.log(`${c.COMMAND_READ}: IMAGE NOT FOUND`);
        return;
    }

    let messageAttachment = message.attachments.first().url;
    let embed = new Discord.EmbedBuilder();
    embed.setAuthor({
        name: message.author.tag,
        iconURL: message.author.avatarURL()
    });
    embed.setImage(messageAttachment);
    embed.setColor(14680086);
    embed.setDescription('Some description here');
    embed.addFields(
        { name: 'Regular field title', value: 'Some value here' },
        { name: '\u200B', value: '\u200B' },
        { name: 'Inline field title', value: 'Some value here', inline: true },
        { name: 'Inline field title', value: 'Some value here', inline: true },
    );
    console.log(`OCR processing: ${messageAttachment}`);
    const pythonProcess = spawn('python', ["../python/readscores.py", messageAttachment]);
    pythonProcess.stdout.on('data', (data) => {
        console.log(`OCR success: ${messageAttachment}`);
        embed.addFields({ name: 'readscores.py', value: data.toString() });
        message.channel.send({ embeds: [embed] });
        message.delete();
    });
};