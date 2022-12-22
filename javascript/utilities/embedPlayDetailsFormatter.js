const c = require("../resources/constants.js");

module.exports = (user, grade) => {
    return `${c.EMBED_SUBFIELD_GAME_ID}: ${user}\n` + 
           `${c.EMBED_SUBFIELD_GRADE}: ${grade}\n`
}