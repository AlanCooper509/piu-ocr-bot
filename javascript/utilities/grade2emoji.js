module.exports = (grade) => {
    switch (grade) {
        case "A":
            return '';
        case "S":
            return '⭐';
        case "SS":
            return '🌟';
        case "SSS":
            return '🏆';
        default:
            return '';
    }
}