# piu-ocr-bot 

> "write a real readme"<br> 
> \- *EpikWaffle*

## Python (v3.10.7) with EasyOCR (v1.6.2)
#### Driver Code:
`readscores.py` with input args

#### Required Input Arg:
- `arg[0]`: URL path to an image, or the file name (with extension) found in the `input_images` directory if `LOCAL` is passed in. Image should only show one side's score (half of the screen) to function properly

#### Optional Input Args:
- `arg[1]`: `LOCAL` or `DEBUG`
- `arg[2]`: `LOCAL` or `DEBUG`

`LOCAL` treats the `arg[0]` as a file name rather than a URL, and `DEBUG` puts a bunch of print statements to console for debugging purposes.

#### Output:
prints the player's Game ID, Chart Name, PERFECT/GREAT/GOOD/BAD/MISS count, MAX COMBO, and TOTAL SCORE based on the input image.

## NodeJS (v16.17.1) with DiscordJS (v14.6.0)
#### Update Slash Commands:
`node deploy-commands.js` to quickly register updates to slash commands if needed

#### Driver Code:
`node bot.js` to startup the bot and setup the listeners
