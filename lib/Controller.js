/**
 * Created by KrempiOEM on 15. 5. 2017.
 */

var os = require('os');
var fs = require('fs');
var dbInit = require('./usecaseprocess/Init.js');
var useCaseProcess = require('./usecaseprocess/UsecaseProccesing.js');
var codeProc = require('./codeprocess/CodeProcessing');
var ucSelect = require('./usecaseprocess/UsecaseRelatedSelects');
var jsfile = require('jsonfile');
var Promise = require('promise');

            var ucArr = [];
module.exports = {


    mainProcess: function (path, ext) {

        return new Promise(function (resolve, reject) {
            var mainArr = [];

            codeProc.codeProcess(codeDirectory, ext)
                .then(function (codeTreeArr) {
                    module.exports.usecaseResultBuilder(mainArr, codeTreeArr)
                        .then(function () {

                        var jfile = "Output.json";
                        jsfile.writeFileSync(jfile, ucArr, {spaces: 2});

                        resolve();
                    })

                });

        });
        /*
         })
         .catch(function (err) {
         console.log("ERROR IN USE CASE PROCESS HANDLER" + err);
         });
         })
         .catch(function (err) {
         console.log("ERROR IN DB CREATION " + err);
         });
         */


    },

    usecaseResultBuilder: function (mainArr, codeTreeArr) {

        return new Promise(function (resolve, reject) {

            ucSelect.selectUseCaseIdAndName()
                .then(function (ucData) {
                    var array = [];
                    for (var ucrow in ucData) {

                        array.push(module.exports.stepsResultBuilder(ucData[ucrow].id, ucArr, ucData[ucrow], codeTreeArr));
                    }
                    Promise.all(array)
                        .then(function () {
                            //var UC={
                              //"usecases":ucArr
                            //};
                            ////mainArr.push(UC);
                            /*mainArr = ucArr;*/
                            resolve();
                        });
                });

        });

    },


    stepsResultBuilder: function (uid, ucArr, ucData, codeTreeArr) {
        return new Promise(function (resolve, reject) {
            ucSelect.selectStepsByUid(uid)
                .then(function (stepData) {

                    var array = [];
                    var stepArray = [];
                    for (var steprow in stepData) {
                        array.push(module.exports.simwordListBuild(stepArray, stepData[steprow], codeTreeArr));
                    }
                    Promise.all(array)
                        .then(function () {

                            console.log('all uc done')

                            var UC = {
                                "name": ucData.name,
                                "steps": stepArray
                            };

                            ucArr.push(UC);
                            resolve();
                        });

                });

        });


    },


    simwordListBuild: function (stepArray, stepData, codeTreeArr) {
        return new Promise(function (resolve, reject) {
            ucSelect.selectWordsIdByStepId(stepData.sid)
                .then(function (wordData) {

                    var array = [];
                    var simwords = [];

                    var simwordsbuilder = [];
                    for (var word in wordData) {
                        array.push(ucSelect.selectSimWords(wordData[word].wid, simwordsbuilder));
                    }

                    Promise.all(array).then(function () {

                        for (var simW in simwordsbuilder) {
                            //console.log(JSON.stringify(simwordsbuilder[simW]));
                            for(var word in simwordsbuilder[simW]){
                                //console.log(simwordsbuilder[simW][word].word);
                                simwords.push([simwordsbuilder[simW][word].word, simwordsbuilder[simW][word].swmap, simwordsbuilder[simW][word].type]);
                            }

                        }
                        //console.log(wordData[word].wid)
                        codeProc.codeBodyProcess(codeTreeArr, stepArray, stepData, simwords)
                            .then(function () {
                                resolve();
                            })
                            .catch(function (err) {

                                console.log("ERR in CODE BODY PROCESS " + err);
                                reject();
                            })
                    })


                });

        });


    }


};
