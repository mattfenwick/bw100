(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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


},{"./lib/parser":2,"./lib/reducer":3,"./lib/solution":4}],2:[function(require,module,exports){
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

},{"unparse-js":5}],3:[function(require,module,exports){
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


},{}],4:[function(require,module,exports){
'use strict';

var parser = require('./parser'),
    reducer = require('./reducer');

function format(wordCounts) {
    var lines = wordCounts.map(function(wc, ix) {
        var index = ix + 1;
        return [index.toString(), '. ', wc[0], ' \t',
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
    return {'type': 'success', 'value': sorted};
}


module.exports = {
    'solve': solve,
    'format': format
};


},{"./parser":2,"./reducer":3}],5:[function(require,module,exports){
'use strict';


module.exports = {
    'maybeerror' : require('./lib/maybeerror.js') ,
    'combinators': require('./lib/combinators.js'),
    'cst'        : require('./lib/cst.js')
};


},{"./lib/combinators.js":6,"./lib/cst.js":7,"./lib/maybeerror.js":8}],6:[function(require,module,exports){
"use strict";

var M = require('./maybeerror.js');


function Parser(f) {
    /*
    A wrapper around a callable of type `[t] -> s -> ME ([t], s, a)`.
    Run the parser using the `parse` method.
    */
    this.parse = f;
}

function checkFunction(fName, actual) {
    if ( typeof actual !== 'function' ) {
        var obj = {
            'message' : 'type error',
            'function': fName,
            'expected': 'function',
            'actual'  : actual
        };
        throw new Error(JSON.stringify(obj));
    }
    // else:  nothing to do
}

function checkParser(fName, actual) {
    if ( !(actual instanceof Parser) ) {
        var obj = {
            'message' : 'type error',
            'function': fName,
            'expected': 'Parser',
            'actual'  : actual
        };
        throw new Error(JSON.stringify(obj));
    }
    // else:  nothing to do
}

function result(value, rest, state) {
    return {'result': value, 'rest': rest, 'state': state};
}

function good(value, rest, state) {
    return M.pure(result(value, rest, state));
}

function compose(f, g) {
    return function(x) { return f(g(x)); };
}


function fmap(g, parser) {
    /*
    (a -> b) -> Parser e s (m t) a -> Parser e s (m t) b
    */
    checkFunction('fmap', g);
    function h(r) {
        return result(g(r.result), r.rest, r.state);
    }
    function f(xs, s) {
        return parser.parse(xs, s).fmap(h);
    }
    return new Parser(f);
}

function pure(x) {
    /*
    a -> Parser e s (m t) a
    */
    function f(xs, s) {
        return good(x, xs, s);
    }
    return new Parser(f);
}

function bind(parser, g) {
    /*
    Parser e s (m t) a -> (a -> Parser e s (m t) b) -> Parser e s (m t) b
    */
    checkParser('bind', parser);
    checkFunction('bind', g);
    function f(xs, s) {
        var r = parser.parse(xs, s),
            val = r.value;
        if ( r.status === 'success' ) {
            return g(val.result).parse(val.rest, val.state);
        } else {
            return r;
        }
    }
    return new Parser(f);
}

function error(e) {
    /*
    e -> Parser e s (m t) a
    */
    function f(xs, s) {
        return M.error(e);
    }
    return new Parser(f);
}

function catchError(f, parser) {
    /*
    Parser e s (m t) a -> (e -> Parser e s (m t) a) -> Parser e s (m t) a
    */
    checkFunction('catchError', f);
    checkParser('catchError', parser);
    function g(xs, s) {
        var v = parser.parse(xs, s);
        if ( v.status === 'error' ) {
            return f(v.value).parse(xs, s);
        }
        return v;
    }
    return new Parser(g);
}

function mapError(f, parser) {
    /*
    Parser e s (m t) a -> (e -> e) -> Parser e s (m t) a
    */
    checkFunction('mapError', f);
    checkParser('mapError', parser);
    return catchError(compose(error, f), parser);
}

function put(xs) {
    /*
    m t -> Parser e s (m t) a
    */
    function f(_xs_, s) {
        return good(null, xs, s);
    }
    return new Parser(f);
}

function putState(s) {
    /*
    s -> Parser e s (m t) a
    */
    function f(xs, _s_) {
        return good(null, xs, s);
    }
    return new Parser(f);
}

function updateState(g) {
    /*
    (s -> s) -> Parser e s (m t) a
    */
    checkFunction('updateState', g);
    function f(xs, s) {
        return good(null, xs, g(s));
    }
    return new Parser(f);
}

function check(predicate, parser) {
    /*
    (a -> Bool) -> Parser e s (m t) a -> Parser e s (m t) a
    */
    checkFunction('check', predicate);
    checkParser('check', parser);
    function f(xs, s) {
        var r = parser.parse(xs, s);
        if ( r.status !== 'success' ) {
            return r;
        } else if ( predicate(r.value.result) ) {
            return r;
        }
        return M.zero;
    }
    return new Parser(f);
}

function many0(parser) {
    /*
    Parser e s (m t) a -> Parser e s (m t) [a]
    */
    checkParser('many0', parser);
    function f(xs, s) {
        var vals = [],
            tokens = xs,
            state = s,
            r;
        while ( true ) {
            r = parser.parse(tokens, state);
            if ( r.status === 'success' ) {
                vals.push(r.value.result);
                state = r.value.state;
                tokens = r.value.rest;
            } else if ( r.status === 'failure' ) {
                return good(vals, tokens, state);
            } else { // must respect errors
                return r;
            }
        }
    }
    return new Parser(f);
}

function many1(parser) {
    /*
    Parser e s (m t) a -> Parser e s (m t) [a]
    */
    checkParser('many1', parser);
    return check(function(x) {return x.length > 0;}, many0(parser));
}

function _get_args(args, ix) {
    return Array.prototype.slice.call(args, ix);
}

function seq() {
    /*
    [Parser e s (m t) a] -> Parser e s (m t) [a]
    */
    var parsers = _get_args(arguments, 0);
    parsers.map(checkParser.bind(null, 'seq')); // can I use `forEach` here instead of `map`?
    function f(xs, s) {
        var vals = [],
            state = s,
            tokens = xs,
            r;
        for(var i = 0; i < parsers.length; i++) {
            r = parsers[i].parse(tokens, state);
            if ( r.status === 'success' ) {
                vals.push(r.value.result);
                state = r.value.state;
                tokens = r.value.rest;
            } else {
                return r;
            }
        }
        return good(vals, tokens, state);
    }
    return new Parser(f);
}

function app(f) {
    var parsers = _get_args(arguments, 1);
    checkFunction('app', f);
    parsers.map(checkParser.bind(null, 'app')); // can I use `forEach` here as well?
    function g(args) {
        return f.apply(undefined, args);
    }
    return fmap(g, seq.apply(undefined, parsers));
}

function _first(x, _) {
    return x;
}

function _second(_, y) {
    return y;
}

function seq2L(p1, p2) {
    /*
    Parser e s (m t) a -> Parser e s (m t) b -> Parser e s (m t) a
    */
    checkParser('seq2L', p1);
    checkParser('seq2L', p2);
    return app(_first, p1, p2);
}

function seq2R(p1, p2) {
    /*
    Parser e s (m t) a -> Parser e s (m t) b -> Parser e s (m t) b
    */
    checkParser('seq2R', p1);
    checkParser('seq2R', p2);
    return app(_second, p1, p2);
}

function lookahead(parser) {
    /*
    Parser e s (m t) a -> Parser e s (m t) None
    */
    checkParser('lookahead', parser);
    return bind(get, function(xs) {return seq2R(parser, put(xs));});
}

function not0(parser) {
    /*
    Parser e s (m t) a -> Parser e s (m t) None
    */
    checkParser('not0', parser);
    function f(xs, s) {
        var r = parser.parse(xs, s);
        if ( r.status === 'error' ) {
            return r;
        } else if ( r.status === 'success' ) {
            return M.zero;
        } else {
            return good(null, xs, s);
        }
    }
    return new Parser(f);
}

function alt() {
    /*
    [Parser e s (m t) a] -> Parser e s (m t) a
    */
    var parsers = _get_args(arguments, 0);
    parsers.map(checkParser.bind(null, 'alt')); // use `forEach` here, too?
    function f(xs, s) {
        var r = M.zero;
        for(var i = 0; i < parsers.length; i++) {
            r = parsers[i].parse(xs, s);
            if ( r.status === 'success' || r.status === 'error' ) {
                return r;
            }
        }
        return r;
    }
    return new Parser(f);
}

function optional(parser, default_v) {
    /*
    Parser e s (m t) a -> a -> Parser e s (m t) a
    */
    // `default_v` is optional
    //   change undefineds to nulls to help distinguish accidents
    if ( typeof default_v === 'undefined' ) {
        default_v = null;
    }
    checkParser('optional', parser);
    return alt(parser, pure(default_v));
}

function commit(e, parser) {
    /*
    Parser e s (m t) a -> e -> Parser e s (m t) a
    */
    checkParser('commit', parser);
    return alt(parser, error(e));
}

// Parser e s (m t) a
var zero = new Parser(function(xs, s) {return M.zero;});

// Parser e s (m t) (m t)
var get = new Parser(function(xs, s) {return good(xs, xs, s);});

// Parser e s (m t) s
var getState = new Parser(function(xs, s) {return good(s, xs, s);});


function _build_set(elems) {
    var obj = {};
    for(var i = 0; i < elems.length; i++) {
        obj[elems[i]] = 1;
    }
    return obj;
}

/*
item :: Parser e s (m t) t
`item` is the most basic parser and should:
 - succeed, consuming one single token if there are any tokens left
 - fail if there are no tokens left
*/
function Itemizer(item) {
    checkParser('Itemizer', item);
    
    function literal(x) {
        /*
        Eq t => t -> Parser e s (m t) t
        */
        return check(function(y) {return x === y;}, item); // what about other notions of equality ??
    }
    
    function satisfy(pred) {
        /*
        (t -> Bool) -> Parser e s (m t) t
        */
        checkFunction('satisfy', pred);
        return check(pred, item);
    }
    
    function not1(parser) {
        /*
        Parser e s (m t) a -> Parser e s (m t) t
        */
        checkParser('not1', parser);
        return seq2R(not0(parser), item);
    }

    function string(elems) {
        /*
        Eq t => [t] -> Parser e s (m t) [t] 
        */
        var ps = [];
        for(var i = 0; i < elems.length; i++) { // have to do this b/c strings don't have a `map` method
            ps.push(literal(elems[i]));
        }
        var matcher = seq.apply(undefined, ps);
        return seq2R(matcher, pure(elems));
    }
    
    function oneOf(elems) {
        var c_set = _build_set(elems);
        return satisfy(function(x) {return x in c_set;}); // does this hit prototype properties ... ???
    }
    
    return {
        'item'   :  item,
        'literal':  literal,
        'satisfy':  satisfy,
        'string' :  string,
        'not1'   :  not1,
        'oneOf'  :  oneOf
    };
}


function _item_basic(xs, s) {
    /*
    Simply consumes a single token if one is available, presenting that token
    as the value.  Fails if token stream is empty.
    */
    if ( xs.length === 0 ) {
        return M.zero;
    }
    var first = xs[0],
        rest = xs.slice(1);
    return good(first, rest, s);
}


function _bump(char, position) {
    /*
    only treats `\n` as newline
    */
    var line = position[0],
        col = position[1];
    if ( char === '\n' ) {
        return [line + 1, 1];
    }
    return [line, col + 1];
}

function _item_position(xs, position) {
    /*
    Assumes that the state is a 2-tuple of integers, (line, column).
    Does two things:
      1. see `_item_basic`
      2. updates the line/col position in the parsing state
    */
    if ( xs.length === 0 ) {
        return M.zero;
    }
    var first = xs[0],
        rest = xs.slice(1);
    return good(first, rest, _bump(first, position));
}


function _item_count(xs, ct) {
    /*
    Does two things:
      1. see `_item_basic`
      2. increments a counter -- which tells how many tokens have been consumed
    */
    if ( xs.length === 0 ) {
        return M.zero;
    }
    var first = xs[0],
        rest = xs.slice(1);
    return good(first, rest, ct + 1);
}


var basic    = Itemizer(new Parser(_item_basic)),
    position = Itemizer(new Parser(_item_position)),
    count    = Itemizer(new Parser(_item_count));


function run(parser, input_string, state) {
    /*
    Run a parser given the token input and state.
    */
    return parser.parse(input_string, state);
}


module.exports = {
    'Parser'     : Parser,
    'Itemizer'   : Itemizer,
    
    'fmap'       : fmap,
    'pure'       : pure,
    'bind'       : bind,
    'error'      : error,
    'catchError' : catchError,
    'mapError'   : mapError,
    'put'        : put,
    'putState'   : putState,
    'updateState': updateState,
    'check'      : check,
    'many0'      : many0,
    'many1'      : many1,
    'seq'        : seq,
    'app'        : app,
    'optional'   : optional,
    'seq2L'      : seq2L,
    'seq2R'      : seq2R,
    'lookahead'  : lookahead,
    'not0'       : not0,
    'commit'     : commit,
    'alt'        : alt,
    'zero'       : zero,
    'get'        : get,
    'getState'   : getState,
    
    'basic'      : basic,
    'position'   : position,
    'count'      : count,
    
    'run'        : run,
    
    '__version__': '0.1.3'
};


},{"./maybeerror.js":8}],7:[function(require,module,exports){
"use strict";

var C = require('./combinators.js');


var bind   = C.bind  ,  getState = C.getState,
    commit = C.commit,  mapError = C.mapError,
    app    = C.app   ,  many0    = C.many0   ,
    seq    = C.seq   ,  optional = C.optional,
    fmap     = C.fmap;

function cut(message, parser) {
    /*
    assumes errors are lists
    */
    function f(p) {
        return commit([[message, p]], parser);
    }
    return bind(getState, f);
}

// probably not the optimal way to do this
function _cons(first, rest) {
    var copy = rest.slice();
    copy.unshift(first);
    return copy;
}

function addError(e, parser) {
    /*
    assumes errors are lists, and
    that the state is desired
    */
    function f(pos) {
        return mapError(function(es) {return _cons([e, pos], es);}, parser);
    }
    return bind(getState, f);
}


function _has_duplicates(arr) {
    var keys = {};
    for(var i = 0; i < arr.length; i++) {
        if ( arr[i] in keys ) {
            return true;
        }
        keys[arr[i]] = 1;
    }
    return false;
}

function _set(arr) {
    var keys = {};
    for(var i = 0; i < arr.length; i++) {
        keys[arr[i]] = 1;
    }
    return keys;
}

function _dict(arr) {
    var obj = {};
    arr.map(function(p) {
        obj[p[0]] = p[1];
    });
    return obj;
}

function node(name) {
    /*
    1. runs parsers in sequence
    2. collects results into a dictionary
    3. grabs state at which parsers started
    4. adds an error frame
    */
    var pairs = Array.prototype.slice.call(arguments, 1),
        names = pairs.map(function(x) {return x[0];}),
        name_set = _set(names);
    if ( _has_duplicates(names) ) {
        throw new Error('duplicate names');
    } else if ( '_name' in name_set ) {
        throw new Error('forbidden key: "_name"');
    } else if ( '_state' in name_set ) {
        throw new Error('forbidden key: "_state"');
    }
    function action(state, results) {
        var out = _dict(results);
        out._state = state;
        out._name = name;
        return out;
    }
    function closure_workaround(s) { // captures s
        return function(y) {return [s, y];};
    }
    function f(pair) {
        var s = pair[0],
            p = pair[1];
        return fmap(closure_workaround(s), p);
    }
    return addError(name,
                    app(action,
                          getState,
                          seq.apply(undefined, pairs.map(f))));
}

function _sep_action(fst, pairs) {
    var vals = [fst],
        seps = [];
    pairs.map(function(p) {
        var sep = p[0],
            val = p[1];
        vals.push(val);
        seps.push(sep);
    });
    return {
        'values': vals,
        'separators': seps
    };
}

function _pair(x, y) {
    return [x, y];
}

function sepBy1(parser, separator) {
    return app(_sep_action,
               parser,
               many0(app(_pair, separator, parser)));
}

function sepBy0(parser, separator) {
    return optional(sepBy1(parser, separator), {'values': [], 'separators': []});
}

module.exports = {
    'node'    :  node,
    'addError':  addError,
    'cut'     :  cut,
    'sepBy0'  :  sepBy0
};


},{"./combinators.js":6}],8:[function(require,module,exports){
"use strict";

var STATUSES = {
    'success': 1,
    'failure': 1,
    'error'  : 1
};

function MaybeError(status, value) {
    if ( !(status in STATUSES) ) {
        throw new Error('invalid MaybeError constructor name: ' + status);
    }
    this.status = status;
    this.value = value;
}

MaybeError.pure = function(x) {
    return new MaybeError('success', x);
};

MaybeError.error = function(e) {
    return new MaybeError('error', e);
};

MaybeError.prototype.fmap = function(f) {
    if ( this.status === 'success' ) {
        return MaybeError.pure(f(this.value));
    }
    return this;
};

MaybeError.app = function(f) {
    var vals = Array.prototype.slice.call(arguments, 1),
        args = [];
    for(var i = 0; i < vals.length; i++) {
        if ( vals[i].status === 'success' ) {
            args.push(vals[i].value);
        } else {
            return vals[i];
        }
    }
    return MaybeError.pure(f.apply(undefined, args));
};
        
MaybeError.prototype.bind = function(f) {
    if ( this.status === 'success' ) {
        return f(this.value);
    }
    return this;
};

MaybeError.prototype.mapError = function(f) {
    if ( this.status === 'error' ) {
        return MaybeError.error(f(this.value));
    }
    return this;
};

MaybeError.prototype.plus = function(that) {
    if ( this.status === 'failure' ) {
        return that;
    }
    return this;
};

MaybeError.zero = new MaybeError('failure', undefined);


module.exports = MaybeError;


},{}]},{},[1])