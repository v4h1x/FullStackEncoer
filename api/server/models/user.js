// In the name of God
'use strict';

import pkg from 'sqlstring-sqlite';
const { escapeId, escape } = pkg;
import sqlite3 from 'sqlite3';
var db
import bcrypt from 'bcrypt';

function getConnection() {
    if (!db)
        {
            db = new sqlite3.Database('main.sqlite');
            db.configure('busyTimeout', 10000);
        }
    return db;
}

class User {

    constructor(obj) {
        for (let key in obj) {
            this[key] = obj[key];
        }
    }

    static async countAll(){
        let query = 'select count(*) as total from users';
        let promise = new Promise((resolve, reject) => {
            getConnection().get(query, [], (error, row) => {
                if (error)
                    reject(error);
                resolve(row.total);
            });
        });
        return promise
            .catch(error => Promise.reject(error));
    }

    static async fetchUsers(start, limit, sortColumn, sortOrder) {
        let query = 'select id, username, email, date_added, role from users';
        if (sortColumn && sortOrder)
            query = query + ' order by ' + escapeId(sortColumn) + ' ' + sortOrder;
        if (start && limit)
            query = query + ' limit ' + escape(start) + ',' + escape(limit);
        let promise = new Promise((resolve, reject) => {
            getConnection().all(query, (error, rows) => {
                if (error)
                    reject(error);
                let users = [];
                if (rows)
                    rows.forEach(row => users.push(new User(row)));
                resolve(users);
            });
        });
        return promise
            .catch(error => Promise.reject(error));
    }

    static async fetchUserById(user_id) {
        let promise = new Promise((resolve, reject) => {
            getConnection().get('select * from users where id = ?', user_id, (error, row) => {
                if (error)
                    reject(error);
                if (row)
                    resolve(new User(row));
                resolve(null);
            });
        });
        return promise
            .catch(error => Promise.reject(error));
    }

    static async fetchUserByUsername(user_name) {
        let promise = new Promise((resolve, reject) => {
            getConnection().get('select * from users where username = ?', user_name, (error, row) => {
                if (error)
                    reject(error);
                if (row)
                    resolve(new User(row));
                resolve(null);
            });
        });
        return promise
            .catch(error => Promise.reject(error));
    }

    static async fetchUserByEmail(email) {
        let promise = new Promise((resolve, reject) => {
            getConnection().get('select * from users where email = ?', email, (error, row) => {
                if (error)
                    reject(error);
                if (row)
                    resolve(new User(row));
                resolve(null);
            });
        });
        return promise
            .catch(error => Promise.reject(error));
    }

    static async insert(user) {
        let promise = new Promise((resolve, reject) => {
            let saltRounds = 10;
            bcrypt.hash(user.password, saltRounds, (err, hash) => {
                var stmt = getConnection().prepare('INSERT INTO users (username, email, password, date_added, role) VALUES (?, ?, ?, ?, ?);');
                stmt.run(user.username, user.email, hash, new Date().toISOString(), user.role, (error) => {
                    if (error)
                        reject(error);
                    resolve(stmt.lastID);
                });
            });
        });
        return promise
            .catch(error => Promise.reject(error));
    }

    static async update(user) {
        let promise = new Promise((resolve, reject) => {
            const sql = 'UPDATE users set email = ?,role = ? WHERE id = ?';
            getConnection().run(sql, user.email, user.role, user.id, (error) => {
                reject(error);
            });
            resolve(null);
        });
        return promise
            .catch(error => Promise.reject(error));
    }

    static async updatePassword(user) {
        let promise = new Promise((resolve, reject) => {
            let saltRounds = 10;
            bcrypt.hash(user.password, saltRounds, (err, hash) => {

                const sql = 'UPDATE users set password = ? WHERE id = ?';
                getConnection().run(sql, hash, user.id, (error) => {
                    reject(error);
                });
                resolve(null);
            });
        });
        return promise
            .catch(error => Promise.reject(error));
    }

    static async delete(userId) {
        let promise = new Promise((resolve, reject) => {
            const sql = 'DELETE FROM users WHERE id = ?';
            getConnection().run(sql, userId, (error) => {
                reject(error);
            });
            resolve(null);
        });
        return promise
            .catch(error => Promise.reject(error));
    }

    static async fetchAuthorities(role) {
        return new Promise((resolve, reject) => {
            const sql = 'SELECT a.name, a.display_name '
                + 'FROM roles r '
                + 'JOIN role_authorities ra '
                + 'ON r.name = ra.role '
                + 'JOIN authorities a '
                + 'ON ra.authority = a.name '
                + 'WHERE r.name = ?';
            getConnection().all(sql, role, (error, authorites) => {
                if (error)
                    reject(error);
                resolve(authorites);
            })
        })
            .catch(error => Promise.reject(error));
    }
}

export default User;
