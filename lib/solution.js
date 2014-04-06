'use strict';

var parser = require('./parser'),
    reducer = require('./reducer');

function format(wordCounts) {
    var lines = wordCounts.map(function(wc, ix) {
        var index = ix + 1;
        return [index.toString(), '. ', wc[0], 
                JSON.stringify({'count': wc[1].length, 'positions': wc[1]})].join('');
    });
    return lines.join('\n');
}

/*
questions that weren't satisfactorily answered in the spec:
 - is case important?
 - should the output be a string, or a data structure?
   - if it's a string, how should the numbering work?
*/
function solve(str) {
    var parse_result = parser.parse(str);
    if ( parse_result.status !== 'success' ) {
        return {'type': 'error', 'value': parse_result.value};
    }
    var counter = reducer.reduce(parse_result.value.result);
    var sorted = [];
    Object.getOwnPropertyNames(counter).sort().map(function(key) {
        sorted.push([key, counter[key]]);
    });
    return sorted;
}


module.exports = {
    'solve': solve,
    'format': format
};

