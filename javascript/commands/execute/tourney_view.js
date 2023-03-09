// local imports
const c = require("../../resources/constants.js");
const parseChart = require("../../utilities/parseChart.js");
const parseDiff = require("../../utilities/parseDiff.js");

module.exports = (input) => {
    if (![c.COMMAND, c.MESSAGE].includes(input.constructor.name)) {
        console.log(`${input.constructor.name}: Object input type not recognized`);
        return;
    }
    
    let chartName = parseChart(input, c.COMMAND_SHOW_SUBCOMMAND_CHART_TITLE_NAME);
    if (chartName == null) { return; }
    let chartDiff = parseDiff(input, c.COMMAND_SHOW_SUBCOMMAND_CHART_DIFF_NAME);
    
    console.log(`chartName: ${chartName}\nchartDiff: type=${chartDiff.type}, diff=${chartDiff.diff}`);

    let reply = "hey";
    switch (input.constructor.name) {
        case c.COMMAND:
            input.editReply(reply);
            return;
        case c.MESSAGE:
            input.reply(reply);
            return;
    }
}