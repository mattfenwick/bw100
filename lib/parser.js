'use strict';

var u = require('unparse-js'),
    C = u.combinators,
    Cst = u.cst;

var P = C.basic,
    oneOf = P.oneOf, string = P.string,
    item = P.item,
    not0 = C.not0,
    cut = Cst.cut, node = Cst.node,
    alt = C.alt, many0 = C.many0,
    many1 = C.many1, seq = C.seq,
    seq2L = C.seq2L;

var lower_letters = 'abcdefghijklmnopqrstuvwxyz',
    upper_letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

var whitespace = oneOf(' \t\n');

function munch(tok) {
    return seq2L(tok, many0(whitespace));
}

var _close = oneOf('.!?'),

    close = munch(_close),

    _punc = oneOf(',:'),

    punc = munch(_punc),

    specialWord = string('i.e.'),

    _word = alt(oneOf(lower_letters + upper_letters),
                specialWord),

    word = node('word',
        ['value', munch(_word)]),
    
    chunk = many1(word),

    _rest_chunk = seq(punc, cut('chunk', chunk)),

    sentence = node('sentence',
        ['first', chunk],
        ['rest' , many0(_rest_chunk)],
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
    'chunk'      : chunk      ,
    'word'       : word       ,
    'specialWord': specialWord,
    'punc'       : punc       ,
    'close'      : close      ,
    'whitespace' : whitespace ,

    'munch'      : munch
};
