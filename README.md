# piu-ocr-bot 

> "write a real readme"<br> 
> \- *EpikWaffle, 10/18/22*

## Python (v3.10.7) with EasyOCR (v1.6.2)
#### Driver Code:
`readscores.py [<image_url>] ((optional) LOCAL) ((optional) DEBUG)`

#### Required Input Arg:
- `arg[0]`: URL path to an image, or the file name (with extension) found in the `input_images` directory if `LOCAL` is passed in. Image should only show one side's score (half of the screen) to function properly

#### Optional Input Args:
- `arg[1]`: `LOCAL` or `DEBUG`
- `arg[2]`: `LOCAL` or `DEBUG`

`LOCAL` treats the `arg[0]` as a file name to grab from the `input_images` directory rather than a URL, and `DEBUG` puts a bunch of print statements to console for debugging purposes.

#### Output:
prints the player's Game ID, Chart Name, PERFECT/GREAT/GOOD/BAD/MISS count, MAX COMBO, and TOTAL SCORE based on the input image.

## NodeJS (v16.17.1) with DiscordJS (v14.6.0) and SQLite3(v5.1.4)
### Bot Setup

- #### .env file:
    - You should probably know what this is already if you're setting this up yourself. Add this file into the javascript directory. You'll want these fields:
        - `BOT_TOKEN`: discord bot token
        - `CLIENT_ID`: used for deploying slash commands
        - `GUILD_ID`: name of guild id to deploy commands to
        - `DB_NAME`: name of your db file
        - `DB_SCORES_TABLE`: name of scores table in db file
        - `DB_USERS_TABLE`: name of users table in db file
        - `DB_TOURNEY_TABLE`: name of tourney table in db file
        - `DB_GROUPS_TABLE`: name of groups table in db file

- #### Update Slash Commands:
    - `node deploy-commands.js` to quickly register updates to slash commands if needed

- #### db table setup:
    - `node database-setup.js` to setup a db table. Note this requires fields from the .env file that should be in the same `javascript` level directory as this script

- #### Driver Code:
    - `node bot.js` to startup the bot and setup the listeners

### Currently Supported Commands/Features (as of 03/13/23):

#### CRUD opterations
One purpose of utilizing Discord is as an interface for performing CRUD (Create/Read/Update/Delete) operations.
- `/save <image upload>`: write to a back-end DB and display the play details as a Discord Embed (CREATE/READ)
    - Button Interactions: `SCORES` / `CHART/USER` / `COMBO` / `TOTAL` / `DELETE` for editing a specific DB entry and the displayed Discord Embed (UPDATE/DELETE)
- `/show play <play_id>`: retrieve a play from back-end DB and display the play details as a Discord Embed (READ)
    - Button Interactions: `SCORES` / `CHART/USER` / `COMBO` / `TOTAL` / `DELETE` for editing the specific DB entry and the displayed Discord Embed (UPDATE/DELETE)
- `/show player <game_id> ((optional) chart <filtered_chart_name>) ((optional) type <chart_type>)`: retrieves all user plays (optionally of a specific chart/type) by most recent (or by highest total score if chart filter is present) and displays them as paginated results in a Discord Embed (READ)
    - user may then SELECT a row number from the paginated results to display details on a specific play, identical to calling `/show play <play_id>`
- `/show server <chart_name> ((optional) difficulty <chart_type>) ((optional) <boolean:all_uploads>)`: retrieves all of the Discord server's users' plays (optionally of a specific type/difficulty) by highest total score (regardless if difficulty filter is present) and displays them as paginated results in a Discord Embed (READ)
    - user may then SELECT a row number from the paginated results to display details on a specific play, identical to calling `/show play <play_id>`
    - if `<boolean:all_uploads>` is set to `False`, only the scores uploaded to the specified server are retrieved.

#### Misc. Features:
- `/name ((optional) <game_id>)`: sets the Discord user's default `<game_id>` (PIU AM Pass IGN) to use when uploading any future score images via `/save <image upload>`. This takes priority over whatever OCR detects upon upload. Not supplying the `<game_id>` removes any default `<game_id>` that may be already set for the user.
- `/tourney` has several subvariants for creating or viewing a tourney, where a chart is specified with a start and end date for "collecting" submissions automatically: 
    - `/tourney create <chart_name> <difficulty> <start_date> <end_date>`: sets up a server-wide tourney on a single chart
    - `/tourney group <name>`: creates an empty tourney group for adding in existing single chart tourney ids from within the same server. A button interaction accompanying the reply allows for pulling up a modal for adding tourney ID's to associate with the new group. If the tourney group already exists, it shows a leaderboard for this tourney group.
    - `/tourney view <tourney_id>` AKA `/show tourney <tourney_id>`: shows a server-wide score leaderboard that matches the tourney or tourney group filters and displays each user's highest score or cumulative highest scores during the tourney period(s).
    - `/tourney all ((optional) boolean:active)` AKA `/show tourneys ((optional) boolean:active)`: shows all single chart tourneys in the server. Only shows active tourneys if `active` is true (also enabled by default).
- `/export`: writes all DB scores uploaded by the Discord user (across all servers) into a (hidden) CSV file that can be downloaded
- `/hey` [hey!!](https://i.ytimg.com/vi/YknOygHNv1U/maxresdefault.jpg)

#### Misc. Notes:
- filtering chart names support partial matching, such as `/show server chart_name:The Quick Brow...` to pull up "The Quick Brown Fox Jumps Over the Lazy Dog"
- there are implicit message commands implemented that are almost identical to the slash commands listed above
- while hosting on Oracle 8 VM, useful setup links:
    - https://yum.oracle.com/oracle-linux-python.html#InstallFromAppStream "Installing Python on Oracle Linux 8 via AppStream Modules"
    - https://yum.oracle.com/oracle-linux-nodejs.html "Installing and updating Node.js - Oracle Linux 8"
- I had to comment out line 48 of `discord.js/src/client/actions/InteractionCreate.js`, no idea why it decided to stop recognizing `channel.isTextBased()` as a method.

#### Planned:
- break on/off support on the OCR side (currently just has emojis to manually toggle a score as break on/off after uploading)
- chat name approximate matching in post-processing of OCR (probably from python side)
- vs mode screenshot support (python side)
