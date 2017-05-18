/**
 * Created by Michal Krempasky
 * FIIT STU BA
 */

var sql = require('sqlite3').verbose();
var file = "test.db";
global.db = new sql.Database(file);

global.ucJSON = "";
global.codeDirectory = "";

var controler=require('./lib/Controller');

var argv = require('minimist')(process.argv.slice(2));

var ext="java";

ucJSON = argv['uc-path'];
////codeDirectory = process.argv[3];

var fts = require('./lib/usecaseprocess/FileToStructure.js');
var utils = require('./useion/lib/helpers/utils.js');

var os = require('os');
var fs = require('fs');
var useCaseProcess = require('./lib/usecaseprocess/UsecaseProccesing.js');
var codeProc = require('./lib/codeprocess/CodeProcessing');
var ucSelect = require('./lib/usecaseprocess/UsecaseRelatedSelects');
var jsfile = require('jsonfile');
var Promise = require('promise');


fts(argv['uc-path']).then(function (struct) {
 useCaseProcess.ucLoadingHandler({usecases:struct})
    .then(function () {
        console.log("Done.");
    });

   //console.log(utils.dumpObject(struct));
})



