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

## NodeJS (v16.17.1) with DiscordJS (v14.6.0) and SQLite3(v5.1.4)
### Bot Setup

- #### Update Slash Commands:
    - `node deploy-commands.js` to quickly register updates to slash commands if needed

- #### Driver Code:
    - `node bot.js` to startup the bot and setup the listeners

### Currently Supported Commands/Features (as of 12/22/22):
One purpose of utilizing Discord is as an interface for performing CRUD (Create/Read/Update/Delete) operations.
- `/save <image upload>`: write to a back-end DB and display the play details as a Discord Embed (CREATE)
    - Button Interactions: `SCORES` / `CHART/USER` / `COMBO` / `TOTAL` for editing a specific DB entry and the displayed Discord Embed (UPDATE)
- `/show play <play_id>`: retrieve a play from back-end DB and display the play details as a Discord Embed (READ)
    - Button Interactions: `SCORES` / `CHART/USER` / `COMBO` / `TOTAL` for editing the specific DB entry and the displayed Discord Embed (UPDATE)
- `/show user <user_id> ((optional) chart <filtered_chart_name>)`: retrieves all user plays (optionally of a specific chart) by most recent and displays them as paginated results in a Discord Embed (READ)
- `/hey` [hey!!](https://i.ytimg.com/vi/YknOygHNv1U/maxresdefault.jpg)
