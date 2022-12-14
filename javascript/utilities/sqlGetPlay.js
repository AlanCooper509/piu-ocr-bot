// npm install sqlite3@5.1.4
// npm install dotenv@16.0.3

const sqlite3 = require("sqlite3").verbose();
require("dotenv").config();

// local imports
const c = require("../resources/constants.js");

/**
 * Run a Promise-wrapped SQL query to return a single row from the score entry table
 * - the row is retrieved using the PRIMARY KEY (id)
 * - resolves with the row as a simple JS object, or null (undefined) if a row is not found
 */
module.exports = (entryID) => {
    return new Promise((resolve, reject) => {
        const db = new sqlite3.Database(process.env.DB_NAME, (err) => {
            if (err) {
                console.error(err.message);
                reject(err);
            }
            console.log(`${c.DEBUG_QUERY}: Connected to the database.`);
        });

        let sql = `SELECT CAST(discord_id as TEXT) AS discord_id FROM ${process.env.DB_SCORES_TABLE} WHERE id = ?;`;
        db.get(sql, entryID, (err, row) => {
            if (err) {
                console.log(err);
                reject(err);
            } else {
                console.log(`${c.DEBUG_QUERY}: SELECT query was successful.`);
                resolve(row);
            }
        });
        
        db.close((err) => {
            if (err) {
                console.error(err.message);
                reject(err);
            }
            console.log(`${c.DEBUG_QUERY}: Closed the database connection.`);
        });
    });
}