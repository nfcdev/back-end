/* eslint-disable no-undef */
const mysql = require('mysql');

const {
  MYSQL_DATABASE, MYSQL_USER, MYSQL_PASSWORD, MYSQL_PORT,
} = process.env;
const HOST = process.env.TESTING ? 'db_test' : 'db';

console.log(MYSQL_DATABASE);
console.log(MYSQL_USER);
console.log(MYSQL_PASSWORD);
console.log(MYSQL_PORT);

const pool = mysql.createPool({
  host: HOST,
  port: MYSQL_PORT,
  user: MYSQL_USER,
  password: MYSQL_PASSWORD,
  database: MYSQL_DATABASE,
  connectionLimit: 10,
  charset: 'latin1', // Set charset to support swedish characters.
});

module.exports = pool;
