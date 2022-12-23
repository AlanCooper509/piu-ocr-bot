// npm install discord.js@14.6.0

const Discord = require("discord.js");
const spawn = require("child_process").spawn;

// local imports
const c = require("../../resources/constants.js");
const read_process = require("./read_process.js");

module.exports = (input) => {
    if (![c.COMMAND, c.MESSAGE].includes(input.constructor.name)) {
        console.log(`${input.constructor.name}: Object input type not recognized`);
        return;
    }

    let attachmentURL = '';
    switch (input.constructor.name) {
        case c.COMMAND:
            input.deferReply();
            attachmentURL = input.options.getAttachment(c.COMMAND_READ_SCORE_ATTACHMENT_OPTION_NAME).url;
            break;
        case c.MESSAGE:
            if (input.attachments.size == 0) {
                input.react('❌');
                console.log(`${c.COMMAND_READ}: IMAGE NOT FOUND`);
                return;
            }
            attachmentURL = input.attachments.first().url;
            input.react('🔎').then(replyMessage => setTimeout(() => input.react('🤔'), 5000));
            break;
    }

    console.log(`OCR processing: ${attachmentURL}`);
    const pythonProcess = spawn('python', ["../python/readscores.py", attachmentURL]);
    pythonProcess.stdout.on('data', (data) => {
        console.log(`OCR success: ${attachmentURL}`);
        let timestamp = new Date();

        // output retrieval from OCR script
        let outputs = JSON.parse(data.toString());
        read_process(input, outputs, timestamp, attachmentURL);
    });
};