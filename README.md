# piu-ocr-bot 

> "write a real readme"<br> 
> \- *EpikWaffle*

## Python
Driver Code: `readscores.py`

#### Required Input Args:
- `arg[0]`: URL path to image, or the file name (with extension) in `input_images` directory if LOCAL is passed in
Option Input Args:
- `arg[1]`: `LOCAL` or `DEBUG`
- `arg[2]`: `LOCAL` or `DEBUG`

`LOCAL` treats the `arg[0]` as a filename rather than a URL, and `DEBUG` puts a bunch of print statements to console for debugging purposes.

## NodeJS with DiscordJS (v14.6.0)
#### Update Slash Commands:
`deploy-commands.js` to quickly register updates to slash commands if needed

#### Driver Codes:
`node bot.js` to startup the bot and setup the listeners
