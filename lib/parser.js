'use strict';

var u = require('unparse-js'),
    C = u.combinators,
    Cst = u.cst;

var P = C.basic,
    oneOf = P.oneOf, string = P.string,
    item = P.item,
    not0 = C.not0, updateState = C.updateState,
    cut = Cst.cut, node = Cst.node,
    alt = C.alt, many0 = C.many0,
    many1 = C.many1, seq2L = C.seq2L;

var lower_letters = 'abcdefghijklmnopqrstuvwxyz',
    upper_letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

var whitespace = oneOf(' \t\n,:');

function munch(tok) {
    return seq2L(tok, many0(whitespace));
}

function inc(x) {
    return x + 1;
}

var _close = oneOf('.!?'),

    close = seq2L(munch(_close),
                  updateState(inc)),

    specialWord = string('i.e.'),

    _word = alt(specialWord,
                many1(oneOf(lower_letters + upper_letters))),

    word = node('word',
        ['value', munch(_word)]),
    
    sentence = node('sentence',
        ['words', many1(word)],
        ['close', cut('close', close)]),

    text = node('text',
        ['whitespace', many0(whitespace)],
        ['value', many0(sentence)],
        ['end'  , cut('end', not0(item))]);


module.exports = {
    'parse'      : function(str) {
	return text.parse(str, 1);
    },

    'text'       : text       ,
    'sentence'   : sentence   ,
    'word'       : word       ,
    'specialWord': specialWord,
    'close'      : close      ,
    'whitespace' : whitespace ,

    'munch'      : munch
};
