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
            ingestImage(input, attachmentURL);
            break;
        case c.MESSAGE:
            if (input.attachments.size == 0) {
                input.react('❌');
                console.log(`${c.COMMAND_READ}: IMAGE NOT FOUND`);
                return;
            }
            if (input.attachments.size > 100) {
                input.react('❌');
                console.log(`${c.COMMAND_READ}: OVER 100 IMAGES`);
                return;
            }

            let promises = [];
            id = input.id.slice(0, input.id.length - 3);
            let iterator = 0;
            input.attachments.forEach(attachment => {
                console.log(attachment.url);
                customID = id + iterator.toString();
                promises.push(ingestPromise(input, attachment.url, customID));
                iterator++;
            });

            Promise.all(promises).then(() => {
                // finished all images
                console.log(`finished saving ${input.attachments.size} images from ${input.author.id}.`);
            });
            input.react('🔎').then(replyMessage => setTimeout(() => input.react('🤔'), 5000));
            break;
    }
    
    function ingestPromise(input, imageURL, customID) {
        return new Promise((resolve, reject) => {
            ingestImage(input, imageURL, customID, resolve, reject);
        });
    }
    
    function ingestImage(input, imageURL, customID = null, resolve = null, reject = null) {
        console.log(`OCR processing: ${imageURL}`);
        const pythonProcess = spawn('python', ["../python/readscores.py", imageURL]);
        pythonProcess.stdout.on('data', (data) => {
            console.log(`OCR success: ${imageURL}`);
            let timestamp = new Date();

            // output retrieval from OCR script
            let outputs = JSON.parse(data.toString());
            read_process(input, outputs, timestamp, imageURL, customID);

            if (resolve) {
                resolve();
            }
        });
    }
};