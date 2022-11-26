// define listener(s)
module.exports = (client, message) => {
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
};