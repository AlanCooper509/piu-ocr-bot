exports.COMMAND_READ = "read";
exports.COMMAND_READ_DESC = "Upload your PIU XX score!";
exports.COMMAND_READ_SCORE_ATTACHMENT_OPTION_NAME = "score";
exports.COMMAND_READ_SCORE_ATTACHMENT_OPTION_DESC = "upload your results screen here";

// Button ID's created using Discord.ButtonBuilder() and accessed by interaction.customId
exports.DEV_MODAL_EDIT_SCORES_BUTTON_ID = "editScoresButton";
exports.DEV_MODAL_EDIT_COMBO_BUTTON_ID = "editComboButton";
exports.DEV_MODAL_EDIT_TOTAL_BUTTON_ID = "editTotalButton";
exports.DEV_MODAL_EDIT_INFO_BUTTON_ID = "editInfoButton";

// Modal ID's created using Discord.ModalBuilder() and accessed by interaction.customId
exports.DEV_MODAL_EDIT_SCORES_ID = "editScoreModal";
exports.DEV_MODAL_EDIT_COMBO_ID = "editComboModal";
exports.DEV_MODAL_EDIT_TOTAL_ID = "editTotalModal";
exports.DEV_MODAL_EDIT_INFO_ID = "editComboModal";

// Modals' User-Input Text Field ID's created using Discord.TextInputBuilder() and accessed by interaction.fields.getTextInputValue();
modalTextPerfectId = "perfectInput";
modalTextGreatId   = "greatInput";
modalTextGoodId    = "goodInput";
modalTextBadId     = "badInput";
modalTextMissId    = "missInput";
exports.DEV_MODAL_EDIT_SCORES_PERFECT_ID = modalTextPerfectId
exports.DEV_MODAL_EDIT_SCORES_GREAT_ID   = modalTextGreatId
exports.DEV_MODAL_EDIT_SCORES_GOOD_ID    = modalTextGoodId
exports.DEV_MODAL_EDIT_SCORES_BAD_ID     = modalTextBadId
exports.DEV_MODAL_EDIT_SCORES_MISS_ID    = modalTextMissId
exports.DEV_MODAL_EDIT_SCORES_TEXT_IDS   = [modalTextPerfectId,
                                            modalTextGreatId,
                                            modalTextGoodId,
                                            modalTextBadId,
                                            modalTextMissId];

// JSON values taken as output from Python OCR component
exports.JSON_TEXT_PERFECT = "perfect";
exports.JSON_TEXT_GREAT   = "great";
exports.JSON_TEXT_GOOD    = "good";
exports.JSON_TEXT_BAD     = "bad";
exports.JSON_TEXT_MISS    = "miss";
exports.JSON_TEXT_COMBO   = "max combo";
exports.JSON_TEXT_SCORE   = "total score";
exports.JSON_TEXT_USER    = "user";
exports.JSON_TEXT_CHART   = "chart";
exports.JSON_TEXT_TYPE    = "type";
exports.JSON_TEXT_DIFF    = "difficulty";
exports.JSON_TEXT_GRADE   = "grade";
exports.JSON_NO_VALUE     = "???";