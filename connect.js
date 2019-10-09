const mysql = require('mysql');

const pool = mysql.createPool({
  host: '172.18.0.2',
  port: '3306',
  user: 'root',
  password: '72hbH2ypfZLqJfEh',
  database: 'c4db',
  connectionLimit: 10
});

module.exports = pool;