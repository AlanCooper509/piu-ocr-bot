const Discord = require("discord.js");
const spawn = require("child_process").spawn;

// define listener(s)
module.exports = (client, message) => {
    // handle image attachments
    if (message.attachments.size > 0) {
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
        console.log(`processing ${messageAttachment}`);
        const pythonProcess = spawn('python', ["../python/readscores.py", messageAttachment]);
        pythonProcess.stdout.on('data', (data) => {
            console.log(`success ${messageAttachment}:`);
            embed.addFields({ name: 'readscores.py', value: data.toString() });
            message.channel.send({ embeds: [embed] });
            message.delete();
        });
    } else {
        const prefix = '!'

        //if our message doesnt start with our defined prefix, dont go any further into function
        if(!message.content.startsWith(prefix)) {
            console.log('no prefix');
            return;
        }

        //slices off prefix from our message, then trims extra whitespace, then returns our array of words from the message
        const args = message.content.slice(prefix.length).trim().split(' ');

        //splits off the first word from the array, which will be our command
        const command = args.shift().toLowerCase();
        //log the command
        console.log('command: ', command);
        //log any arguments passed with a command
        console.log(args);
    }
};