// In the name of God

import logger from "../logger.js";

class Log {

    constructor(obj) {
        for (let key in obj) {
            this[key] = obj[key];
        }
    }

    static async fetchLogs(options) {

        //
        // Find items logged between today and yesterday.
        //
        return new Promise((resolve, reject) => {
            logger.query(options, function (err, results) {
                if (err)
                    reject(err);
                results.file.forEach((l, index) => {
                    l.id = index + 1;
                });
                resolve(results.file);
            });
        })
            .catch(error => Promise.reject(error));
    }
}

export default Log;
