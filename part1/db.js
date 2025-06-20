const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: 'localhost',
  user: 'youruser',
  password: 'yourpass',
  database: 'DogWalkService'
});

module.exports = pool;