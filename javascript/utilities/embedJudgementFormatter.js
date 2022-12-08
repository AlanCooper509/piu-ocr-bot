// local imports
const c = require("../resources/constants.js");

// define listener(s)
module.exports = (embed, perfects, greats, goods, bads, misses) => {
        let padding = 25;
        let perfectRow = `${c.EMBED_SUBFIELD_PERFECT} ${'-'.repeat(padding - perfects.toString().length)} ${perfects.toString()}`;
        let greatRow =   `${c.EMBED_SUBFIELD_GREAT} ${'-'.repeat(padding + 2 - greats.toString().length)} ${greats.toString()}`;
        let goodRow =    `${c.EMBED_SUBFIELD_GOOD} ${'-'.repeat(padding + 3 - goods.toString().length)} ${goods.toString()}`;
        let badRow =     `${c.EMBED_SUBFIELD_BAD} ${'-'.repeat(padding + 4 - bads.toString().length)} ${bads.toString()}`;
        let missRow =    `${c.EMBED_SUBFIELD_MISS} ${'-'.repeat(padding + 3 - misses.toString().length)} ${misses.toString()}`;

        embed.addFields(
            {
                name: c.EMBED_FIELD_SCORES,
                value: `\`\`\`${perfectRow}\n${greatRow}\n${goodRow}\n${badRow}\n${missRow}\`\`\``
            }
        );
}