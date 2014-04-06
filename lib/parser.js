'use strict';

var u = require('unparse-js'),
    C = u.combinators,
    Cst = u.cst;

var P = C.basic,
    oneOf = P.oneOf, string = P.string,
    not1 = P.not1,
    cut = Cst.cut, node = Cst.node,
    alt = C.alt, many0 = C.many0,
    many1 = C.many1, seq = C.seq,
    seq2L = C.seq2L, seq2R = C.seq2R;

var lower_letters = 'abcdefghijklmnopqrstuvwxyz',
    upper_letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

var whitespace = oneOf(' \t\n');

function munch(tok) {
    return seq2L(tok, many0(whitespace));
}

var close = oneOf('.!?'),

    punc = oneOf(',:'),

    specialWord = string('i.e.'),

    word = alt(oneOf(lower_letters + upper_letters),
	       specialWord),
    
    chunk = many1(word),

    sentence = seq(chunk, many0(seq(punc, chunk)), close),

    text = many0(sentence);


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
};
