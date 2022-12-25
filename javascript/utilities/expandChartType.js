// NOTE: these should match the python/resources/constants: CHART_TYPES values
module.exports = (chartType) => {
    switch (chartType.toUpperCase()) {
        case "D":
            return "DOUBLE";
        case "S":
            return "SINGLE";
        case "DP":
            return "DOUBLE P.";
        case "SP":
            return "SINGLE P.";
        case "CO-OP":
            return "CO-OP";
        case "?":
            return "UNKNOWN";
        default:
            return chartType.toUpperCase();
    }
}