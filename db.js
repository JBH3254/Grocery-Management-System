const mysql = require('mysql2');

const pool = mysql.createPool({
  host: 'localhost',      // או כתובת ה-IP של שרת ה-MySQL שלך
  user: 'groceryOwner',       // שם המשתמש שיצרת ב-MySQL
  password: '1515', // הסיסמה שהגדרת למשתמש
  database: 'grocery_management', // שם מסד הנתונים שיצרת
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

module.exports = pool.promise();