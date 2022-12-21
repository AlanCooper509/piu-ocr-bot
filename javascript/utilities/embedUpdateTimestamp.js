// local imports
const c = require("../resources/constants.js");

// define listener(s)
module.exports = (embed, referenceEmbedField, timestamp) => {
        let update = "";
        let referenceFooter = referenceEmbedField.footer.text;

        if (referenceFooter.includes(c.EMBED_SUBFIELD_MODIFIED)) {
            let strIndex = referenceFooter.indexOf(c.EMBED_SUBFIELD_MODIFIED) + (c.EMBED_SUBFIELD_MODIFIED).length;
            update = referenceFooter.substring(0, strIndex);
        } else {
            update = referenceFooter + `\n${c.EMBED_SUBFIELD_MODIFIED}`;
        }

        update += ":\t " + 
            new Date(timestamp).toLocaleTimeString([], {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                    hour: 'numeric',
                    minute: 'numeric'
                });

        embed.setFooter({text: update});
        
        return embed;
}