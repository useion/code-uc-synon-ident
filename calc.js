/**
 * Created by Michal Krempasky
 * FIIT STU BA
 */

var sql = require('sqlite3').verbose();
var file = "test.db";
global.db = new sql.Database(file);

global.ucJSON = "";
global.codeDirectory = "";

var argv = require('minimist')(process.argv.slice(2));


var controler=require('./lib/Controller');

//ucJSON = argv['uc-path'];
codeDirectory = argv['code-path'];
var ext = argv['lang'];

controler.mainProcess(codeDirectory,ext).then(function () {
    console.log("DONE");
    db.close();
    process.exit(0);
})
    .catch(function (err) {
        console.log("ERROR  " + err);
        db.close();
        process.exit(1);
    })
;
