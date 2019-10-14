const mysql = require('mysql');

// eslint-disable-next-line no-undef
const { MYSQL_DATABASE, MYSQL_USER, MYSQL_PASSWORD, MYSQL_PORT } = process.env;

const pool = mysql.createPool({
  host: 'db',
  port: MYSQL_PORT,
  user: MYSQL_USER,
  password: MYSQL_PASSWORD,
  database: MYSQL_DATABASE,
  connectionLimit: 10
});

module.exports = pool;