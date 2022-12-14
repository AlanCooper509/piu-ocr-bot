// npm install sqlite3@5.1.4
// npm install dotenv@16.0.3

const sqlite3 = require("sqlite3").verbose();
require("dotenv").config();

const db = new sqlite3.Database(process.env.DB_NAME, (err) => {
    if (err) {
        console.error(err.message);
    }
    console.log('Connected to the database.');
});

db.serialize(() => {
    // 1rst operation (run create table statement)
    let sql = `CREATE TABLE IF NOT EXISTS users(email text, password text)`;
    db.run(sql, (err) => {
        if (err) {
            console.log(err);
            throw err;
        } else {
            console.log("COMPLETE");
        }
    });
});

// Always close the connection with database
db.close((err) => {
    if (err) {
        console.error(err.message);
    }
    console.log('Closed the database connection.');
});