/**
 * Created by Michal Krempasky
 * FIIT STU BA
 */

const FileHound = require('filehound');
var parser = require('../../useion/lib/parser/parsers/block/index.js');
var fs = require('fs');
var ucSelect = require('../usecaseprocess/UsecaseRelatedSelects');
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
            //tree.replace("\n\r","\r\n");
            //console.log(tree);
            codeTreeArr.push(tree);
            resolve();

        });
    },

    codeBodyProcess: function (codeTreeArr, stepArr, stepData, simwords) {
        return new Promise(function (resolve, reject) {


            ucSelect.countRelevantWordsInStep(stepData.sid).then(function (relWords) {

                console.log(relWords);
                console.log(simwords);

                var findCounter = 0;
                for (var tree in codeTreeArr) {
                    var package = codeTreeArr[tree].body_character;
                    //TODO package


                    var fullBody = codeTreeArr[tree].children;
                    //console.log(JSON.stringify(fullBody));

                    for (var bodyPart in fullBody) {
                        // console.log(JSON.stringify(fullBody[bodyPart]));
                        var classArr = [];
                        if (fullBody[bodyPart].type == "class") {
                            //console.log("CLASS "+fullBody[bodyPart].name);
                            var classBody = fullBody[bodyPart].children;
                            var methodArr = [];
                            for (var classPart in classBody) {
                                if (classBody[classPart].type == "method") {

                                    var body = classBody[classPart].body;

                                    //console.log("BODY "+ JSON.stringify(body));
                                    var lineStart = parseInt(classBody[classPart].line_start);
                                    var lineEnd = parseInt(classBody[classPart].line_end);

                                    var lines = body.split('\r\n');

                                    var lineArr = [];

                                    for (var lineIterator in lines) {
                                        findCounter = 0;
                                        var wordArr = "";
                                        var pom = lines[lineIterator].toLowerCase();
                                        var lineNumber = lineStart + parseInt(lineIterator);


                                        for (var word in simwords) {
                                            // console.log(simwords[word]);
                                            if (pom.includes(simwords[word])) {
                                                findCounter++;
                                                // console.log("number " + lineNumber + " on line x " + lines[lineIterator] + " x");
                                                if(wordArr.includes(simwords[word])==false){
                                                    wordArr = wordArr.concat(simwords[word] + " ");
                                                }

                                            }

                                        }
                                        var line = {
                                            "line": lineNumber,
                                            "matchedWords": wordArr
                                        };
                                        if (findCounter > 0) {
                                            lineArr.push(line);
                                        }
                                    }

                                    var method = {
                                        "methodName": classBody[classPart].name,
                                        "lines": lineArr
                                    };
                                    if (lineArr.length > 0) {
                                        methodArr.push(method);
                                    }
                                }


                            }
                            var oneClass = {
                                "className": fullBody[bodyPart].name,
                                "package": "",
                                "methods": methodArr
                            };
                            if (methodArr.length > 0) {
                                classArr.push(oneClass);
                            }

                        }


                    }


                }
                var step = {
                    "stepNumber": stepData.step_number,
                    "step": stepData.step,
                    "classes": classArr
                };

                stepArr.push(step);
                resolve();


            })

        });

    }


};
