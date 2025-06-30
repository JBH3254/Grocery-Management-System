const mysql = require('mysql2');

const pool = mysql.createPool({
  host: 'localhost',   
  user: 'groceryOwner',      
  password: '1515', 
  database: 'grocery_management', 
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});


module.exports = pool.promise();