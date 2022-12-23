// NOTE: these should match the python/resources/constants: CHART_TYPES values
module.exports = (chartType) => {
    switch (chartType.toUpperCase()) {
        case "DOUBLE":
            return "D";
        case "SINGLE":
            return "S";
        case "DOUBLE P.":
            return "DP";
        case "SINGLE P.":
            return "SP";
        case "CO-OP":
            return "CO-OP";
        case "UNKNOWN":
            return "?";
        default:
            return chartType.toUpperCase();
    }
}