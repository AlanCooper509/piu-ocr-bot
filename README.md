# piu-ocr-bot 

> "write a real readme"<br> 
> \- *EpikWaffle, 10/18/22*

## Python (v3.10.7) with EasyOCR (v1.6.2)
#### Driver Code:
`readscores.py` [<image_url>] ((optional) LOCAL) ((optional) DEBUG)

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

#### CRUD opterations
One purpose of utilizing Discord is as an interface for performing CRUD (Create/Read/Update/Delete) operations.
- `/save <image upload>`: write to a back-end DB and display the play details as a Discord Embed (CREATE)
    - Button Interactions: `SCORES` / `CHART/USER` / `COMBO` / `TOTAL` / `DELETE` for editing a specific DB entry and the displayed Discord Embed (UPDATE/DELETE)
- `/show play <play_id>`: retrieve a play from back-end DB and display the play details as a Discord Embed (READ)
    - Button Interactions: `SCORES` / `CHART/USER` / `COMBO` / `TOTAL` / `DELETE` for editing the specific DB entry and the displayed Discord Embed (UPDATE/DELETE)
- `/show player <game_id> ((optional) chart <filtered_chart_name>) ((optional) type <chart_type>)`: retrieves all user plays (optionally of a specific chart/type) by most recent (or by highest total score if chart filter is present) and displays them as paginated results in a Discord Embed (READ)
    - user may then SELECT a row number from the paginated results to display details on a specific play, identical to calling `/show play <play_id>`

#### Misc. Features:
- `/name ((optional) <game_id>)`: sets the Discord user's default `<game_id>` (PIU AM Pass IGN) to use when uploading any future score images. This takes priority over whatever OCR detects upon upload. Not supplying the `<game_id>` removes any default `<game_id>` that may be already set for the user.
- `/hey` [hey!!](https://i.ytimg.com/vi/YknOygHNv1U/maxresdefault.jpg)
