var Promise = require('promise'),
    fstools = require('../../useion/lib/helpers/fstools.js'),
    useCaseParserO = require('../../useion/lib/parser/parsers/usecase.js');

module.exports = function (path) {
    return new Promise(function (f,r) {
        var usecases = [];
        fstools.walk(path, function (error, files) {
            for (var i in files) {
                var file = files[i];

                var
                useCaseParser = new useCaseParserO(),
                parser_usecase      = useCaseParser.parse(file);

                if (parser_usecase) {
                    var scenario = [];
                    for (var j in parser_usecase.steps) {
                        var stepData = parser_usecase.steps[j].played_by+" "+parser_usecase.steps[j].name;
                        if (!parser_usecase.steps[j].played_by) {
                            stepData = parser_usecase.steps[j].name

                        }

                        scenario.push({
                            stepNumber: parser_usecase.steps[j].no,
                            stepData: stepData
                        })
                    }
                    usecases.push({
                        path: file,
                        usecase: parser_usecase.name,
                        scenario: scenario
                    });
                }

            }

            f(usecases);
        })
    })
}
