// npm install sqlite3@5.1.4
// npm install dotenv@16.0.3

const sqlite3 = require("sqlite3").verbose();
require("dotenv").config();

const sql_scores = 
    `CREATE TABLE IF NOT EXISTS ${process.env.DB_SCORES_TABLE} (
        id               INTEGER PRIMARY KEY,
        discord_id       INTEGER NOT NULL,
        server_id        NUMERIC NOT NULL,
        game_id          TEXT,
        image_url        TEXT    NOT NULL,
        chart_name       TEXT,
        chart_type       TEXT,
        chart_diff       INTEGER CHECK (chart_diff >= -1),
        grade            TEXT,
        break_on         INTEGER CHECK (break_on == -1 OR
                                        break_on == 0 OR 
                                        break_on == 1) 
                                 DEFAULT (-1),
        details_modified TEXT    CHECK (details_modified == 0 OR 
                                        details_modified == 1) 
                                 DEFAULT (0),
        perfects         INTEGER CHECK (perfects >= 0),
        greats           INTEGER CHECK (greats >= 0),
        goods            INTEGER CHECK (goods >= 0),
        bads             INTEGER CHECK (bads >= 0),
        misses           INTEGER CHECK (misses >= 0),
        scores_modified  INTEGER CHECK (scores_modified == 0 OR 
                                        scores_modified == 1) 
                                 DEFAULT (0),
        max_combo        INTEGER CHECK (max_combo >= 0),
        combo_modified   INTEGER CHECK (combo_modified == 0 OR 
                                        combo_modified == 1) 
                                 DEFAULT (0),
        total_score      INTEGER CHECK (total_score >= 0),
        total_modified   INTEGER DEFAULT (0) 
                                 CHECK (total_modified == 0 OR 
                                        total_modified == 1),
        time_uploaded    TEXT,
        time_modified    TEXT);`;

const sql_users = 
    `CREATE TABLE IF NOT EXISTS ${process.env.DB_USERS_TABLE} (
        id               INTEGER PRIMARY KEY,
        game_id          TEXT,
        status           TEXT,
        last_active      TEXT);`;

const sql_groups =
    `CREATE TABLE IF NOT EXISTS ${process.env.DB_GROUPS_TABLE} (
        id        INTEGER PRIMARY KEY,
        server_id NUMERIC NOT NULL,
        name      TEXT    NOT NULL
    );`;

const sql_tourneys =
    `CREATE TABLE IF NOT EXISTS ${process.env.DB_TOURNEY_TABLE} (
        id         INTEGER PRIMARY KEY,
        server_id  NUMERIC NOT NULL,
        parent_id  INTEGER REFERENCES TournamentListings (id),
        chart_name TEXT    NOT NULL,
        chart_type TEXT,
        chart_diff INTEGER CHECK (chart_diff >= -1),
        time_start TEXT    NOT NULL,
        time_end   TEXT    NOT NULL);`;


const db = new sqlite3.Database(process.env.DB_NAME, (err) => {
    if (err) {
        console.error(err.message);
    }
    console.log('Connected to the database.');
});

db.serialize(() => {
    db.run(sql_scores, (err) => {
        if (err) {
            console.log(err);
            throw err;
        } else {
            console.log("CREATE TABLE COMPLETE");
        }
    }).run(sql_users, (err) => {
        if (err) {
            console.log(err);
            throw err;
        } else {
            console.log("CREATE TABLE COMPLETE");
        }
    }).run(sql_groups, (err) => {
        if (err) {
            console.log(err);
            throw err;
        } else {
            console.log("CREATE TABLE COMPLETE");
        }
    }).run(sql_tourneys, (err) => {
        if (err) {
            console.log(err);
            throw err;
        } else {
            console.log("CREATE TABLE COMPLETE");
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