// In the name of God

import Common from '../common/common.js';
import User from '../models/user.js';
import sqlite3 from 'sqlite3'

beforeAll(() => {
    let db = new sqlite3.Database('main.sqlite');
    return new Promise((resolve, reject) => {
        db.run("DELETE FROM users WHERE username in ('test', 'test2')", [], (error) => {
            if (error)
                reject(error);
            resolve();
        });
    })
});

test('Should throw error because user does not have username', async () => {
    let user = { email: 'test@test.com', role: Common.Roles.MONITORING, password: 'password' };
    expect(User.insert(user)).rejects.toBeTruthy();
});

test('Should not insert user because it does not have email', async () => {
    let user = { username: 'test', role: Common.Roles.MONITORING, password: 'password' };
    expect(User.insert(user)).rejects.toBeTruthy()
});

test('Should not insert user because it  does not have role', async () => {
    let user = { username: 'test', email: 'test@test.com', password: 'password' };
    expect(User.insert(user)).rejects.toBeTruthy()
});

test('Should not insert user because it does not have password', async () => {
    let user = { username: 'test', email: 'test@test.com', role: Common.Roles.MONITORING };
    expect(User.insert(user)).rejects.toBeTruthy()
});

test('Should insert a user in the database', async () => {
    let user = { username: 'test', email: 'test@test.com', role: Common.Roles.MONITORING, password: 'password' };
    let userId = await User.insert(user);
    expect(userId).toBeGreaterThan(0)

});

test('Should not insert a duplicate username in the database', async () => {
    let user = { username: 'test', email: 'test2@test.com', role: Common.Roles.MONITORING, password: 'password' };
    expect(User.insert(user)).rejects.toBeTruthy()
});

test('Should not insert a duplicate email in the database', async () => {
    let user = { username: 'test2', email: 'test@test.com', role: Common.Roles.MONITORING, password: 'password' };
    expect(User.insert(user)).rejects.toBeTruthy()
});

test('Should insert the second user in the database', async () => {
    let user = { username: 'test2', email: 'test2@test.com', role: Common.Roles.MONITORING, password: 'password2' };
    let userId = await User.insert(user);
    expect(userId).toBeGreaterThan(0)

});

test('Sould return 3 users', async ()=>{
  let users = await User.fetchUsers();
  expect(users).toHaveLength(3);
})

test('Counting all users. Should return 3', async ()=>{
    let count = await User.countAll()
    expect(count).toStrictEqual(3);
})

test('Sould fetch user test2', async ()=>{
    let test2 = await User.fetchUserByUsername('test2');
    expect(test2.username).toStrictEqual('test2');
    expect(test2.email).toStrictEqual('test2@test.com');
})

test('Sould delete user test2', async ()=>{
    let test2 = await User.fetchUserByUsername('test2');
    await User.delete(test2.id);
    expect(User.fetchUserByUsername('test2')).resolves.toBeNull();
})