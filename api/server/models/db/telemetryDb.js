// In the name of God

import fs from 'fs';
import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DB_NAME = 'telemetry';
const DB_FILENAME = DB_NAME + '.sqlite';

const createDatabase = () => {
    return new Promise((resolve, reject) => {
        // Read the SQL file
        const dataSql = fs.readFileSync(__dirname + '/scripts/' + DB_NAME + '.ddl').toString();

        // Setup the database connection
        let db = new sqlite3.Database(DB_FILENAME, sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE);

        // Convert the SQL string to array so that you can run them one at a time.
        // You can split the strings using the query delimiter i.e. `;` in // my case I used `);` because some data in the queries had `;`.
        const dataArr = dataSql.toString().split(";");

        // db.serialize ensures that your queries are one after the other depending on which one came first in your `dataArr`
        db.serialize(() => {
            // Loop through the `dataArr` and db.run each query
            dataArr.forEach(query => {
                if (query && query.length > 1) {
                    // Add the delimiter back to each query before you run them
                    // In my case the it was `);`
                    query += ";";
                    db.run(query, err => {
                        if (err)
                        {
                            reject(err);
                        }
                    });
                }
            });
        });

        // Close the DB connection
        db.close();
        resolve();
    });
};

const TelemetryDB = {

    prepare: async () => {
        Promise.resolve()
            .then(() => {
                if (fs.existsSync(DB_FILENAME))
                    return Promise.resolve();
                return createDatabase();
            })
            .catch(error => Promise.reject(error));
    }
};

export default TelemetryDB;