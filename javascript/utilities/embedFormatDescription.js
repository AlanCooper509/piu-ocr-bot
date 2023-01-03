module.exports = (chartName, chartType, chartDiff, breakOn) => {
        let pass = breakOn == 1 ? '✅ ' : breakOn == 0 ? '💔 ' : '';
        return `**${chartName}**\n${pass}*${chartType} ${chartDiff}*`;
}