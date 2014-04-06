"use strict";

var R = require('../lib/reducer'),
    assert = require('assert');

var module = describe,
    test = it,
    deepEqual = assert.deepEqual;

module("reducer", function() {    
    
    var testData = {
      "whitespace": [],
      "value": [
        {
          "words": [
            {"value": ["a","b"], "_state": 1, "_name": "word"},
            {"value": ["c", "d"], "_state": 1, "_name": "word"},
          ],
          "close": ".",       "_state": 1, "_name": "sentence"
        },
        {
          "words": [
            {"value": ["a","b"], "_state": 2, "_name": "word"},
            {"value": ["a","b"], "_state": 2, "_name": "word"},
          ],
          "close": ".",       "_state": 2, "_name": "sentence"
        },
        {
          "words": [
            {"value": ["a","b"], "_state": 3, "_name": "word"},
            {"value": ["d","e"], "_state": 3, "_name": "word"},
          ],
          "close": ".",       "_state": 3, "_name": "sentence"
        }
      ]};
    
    var words = [
                    {"value": ["a","b"], "_state": 1, "_name": "word"},
                    {"value": ["c", "d"], "_state": 1, "_name": "word"},
                    {"value": ["a","b"], "_state": 2, "_name": "word"},
                    {"value": ["a","b"], "_state": 2, "_name": "word"},
                    {"value": ["a","b"], "_state": 3, "_name": "word"},
                    {"value": ["d","e"], "_state": 3, "_name": "word"},
                  ];
    
    test('extract words', function() {
        deepEqual(R.extractWords({'value': []}),
                  []);
        deepEqual(R.extractWords(testData),
                  words);
    });
    
    test('extract word value and position', function() {
        deepEqual(R.extractWordValuePosition(words[5]),
                  {'value': 'de', 'position': 3});
    });
    
    test('count words', function() {
        deepEqual(R.countWords([]),
                  {});
        deepEqual(R.countWords(words.map(R.extractWordValuePosition)),
                  {'ab': [1,2,2,3], 'cd': [1], 'de': [3]});
    });
    
    test('reduce', function() {
        deepEqual(R.reduce(testData),
                  {'ab': [1,2,2,3], 'cd': [1], 'de': [3]});
    });
    
});

