'use strict';


function extractWords(cst) {
    var sentences = cst.value,
        words = [];
    sentences.map(function(s) {
        s.words.map(function(w) {
            words.push(w);
        });
    });
    return words;
}

function extractWordValuePosition(word) {
    var val = word.value;
    return {
        'value': (typeof val === 'string') ? val : val.join(''), 
        'position': word._state
    };
}

function countWords(words) {
    var counter = Object.create(null);
    words.map(function(w) {
        var key = w.value.toLowerCase();
        if ( !(key in counter) ) {
            counter[key] = [];
        }
        counter[key].push(w.position);
    });
    return counter;
}

function reduce(cst) {
    var words = extractWords(cst),
        wordsWithPosition = words.map(extractWordValuePosition);
    return countWords(wordsWithPosition);
}


module.exports = {
    'extractWords': extractWords,
    'extractWordValuePosition': extractWordValuePosition,
    'countWords': countWords,
    'reduce': reduce
};

