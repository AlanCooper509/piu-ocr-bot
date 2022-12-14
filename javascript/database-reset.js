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
    // first operation (run create table statement)
    let sql = 
        `CREATE TABLE IF NOT EXISTS ${process.env.DB_SCORES_TABLE} (
        id            INTEGER PRIMARY KEY,
        discord_id    INTEGER NOT NULL,
        server_id     NUMERIC NOT NULL,
        game_id       TEXT,
        image_url     TEXT,
        chart_name    TEXT,
        chart_type    TEXT,
        chart_diff    INTEGER CHECK (chart_diff >= -1),
        grade         TEXT,
        break_on      INTEGER CHECK (break_on == 0 OR 
                                     break_on == 1) 
                              DEFAULT (0),
        perfects      INTEGER CHECK (perfects >= 0),
        greats        INTEGER CHECK (greats >= 0),
        goods         INTEGER CHECK (goods >= 0),
        bads          INTEGER CHECK (bads >= 0),
        misses        INTEGER CHECK (misses >= 0),
        max_combo     INTEGER CHECK (max_combo >= 0),
        total_score   INTEGER CHECK (total_score >= 0),
        time_uploaded TEXT,
        time_modified TEXT);`;
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