/**
 * Created by Michal Krempasky
 * FIIT STU BA
 */

const FileHound = require('filehound');
var parser = require('../../useion/lib/parser/parsers/block/index.js');
var fs = require('fs');
var ucSelect = require('../usecaseprocess/UsecaseRelatedSelects');

var argv = require('minimist')(process.argv.slice(2));


var utils = require('../../useion/lib/helpers/utils.js');
module.exports = {

    filesPathFinder: function (dir, ext) {
        return new Promise(function (resolve, reject) {

            const files = FileHound.create()
                .paths(dir)
                .ext(ext)
                .find();
            files
                .then(function (list) {
                    resolve(list);
                })
                .catch(function (message) {
                    console.log("Filehound ERROR:" + message);
                    reject(message);
                });
        });
    },

    codeProcess: function (dir, ext) {
        return new Promise(function (resolve, reject) {
            var codeTreeArr = [];
            module.exports.filesPathFinder(dir, ext).then(function (paths) {


                var parseProcessArr = [];
                for (var path in paths) {
                    parseProcessArr.push(module.exports.codeParseProcess(paths[path], ext, codeTreeArr));
                }

                Promise.all(parseProcessArr).then(function () {
                    resolve(codeTreeArr);
                })
                    .catch(function (err) {
                        console.log("err" + err);
                        reject();
                    })
            }).catch(function (err) {
                console.log("err" + err);
                reject();
            })
        });
    },

    //parse: function (body, lang, path, offset) {

    codeParseProcess: function (path, ext, codeTreeArr) {
        return new Promise(function (resolve, reject) {

            // console.log("path " + path + " ext: "+ext);
            var codeBlock = parser.parse(fs.readFileSync(path, 'utf8'), ext);
            var tree = codeBlock.tree;
            tree.path = path;
            //tree.replace("\n\r","\r\n");
            //console.log(tree);
            codeTreeArr.push(tree);
            resolve();

        });
    },

    codeBodyProcess: function (codeTreeArr, stepArr, stepData, simwords) {

        return new Promise(function (resolve, reject) {

        console.log("Processing step ",stepData);

            ucSelect.countRelevantWordsInStep(stepData.sid).then(function (relWords) {


                var methodArr = [];
                var findCounter = 0;
                for (var tree in codeTreeArr) {

                    var fullBody = codeTreeArr[tree].children;
                    //console.log(JSON.stringify(fullBody));


                    for (var bodyPart in fullBody) {
                        // console.log(JSON.stringify(fullBody[bodyPart]));
                        if (fullBody[bodyPart].type == "class") {

                            //console.log("CLASS "+fullBody[bodyPart].name);
                            var classBody = fullBody[bodyPart].children;
                            for (var classPart in classBody) {
                                if (classBody[classPart].type == "method") {

                                    //console.log("Processing "+fullBody[bodyPart].name + "." + classBody[classPart].name)

                                    var body = classBody[classPart].body.toLowerCase();
                                    //var body = classBody[classPart].name;
                                    var kw = ['__halt_compiler', 'abstract', 'and', 'array', 'as', 'break', 'callable', 'case', 'catch', 'class', 'clone', 'const', 'continue', 'declare', 'default', 'die', 'do', 'echo', 'else', 'elseif', 'empty', 'enddeclare', 'endfor', 'endforeach', 'endif', 'endswitch', 'endwhile', 'eval', 'exit', 'extends', 'final', 'for', 'foreach', 'function', 'global', 'goto', 'if', 'implements', 'include', 'include_once', 'instanceof', 'insteadof', 'interface', 'isset', 'list', 'namespace', 'new', 'or', 'print', 'private', 'protected', 'public', 'require', 'require_once', 'return', 'static', 'switch', 'throw', 'trait', 'try', 'unset', 'use', 'var', 'while', 'xor'];
                                    for (var i in kw) {
                                        body = body.replace(new RegExp("/"+kw[i]+"/g"), '');
                                    }

                                    body = body.replace(/([a-z](?=[A-Z]))/g, '$1 ');
                                    body = body.replace(/_/g, ' ');

                                    body = body.toLowerCase();


                                    var allW = relWords.length,
                                        stepsFound = {},
                                        foundW = {
                                            stepFound:  [],
                                            synonFound: [],
                                            hyperFound: [],
                                            hypoFound:  []
                                        },
                                        stepWords = relWords,
                                        synonyms = [],
                                        hypernyms = [],
                                        hyponyms = [];

                                    for (var i in simwords) {
                                        switch (simwords[i][2]) {
                                            case "synonym": synonyms.push([simwords[i][0].replace(/_/g, " "),simwords[0][1]]); break;
                                            case "hypernym": hypernyms.push([simwords[i][0].replace(/_/g, " "),simwords[0][1]]); break;
                                            case "hyponym": hyponyms.push([simwords[i][0].replace(/_/g, " "),simwords[0][1]]); break;
                                        }
                                    }



                                    for (var i in relWords) {
                                        if ((new RegExp(relWords[i].word)).test(body)) {
                                            if (!(foundW.stepFound.indexOf(relWords[i].word) > -1)) {
                                                foundW.stepFound.push(relWords[i].word);
                                                if (/orig/.test(argv['strategy']))
                                                    stepsFound[relWords[i].wid] = relWords[i];
                                            }
                                        }
                                    }

                                    for (var i in synonyms) {
                                        if ((new RegExp(synonyms[i][0])).test(body)) {
                                            if (!(foundW.synonFound.indexOf(synonyms[i][0]) > -1)) {
                                                foundW.synonFound.push(synonyms[i][0]);
                                                if (/syn/.test(argv['strategy']))
                                                    stepsFound[synonyms[i][1]] = synonyms[i];
                                            }
                                        }
                                    }

                                    for (var i in hypernyms) {
                                        if ((new RegExp(hypernyms[i][0])).test(body)) {
                                            if (!(foundW.hyperFound.indexOf(hypernyms[i][0]) > -1)) {
                                                foundW.hyperFound.push(hypernyms[i][0]);
                                                if (/hyper/.test(argv['strategy']))
                                                    stepsFound[hypernyms[i][1]] = hypernyms[i];
                                            }
                                        }
                                    }

                                    for (var i in hyponyms) {
                                        if ((new RegExp(hyponyms[i][0])).test(body)) {
                                            if (!(foundW.hypoFound.indexOf(hyponyms[i][0]) > -1)) {

                                                foundW.hypoFound.push(hyponyms[i][0]);
                                                if (/hypo/.test(argv['strategy']))
                                                    stepsFound[hyponyms[i][1]] = hyponyms[i];
                                            }
                                        }
                                    }


                                    //console.log("BODY "+ JSON.stringify(body));
                                    /*var lineStart = parseInt(classBody[classPart].line_start);*/
                                    //var lineEnd = parseInt(classBody[classPart].line_end);

                                    //var lines = body.split('\r\n');

                                    //var lineArr = [];

                                    //for (var lineIterator in lines) {
                                    //findCounter = 0;
                                    //var wordArr = "";
                                    //var pom = lines[lineIterator].toLowerCase();
                                    //var lineNumber = lineStart + parseInt(lineIterator);


                                    //for (var word in simwords) {
                                    //// console.log(simwords[word]);
                                    //if (pom.includes(simwords[word])) {
                                    //findCounter++;
                                    //// console.log("number " + lineNumber + " on line x " + lines[lineIterator] + " x");
                                    //if(wordArr.includes(simwords[word])==false){
                                    //wordArr = wordArr.concat(simwords[word] + " ");
                                    //}

                                    //}

                                    //}
                                    //var line = {
                                    //"line": lineNumber,
                                    //"matchedWords": wordArr
                                    //};
                                    //if (findCounter > 0) {
                                    //lineArr.push(line);
                                    //}
                                    /*}*/


                                    var similarity  = (Object.keys(stepsFound).length/allW)*100;

                                    var method = {
                                        "path": codeTreeArr[tree].path,
                                        "className": fullBody[bodyPart].name,
                                        "methodName": classBody[classPart].name,
                                        similarity: similarity,
                                        foundWords: foundW
                                    };
                                    if (similarity > 0)
                                        methodArr.push(method);
                                }


                            }

                        }


                    }


                }

                function biggestDiff (arr, key) {

                    function keysrt(key, rev) {
                        return function(a,b){
                            if (!rev) {
                                if (a[key] > b[key]) return 1;
                                if (a[key] < b[key]) return -1;
                            } else {
                                if (a[key] < b[key]) return 1;
                                if (a[key] > b[key]) return -1;
                            }
                            return 0;
                        }
                    }

                    var sorted = arr.sort(keysrt(key), false),
                        biggestDiff = -1,
                        biggestDiffI = null;
                    for (var i in sorted) {
                        var item = sorted[i];
                        var nextI = parseInt(i)+1,
                            nextItem = null;
                        if (""+nextI in sorted) nextItem = sorted[nextI];

                        if (nextItem) {
                            var diff = nextItem[key] - item[key];
                            if (diff > biggestDiff) {
                                biggestDiff = diff;
                                biggestDiffI = parseInt(i);
                            }
                        }

                    }
                    if (biggestDiffI === null) return sorted;
                    var newArr = [];
                    for (var i in sorted) {
                        if (parseInt(i)>biggestDiffI) {
                            newArr.push(sorted[i]);
                        }
                    }
                    var sortedNewArr = newArr.sort(keysrt(key, true))
                    return sortedNewArr;

                }

                methodArr = biggestDiff(methodArr, 'similarity')


                var step = {
                    "stepNumber": stepData.step_number,
                    "step": stepData.step,
                    "methods": methodArr
                };

                stepArr.push(step);


                console.log("Finished processing step ",stepData);
                resolve();


            })

        });

    }


};
