
const mysql = require('mysql');
const conn = mysql.createPool({
    host: "localhost",
    user: "root",
    password: "",
    database: "rrhh",
    multipleStatements: true,
});



module.exports = conn;
