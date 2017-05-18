/**
 * Created by Michal Krempasky
 * FIIT STU BA
 */

var sql = require('sqlite3').verbose();
var file = "test.db";
var fs = require('fs');
if (fs.existsSync(file)) {
    console.log("Removing old db file...")
    fs.unlinkSync(file);
}
global.db = new sql.Database(file);

var ext="java";

var dbInit = require('./lib/usecaseprocess/Init.js');

dbInit.createTables()
    .then(function () {
        console.log("Done.")
    });


