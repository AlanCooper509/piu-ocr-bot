const c = require("../resources/constants.js");

module.exports = (user, grade, status = -1) => {
    return `${c.EMBED_SUBFIELD_GAME_ID}: ${user}\n` + 
           `${c.EMBED_SUBFIELD_GRADE}: ${grade} ${status == 1 ? "(BREAK ON)" : status == 0 ? "(BREAK OFF)" : ''}\n`
}