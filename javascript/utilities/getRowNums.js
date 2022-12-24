module.exports = (fields) => {
    /**
     * Expected input:
     *     Discord.Embed fields array
     **/
    let rowNums = [];
    for (let i = 0; i < fields.length; i++) {
        let name = fields[i].name.replaceAll(/>|`|\s/g, '');
        
        // guard clause: ensure each embed field name (title) starts with a number
        if (!/^\d+/.test(name)) { continue; }

        // grab the first number in the field's name as the row number
        rowNums.push(name.match(/\d+/)[0]);
    }
    return rowNums;
}