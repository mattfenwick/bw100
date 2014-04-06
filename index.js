'use strict';

var parser = require('./lib/parser'),
    reducer = require('./lib/reducer'),
    solution = require('./lib/solution');

window.parser = parser;
window.reducer = reducer;
window.solution = solution;

window.bw100 = function(str) {
    var sol = solution.solve(str);
    if ( sol.type === 'error' ) {
        console.log(JSON.stringify(sol));
    } else {
        console.log(solution.format(sol.value));
    }
}

module.exports = {
    'bw100': bw100
};

