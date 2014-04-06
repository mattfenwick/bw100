"use strict";

var M = require('unparse-js').maybeerror,
    Parser = require('../lib/parser'),
    assert = require('assert');

var module = describe,
    test = it,
    deepEqual = assert.deepEqual;

module("parser", function() {

    function good(rest, state, value) {
        return M.pure({'rest': rest, 'state': state, 'result': value});
    }
    
    var error = M.error;

    function cstnode(name, state) {
        var pairs = Array.prototype.slice.call(arguments, 2),
            obj = {'_name': name, '_state': state};
        pairs.map(function(p) {
            obj[p[0]] = p[1];
        });
        return obj;
    }

    test('i.e.', function() {
        deepEqual(Parser.word.parse('i.e.', 1),
                  good('', 1, cstnode('word', 1, ['value', 'i.e.'])));
    });
    
    test('word', function() {
        deepEqual(Parser.word.parse('abc def', 1),
                  good('def', 1, cstnode('word', 1, ['value', ['a', 'b', 'c']])));
    });
    
    test('sentence', function() {
        var act = Parser.sentence.parse('abc def.  ghi', 1),
            exp = good('ghi', 2,
                       cstnode('sentence', 1,
                               ['words', [cstnode('word', 1, ['value', ['a', 'b', 'c']]),
                                          cstnode('word', 1, ['value', ['d', 'e', 'f']])]],
                               ['close', '.']));
        deepEqual(act.status, exp.status);
        deepEqual(act.value.rest, exp.value.rest);
        deepEqual(act.value.state, exp.value.state);
        deepEqual(act.value.result, exp.value.result);
        deepEqual(act, exp);
    });

    test('text', function() {
        var act = Parser.text.parse('ab. de.  gh .', 1),
            exp = good('', 4,
                       cstnode('text', 1,
                           ['whitespace', []],
                           ['value', 
                            [cstnode('sentence', 1,
                                     ['words', [cstnode('word', 1, ['value', ['a', 'b']])]],
                                     ['close', '.']),
                             cstnode('sentence', 2,
                                     ['words', [cstnode('word', 2, ['value', ['d', 'e']])]],
                                     ['close', '.']),
                             cstnode('sentence', 3,
                                     ['words', [cstnode('word', 3, ['value', ['g', 'h']])]],
                                     ['close', '.'])]],
                           ['end', null]));
        deepEqual(act.status, exp.status);
//        console.log(JSON.stringify(act, null, 2));
        deepEqual(act.value.rest, exp.value.rest);
        deepEqual(act.value.state, exp.value.state);
        deepEqual(act.value.result, exp.value.result);
        deepEqual(act, exp);
    });

});

