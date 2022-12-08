// local imports
const c = require("../resources/constants.js");

// define listener(s)
module.exports = (embed, perfects, greats, goods, bads, misses) => {
        let mostDigits = Math.max(perfects.toString().length, greats.toString().length, goods.toString().length, bads.toString().length, misses.toString().length);
        let padding = 25;
        let perfectRow = `${c.EMBED_SUBFIELD_PERFECT} ${'-'.repeat(padding - mostDigits)}${' '.repeat(1 + mostDigits - perfects.toString().length)}${perfects.toString()}`;
        let greatRow =   `${c.EMBED_SUBFIELD_GREAT} ${'-'.repeat(padding + 2 - mostDigits)}${' '.repeat(1 + mostDigits - greats.toString().length)}${greats.toString()}`;
        let goodRow =    `${c.EMBED_SUBFIELD_GOOD} ${'-'.repeat(padding + 3 - mostDigits)}${' '.repeat(1 + mostDigits - goods.toString().length)}${goods.toString()}`;
        let badRow =     `${c.EMBED_SUBFIELD_BAD} ${'-'.repeat(padding + 4 - mostDigits)}${' '.repeat(1 + mostDigits - bads.toString().length)}${bads.toString()}`;
        let missRow =    `${c.EMBED_SUBFIELD_MISS} ${'-'.repeat(padding + 3 - mostDigits)}${' '.repeat(1 + mostDigits - misses.toString().length)}${misses.toString()}`;

        embed.addFields(
            {
                name: c.EMBED_FIELD_SCORES,
                value: `\`\`\`${perfectRow}\n${greatRow}\n${goodRow}\n${badRow}\n${missRow}\`\`\``
            }
        );
}