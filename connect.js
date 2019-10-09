const mysql = require('mysql');
//const t = process.env.DB_HOST;

const pool = mysql.createPool({
  host: 'db',
  port: '3306',
  user: 'root',
  password: '72hbH2ypfZLqJfEh',
  database: 'c4db',
  connectionLimit: 10
});

module.exports = pool;