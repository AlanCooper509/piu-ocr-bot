// npm install discord.js@14.6.0

const Discord = require("discord.js");
const spawn = require("child_process").spawn;

// local imports
const c = require("../../resources/constants.js");
const read_respond = require("./read_respond.js");

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

        // output retrieval from OCR script
        let outputs = JSON.parse(data.toString());
        read_respond(input, outputs, timestamp, attachmentURL);
    });
};