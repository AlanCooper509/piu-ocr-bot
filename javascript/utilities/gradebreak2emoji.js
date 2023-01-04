module.exports = (break_on) => {
    switch (break_on) {
        case -1:
            return '';
        case 0:
            return '💔';
        case 1:
            return '✅';
        default:
            return '';
    }
}