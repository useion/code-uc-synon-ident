/**
 * Created by Michal Krempasky
 * FIIT STU BA
 */

var rpc = require('./XMLRpcConector');
var usecaseSelects = require('./UsecaseRelatedSelects');
var inserts = require('./Inserts');
var fs = require('fs');
var Promise = require('promise');

module.exports = {

    stepCallback: function (wordcalls, postagged, stepId) {
        var word;
        for (var pos in postagged) {
            if (postagged.hasOwnProperty(pos)) {
                word = postagged[pos];
                wordcalls.push(inserts.insertIntoWords(word[0], word[1], stepId));
            }
        }
    },

    wordCallback: function (simwordcallsIns, similarWordsList, wordId, posTagMapping) {

        var lemma = similarWordsList[0];
        for (var t in similarWordsList) {
            if (t==0) continue;
            if (t==1) var type = "synonym";
            if (t==2) var type = "hypernym";
            if (t==3) var type = "hyponym";
            simwordcallsIns.push(inserts.insertSimilarwordsIntoWords(similarWordsList[t], wordId, posTagMapping, type, lemma));
        }
    },

    stepsProcessing: function (steps) {

        ///// PROCCESING of ALL steps in DB and CREATING WORDS
        ///// ALSO with RPC connection to PYTHON lib NLTK
        ///// and creating Words DB
        return new Promise(function (fulfill, reject) {

            var calls = [];
            var wordcalls = [];
            var simwordcalls = [];
            var simwordcallsIns = [];
            var emptyarr = [];
            console.log("StepsProcessing");

            for (var i in steps) {

                calls.push(
                    rpc.waterfallWrap(
                        null, rpc.positionTagger,
                        [wordcalls, steps[i].step, steps[i].id, module.exports.stepCallback]));
            }

            function positionTaggerWaterfall() {
                return new Promise(function (ondone, reject) {
                    new Promise(function () {
                        rpc.waterfall(calls, function (emptyarr) {
                            new Promise(function (resolve, reject) {
                                ondone(emptyarr);
                                resolve(emptyarr);
                            });
                        }, emptyarr)
                    });
                });
            }

            function similarWordsWaterfall() {
                return new Promise(function (ondone, reject) {
                    new Promise(function () {
                        rpc.waterfall(simwordcalls, function (emptyarr) {
                            new Promise(function (resolve, reject) {
                                ondone(emptyarr);
                                resolve(emptyarr);
                            });
                        }, emptyarr)
                    });
                });
            }

            var waterfallStepsProc = positionTaggerWaterfall();
            waterfallStepsProc.then(function (emptyarr) {

                Promise.all(wordcalls).then(function () {

                    usecaseSelects.selectWordsData().then(function (wordArr) {
                        for (var i in wordArr) {
                            simwordcalls.push(
                                rpc.waterfallWrap(
                                    null, rpc.similarWords,
                                    [simwordcallsIns, wordArr[i].wid, wordArr[i].word, wordArr[i].posmap, module.exports.wordCallback]));
                        }

                        var waterfallSimWordsProc = similarWordsWaterfall();
                        waterfallSimWordsProc.then(function (emptyarr) {
                            console.log('aa')
                            console.log(simwordcallsIns);

                            Promise.all(simwordcallsIns).then(function () {

                                fulfill();
                            });
                        });
                    });
                });
            });
        });
    },

    ucLoaderFromJSON: function (parsedJson) {
        ////// LOADING UC from JSON and storing them in DB
        ////// into UC table and Steps table , also with realtion between them

        return new Promise(function (done, reject) {

            var insertUCProc = [];
            var insertStepsProc = [];

            //fs.readFile(path, "utf8", function (err, data) {*/
                //if (err) {
                    //console.log("bad type of file" + err);
                    //reject(err);
                //}


                //[> TODO
                //* if(response) {
                 //try {
                 //a = JSON.parse(response);
                 //} catch(e) {
                 //alert(e);
                 //}
                 //}
                //* */

                /*var parsedJson = JSON.parse(data);*/
                var usecasesNode = parsedJson.usecases;
                if(usecasesNode == null || usecasesNode == undefined){

                    reject(err);
                }
                for (var useCasesIterator in usecasesNode) {

                    if (usecasesNode.hasOwnProperty(useCasesIterator)) {
                        var useCaseName = usecasesNode[useCasesIterator].usecase;
                        var useCasePath = usecasesNode[useCasesIterator].path;
                        insertUCProc.push(inserts.insertUC(useCaseName, useCasePath));

                        var useCaseScenario = usecasesNode[useCasesIterator].scenario;

                        for (var useCaseSteps in useCaseScenario) {
                            if (useCaseScenario.hasOwnProperty(useCaseSteps)) {
                                insertStepsProc.push(inserts.insertStep(useCaseScenario[useCaseSteps].stepNumber,
                                    useCaseScenario[useCaseSteps].stepData, useCaseName));
                            }
                        }
                    }
                }

                Promise.all(insertUCProc).then(function () {

                    Promise.all(insertStepsProc).then(function () {

                        done();
                    });
                });
            });
        //});
    },

    ucLoadingHandler: function (struct) {
        ////// LOADING Use cases from JSON to DB
        ////// and filling up DB with UC and UC_Steps
        ///// ALSO CREATING Words via post tab
        ///// AND CREATING Similar words via synsets in NLTK
        return new Promise(function (done, reject) {

            /// NACITANIE UC DAT
            module.exports.ucLoaderFromJSON(struct).then(function () {
                usecaseSelects.selectStepsAndSid().then(function (steps) {
                    //console.log(JSON.stringify(steps));
                    module.exports.stepsProcessing(steps).then(function () {
                        console.log("STEPS process DONE");
                        done();
                    });
                });
            });
        });
    }
};
