exports.COMMAND_HEY = "hey";
exports.COMMAND_HEY_DESC = "HEY!!";

exports.COMMAND_READ = "save";
exports.COMMAND_READ_DESC = "Upload your PIU XX score!";
exports.COMMAND_READ_SCORE_ATTACHMENT_OPTION_NAME = "score";
exports.COMMAND_READ_SCORE_ATTACHMENT_OPTION_DESC = "upload your results screen here";

exports.COMMAND_SHOW = "show";
exports.COMMAND_SHOW_DESC = "Show a specific play, user, or chart!";
exports.COMMAND_SHOW_SUBCOMMAND_PLAY = "play";
exports.COMMAND_SHOW_SUBCOMMAND_PLAY_DESC = "Show a specific play";
exports.COMMAND_SHOW_SUBCOMMAND_PLAY_ID_NAME = "play_id";
exports.COMMAND_SHOW_SUBCOMMAND_PLAY_ID_DESC = "the play id to show";
exports.COMMAND_SHOW_SUBCOMMAND_USER = "player";
exports.COMMAND_SHOW_SUBCOMMAND_USER_DESC = "Show a specific PIU user's plays";
exports.COMMAND_SHOW_SUBCOMMAND_USER_ID_NAME = "game_id";
exports.COMMAND_SHOW_SUBCOMMAND_USER_ID_DESC = "the IGN of the PIU player to show";
exports.COMMAND_SHOW_SUBCOMMAND_USER_TITLE_NAME = "filtered_chart_name";
exports.COMMAND_SHOW_SUBCOMMAND_USER_TITLE_DESC = "filter for a specific chart";
exports.COMMAND_SHOW_SUBCOMMAND_USER_DIFF_NAME = "chart_type";
exports.COMMAND_SHOW_SUBCOMMAND_USER_DIFF_DESC = "examples: D21, S14, SP8, CO-OP";
exports.COMMAND_SHOW_SUBCOMMAND_CHART = "server";
exports.COMMAND_SHOW_SUBCOMMAND_CHART_DESC = "Show all of the server's plays on a speicifc chart";
exports.COMMAND_SHOW_SUBCOMMAND_CHART_TITLE_NAME = "chart_name";
exports.COMMAND_SHOW_SUBCOMMAND_CHART_TITLE_DESC = "the name of the chart to show";
exports.COMMAND_SHOW_SUBCOMMAND_CHART_DIFF_NAME = "difficulty";
exports.COMMAND_SHOW_SUBCOMMAND_CHART_DIFF_DESC = "examples: D21, S14, SP8, CO-OP";
exports.COMMAND_SHOW_SUBCOMMAND_CHART_ALL_NAME = "all_uploads";
exports.COMMAND_SHOW_SUBCOMMAND_CHART_ALL_DESC = "'True' for this server's users' uploads (across all servers). 'False' for server-specific uploads."

exports.COMMAND_NAME = "name";
exports.COMMAND_NAME_DESC = "Set your Game ID automatically for future uploads!";
exports.COMMAND_NAME_SUBCOMMAND_USER_ID_NAME = "game_id";
exports.COMMAND_NAME_SUBCOMMAND_USER_ID_DESC = "the IGN of your AM Pass card";

exports.COMMAND_EXPORT = "export";
exports.COMMAND_EXPORT_DESC = "Returns all of your saved plays as a downloadable CSV!";

exports.COMMAND_TOURNEY = "tourney";
exports.COMMAND_TOURNEY_DESC = "View or setup a server-wide tourney on a specific chart!";
exports.COMMAND_TOURNEY_SUBCOMMAND_CREATE = "create";
exports.COMMAND_TOURNEY_SUBCOMMAND_CREATE_DESC = "Setup a server-wide tourney on a specific chart!";
exports.COMMAND_TOURNEY_SUBCOMMAND_VIEW = "view";
exports.COMMAND_TOURNEY_SUBCOMMAND_VIEW_DESC = "View a server-wide tourney on a specific chart!";
exports.COMMAND_TOURNEY_SUBCOMMAND_VIEW_ID_NAME = "tourney_id";
exports.COMMAND_TOURNEY_SUBCOMMAND_VIEW_ID_DESC = "the tourney id to show";
exports.COMMAND_TOURNEY_SUBCOMMAND_CHART_TITLE_NAME = "chart_name";
exports.COMMAND_TOURNEY_SUBCOMMAND_CHART_TITLE_DESC = "the name of the chart for competition";
exports.COMMAND_TOURNEY_SUBCOMMAND_CHART_DIFF_NAME = "difficulty";
exports.COMMAND_TOURNEY_SUBCOMMAND_CHART_DIFF_DESC = "examples: D21, S14, SP8, CO-OP";
exports.COMMAND_TOURNEY_SUBCOMMAND_START_NAME = "start_date";
exports.COMMAND_TOURNEY_SUBCOMMAND_START_DESC = "start of tourney 'yyyy-mm-dd hh:mm:ss'";
exports.COMMAND_TOURNEY_SUBCOMMAND_END_NAME = "end_date";
exports.COMMAND_TOURNEY_SUBCOMMAND_END_DESC = "end of tourney 'yyyy-mm-dd hh:mm:ss'";

// Embed field names or keyword strings created using Discord.EmbedBuilder() and accessed whenever updating or reading the embed
exports.EMBED_FIELD_PLAY_DETAILS = "PLAY DETAILS";
exports.EMBED_FIELD_MAX_COMBO    = "MAX COMBO";
exports.EMBED_FIELD_TOTAL_SCORE  = "TOTAL SCORE";
exports.EMBED_FIELD_SCORES       = "SCORES";
exports.EMBED_FIELD_RECORD_ID    = "RECORD ID";
exports.EMBED_FIELD_RECENT       = "RECENT PLAYS";
exports.EMBED_SUBFIELD_GAME_ID   = "GAME ID";
exports.EMBED_SUBFIELD_GRADE     = "GRADE";
exports.EMBED_SUBFIELD_UPLOADED  = "UPLOADED";
exports.EMBED_SUBFIELD_MODIFIED  = "LAST MODIFIED";
exports.EMBED_SUBFIELD_PERFECT   = "PERFECT";
exports.EMBED_SUBFIELD_GREAT     = "GREAT";
exports.EMBED_SUBFIELD_GOOD      = "GOOD";
exports.EMBED_SUBFIELD_BAD       = "BAD";
exports.EMBED_SUBFIELD_MISS      = "MISS";
exports.EMBED_EMOJI_BREAK_ON     = "✅";
exports.EMBED_EMOJI_BREAK_OFF    = "💔";

// Button ID's created using Discord.ButtonBuilder() and accessed by interaction.customId
exports.DEV_MODAL_EDIT_SCORES_BUTTON_ID = "editScoresButton";
exports.DEV_MODAL_EDIT_COMBO_BUTTON_ID = "editComboButton";
exports.DEV_MODAL_EDIT_TOTAL_BUTTON_ID = "editTotalButton";
exports.DEV_MODAL_EDIT_INFO_BUTTON_ID = "editInfoButton";
exports.DEV_MODAL_EDIT_DELETE_BUTTON_ID = "editDeleteButton";
exports.PAGE_PREV_BUTTON_ID = "paginateLeftButton";
exports.PAGE_NEXT_BUTTON_ID = "paginateRightButton";
exports.PAGE_SELECT_BUTTON_ID = "selectRowButton";

// Modal ID's created using Discord.ModalBuilder() and accessed by interaction.customId
exports.DEV_MODAL_EDIT_SCORES_ID = "editScoreModal";
exports.DEV_MODAL_EDIT_COMBO_ID = "editComboModal";
exports.DEV_MODAL_EDIT_TOTAL_ID = "editTotalModal";
exports.DEV_MODAL_EDIT_INFO_ID = "editInfoModal";
exports.DEV_MODAL_EDIT_DELETE_ID = "editDeleteModal";
exports.DEV_MODAL_SELECT_ID = "selectRowModal";

// Modals' User-Input Text Field ID's created using Discord.TextInputBuilder() and accessed by interaction.fields.getTextInputValue();
modalTextPerfectId = "perfectInput";
modalTextGreatId   = "greatInput";
modalTextGoodId    = "goodInput";
modalTextBadId     = "badInput";
modalTextMissId    = "missInput";
exports.DEV_MODAL_EDIT_TOTAL_TEXT_ID      = "totalInput";
exports.DEV_MODAL_EDIT_COMBO_TEXT_ID      = "comboInput";
exports.DEV_MODAL_EDIT_GAMEID_TEXT_ID     = "gameId";
exports.DEV_MODAL_EDIT_GRADE_TEXT_ID      = "grade";
exports.DEV_MODAL_EDIT_CHART_NAME_TEXT_ID = "chartName";
exports.DEV_MODAL_EDIT_CHART_DIFF_TEXT_ID = "chartDiff";
exports.DEV_MODAL_EDIT_DELETE_TEXT_ID     = "deleteId";
exports.DEV_MODAL_EDIT_SCORES_TEXT_IDS   = [modalTextPerfectId,
                                            modalTextGreatId,
                                            modalTextGoodId,
                                            modalTextBadId,
                                            modalTextMissId];
exports.DEV_MODAL_SELECT_PLAY_ID = "playIdRowSelection";

// JSON parameters taken as output from Python OCR component
exports.JSON_TEXT_USER    = "user";
exports.JSON_TEXT_CHART   = "chart";
exports.JSON_TEXT_TYPE    = "type";
exports.JSON_TEXT_DIFF    = "difficulty";
exports.JSON_TEXT_GRADE   = "grade";
exports.JSON_TEXT_PERFECT = "perfect";
exports.JSON_TEXT_GREAT   = "great";
exports.JSON_TEXT_GOOD    = "good";
exports.JSON_TEXT_BAD     = "bad";
exports.JSON_TEXT_MISS    = "miss";
exports.JSON_TEXT_COMBO   = "max combo";
exports.JSON_TEXT_SCORE   = "total score";
exports.JSON_NO_VALUE     = "!!";

// HEY!!
exports.HEY = { content: '**HEY!!**', files: ['https://i.ytimg.com/vi/YknOygHNv1U/maxresdefault.jpg'] };

// console logging prefixes
exports.DEBUG_INPUT = "[INPUT]";
exports.DEBUG_QUERY = "[QUERY]";

// Discord Object Strings
exports.COMMAND = "ChatInputCommandInteraction";
exports.MESSAGE = "Message";
exports.SUBMIT = "ModalSubmitInteraction";