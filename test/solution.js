"use strict";

var S = require('../lib/solution'),
    assert = require('assert');

var module = describe,
    test = it,
    deepEqual = assert.deepEqual;

module("solution", function() {    
    
    var testData = 'ab cd. ab ab. ab de.';
    
    var bwExample = "Given an arbitrary text document written in English, write a program that will generate a concordance, i.e. an alphabetical list of all word occurrences, labeled with word frequencies. Bonus: label each word with the sentence numbers in which each occurrence appeared.";
    
    test('solve', function() {
        deepEqual(S.solve(testData).value,
                  [['ab', [1,2,2,3]], ['cd', [1]], ['de', [3]]]);
    });
    
    test('solve error', function() {
        deepEqual(S.solve('ab cd. ef gh'), // no period!
                  {'type': 'error', 'value': [['text', 1], ['sentence', 2], ['close', 2]]});
    });
    
    test('solve bw', function() {
        var s = S.solve(bwExample);
//        console.log(JSON.stringify(s, null, 2));
        deepEqual(s.value,
                  [['a', [1,1]],
                   ['all', [1]],
                   ['alphabetical', [1]],
                   ['an', [1,1]],
                   ['appeared', [2]],
                   ['arbitrary', [1]],
                   ['bonus', [2]],
                   ['concordance', [1]],
                   ['document', [1]],
                   ['each', [2,2]],
                   ['english', [1]],
                   ['frequencies', [1]],
                   ['generate', [1]],
                   ['given', [1]],
                   ['i.e.', [1]],
                   ['in', [1,2]],
                   ['label', [2]],
                   ['labeled', [1]],
                   ['list', [1]],
                   ['numbers', [2]],
                   ['occurrence', [2]],
                   ['occurrences', [1]],
                   ['of', [1]],
                   ['program', [1]],
                   ['sentence', [2]],
                   ['text', [1]],
                   ['that', [1]],
                   ['the', [2]],
                   ['which', [2]],
                   ['will', [1]],
                   ['with', [1,2]],
                   ['word', [1,1,2]],
                   ['write', [1]],
                   ['written', [1]]
                   ]);
    });
    
});

