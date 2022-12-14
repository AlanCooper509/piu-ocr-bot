// local imports
const c = require("../resources/constants.js");

// define listener(s)
module.exports = (embed, referenceEmbedField, timestamp) => {
        let modText = "LAST MODIFIED:";
        let update = "";

        let uploadDate = timestamp.toLocaleDateString();
        let uploadTime = timestamp.toLocaleTimeString();
        
        if (referenceEmbedField.value.includes(modText)) {
            let strIndex = referenceEmbedField.value.indexOf(modText) + modText.length;
            update = referenceEmbedField.value.substring(0, strIndex);
            update += `\n\t${uploadDate}, ${uploadTime}\`\`\``;
        } else {
            // remove the backticks ending the codeblock and reapply them after the added part
            update = referenceEmbedField.value.substring(0, referenceEmbedField.value.length - 3) + `\n\n${modText}\n\t${uploadDate}, ${uploadTime}\`\`\``;
        }

        embed.addFields(
            {
                name: referenceEmbedField.name,
                value: update,
                inline: referenceEmbedField.inline
            }
        );
}