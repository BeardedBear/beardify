(function(scope){
'use strict';

function F(arity, fun, wrapper) {
  wrapper.a = arity;
  wrapper.f = fun;
  return wrapper;
}

function F2(fun) {
  return F(2, fun, function(a) { return function(b) { return fun(a,b); }; })
}
function F3(fun) {
  return F(3, fun, function(a) {
    return function(b) { return function(c) { return fun(a, b, c); }; };
  });
}
function F4(fun) {
  return F(4, fun, function(a) { return function(b) { return function(c) {
    return function(d) { return fun(a, b, c, d); }; }; };
  });
}
function F5(fun) {
  return F(5, fun, function(a) { return function(b) { return function(c) {
    return function(d) { return function(e) { return fun(a, b, c, d, e); }; }; }; };
  });
}
function F6(fun) {
  return F(6, fun, function(a) { return function(b) { return function(c) {
    return function(d) { return function(e) { return function(f) {
    return fun(a, b, c, d, e, f); }; }; }; }; };
  });
}
function F7(fun) {
  return F(7, fun, function(a) { return function(b) { return function(c) {
    return function(d) { return function(e) { return function(f) {
    return function(g) { return fun(a, b, c, d, e, f, g); }; }; }; }; }; };
  });
}
function F8(fun) {
  return F(8, fun, function(a) { return function(b) { return function(c) {
    return function(d) { return function(e) { return function(f) {
    return function(g) { return function(h) {
    return fun(a, b, c, d, e, f, g, h); }; }; }; }; }; }; };
  });
}
function F9(fun) {
  return F(9, fun, function(a) { return function(b) { return function(c) {
    return function(d) { return function(e) { return function(f) {
    return function(g) { return function(h) { return function(i) {
    return fun(a, b, c, d, e, f, g, h, i); }; }; }; }; }; }; }; };
  });
}

function A2(fun, a, b) {
  return fun.a === 2 ? fun.f(a, b) : fun(a)(b);
}
function A3(fun, a, b, c) {
  return fun.a === 3 ? fun.f(a, b, c) : fun(a)(b)(c);
}
function A4(fun, a, b, c, d) {
  return fun.a === 4 ? fun.f(a, b, c, d) : fun(a)(b)(c)(d);
}
function A5(fun, a, b, c, d, e) {
  return fun.a === 5 ? fun.f(a, b, c, d, e) : fun(a)(b)(c)(d)(e);
}
function A6(fun, a, b, c, d, e, f) {
  return fun.a === 6 ? fun.f(a, b, c, d, e, f) : fun(a)(b)(c)(d)(e)(f);
}
function A7(fun, a, b, c, d, e, f, g) {
  return fun.a === 7 ? fun.f(a, b, c, d, e, f, g) : fun(a)(b)(c)(d)(e)(f)(g);
}
function A8(fun, a, b, c, d, e, f, g, h) {
  return fun.a === 8 ? fun.f(a, b, c, d, e, f, g, h) : fun(a)(b)(c)(d)(e)(f)(g)(h);
}
function A9(fun, a, b, c, d, e, f, g, h, i) {
  return fun.a === 9 ? fun.f(a, b, c, d, e, f, g, h, i) : fun(a)(b)(c)(d)(e)(f)(g)(h)(i);
}

console.warn('Compiled in DEV mode. Follow the advice at https://elm-lang.org/0.19.0/optimize for better performance and smaller assets.');


var _JsArray_empty = [];

function _JsArray_singleton(value)
{
    return [value];
}

function _JsArray_length(array)
{
    return array.length;
}

var _JsArray_initialize = F3(function(size, offset, func)
{
    var result = new Array(size);

    for (var i = 0; i < size; i++)
    {
        result[i] = func(offset + i);
    }

    return result;
});

var _JsArray_initializeFromList = F2(function (max, ls)
{
    var result = new Array(max);

    for (var i = 0; i < max && ls.b; i++)
    {
        result[i] = ls.a;
        ls = ls.b;
    }

    result.length = i;
    return _Utils_Tuple2(result, ls);
});

var _JsArray_unsafeGet = F2(function(index, array)
{
    return array[index];
});

var _JsArray_unsafeSet = F3(function(index, value, array)
{
    var length = array.length;
    var result = new Array(length);

    for (var i = 0; i < length; i++)
    {
        result[i] = array[i];
    }

    result[index] = value;
    return result;
});

var _JsArray_push = F2(function(value, array)
{
    var length = array.length;
    var result = new Array(length + 1);

    for (var i = 0; i < length; i++)
    {
        result[i] = array[i];
    }

    result[length] = value;
    return result;
});

var _JsArray_foldl = F3(function(func, acc, array)
{
    var length = array.length;

    for (var i = 0; i < length; i++)
    {
        acc = A2(func, array[i], acc);
    }

    return acc;
});

var _JsArray_foldr = F3(function(func, acc, array)
{
    for (var i = array.length - 1; i >= 0; i--)
    {
        acc = A2(func, array[i], acc);
    }

    return acc;
});

var _JsArray_map = F2(function(func, array)
{
    var length = array.length;
    var result = new Array(length);

    for (var i = 0; i < length; i++)
    {
        result[i] = func(array[i]);
    }

    return result;
});

var _JsArray_indexedMap = F3(function(func, offset, array)
{
    var length = array.length;
    var result = new Array(length);

    for (var i = 0; i < length; i++)
    {
        result[i] = A2(func, offset + i, array[i]);
    }

    return result;
});

var _JsArray_slice = F3(function(from, to, array)
{
    return array.slice(from, to);
});

var _JsArray_appendN = F3(function(n, dest, source)
{
    var destLen = dest.length;
    var itemsToCopy = n - destLen;

    if (itemsToCopy > source.length)
    {
        itemsToCopy = source.length;
    }

    var size = destLen + itemsToCopy;
    var result = new Array(size);

    for (var i = 0; i < destLen; i++)
    {
        result[i] = dest[i];
    }

    for (var i = 0; i < itemsToCopy; i++)
    {
        result[i + destLen] = source[i];
    }

    return result;
});



// LOG

var _Debug_log_UNUSED = F2(function(tag, value)
{
	return value;
});

var _Debug_log = F2(function(tag, value)
{
	console.log(tag + ': ' + _Debug_toString(value));
	return value;
});


// TODOS

function _Debug_todo(moduleName, region)
{
	return function(message) {
		_Debug_crash(8, moduleName, region, message);
	};
}

function _Debug_todoCase(moduleName, region, value)
{
	return function(message) {
		_Debug_crash(9, moduleName, region, value, message);
	};
}


// TO STRING

function _Debug_toString_UNUSED(value)
{
	return '<internals>';
}

function _Debug_toString(value)
{
	return _Debug_toAnsiString(false, value);
}

function _Debug_toAnsiString(ansi, value)
{
	if (typeof value === 'function')
	{
		return _Debug_internalColor(ansi, '<function>');
	}

	if (typeof value === 'boolean')
	{
		return _Debug_ctorColor(ansi, value ? 'True' : 'False');
	}

	if (typeof value === 'number')
	{
		return _Debug_numberColor(ansi, value + '');
	}

	if (value instanceof String)
	{
		return _Debug_charColor(ansi, "'" + _Debug_addSlashes(value, true) + "'");
	}

	if (typeof value === 'string')
	{
		return _Debug_stringColor(ansi, '"' + _Debug_addSlashes(value, false) + '"');
	}

	if (typeof value === 'object' && '$' in value)
	{
		var tag = value.$;

		if (typeof tag === 'number')
		{
			return _Debug_internalColor(ansi, '<internals>');
		}

		if (tag[0] === '#')
		{
			var output = [];
			for (var k in value)
			{
				if (k === '$') continue;
				output.push(_Debug_toAnsiString(ansi, value[k]));
			}
			return '(' + output.join(',') + ')';
		}

		if (tag === 'Set_elm_builtin')
		{
			return _Debug_ctorColor(ansi, 'Set')
				+ _Debug_fadeColor(ansi, '.fromList') + ' '
				+ _Debug_toAnsiString(ansi, elm$core$Set$toList(value));
		}

		if (tag === 'RBNode_elm_builtin' || tag === 'RBEmpty_elm_builtin')
		{
			return _Debug_ctorColor(ansi, 'Dict')
				+ _Debug_fadeColor(ansi, '.fromList') + ' '
				+ _Debug_toAnsiString(ansi, elm$core$Dict$toList(value));
		}

		if (tag === 'Array_elm_builtin')
		{
			return _Debug_ctorColor(ansi, 'Array')
				+ _Debug_fadeColor(ansi, '.fromList') + ' '
				+ _Debug_toAnsiString(ansi, elm$core$Array$toList(value));
		}

		if (tag === '::' || tag === '[]')
		{
			var output = '[';

			value.b && (output += _Debug_toAnsiString(ansi, value.a), value = value.b)

			for (; value.b; value = value.b) // WHILE_CONS
			{
				output += ',' + _Debug_toAnsiString(ansi, value.a);
			}
			return output + ']';
		}

		var output = '';
		for (var i in value)
		{
			if (i === '$') continue;
			var str = _Debug_toAnsiString(ansi, value[i]);
			var c0 = str[0];
			var parenless = c0 === '{' || c0 === '(' || c0 === '[' || c0 === '<' || c0 === '"' || str.indexOf(' ') < 0;
			output += ' ' + (parenless ? str : '(' + str + ')');
		}
		return _Debug_ctorColor(ansi, tag) + output;
	}

	if (typeof value === 'object')
	{
		var output = [];
		for (var key in value)
		{
			var field = key[0] === '_' ? key.slice(1) : key;
			output.push(_Debug_fadeColor(ansi, field) + ' = ' + _Debug_toAnsiString(ansi, value[key]));
		}
		if (output.length === 0)
		{
			return '{}';
		}
		return '{ ' + output.join(', ') + ' }';
	}

	return _Debug_internalColor(ansi, '<internals>');
}

function _Debug_addSlashes(str, isChar)
{
	var s = str
		.replace(/\\/g, '\\\\')
		.replace(/\n/g, '\\n')
		.replace(/\t/g, '\\t')
		.replace(/\r/g, '\\r')
		.replace(/\v/g, '\\v')
		.replace(/\0/g, '\\0');

	if (isChar)
	{
		return s.replace(/\'/g, '\\\'');
	}
	else
	{
		return s.replace(/\"/g, '\\"');
	}
}

function _Debug_ctorColor(ansi, string)
{
	return ansi ? '\x1b[96m' + string + '\x1b[0m' : string;
}

function _Debug_numberColor(ansi, string)
{
	return ansi ? '\x1b[95m' + string + '\x1b[0m' : string;
}

function _Debug_stringColor(ansi, string)
{
	return ansi ? '\x1b[93m' + string + '\x1b[0m' : string;
}

function _Debug_charColor(ansi, string)
{
	return ansi ? '\x1b[92m' + string + '\x1b[0m' : string;
}

function _Debug_fadeColor(ansi, string)
{
	return ansi ? '\x1b[37m' + string + '\x1b[0m' : string;
}

function _Debug_internalColor(ansi, string)
{
	return ansi ? '\x1b[94m' + string + '\x1b[0m' : string;
}



// CRASH


function _Debug_crash_UNUSED(identifier)
{
	throw new Error('https://github.com/elm/core/blob/1.0.0/hints/' + identifier + '.md');
}


function _Debug_crash(identifier, fact1, fact2, fact3, fact4)
{
	switch(identifier)
	{
		case 0:
			throw new Error('What node should I take over? In JavaScript I need something like:\n\n    Elm.Main.init({\n        node: document.getElementById("elm-node")\n    })\n\nYou need to do this with any Browser.sandbox or Browser.element program.');

		case 1:
			throw new Error('Browser.application programs cannot handle URLs like this:\n\n    ' + document.location.href + '\n\nWhat is the root? The root of your file system? Try looking at this program with `elm reactor` or some other server.');

		case 2:
			var jsonErrorString = fact1;
			throw new Error('Problem with the flags given to your Elm program on initialization.\n\n' + jsonErrorString);

		case 3:
			var portName = fact1;
			throw new Error('There can only be one port named `' + portName + '`, but your program has multiple.');

		case 4:
			var portName = fact1;
			var problem = fact2;
			throw new Error('Trying to send an unexpected type of value through port `' + portName + '`:\n' + problem);

		case 5:
			throw new Error('Trying to use `(==)` on functions.\nThere is no way to know if functions are "the same" in the Elm sense.\nRead more about this at https://package.elm-lang.org/packages/elm/core/latest/Basics#== which describes why it is this way and what the better version will look like.');

		case 6:
			var moduleName = fact1;
			throw new Error('Your page is loading multiple Elm scripts with a module named ' + moduleName + '. Maybe a duplicate script is getting loaded accidentally? If not, rename one of them so I know which is which!');

		case 8:
			var moduleName = fact1;
			var region = fact2;
			var message = fact3;
			throw new Error('TODO in module `' + moduleName + '` ' + _Debug_regionToString(region) + '\n\n' + message);

		case 9:
			var moduleName = fact1;
			var region = fact2;
			var value = fact3;
			var message = fact4;
			throw new Error(
				'TODO in module `' + moduleName + '` from the `case` expression '
				+ _Debug_regionToString(region) + '\n\nIt received the following value:\n\n    '
				+ _Debug_toString(value).replace('\n', '\n    ')
				+ '\n\nBut the branch that handles it says:\n\n    ' + message.replace('\n', '\n    ')
			);

		case 10:
			throw new Error('Bug in https://github.com/elm/virtual-dom/issues');

		case 11:
			throw new Error('Cannot perform mod 0. Division by zero error.');
	}
}

function _Debug_regionToString(region)
{
	if (region.start.line === region.end.line)
	{
		return 'on line ' + region.start.line;
	}
	return 'on lines ' + region.start.line + ' through ' + region.end.line;
}



// EQUALITY

function _Utils_eq(x, y)
{
	for (
		var pair, stack = [], isEqual = _Utils_eqHelp(x, y, 0, stack);
		isEqual && (pair = stack.pop());
		isEqual = _Utils_eqHelp(pair.a, pair.b, 0, stack)
		)
	{}

	return isEqual;
}

function _Utils_eqHelp(x, y, depth, stack)
{
	if (depth > 100)
	{
		stack.push(_Utils_Tuple2(x,y));
		return true;
	}

	if (x === y)
	{
		return true;
	}

	if (typeof x !== 'object' || x === null || y === null)
	{
		typeof x === 'function' && _Debug_crash(5);
		return false;
	}

	/**/
	if (x.$ === 'Set_elm_builtin')
	{
		x = elm$core$Set$toList(x);
		y = elm$core$Set$toList(y);
	}
	if (x.$ === 'RBNode_elm_builtin' || x.$ === 'RBEmpty_elm_builtin')
	{
		x = elm$core$Dict$toList(x);
		y = elm$core$Dict$toList(y);
	}
	//*/

	/**_UNUSED/
	if (x.$ < 0)
	{
		x = elm$core$Dict$toList(x);
		y = elm$core$Dict$toList(y);
	}
	//*/

	for (var key in x)
	{
		if (!_Utils_eqHelp(x[key], y[key], depth + 1, stack))
		{
			return false;
		}
	}
	return true;
}

var _Utils_equal = F2(_Utils_eq);
var _Utils_notEqual = F2(function(a, b) { return !_Utils_eq(a,b); });



// COMPARISONS

// Code in Generate/JavaScript.hs, Basics.js, and List.js depends on
// the particular integer values assigned to LT, EQ, and GT.

function _Utils_cmp(x, y, ord)
{
	if (typeof x !== 'object')
	{
		return x === y ? /*EQ*/ 0 : x < y ? /*LT*/ -1 : /*GT*/ 1;
	}

	/**/
	if (x instanceof String)
	{
		var a = x.valueOf();
		var b = y.valueOf();
		return a === b ? 0 : a < b ? -1 : 1;
	}
	//*/

	/**_UNUSED/
	if (!x.$)
	//*/
	/**/
	if (x.$[0] === '#')
	//*/
	{
		return (ord = _Utils_cmp(x.a, y.a))
			? ord
			: (ord = _Utils_cmp(x.b, y.b))
				? ord
				: _Utils_cmp(x.c, y.c);
	}

	// traverse conses until end of a list or a mismatch
	for (; x.b && y.b && !(ord = _Utils_cmp(x.a, y.a)); x = x.b, y = y.b) {} // WHILE_CONSES
	return ord || (x.b ? /*GT*/ 1 : y.b ? /*LT*/ -1 : /*EQ*/ 0);
}

var _Utils_lt = F2(function(a, b) { return _Utils_cmp(a, b) < 0; });
var _Utils_le = F2(function(a, b) { return _Utils_cmp(a, b) < 1; });
var _Utils_gt = F2(function(a, b) { return _Utils_cmp(a, b) > 0; });
var _Utils_ge = F2(function(a, b) { return _Utils_cmp(a, b) >= 0; });

var _Utils_compare = F2(function(x, y)
{
	var n = _Utils_cmp(x, y);
	return n < 0 ? elm$core$Basics$LT : n ? elm$core$Basics$GT : elm$core$Basics$EQ;
});


// COMMON VALUES

var _Utils_Tuple0_UNUSED = 0;
var _Utils_Tuple0 = { $: '#0' };

function _Utils_Tuple2_UNUSED(a, b) { return { a: a, b: b }; }
function _Utils_Tuple2(a, b) { return { $: '#2', a: a, b: b }; }

function _Utils_Tuple3_UNUSED(a, b, c) { return { a: a, b: b, c: c }; }
function _Utils_Tuple3(a, b, c) { return { $: '#3', a: a, b: b, c: c }; }

function _Utils_chr_UNUSED(c) { return c; }
function _Utils_chr(c) { return new String(c); }


// RECORDS

function _Utils_update(oldRecord, updatedFields)
{
	var newRecord = {};

	for (var key in oldRecord)
	{
		newRecord[key] = oldRecord[key];
	}

	for (var key in updatedFields)
	{
		newRecord[key] = updatedFields[key];
	}

	return newRecord;
}


// APPEND

var _Utils_append = F2(_Utils_ap);

function _Utils_ap(xs, ys)
{
	// append Strings
	if (typeof xs === 'string')
	{
		return xs + ys;
	}

	// append Lists
	if (!xs.b)
	{
		return ys;
	}
	var root = _List_Cons(xs.a, ys);
	xs = xs.b
	for (var curr = root; xs.b; xs = xs.b) // WHILE_CONS
	{
		curr = curr.b = _List_Cons(xs.a, ys);
	}
	return root;
}



var _List_Nil_UNUSED = { $: 0 };
var _List_Nil = { $: '[]' };

function _List_Cons_UNUSED(hd, tl) { return { $: 1, a: hd, b: tl }; }
function _List_Cons(hd, tl) { return { $: '::', a: hd, b: tl }; }


var _List_cons = F2(_List_Cons);

function _List_fromArray(arr)
{
	var out = _List_Nil;
	for (var i = arr.length; i--; )
	{
		out = _List_Cons(arr[i], out);
	}
	return out;
}

function _List_toArray(xs)
{
	for (var out = []; xs.b; xs = xs.b) // WHILE_CONS
	{
		out.push(xs.a);
	}
	return out;
}

var _List_map2 = F3(function(f, xs, ys)
{
	for (var arr = []; xs.b && ys.b; xs = xs.b, ys = ys.b) // WHILE_CONSES
	{
		arr.push(A2(f, xs.a, ys.a));
	}
	return _List_fromArray(arr);
});

var _List_map3 = F4(function(f, xs, ys, zs)
{
	for (var arr = []; xs.b && ys.b && zs.b; xs = xs.b, ys = ys.b, zs = zs.b) // WHILE_CONSES
	{
		arr.push(A3(f, xs.a, ys.a, zs.a));
	}
	return _List_fromArray(arr);
});

var _List_map4 = F5(function(f, ws, xs, ys, zs)
{
	for (var arr = []; ws.b && xs.b && ys.b && zs.b; ws = ws.b, xs = xs.b, ys = ys.b, zs = zs.b) // WHILE_CONSES
	{
		arr.push(A4(f, ws.a, xs.a, ys.a, zs.a));
	}
	return _List_fromArray(arr);
});

var _List_map5 = F6(function(f, vs, ws, xs, ys, zs)
{
	for (var arr = []; vs.b && ws.b && xs.b && ys.b && zs.b; vs = vs.b, ws = ws.b, xs = xs.b, ys = ys.b, zs = zs.b) // WHILE_CONSES
	{
		arr.push(A5(f, vs.a, ws.a, xs.a, ys.a, zs.a));
	}
	return _List_fromArray(arr);
});

var _List_sortBy = F2(function(f, xs)
{
	return _List_fromArray(_List_toArray(xs).sort(function(a, b) {
		return _Utils_cmp(f(a), f(b));
	}));
});

var _List_sortWith = F2(function(f, xs)
{
	return _List_fromArray(_List_toArray(xs).sort(function(a, b) {
		var ord = A2(f, a, b);
		return ord === elm$core$Basics$EQ ? 0 : ord === elm$core$Basics$LT ? -1 : 1;
	}));
});



// MATH

var _Basics_add = F2(function(a, b) { return a + b; });
var _Basics_sub = F2(function(a, b) { return a - b; });
var _Basics_mul = F2(function(a, b) { return a * b; });
var _Basics_fdiv = F2(function(a, b) { return a / b; });
var _Basics_idiv = F2(function(a, b) { return (a / b) | 0; });
var _Basics_pow = F2(Math.pow);

var _Basics_remainderBy = F2(function(b, a) { return a % b; });

// https://www.microsoft.com/en-us/research/wp-content/uploads/2016/02/divmodnote-letter.pdf
var _Basics_modBy = F2(function(modulus, x)
{
	var answer = x % modulus;
	return modulus === 0
		? _Debug_crash(11)
		:
	((answer > 0 && modulus < 0) || (answer < 0 && modulus > 0))
		? answer + modulus
		: answer;
});


// TRIGONOMETRY

var _Basics_pi = Math.PI;
var _Basics_e = Math.E;
var _Basics_cos = Math.cos;
var _Basics_sin = Math.sin;
var _Basics_tan = Math.tan;
var _Basics_acos = Math.acos;
var _Basics_asin = Math.asin;
var _Basics_atan = Math.atan;
var _Basics_atan2 = F2(Math.atan2);


// MORE MATH

function _Basics_toFloat(x) { return x; }
function _Basics_truncate(n) { return n | 0; }
function _Basics_isInfinite(n) { return n === Infinity || n === -Infinity; }

var _Basics_ceiling = Math.ceil;
var _Basics_floor = Math.floor;
var _Basics_round = Math.round;
var _Basics_sqrt = Math.sqrt;
var _Basics_log = Math.log;
var _Basics_isNaN = isNaN;


// BOOLEANS

function _Basics_not(bool) { return !bool; }
var _Basics_and = F2(function(a, b) { return a && b; });
var _Basics_or  = F2(function(a, b) { return a || b; });
var _Basics_xor = F2(function(a, b) { return a !== b; });



function _Char_toCode(char)
{
	var code = char.charCodeAt(0);
	if (0xD800 <= code && code <= 0xDBFF)
	{
		return (code - 0xD800) * 0x400 + char.charCodeAt(1) - 0xDC00 + 0x10000
	}
	return code;
}

function _Char_fromCode(code)
{
	return _Utils_chr(
		(code < 0 || 0x10FFFF < code)
			? '\uFFFD'
			:
		(code <= 0xFFFF)
			? String.fromCharCode(code)
			:
		(code -= 0x10000,
			String.fromCharCode(Math.floor(code / 0x400) + 0xD800)
			+
			String.fromCharCode(code % 0x400 + 0xDC00)
		)
	);
}

function _Char_toUpper(char)
{
	return _Utils_chr(char.toUpperCase());
}

function _Char_toLower(char)
{
	return _Utils_chr(char.toLowerCase());
}

function _Char_toLocaleUpper(char)
{
	return _Utils_chr(char.toLocaleUpperCase());
}

function _Char_toLocaleLower(char)
{
	return _Utils_chr(char.toLocaleLowerCase());
}



var _String_cons = F2(function(chr, str)
{
	return chr + str;
});

function _String_uncons(string)
{
	var word = string.charCodeAt(0);
	return word
		? elm$core$Maybe$Just(
			0xD800 <= word && word <= 0xDBFF
				? _Utils_Tuple2(_Utils_chr(string[0] + string[1]), string.slice(2))
				: _Utils_Tuple2(_Utils_chr(string[0]), string.slice(1))
		)
		: elm$core$Maybe$Nothing;
}

var _String_append = F2(function(a, b)
{
	return a + b;
});

function _String_length(str)
{
	return str.length;
}

var _String_map = F2(function(func, string)
{
	var len = string.length;
	var array = new Array(len);
	var i = 0;
	while (i < len)
	{
		var word = string.charCodeAt(i);
		if (0xD800 <= word && word <= 0xDBFF)
		{
			array[i] = func(_Utils_chr(string[i] + string[i+1]));
			i += 2;
			continue;
		}
		array[i] = func(_Utils_chr(string[i]));
		i++;
	}
	return array.join('');
});

var _String_filter = F2(function(isGood, str)
{
	var arr = [];
	var len = str.length;
	var i = 0;
	while (i < len)
	{
		var char = str[i];
		var word = str.charCodeAt(i);
		i++;
		if (0xD800 <= word && word <= 0xDBFF)
		{
			char += str[i];
			i++;
		}

		if (isGood(_Utils_chr(char)))
		{
			arr.push(char);
		}
	}
	return arr.join('');
});

function _String_reverse(str)
{
	var len = str.length;
	var arr = new Array(len);
	var i = 0;
	while (i < len)
	{
		var word = str.charCodeAt(i);
		if (0xD800 <= word && word <= 0xDBFF)
		{
			arr[len - i] = str[i + 1];
			i++;
			arr[len - i] = str[i - 1];
			i++;
		}
		else
		{
			arr[len - i] = str[i];
			i++;
		}
	}
	return arr.join('');
}

var _String_foldl = F3(function(func, state, string)
{
	var len = string.length;
	var i = 0;
	while (i < len)
	{
		var char = string[i];
		var word = string.charCodeAt(i);
		i++;
		if (0xD800 <= word && word <= 0xDBFF)
		{
			char += string[i];
			i++;
		}
		state = A2(func, _Utils_chr(char), state);
	}
	return state;
});

var _String_foldr = F3(function(func, state, string)
{
	var i = string.length;
	while (i--)
	{
		var char = string[i];
		var word = string.charCodeAt(i);
		if (0xDC00 <= word && word <= 0xDFFF)
		{
			i--;
			char = string[i] + char;
		}
		state = A2(func, _Utils_chr(char), state);
	}
	return state;
});

var _String_split = F2(function(sep, str)
{
	return str.split(sep);
});

var _String_join = F2(function(sep, strs)
{
	return strs.join(sep);
});

var _String_slice = F3(function(start, end, str) {
	return str.slice(start, end);
});

function _String_trim(str)
{
	return str.trim();
}

function _String_trimLeft(str)
{
	return str.replace(/^\s+/, '');
}

function _String_trimRight(str)
{
	return str.replace(/\s+$/, '');
}

function _String_words(str)
{
	return _List_fromArray(str.trim().split(/\s+/g));
}

function _String_lines(str)
{
	return _List_fromArray(str.split(/\r\n|\r|\n/g));
}

function _String_toUpper(str)
{
	return str.toUpperCase();
}

function _String_toLower(str)
{
	return str.toLowerCase();
}

var _String_any = F2(function(isGood, string)
{
	var i = string.length;
	while (i--)
	{
		var char = string[i];
		var word = string.charCodeAt(i);
		if (0xDC00 <= word && word <= 0xDFFF)
		{
			i--;
			char = string[i] + char;
		}
		if (isGood(_Utils_chr(char)))
		{
			return true;
		}
	}
	return false;
});

var _String_all = F2(function(isGood, string)
{
	var i = string.length;
	while (i--)
	{
		var char = string[i];
		var word = string.charCodeAt(i);
		if (0xDC00 <= word && word <= 0xDFFF)
		{
			i--;
			char = string[i] + char;
		}
		if (!isGood(_Utils_chr(char)))
		{
			return false;
		}
	}
	return true;
});

var _String_contains = F2(function(sub, str)
{
	return str.indexOf(sub) > -1;
});

var _String_startsWith = F2(function(sub, str)
{
	return str.indexOf(sub) === 0;
});

var _String_endsWith = F2(function(sub, str)
{
	return str.length >= sub.length &&
		str.lastIndexOf(sub) === str.length - sub.length;
});

var _String_indexes = F2(function(sub, str)
{
	var subLen = sub.length;

	if (subLen < 1)
	{
		return _List_Nil;
	}

	var i = 0;
	var is = [];

	while ((i = str.indexOf(sub, i)) > -1)
	{
		is.push(i);
		i = i + subLen;
	}

	return _List_fromArray(is);
});


// TO STRING

function _String_fromNumber(number)
{
	return number + '';
}


// INT CONVERSIONS

function _String_toInt(str)
{
	var total = 0;
	var code0 = str.charCodeAt(0);
	var start = code0 == 0x2B /* + */ || code0 == 0x2D /* - */ ? 1 : 0;

	for (var i = start; i < str.length; ++i)
	{
		var code = str.charCodeAt(i);
		if (code < 0x30 || 0x39 < code)
		{
			return elm$core$Maybe$Nothing;
		}
		total = 10 * total + code - 0x30;
	}

	return i == start
		? elm$core$Maybe$Nothing
		: elm$core$Maybe$Just(code0 == 0x2D ? -total : total);
}


// FLOAT CONVERSIONS

function _String_toFloat(s)
{
	// check if it is a hex, octal, or binary number
	if (s.length === 0 || /[\sxbo]/.test(s))
	{
		return elm$core$Maybe$Nothing;
	}
	var n = +s;
	// faster isNaN check
	return n === n ? elm$core$Maybe$Just(n) : elm$core$Maybe$Nothing;
}

function _String_fromList(chars)
{
	return _List_toArray(chars).join('');
}




/**/
function _Json_errorToString(error)
{
	return elm$json$Json$Decode$errorToString(error);
}
//*/


// CORE DECODERS

function _Json_succeed(msg)
{
	return {
		$: 0,
		a: msg
	};
}

function _Json_fail(msg)
{
	return {
		$: 1,
		a: msg
	};
}

var _Json_decodeInt = { $: 2 };
var _Json_decodeBool = { $: 3 };
var _Json_decodeFloat = { $: 4 };
var _Json_decodeValue = { $: 5 };
var _Json_decodeString = { $: 6 };

function _Json_decodeList(decoder) { return { $: 7, b: decoder }; }
function _Json_decodeArray(decoder) { return { $: 8, b: decoder }; }

function _Json_decodeNull(value) { return { $: 9, c: value }; }

var _Json_decodeField = F2(function(field, decoder)
{
	return {
		$: 10,
		d: field,
		b: decoder
	};
});

var _Json_decodeIndex = F2(function(index, decoder)
{
	return {
		$: 11,
		e: index,
		b: decoder
	};
});

function _Json_decodeKeyValuePairs(decoder)
{
	return {
		$: 12,
		b: decoder
	};
}

function _Json_mapMany(f, decoders)
{
	return {
		$: 13,
		f: f,
		g: decoders
	};
}

var _Json_andThen = F2(function(callback, decoder)
{
	return {
		$: 14,
		b: decoder,
		h: callback
	};
});

function _Json_oneOf(decoders)
{
	return {
		$: 15,
		g: decoders
	};
}


// DECODING OBJECTS

var _Json_map1 = F2(function(f, d1)
{
	return _Json_mapMany(f, [d1]);
});

var _Json_map2 = F3(function(f, d1, d2)
{
	return _Json_mapMany(f, [d1, d2]);
});

var _Json_map3 = F4(function(f, d1, d2, d3)
{
	return _Json_mapMany(f, [d1, d2, d3]);
});

var _Json_map4 = F5(function(f, d1, d2, d3, d4)
{
	return _Json_mapMany(f, [d1, d2, d3, d4]);
});

var _Json_map5 = F6(function(f, d1, d2, d3, d4, d5)
{
	return _Json_mapMany(f, [d1, d2, d3, d4, d5]);
});

var _Json_map6 = F7(function(f, d1, d2, d3, d4, d5, d6)
{
	return _Json_mapMany(f, [d1, d2, d3, d4, d5, d6]);
});

var _Json_map7 = F8(function(f, d1, d2, d3, d4, d5, d6, d7)
{
	return _Json_mapMany(f, [d1, d2, d3, d4, d5, d6, d7]);
});

var _Json_map8 = F9(function(f, d1, d2, d3, d4, d5, d6, d7, d8)
{
	return _Json_mapMany(f, [d1, d2, d3, d4, d5, d6, d7, d8]);
});


// DECODE

var _Json_runOnString = F2(function(decoder, string)
{
	try
	{
		var value = JSON.parse(string);
		return _Json_runHelp(decoder, value);
	}
	catch (e)
	{
		return elm$core$Result$Err(A2(elm$json$Json$Decode$Failure, 'This is not valid JSON! ' + e.message, _Json_wrap(string)));
	}
});

var _Json_run = F2(function(decoder, value)
{
	return _Json_runHelp(decoder, _Json_unwrap(value));
});

function _Json_runHelp(decoder, value)
{
	switch (decoder.$)
	{
		case 3:
			return (typeof value === 'boolean')
				? elm$core$Result$Ok(value)
				: _Json_expecting('a BOOL', value);

		case 2:
			if (typeof value !== 'number') {
				return _Json_expecting('an INT', value);
			}

			if (-2147483647 < value && value < 2147483647 && (value | 0) === value) {
				return elm$core$Result$Ok(value);
			}

			if (isFinite(value) && !(value % 1)) {
				return elm$core$Result$Ok(value);
			}

			return _Json_expecting('an INT', value);

		case 4:
			return (typeof value === 'number')
				? elm$core$Result$Ok(value)
				: _Json_expecting('a FLOAT', value);

		case 6:
			return (typeof value === 'string')
				? elm$core$Result$Ok(value)
				: (value instanceof String)
					? elm$core$Result$Ok(value + '')
					: _Json_expecting('a STRING', value);

		case 9:
			return (value === null)
				? elm$core$Result$Ok(decoder.c)
				: _Json_expecting('null', value);

		case 5:
			return elm$core$Result$Ok(_Json_wrap(value));

		case 7:
			if (!Array.isArray(value))
			{
				return _Json_expecting('a LIST', value);
			}
			return _Json_runArrayDecoder(decoder.b, value, _List_fromArray);

		case 8:
			if (!Array.isArray(value))
			{
				return _Json_expecting('an ARRAY', value);
			}
			return _Json_runArrayDecoder(decoder.b, value, _Json_toElmArray);

		case 10:
			var field = decoder.d;
			if (typeof value !== 'object' || value === null || !(field in value))
			{
				return _Json_expecting('an OBJECT with a field named `' + field + '`', value);
			}
			var result = _Json_runHelp(decoder.b, value[field]);
			return (elm$core$Result$isOk(result)) ? result : elm$core$Result$Err(A2(elm$json$Json$Decode$Field, field, result.a));

		case 11:
			var index = decoder.e;
			if (!Array.isArray(value))
			{
				return _Json_expecting('an ARRAY', value);
			}
			if (index >= value.length)
			{
				return _Json_expecting('a LONGER array. Need index ' + index + ' but only see ' + value.length + ' entries', value);
			}
			var result = _Json_runHelp(decoder.b, value[index]);
			return (elm$core$Result$isOk(result)) ? result : elm$core$Result$Err(A2(elm$json$Json$Decode$Index, index, result.a));

		case 12:
			if (typeof value !== 'object' || value === null || Array.isArray(value))
			{
				return _Json_expecting('an OBJECT', value);
			}

			var keyValuePairs = _List_Nil;
			// TODO test perf of Object.keys and switch when support is good enough
			for (var key in value)
			{
				if (value.hasOwnProperty(key))
				{
					var result = _Json_runHelp(decoder.b, value[key]);
					if (!elm$core$Result$isOk(result))
					{
						return elm$core$Result$Err(A2(elm$json$Json$Decode$Field, key, result.a));
					}
					keyValuePairs = _List_Cons(_Utils_Tuple2(key, result.a), keyValuePairs);
				}
			}
			return elm$core$Result$Ok(elm$core$List$reverse(keyValuePairs));

		case 13:
			var answer = decoder.f;
			var decoders = decoder.g;
			for (var i = 0; i < decoders.length; i++)
			{
				var result = _Json_runHelp(decoders[i], value);
				if (!elm$core$Result$isOk(result))
				{
					return result;
				}
				answer = answer(result.a);
			}
			return elm$core$Result$Ok(answer);

		case 14:
			var result = _Json_runHelp(decoder.b, value);
			return (!elm$core$Result$isOk(result))
				? result
				: _Json_runHelp(decoder.h(result.a), value);

		case 15:
			var errors = _List_Nil;
			for (var temp = decoder.g; temp.b; temp = temp.b) // WHILE_CONS
			{
				var result = _Json_runHelp(temp.a, value);
				if (elm$core$Result$isOk(result))
				{
					return result;
				}
				errors = _List_Cons(result.a, errors);
			}
			return elm$core$Result$Err(elm$json$Json$Decode$OneOf(elm$core$List$reverse(errors)));

		case 1:
			return elm$core$Result$Err(A2(elm$json$Json$Decode$Failure, decoder.a, _Json_wrap(value)));

		case 0:
			return elm$core$Result$Ok(decoder.a);
	}
}

function _Json_runArrayDecoder(decoder, value, toElmValue)
{
	var len = value.length;
	var array = new Array(len);
	for (var i = 0; i < len; i++)
	{
		var result = _Json_runHelp(decoder, value[i]);
		if (!elm$core$Result$isOk(result))
		{
			return elm$core$Result$Err(A2(elm$json$Json$Decode$Index, i, result.a));
		}
		array[i] = result.a;
	}
	return elm$core$Result$Ok(toElmValue(array));
}

function _Json_toElmArray(array)
{
	return A2(elm$core$Array$initialize, array.length, function(i) { return array[i]; });
}

function _Json_expecting(type, value)
{
	return elm$core$Result$Err(A2(elm$json$Json$Decode$Failure, 'Expecting ' + type, _Json_wrap(value)));
}


// EQUALITY

function _Json_equality(x, y)
{
	if (x === y)
	{
		return true;
	}

	if (x.$ !== y.$)
	{
		return false;
	}

	switch (x.$)
	{
		case 0:
		case 1:
			return x.a === y.a;

		case 3:
		case 2:
		case 4:
		case 6:
		case 5:
			return true;

		case 9:
			return x.c === y.c;

		case 7:
		case 8:
		case 12:
			return _Json_equality(x.b, y.b);

		case 10:
			return x.d === y.d && _Json_equality(x.b, y.b);

		case 11:
			return x.e === y.e && _Json_equality(x.b, y.b);

		case 13:
			return x.f === y.f && _Json_listEquality(x.g, y.g);

		case 14:
			return x.h === y.h && _Json_equality(x.b, y.b);

		case 15:
			return _Json_listEquality(x.g, y.g);
	}
}

function _Json_listEquality(aDecoders, bDecoders)
{
	var len = aDecoders.length;
	if (len !== bDecoders.length)
	{
		return false;
	}
	for (var i = 0; i < len; i++)
	{
		if (!_Json_equality(aDecoders[i], bDecoders[i]))
		{
			return false;
		}
	}
	return true;
}


// ENCODE

var _Json_encode = F2(function(indentLevel, value)
{
	return JSON.stringify(_Json_unwrap(value), null, indentLevel) + '';
});

function _Json_wrap(value) { return { $: 0, a: value }; }
function _Json_unwrap(value) { return value.a; }

function _Json_wrap_UNUSED(value) { return value; }
function _Json_unwrap_UNUSED(value) { return value; }

function _Json_emptyArray() { return []; }
function _Json_emptyObject() { return {}; }

var _Json_addField = F3(function(key, value, object)
{
	object[key] = _Json_unwrap(value);
	return object;
});

function _Json_addEntry(func)
{
	return F2(function(entry, array)
	{
		array.push(_Json_unwrap(func(entry)));
		return array;
	});
}

var _Json_encodeNull = _Json_wrap(null);



// TASKS

function _Scheduler_succeed(value)
{
	return {
		$: 0,
		a: value
	};
}

function _Scheduler_fail(error)
{
	return {
		$: 1,
		a: error
	};
}

function _Scheduler_binding(callback)
{
	return {
		$: 2,
		b: callback,
		c: null
	};
}

var _Scheduler_andThen = F2(function(callback, task)
{
	return {
		$: 3,
		b: callback,
		d: task
	};
});

var _Scheduler_onError = F2(function(callback, task)
{
	return {
		$: 4,
		b: callback,
		d: task
	};
});

function _Scheduler_receive(callback)
{
	return {
		$: 5,
		b: callback
	};
}


// PROCESSES

var _Scheduler_guid = 0;

function _Scheduler_rawSpawn(task)
{
	var proc = {
		$: 0,
		e: _Scheduler_guid++,
		f: task,
		g: null,
		h: []
	};

	_Scheduler_enqueue(proc);

	return proc;
}

function _Scheduler_spawn(task)
{
	return _Scheduler_binding(function(callback) {
		callback(_Scheduler_succeed(_Scheduler_rawSpawn(task)));
	});
}

function _Scheduler_rawSend(proc, msg)
{
	proc.h.push(msg);
	_Scheduler_enqueue(proc);
}

var _Scheduler_send = F2(function(proc, msg)
{
	return _Scheduler_binding(function(callback) {
		_Scheduler_rawSend(proc, msg);
		callback(_Scheduler_succeed(_Utils_Tuple0));
	});
});

function _Scheduler_kill(proc)
{
	return _Scheduler_binding(function(callback) {
		var task = proc.f;
		if (task.$ === 2 && task.c)
		{
			task.c();
		}

		proc.f = null;

		callback(_Scheduler_succeed(_Utils_Tuple0));
	});
}


/* STEP PROCESSES

type alias Process =
  { $ : tag
  , id : unique_id
  , root : Task
  , stack : null | { $: SUCCEED | FAIL, a: callback, b: stack }
  , mailbox : [msg]
  }

*/


var _Scheduler_working = false;
var _Scheduler_queue = [];


function _Scheduler_enqueue(proc)
{
	_Scheduler_queue.push(proc);
	if (_Scheduler_working)
	{
		return;
	}
	_Scheduler_working = true;
	while (proc = _Scheduler_queue.shift())
	{
		_Scheduler_step(proc);
	}
	_Scheduler_working = false;
}


function _Scheduler_step(proc)
{
	while (proc.f)
	{
		var rootTag = proc.f.$;
		if (rootTag === 0 || rootTag === 1)
		{
			while (proc.g && proc.g.$ !== rootTag)
			{
				proc.g = proc.g.i;
			}
			if (!proc.g)
			{
				return;
			}
			proc.f = proc.g.b(proc.f.a);
			proc.g = proc.g.i;
		}
		else if (rootTag === 2)
		{
			proc.f.c = proc.f.b(function(newRoot) {
				proc.f = newRoot;
				_Scheduler_enqueue(proc);
			});
			return;
		}
		else if (rootTag === 5)
		{
			if (proc.h.length === 0)
			{
				return;
			}
			proc.f = proc.f.b(proc.h.shift());
		}
		else // if (rootTag === 3 || rootTag === 4)
		{
			proc.g = {
				$: rootTag === 3 ? 0 : 1,
				b: proc.f.b,
				i: proc.g
			};
			proc.f = proc.f.d;
		}
	}
}



// SEND REQUEST

var _Http_toTask = F2(function(request, maybeProgress)
{
	return _Scheduler_binding(function(callback)
	{
		var xhr = new XMLHttpRequest();

		_Http_configureProgress(xhr, maybeProgress);

		xhr.addEventListener('error', function() {
			callback(_Scheduler_fail(elm$http$Http$NetworkError));
		});
		xhr.addEventListener('timeout', function() {
			callback(_Scheduler_fail(elm$http$Http$Timeout));
		});
		xhr.addEventListener('load', function() {
			callback(_Http_handleResponse(xhr, request.expect.a));
		});

		try
		{
			xhr.open(request.method, request.url, true);
		}
		catch (e)
		{
			return callback(_Scheduler_fail(elm$http$Http$BadUrl(request.url)));
		}

		_Http_configureRequest(xhr, request);

		var body = request.body;
		xhr.send(elm$http$Http$Internal$isStringBody(body)
			? (xhr.setRequestHeader('Content-Type', body.a), body.b)
			: body.a
		);

		return function() { xhr.abort(); };
	});
});

function _Http_configureProgress(xhr, maybeProgress)
{
	if (!elm$core$Maybe$isJust(maybeProgress))
	{
		return;
	}

	xhr.addEventListener('progress', function(event) {
		if (!event.lengthComputable)
		{
			return;
		}
		_Scheduler_rawSpawn(maybeProgress.a({
			bytes: event.loaded,
			bytesExpected: event.total
		}));
	});
}

function _Http_configureRequest(xhr, request)
{
	for (var headers = request.headers; headers.b; headers = headers.b) // WHILE_CONS
	{
		xhr.setRequestHeader(headers.a.a, headers.a.b);
	}

	xhr.responseType = request.expect.b;
	xhr.withCredentials = request.withCredentials;

	elm$core$Maybe$isJust(request.timeout) && (xhr.timeout = request.timeout.a);
}


// RESPONSES

function _Http_handleResponse(xhr, responseToResult)
{
	var response = _Http_toResponse(xhr);

	if (xhr.status < 200 || 300 <= xhr.status)
	{
		response.body = xhr.responseText;
		return _Scheduler_fail(elm$http$Http$BadStatus(response));
	}

	var result = responseToResult(response);

	if (elm$core$Result$isOk(result))
	{
		return _Scheduler_succeed(result.a);
	}
	else
	{
		response.body = xhr.responseText;
		return _Scheduler_fail(A2(elm$http$Http$BadPayload, result.a, response));
	}
}

function _Http_toResponse(xhr)
{
	return {
		url: xhr.responseURL,
		status: { code: xhr.status, message: xhr.statusText },
		headers: _Http_parseHeaders(xhr.getAllResponseHeaders()),
		body: xhr.response
	};
}

function _Http_parseHeaders(rawHeaders)
{
	var headers = elm$core$Dict$empty;

	if (!rawHeaders)
	{
		return headers;
	}

	var headerPairs = rawHeaders.split('\u000d\u000a');
	for (var i = headerPairs.length; i--; )
	{
		var headerPair = headerPairs[i];
		var index = headerPair.indexOf('\u003a\u0020');
		if (index > 0)
		{
			var key = headerPair.substring(0, index);
			var value = headerPair.substring(index + 2);

			headers = A3(elm$core$Dict$update, key, function(oldValue) {
				return elm$core$Maybe$Just(elm$core$Maybe$isJust(oldValue)
					? value + ', ' + oldValue.a
					: value
				);
			}, headers);
		}
	}

	return headers;
}


// EXPECTORS

function _Http_expectStringResponse(responseToResult)
{
	return {
		$: 0,
		b: 'text',
		a: responseToResult
	};
}

var _Http_mapExpect = F2(function(func, expect)
{
	return {
		$: 0,
		b: expect.b,
		a: function(response) {
			var convertedResponse = expect.a(response);
			return A2(elm$core$Result$map, func, convertedResponse);
		}
	};
});


// BODY

function _Http_multipart(parts)
{


	for (var formData = new FormData(); parts.b; parts = parts.b) // WHILE_CONS
	{
		var part = parts.a;
		formData.append(part.a, part.b);
	}

	return elm$http$Http$Internal$FormDataBody(formData);
}



function _Process_sleep(time)
{
	return _Scheduler_binding(function(callback) {
		var id = setTimeout(function() {
			callback(_Scheduler_succeed(_Utils_Tuple0));
		}, time);

		return function() { clearTimeout(id); };
	});
}




// PROGRAMS


var _Platform_worker = F4(function(impl, flagDecoder, debugMetadata, args)
{
	return _Platform_initialize(
		flagDecoder,
		args,
		impl.init,
		impl.update,
		impl.subscriptions,
		function() { return function() {} }
	);
});



// INITIALIZE A PROGRAM


function _Platform_initialize(flagDecoder, args, init, update, subscriptions, stepperBuilder)
{
	var result = A2(_Json_run, flagDecoder, _Json_wrap(args ? args['flags'] : undefined));
	elm$core$Result$isOk(result) || _Debug_crash(2 /**/, _Json_errorToString(result.a) /**/);
	var managers = {};
	result = init(result.a);
	var model = result.a;
	var stepper = stepperBuilder(sendToApp, model);
	var ports = _Platform_setupEffects(managers, sendToApp);

	function sendToApp(msg, viewMetadata)
	{
		result = A2(update, msg, model);
		stepper(model = result.a, viewMetadata);
		_Platform_dispatchEffects(managers, result.b, subscriptions(model));
	}

	_Platform_dispatchEffects(managers, result.b, subscriptions(model));

	return ports ? { ports: ports } : {};
}



// TRACK PRELOADS
//
// This is used by code in elm/browser and elm/http
// to register any HTTP requests that are triggered by init.
//


var _Platform_preload;


function _Platform_registerPreload(url)
{
	_Platform_preload.add(url);
}



// EFFECT MANAGERS


var _Platform_effectManagers = {};


function _Platform_setupEffects(managers, sendToApp)
{
	var ports;

	// setup all necessary effect managers
	for (var key in _Platform_effectManagers)
	{
		var manager = _Platform_effectManagers[key];

		if (manager.a)
		{
			ports = ports || {};
			ports[key] = manager.a(key, sendToApp);
		}

		managers[key] = _Platform_instantiateManager(manager, sendToApp);
	}

	return ports;
}


function _Platform_createManager(init, onEffects, onSelfMsg, cmdMap, subMap)
{
	return {
		b: init,
		c: onEffects,
		d: onSelfMsg,
		e: cmdMap,
		f: subMap
	};
}


function _Platform_instantiateManager(info, sendToApp)
{
	var router = {
		g: sendToApp,
		h: undefined
	};

	var onEffects = info.c;
	var onSelfMsg = info.d;
	var cmdMap = info.e;
	var subMap = info.f;

	function loop(state)
	{
		return A2(_Scheduler_andThen, loop, _Scheduler_receive(function(msg)
		{
			var value = msg.a;

			if (msg.$ === 0)
			{
				return A3(onSelfMsg, router, value, state);
			}

			return cmdMap && subMap
				? A4(onEffects, router, value.i, value.j, state)
				: A3(onEffects, router, cmdMap ? value.i : value.j, state);
		}));
	}

	return router.h = _Scheduler_rawSpawn(A2(_Scheduler_andThen, loop, info.b));
}



// ROUTING


var _Platform_sendToApp = F2(function(router, msg)
{
	return _Scheduler_binding(function(callback)
	{
		router.g(msg);
		callback(_Scheduler_succeed(_Utils_Tuple0));
	});
});


var _Platform_sendToSelf = F2(function(router, msg)
{
	return A2(_Scheduler_send, router.h, {
		$: 0,
		a: msg
	});
});



// BAGS


function _Platform_leaf(home)
{
	return function(value)
	{
		return {
			$: 1,
			k: home,
			l: value
		};
	};
}


function _Platform_batch(list)
{
	return {
		$: 2,
		m: list
	};
}


var _Platform_map = F2(function(tagger, bag)
{
	return {
		$: 3,
		n: tagger,
		o: bag
	}
});



// PIPE BAGS INTO EFFECT MANAGERS


function _Platform_dispatchEffects(managers, cmdBag, subBag)
{
	var effectsDict = {};
	_Platform_gatherEffects(true, cmdBag, effectsDict, null);
	_Platform_gatherEffects(false, subBag, effectsDict, null);

	for (var home in managers)
	{
		_Scheduler_rawSend(managers[home], {
			$: 'fx',
			a: effectsDict[home] || { i: _List_Nil, j: _List_Nil }
		});
	}
}


function _Platform_gatherEffects(isCmd, bag, effectsDict, taggers)
{
	switch (bag.$)
	{
		case 1:
			var home = bag.k;
			var effect = _Platform_toEffect(isCmd, home, taggers, bag.l);
			effectsDict[home] = _Platform_insert(isCmd, effect, effectsDict[home]);
			return;

		case 2:
			for (var list = bag.m; list.b; list = list.b) // WHILE_CONS
			{
				_Platform_gatherEffects(isCmd, list.a, effectsDict, taggers);
			}
			return;

		case 3:
			_Platform_gatherEffects(isCmd, bag.o, effectsDict, {
				p: bag.n,
				q: taggers
			});
			return;
	}
}


function _Platform_toEffect(isCmd, home, taggers, value)
{
	function applyTaggers(x)
	{
		for (var temp = taggers; temp; temp = temp.q)
		{
			x = temp.p(x);
		}
		return x;
	}

	var map = isCmd
		? _Platform_effectManagers[home].e
		: _Platform_effectManagers[home].f;

	return A2(map, applyTaggers, value)
}


function _Platform_insert(isCmd, newEffect, effects)
{
	effects = effects || { i: _List_Nil, j: _List_Nil };

	isCmd
		? (effects.i = _List_Cons(newEffect, effects.i))
		: (effects.j = _List_Cons(newEffect, effects.j));

	return effects;
}



// PORTS


function _Platform_checkPortName(name)
{
	if (_Platform_effectManagers[name])
	{
		_Debug_crash(3, name)
	}
}



// OUTGOING PORTS


function _Platform_outgoingPort(name, converter)
{
	_Platform_checkPortName(name);
	_Platform_effectManagers[name] = {
		e: _Platform_outgoingPortMap,
		r: converter,
		a: _Platform_setupOutgoingPort
	};
	return _Platform_leaf(name);
}


var _Platform_outgoingPortMap = F2(function(tagger, value) { return value; });


function _Platform_setupOutgoingPort(name)
{
	var subs = [];
	var converter = _Platform_effectManagers[name].r;

	// CREATE MANAGER

	var init = _Process_sleep(0);

	_Platform_effectManagers[name].b = init;
	_Platform_effectManagers[name].c = F3(function(router, cmdList, state)
	{
		for ( ; cmdList.b; cmdList = cmdList.b) // WHILE_CONS
		{
			// grab a separate reference to subs in case unsubscribe is called
			var currentSubs = subs;
			var value = _Json_unwrap(converter(cmdList.a));
			for (var i = 0; i < currentSubs.length; i++)
			{
				currentSubs[i](value);
			}
		}
		return init;
	});

	// PUBLIC API

	function subscribe(callback)
	{
		subs.push(callback);
	}

	function unsubscribe(callback)
	{
		// copy subs into a new array in case unsubscribe is called within a
		// subscribed callback
		subs = subs.slice();
		var index = subs.indexOf(callback);
		if (index >= 0)
		{
			subs.splice(index, 1);
		}
	}

	return {
		subscribe: subscribe,
		unsubscribe: unsubscribe
	};
}



// INCOMING PORTS


function _Platform_incomingPort(name, converter)
{
	_Platform_checkPortName(name);
	_Platform_effectManagers[name] = {
		f: _Platform_incomingPortMap,
		r: converter,
		a: _Platform_setupIncomingPort
	};
	return _Platform_leaf(name);
}


var _Platform_incomingPortMap = F2(function(tagger, finalTagger)
{
	return function(value)
	{
		return tagger(finalTagger(value));
	};
});


function _Platform_setupIncomingPort(name, sendToApp)
{
	var subs = _List_Nil;
	var converter = _Platform_effectManagers[name].r;

	// CREATE MANAGER

	var init = _Scheduler_succeed(null);

	_Platform_effectManagers[name].b = init;
	_Platform_effectManagers[name].c = F3(function(router, subList, state)
	{
		subs = subList;
		return init;
	});

	// PUBLIC API

	function send(incomingValue)
	{
		var result = A2(_Json_run, converter, _Json_wrap(incomingValue));

		elm$core$Result$isOk(result) || _Debug_crash(4, name, result.a);

		var value = result.a;
		for (var temp = subs; temp.b; temp = temp.b) // WHILE_CONS
		{
			sendToApp(temp.a(value));
		}
	}

	return { send: send };
}



// EXPORT ELM MODULES
//
// Have DEBUG and PROD versions so that we can (1) give nicer errors in
// debug mode and (2) not pay for the bits needed for that in prod mode.
//


function _Platform_export_UNUSED(exports)
{
	scope['Elm']
		? _Platform_mergeExportsProd(scope['Elm'], exports)
		: scope['Elm'] = exports;
}


function _Platform_mergeExportsProd(obj, exports)
{
	for (var name in exports)
	{
		(name in obj)
			? (name == 'init')
				? _Debug_crash(6)
				: _Platform_mergeExportsProd(obj[name], exports[name])
			: (obj[name] = exports[name]);
	}
}


function _Platform_export(exports)
{
	scope['Elm']
		? _Platform_mergeExportsDebug('Elm', scope['Elm'], exports)
		: scope['Elm'] = exports;
}


function _Platform_mergeExportsDebug(moduleName, obj, exports)
{
	for (var name in exports)
	{
		(name in obj)
			? (name == 'init')
				? _Debug_crash(6, moduleName)
				: _Platform_mergeExportsDebug(moduleName + '.' + name, obj[name], exports[name])
			: (obj[name] = exports[name]);
	}
}




// HELPERS


var _VirtualDom_divertHrefToApp;

var _VirtualDom_doc = typeof document !== 'undefined' ? document : {};


function _VirtualDom_appendChild(parent, child)
{
	parent.appendChild(child);
}

var _VirtualDom_init = F4(function(virtualNode, flagDecoder, debugMetadata, args)
{
	// NOTE: this function needs _Platform_export available to work

	/**_UNUSED/
	var node = args['node'];
	//*/
	/**/
	var node = args && args['node'] ? args['node'] : _Debug_crash(0);
	//*/

	node.parentNode.replaceChild(
		_VirtualDom_render(virtualNode, function() {}),
		node
	);

	return {};
});



// TEXT


function _VirtualDom_text(string)
{
	return {
		$: 0,
		a: string
	};
}



// NODE


var _VirtualDom_nodeNS = F2(function(namespace, tag)
{
	return F2(function(factList, kidList)
	{
		for (var kids = [], descendantsCount = 0; kidList.b; kidList = kidList.b) // WHILE_CONS
		{
			var kid = kidList.a;
			descendantsCount += (kid.b || 0);
			kids.push(kid);
		}
		descendantsCount += kids.length;

		return {
			$: 1,
			c: tag,
			d: _VirtualDom_organizeFacts(factList),
			e: kids,
			f: namespace,
			b: descendantsCount
		};
	});
});


var _VirtualDom_node = _VirtualDom_nodeNS(undefined);



// KEYED NODE


var _VirtualDom_keyedNodeNS = F2(function(namespace, tag)
{
	return F2(function(factList, kidList)
	{
		for (var kids = [], descendantsCount = 0; kidList.b; kidList = kidList.b) // WHILE_CONS
		{
			var kid = kidList.a;
			descendantsCount += (kid.b.b || 0);
			kids.push(kid);
		}
		descendantsCount += kids.length;

		return {
			$: 2,
			c: tag,
			d: _VirtualDom_organizeFacts(factList),
			e: kids,
			f: namespace,
			b: descendantsCount
		};
	});
});


var _VirtualDom_keyedNode = _VirtualDom_keyedNodeNS(undefined);



// CUSTOM


function _VirtualDom_custom(factList, model, render, diff)
{
	return {
		$: 3,
		d: _VirtualDom_organizeFacts(factList),
		g: model,
		h: render,
		i: diff
	};
}



// MAP


var _VirtualDom_map = F2(function(tagger, node)
{
	return {
		$: 4,
		j: tagger,
		k: node,
		b: 1 + (node.b || 0)
	};
});



// LAZY


function _VirtualDom_thunk(refs, thunk)
{
	return {
		$: 5,
		l: refs,
		m: thunk,
		k: undefined
	};
}

var _VirtualDom_lazy = F2(function(func, a)
{
	return _VirtualDom_thunk([func, a], function() {
		return func(a);
	});
});

var _VirtualDom_lazy2 = F3(function(func, a, b)
{
	return _VirtualDom_thunk([func, a, b], function() {
		return A2(func, a, b);
	});
});

var _VirtualDom_lazy3 = F4(function(func, a, b, c)
{
	return _VirtualDom_thunk([func, a, b, c], function() {
		return A3(func, a, b, c);
	});
});

var _VirtualDom_lazy4 = F5(function(func, a, b, c, d)
{
	return _VirtualDom_thunk([func, a, b, c, d], function() {
		return A4(func, a, b, c, d);
	});
});

var _VirtualDom_lazy5 = F6(function(func, a, b, c, d, e)
{
	return _VirtualDom_thunk([func, a, b, c, d, e], function() {
		return A5(func, a, b, c, d, e);
	});
});

var _VirtualDom_lazy6 = F7(function(func, a, b, c, d, e, f)
{
	return _VirtualDom_thunk([func, a, b, c, d, e, f], function() {
		return A6(func, a, b, c, d, e, f);
	});
});

var _VirtualDom_lazy7 = F8(function(func, a, b, c, d, e, f, g)
{
	return _VirtualDom_thunk([func, a, b, c, d, e, f, g], function() {
		return A7(func, a, b, c, d, e, f, g);
	});
});

var _VirtualDom_lazy8 = F9(function(func, a, b, c, d, e, f, g, h)
{
	return _VirtualDom_thunk([func, a, b, c, d, e, f, g, h], function() {
		return A8(func, a, b, c, d, e, f, g, h);
	});
});



// FACTS


var _VirtualDom_on = F2(function(key, handler)
{
	return {
		$: 'a0',
		n: key,
		o: handler
	};
});
var _VirtualDom_style = F2(function(key, value)
{
	return {
		$: 'a1',
		n: key,
		o: value
	};
});
var _VirtualDom_property = F2(function(key, value)
{
	return {
		$: 'a2',
		n: key,
		o: value
	};
});
var _VirtualDom_attribute = F2(function(key, value)
{
	return {
		$: 'a3',
		n: key,
		o: value
	};
});
var _VirtualDom_attributeNS = F3(function(namespace, key, value)
{
	return {
		$: 'a4',
		n: key,
		o: { f: namespace, o: value }
	};
});



// XSS ATTACK VECTOR CHECKS


function _VirtualDom_noScript(tag)
{
	return tag == 'script' ? 'p' : tag;
}

function _VirtualDom_noOnOrFormAction(key)
{
	return /^(on|formAction$)/i.test(key) ? 'data-' + key : key;
}

function _VirtualDom_noInnerHtmlOrFormAction(key)
{
	return key == 'innerHTML' || key == 'formAction' ? 'data-' + key : key;
}

function _VirtualDom_noJavaScriptUri_UNUSED(value)
{
	return /^javascript:/i.test(value.replace(/\s/g,'')) ? '' : value;
}

function _VirtualDom_noJavaScriptUri(value)
{
	return /^javascript:/i.test(value.replace(/\s/g,''))
		? 'javascript:alert("This is an XSS vector. Please use ports or web components instead.")'
		: value;
}

function _VirtualDom_noJavaScriptOrHtmlUri_UNUSED(value)
{
	return /^\s*(javascript:|data:text\/html)/i.test(value) ? '' : value;
}

function _VirtualDom_noJavaScriptOrHtmlUri(value)
{
	return /^\s*(javascript:|data:text\/html)/i.test(value)
		? 'javascript:alert("This is an XSS vector. Please use ports or web components instead.")'
		: value;
}



// MAP FACTS


var _VirtualDom_mapAttribute = F2(function(func, attr)
{
	return (attr.$ === 'a0')
		? A2(_VirtualDom_on, attr.n, _VirtualDom_mapHandler(func, attr.o))
		: attr;
});

function _VirtualDom_mapHandler(func, handler)
{
	var tag = elm$virtual_dom$VirtualDom$toHandlerInt(handler);

	// 0 = Normal
	// 1 = MayStopPropagation
	// 2 = MayPreventDefault
	// 3 = Custom

	return {
		$: handler.$,
		a:
			!tag
				? A2(elm$json$Json$Decode$map, func, handler.a)
				:
			A3(elm$json$Json$Decode$map2,
				tag < 3
					? _VirtualDom_mapEventTuple
					: _VirtualDom_mapEventRecord,
				elm$json$Json$Decode$succeed(func),
				handler.a
			)
	};
}

var _VirtualDom_mapEventTuple = F2(function(func, tuple)
{
	return _Utils_Tuple2(func(tuple.a), tuple.b);
});

var _VirtualDom_mapEventRecord = F2(function(func, record)
{
	return {
		message: func(record.message),
		stopPropagation: record.stopPropagation,
		preventDefault: record.preventDefault
	}
});



// ORGANIZE FACTS


function _VirtualDom_organizeFacts(factList)
{
	for (var facts = {}; factList.b; factList = factList.b) // WHILE_CONS
	{
		var entry = factList.a;

		var tag = entry.$;
		var key = entry.n;
		var value = entry.o;

		if (tag === 'a2')
		{
			(key === 'className')
				? _VirtualDom_addClass(facts, key, _Json_unwrap(value))
				: facts[key] = _Json_unwrap(value);

			continue;
		}

		var subFacts = facts[tag] || (facts[tag] = {});
		(tag === 'a3' && key === 'class')
			? _VirtualDom_addClass(subFacts, key, value)
			: subFacts[key] = value;
	}

	return facts;
}

function _VirtualDom_addClass(object, key, newClass)
{
	var classes = object[key];
	object[key] = classes ? classes + ' ' + newClass : newClass;
}



// RENDER


function _VirtualDom_render(vNode, eventNode)
{
	var tag = vNode.$;

	if (tag === 5)
	{
		return _VirtualDom_render(vNode.k || (vNode.k = vNode.m()), eventNode);
	}

	if (tag === 0)
	{
		return _VirtualDom_doc.createTextNode(vNode.a);
	}

	if (tag === 4)
	{
		var subNode = vNode.k;
		var tagger = vNode.j;

		while (subNode.$ === 4)
		{
			typeof tagger !== 'object'
				? tagger = [tagger, subNode.j]
				: tagger.push(subNode.j);

			subNode = subNode.k;
		}

		var subEventRoot = { j: tagger, p: eventNode };
		var domNode = _VirtualDom_render(subNode, subEventRoot);
		domNode.elm_event_node_ref = subEventRoot;
		return domNode;
	}

	if (tag === 3)
	{
		var domNode = vNode.h(vNode.g);
		_VirtualDom_applyFacts(domNode, eventNode, vNode.d);
		return domNode;
	}

	// at this point `tag` must be 1 or 2

	var domNode = vNode.f
		? _VirtualDom_doc.createElementNS(vNode.f, vNode.c)
		: _VirtualDom_doc.createElement(vNode.c);

	if (_VirtualDom_divertHrefToApp && vNode.c == 'a')
	{
		domNode.addEventListener('click', _VirtualDom_divertHrefToApp(domNode));
	}

	_VirtualDom_applyFacts(domNode, eventNode, vNode.d);

	for (var kids = vNode.e, i = 0; i < kids.length; i++)
	{
		_VirtualDom_appendChild(domNode, _VirtualDom_render(tag === 1 ? kids[i] : kids[i].b, eventNode));
	}

	return domNode;
}



// APPLY FACTS


function _VirtualDom_applyFacts(domNode, eventNode, facts)
{
	for (var key in facts)
	{
		var value = facts[key];

		key === 'a1'
			? _VirtualDom_applyStyles(domNode, value)
			:
		key === 'a0'
			? _VirtualDom_applyEvents(domNode, eventNode, value)
			:
		key === 'a3'
			? _VirtualDom_applyAttrs(domNode, value)
			:
		key === 'a4'
			? _VirtualDom_applyAttrsNS(domNode, value)
			:
		((key !== 'value' && key !== 'checked') || domNode[key] !== value) && (domNode[key] = value);
	}
}



// APPLY STYLES


function _VirtualDom_applyStyles(domNode, styles)
{
	var domNodeStyle = domNode.style;

	for (var key in styles)
	{
		domNodeStyle[key] = styles[key];
	}
}



// APPLY ATTRS


function _VirtualDom_applyAttrs(domNode, attrs)
{
	for (var key in attrs)
	{
		var value = attrs[key];
		typeof value !== 'undefined'
			? domNode.setAttribute(key, value)
			: domNode.removeAttribute(key);
	}
}



// APPLY NAMESPACED ATTRS


function _VirtualDom_applyAttrsNS(domNode, nsAttrs)
{
	for (var key in nsAttrs)
	{
		var pair = nsAttrs[key];
		var namespace = pair.f;
		var value = pair.o;

		typeof value !== 'undefined'
			? domNode.setAttributeNS(namespace, key, value)
			: domNode.removeAttributeNS(namespace, key);
	}
}



// APPLY EVENTS


function _VirtualDom_applyEvents(domNode, eventNode, events)
{
	var allCallbacks = domNode.elmFs || (domNode.elmFs = {});

	for (var key in events)
	{
		var newHandler = events[key];
		var oldCallback = allCallbacks[key];

		if (!newHandler)
		{
			domNode.removeEventListener(key, oldCallback);
			allCallbacks[key] = undefined;
			continue;
		}

		if (oldCallback)
		{
			var oldHandler = oldCallback.q;
			if (oldHandler.$ === newHandler.$)
			{
				oldCallback.q = newHandler;
				continue;
			}
			domNode.removeEventListener(key, oldCallback);
		}

		oldCallback = _VirtualDom_makeCallback(eventNode, newHandler);
		domNode.addEventListener(key, oldCallback,
			_VirtualDom_passiveSupported
			&& { passive: elm$virtual_dom$VirtualDom$toHandlerInt(newHandler) < 2 }
		);
		allCallbacks[key] = oldCallback;
	}
}



// PASSIVE EVENTS


var _VirtualDom_passiveSupported;

try
{
	window.addEventListener('t', null, Object.defineProperty({}, 'passive', {
		get: function() { _VirtualDom_passiveSupported = true; }
	}));
}
catch(e) {}



// EVENT HANDLERS


function _VirtualDom_makeCallback(eventNode, initialHandler)
{
	function callback(event)
	{
		var handler = callback.q;
		var result = _Json_runHelp(handler.a, event);

		if (!elm$core$Result$isOk(result))
		{
			return;
		}

		var tag = elm$virtual_dom$VirtualDom$toHandlerInt(handler);

		// 0 = Normal
		// 1 = MayStopPropagation
		// 2 = MayPreventDefault
		// 3 = Custom

		var value = result.a;
		var message = !tag ? value : tag < 3 ? value.a : value.message;
		var stopPropagation = tag == 1 ? value.b : tag == 3 && value.stopPropagation;
		var currentEventNode = (
			stopPropagation && event.stopPropagation(),
			(tag == 2 ? value.b : tag == 3 && value.preventDefault) && event.preventDefault(),
			eventNode
		);
		var tagger;
		var i;
		while (tagger = currentEventNode.j)
		{
			if (typeof tagger == 'function')
			{
				message = tagger(message);
			}
			else
			{
				for (var i = tagger.length; i--; )
				{
					message = tagger[i](message);
				}
			}
			currentEventNode = currentEventNode.p;
		}
		currentEventNode(message, stopPropagation); // stopPropagation implies isSync
	}

	callback.q = initialHandler;

	return callback;
}

function _VirtualDom_equalEvents(x, y)
{
	return x.$ == y.$ && _Json_equality(x.a, y.a);
}



// DIFF


// TODO: Should we do patches like in iOS?
//
// type Patch
//   = At Int Patch
//   | Batch (List Patch)
//   | Change ...
//
// How could it not be better?
//
function _VirtualDom_diff(x, y)
{
	var patches = [];
	_VirtualDom_diffHelp(x, y, patches, 0);
	return patches;
}


function _VirtualDom_pushPatch(patches, type, index, data)
{
	var patch = {
		$: type,
		r: index,
		s: data,
		t: undefined,
		u: undefined
	};
	patches.push(patch);
	return patch;
}


function _VirtualDom_diffHelp(x, y, patches, index)
{
	if (x === y)
	{
		return;
	}

	var xType = x.$;
	var yType = y.$;

	// Bail if you run into different types of nodes. Implies that the
	// structure has changed significantly and it's not worth a diff.
	if (xType !== yType)
	{
		if (xType === 1 && yType === 2)
		{
			y = _VirtualDom_dekey(y);
			yType = 1;
		}
		else
		{
			_VirtualDom_pushPatch(patches, 0, index, y);
			return;
		}
	}

	// Now we know that both nodes are the same $.
	switch (yType)
	{
		case 5:
			var xRefs = x.l;
			var yRefs = y.l;
			var i = xRefs.length;
			var same = i === yRefs.length;
			while (same && i--)
			{
				same = xRefs[i] === yRefs[i];
			}
			if (same)
			{
				y.k = x.k;
				return;
			}
			y.k = y.m();
			var subPatches = [];
			_VirtualDom_diffHelp(x.k, y.k, subPatches, 0);
			subPatches.length > 0 && _VirtualDom_pushPatch(patches, 1, index, subPatches);
			return;

		case 4:
			// gather nested taggers
			var xTaggers = x.j;
			var yTaggers = y.j;
			var nesting = false;

			var xSubNode = x.k;
			while (xSubNode.$ === 4)
			{
				nesting = true;

				typeof xTaggers !== 'object'
					? xTaggers = [xTaggers, xSubNode.j]
					: xTaggers.push(xSubNode.j);

				xSubNode = xSubNode.k;
			}

			var ySubNode = y.k;
			while (ySubNode.$ === 4)
			{
				nesting = true;

				typeof yTaggers !== 'object'
					? yTaggers = [yTaggers, ySubNode.j]
					: yTaggers.push(ySubNode.j);

				ySubNode = ySubNode.k;
			}

			// Just bail if different numbers of taggers. This implies the
			// structure of the virtual DOM has changed.
			if (nesting && xTaggers.length !== yTaggers.length)
			{
				_VirtualDom_pushPatch(patches, 0, index, y);
				return;
			}

			// check if taggers are "the same"
			if (nesting ? !_VirtualDom_pairwiseRefEqual(xTaggers, yTaggers) : xTaggers !== yTaggers)
			{
				_VirtualDom_pushPatch(patches, 2, index, yTaggers);
			}

			// diff everything below the taggers
			_VirtualDom_diffHelp(xSubNode, ySubNode, patches, index + 1);
			return;

		case 0:
			if (x.a !== y.a)
			{
				_VirtualDom_pushPatch(patches, 3, index, y.a);
			}
			return;

		case 1:
			_VirtualDom_diffNodes(x, y, patches, index, _VirtualDom_diffKids);
			return;

		case 2:
			_VirtualDom_diffNodes(x, y, patches, index, _VirtualDom_diffKeyedKids);
			return;

		case 3:
			if (x.h !== y.h)
			{
				_VirtualDom_pushPatch(patches, 0, index, y);
				return;
			}

			var factsDiff = _VirtualDom_diffFacts(x.d, y.d);
			factsDiff && _VirtualDom_pushPatch(patches, 4, index, factsDiff);

			var patch = y.i(x.g, y.g);
			patch && _VirtualDom_pushPatch(patches, 5, index, patch);

			return;
	}
}

// assumes the incoming arrays are the same length
function _VirtualDom_pairwiseRefEqual(as, bs)
{
	for (var i = 0; i < as.length; i++)
	{
		if (as[i] !== bs[i])
		{
			return false;
		}
	}

	return true;
}

function _VirtualDom_diffNodes(x, y, patches, index, diffKids)
{
	// Bail if obvious indicators have changed. Implies more serious
	// structural changes such that it's not worth it to diff.
	if (x.c !== y.c || x.f !== y.f)
	{
		_VirtualDom_pushPatch(patches, 0, index, y);
		return;
	}

	var factsDiff = _VirtualDom_diffFacts(x.d, y.d);
	factsDiff && _VirtualDom_pushPatch(patches, 4, index, factsDiff);

	diffKids(x, y, patches, index);
}



// DIFF FACTS


// TODO Instead of creating a new diff object, it's possible to just test if
// there *is* a diff. During the actual patch, do the diff again and make the
// modifications directly. This way, there's no new allocations. Worth it?
function _VirtualDom_diffFacts(x, y, category)
{
	var diff;

	// look for changes and removals
	for (var xKey in x)
	{
		if (xKey === 'a1' || xKey === 'a0' || xKey === 'a3' || xKey === 'a4')
		{
			var subDiff = _VirtualDom_diffFacts(x[xKey], y[xKey] || {}, xKey);
			if (subDiff)
			{
				diff = diff || {};
				diff[xKey] = subDiff;
			}
			continue;
		}

		// remove if not in the new facts
		if (!(xKey in y))
		{
			diff = diff || {};
			diff[xKey] =
				!category
					? (typeof x[xKey] === 'string' ? '' : null)
					:
				(category === 'a1')
					? ''
					:
				(category === 'a0' || category === 'a3')
					? undefined
					:
				{ f: x[xKey].f, o: undefined };

			continue;
		}

		var xValue = x[xKey];
		var yValue = y[xKey];

		// reference equal, so don't worry about it
		if (xValue === yValue && xKey !== 'value' && xKey !== 'checked'
			|| category === 'a0' && _VirtualDom_equalEvents(xValue, yValue))
		{
			continue;
		}

		diff = diff || {};
		diff[xKey] = yValue;
	}

	// add new stuff
	for (var yKey in y)
	{
		if (!(yKey in x))
		{
			diff = diff || {};
			diff[yKey] = y[yKey];
		}
	}

	return diff;
}



// DIFF KIDS


function _VirtualDom_diffKids(xParent, yParent, patches, index)
{
	var xKids = xParent.e;
	var yKids = yParent.e;

	var xLen = xKids.length;
	var yLen = yKids.length;

	// FIGURE OUT IF THERE ARE INSERTS OR REMOVALS

	if (xLen > yLen)
	{
		_VirtualDom_pushPatch(patches, 6, index, {
			v: yLen,
			i: xLen - yLen
		});
	}
	else if (xLen < yLen)
	{
		_VirtualDom_pushPatch(patches, 7, index, {
			v: xLen,
			e: yKids
		});
	}

	// PAIRWISE DIFF EVERYTHING ELSE

	for (var minLen = xLen < yLen ? xLen : yLen, i = 0; i < minLen; i++)
	{
		var xKid = xKids[i];
		_VirtualDom_diffHelp(xKid, yKids[i], patches, ++index);
		index += xKid.b || 0;
	}
}



// KEYED DIFF


function _VirtualDom_diffKeyedKids(xParent, yParent, patches, rootIndex)
{
	var localPatches = [];

	var changes = {}; // Dict String Entry
	var inserts = []; // Array { index : Int, entry : Entry }
	// type Entry = { tag : String, vnode : VNode, index : Int, data : _ }

	var xKids = xParent.e;
	var yKids = yParent.e;
	var xLen = xKids.length;
	var yLen = yKids.length;
	var xIndex = 0;
	var yIndex = 0;

	var index = rootIndex;

	while (xIndex < xLen && yIndex < yLen)
	{
		var x = xKids[xIndex];
		var y = yKids[yIndex];

		var xKey = x.a;
		var yKey = y.a;
		var xNode = x.b;
		var yNode = y.b;

		var newMatch = undefined;
		var oldMatch = undefined;

		// check if keys match

		if (xKey === yKey)
		{
			index++;
			_VirtualDom_diffHelp(xNode, yNode, localPatches, index);
			index += xNode.b || 0;

			xIndex++;
			yIndex++;
			continue;
		}

		// look ahead 1 to detect insertions and removals.

		var xNext = xKids[xIndex + 1];
		var yNext = yKids[yIndex + 1];

		if (xNext)
		{
			var xNextKey = xNext.a;
			var xNextNode = xNext.b;
			oldMatch = yKey === xNextKey;
		}

		if (yNext)
		{
			var yNextKey = yNext.a;
			var yNextNode = yNext.b;
			newMatch = xKey === yNextKey;
		}


		// swap x and y
		if (newMatch && oldMatch)
		{
			index++;
			_VirtualDom_diffHelp(xNode, yNextNode, localPatches, index);
			_VirtualDom_insertNode(changes, localPatches, xKey, yNode, yIndex, inserts);
			index += xNode.b || 0;

			index++;
			_VirtualDom_removeNode(changes, localPatches, xKey, xNextNode, index);
			index += xNextNode.b || 0;

			xIndex += 2;
			yIndex += 2;
			continue;
		}

		// insert y
		if (newMatch)
		{
			index++;
			_VirtualDom_insertNode(changes, localPatches, yKey, yNode, yIndex, inserts);
			_VirtualDom_diffHelp(xNode, yNextNode, localPatches, index);
			index += xNode.b || 0;

			xIndex += 1;
			yIndex += 2;
			continue;
		}

		// remove x
		if (oldMatch)
		{
			index++;
			_VirtualDom_removeNode(changes, localPatches, xKey, xNode, index);
			index += xNode.b || 0;

			index++;
			_VirtualDom_diffHelp(xNextNode, yNode, localPatches, index);
			index += xNextNode.b || 0;

			xIndex += 2;
			yIndex += 1;
			continue;
		}

		// remove x, insert y
		if (xNext && xNextKey === yNextKey)
		{
			index++;
			_VirtualDom_removeNode(changes, localPatches, xKey, xNode, index);
			_VirtualDom_insertNode(changes, localPatches, yKey, yNode, yIndex, inserts);
			index += xNode.b || 0;

			index++;
			_VirtualDom_diffHelp(xNextNode, yNextNode, localPatches, index);
			index += xNextNode.b || 0;

			xIndex += 2;
			yIndex += 2;
			continue;
		}

		break;
	}

	// eat up any remaining nodes with removeNode and insertNode

	while (xIndex < xLen)
	{
		index++;
		var x = xKids[xIndex];
		var xNode = x.b;
		_VirtualDom_removeNode(changes, localPatches, x.a, xNode, index);
		index += xNode.b || 0;
		xIndex++;
	}

	while (yIndex < yLen)
	{
		var endInserts = endInserts || [];
		var y = yKids[yIndex];
		_VirtualDom_insertNode(changes, localPatches, y.a, y.b, undefined, endInserts);
		yIndex++;
	}

	if (localPatches.length > 0 || inserts.length > 0 || endInserts)
	{
		_VirtualDom_pushPatch(patches, 8, rootIndex, {
			w: localPatches,
			x: inserts,
			y: endInserts
		});
	}
}



// CHANGES FROM KEYED DIFF


var _VirtualDom_POSTFIX = '_elmW6BL';


function _VirtualDom_insertNode(changes, localPatches, key, vnode, yIndex, inserts)
{
	var entry = changes[key];

	// never seen this key before
	if (!entry)
	{
		entry = {
			c: 0,
			z: vnode,
			r: yIndex,
			s: undefined
		};

		inserts.push({ r: yIndex, A: entry });
		changes[key] = entry;

		return;
	}

	// this key was removed earlier, a match!
	if (entry.c === 1)
	{
		inserts.push({ r: yIndex, A: entry });

		entry.c = 2;
		var subPatches = [];
		_VirtualDom_diffHelp(entry.z, vnode, subPatches, entry.r);
		entry.r = yIndex;
		entry.s.s = {
			w: subPatches,
			A: entry
		};

		return;
	}

	// this key has already been inserted or moved, a duplicate!
	_VirtualDom_insertNode(changes, localPatches, key + _VirtualDom_POSTFIX, vnode, yIndex, inserts);
}


function _VirtualDom_removeNode(changes, localPatches, key, vnode, index)
{
	var entry = changes[key];

	// never seen this key before
	if (!entry)
	{
		var patch = _VirtualDom_pushPatch(localPatches, 9, index, undefined);

		changes[key] = {
			c: 1,
			z: vnode,
			r: index,
			s: patch
		};

		return;
	}

	// this key was inserted earlier, a match!
	if (entry.c === 0)
	{
		entry.c = 2;
		var subPatches = [];
		_VirtualDom_diffHelp(vnode, entry.z, subPatches, index);

		_VirtualDom_pushPatch(localPatches, 9, index, {
			w: subPatches,
			A: entry
		});

		return;
	}

	// this key has already been removed or moved, a duplicate!
	_VirtualDom_removeNode(changes, localPatches, key + _VirtualDom_POSTFIX, vnode, index);
}



// ADD DOM NODES
//
// Each DOM node has an "index" assigned in order of traversal. It is important
// to minimize our crawl over the actual DOM, so these indexes (along with the
// descendantsCount of virtual nodes) let us skip touching entire subtrees of
// the DOM if we know there are no patches there.


function _VirtualDom_addDomNodes(domNode, vNode, patches, eventNode)
{
	_VirtualDom_addDomNodesHelp(domNode, vNode, patches, 0, 0, vNode.b, eventNode);
}


// assumes `patches` is non-empty and indexes increase monotonically.
function _VirtualDom_addDomNodesHelp(domNode, vNode, patches, i, low, high, eventNode)
{
	var patch = patches[i];
	var index = patch.r;

	while (index === low)
	{
		var patchType = patch.$;

		if (patchType === 1)
		{
			_VirtualDom_addDomNodes(domNode, vNode.k, patch.s, eventNode);
		}
		else if (patchType === 8)
		{
			patch.t = domNode;
			patch.u = eventNode;

			var subPatches = patch.s.w;
			if (subPatches.length > 0)
			{
				_VirtualDom_addDomNodesHelp(domNode, vNode, subPatches, 0, low, high, eventNode);
			}
		}
		else if (patchType === 9)
		{
			patch.t = domNode;
			patch.u = eventNode;

			var data = patch.s;
			if (data)
			{
				data.A.s = domNode;
				var subPatches = data.w;
				if (subPatches.length > 0)
				{
					_VirtualDom_addDomNodesHelp(domNode, vNode, subPatches, 0, low, high, eventNode);
				}
			}
		}
		else
		{
			patch.t = domNode;
			patch.u = eventNode;
		}

		i++;

		if (!(patch = patches[i]) || (index = patch.r) > high)
		{
			return i;
		}
	}

	var tag = vNode.$;

	if (tag === 4)
	{
		var subNode = vNode.k;

		while (subNode.$ === 4)
		{
			subNode = subNode.k;
		}

		return _VirtualDom_addDomNodesHelp(domNode, subNode, patches, i, low + 1, high, domNode.elm_event_node_ref);
	}

	// tag must be 1 or 2 at this point

	var vKids = vNode.e;
	var childNodes = domNode.childNodes;
	for (var j = 0; j < vKids.length; j++)
	{
		low++;
		var vKid = tag === 1 ? vKids[j] : vKids[j].b;
		var nextLow = low + (vKid.b || 0);
		if (low <= index && index <= nextLow)
		{
			i = _VirtualDom_addDomNodesHelp(childNodes[j], vKid, patches, i, low, nextLow, eventNode);
			if (!(patch = patches[i]) || (index = patch.r) > high)
			{
				return i;
			}
		}
		low = nextLow;
	}
	return i;
}



// APPLY PATCHES


function _VirtualDom_applyPatches(rootDomNode, oldVirtualNode, patches, eventNode)
{
	if (patches.length === 0)
	{
		return rootDomNode;
	}

	_VirtualDom_addDomNodes(rootDomNode, oldVirtualNode, patches, eventNode);
	return _VirtualDom_applyPatchesHelp(rootDomNode, patches);
}

function _VirtualDom_applyPatchesHelp(rootDomNode, patches)
{
	for (var i = 0; i < patches.length; i++)
	{
		var patch = patches[i];
		var localDomNode = patch.t
		var newNode = _VirtualDom_applyPatch(localDomNode, patch);
		if (localDomNode === rootDomNode)
		{
			rootDomNode = newNode;
		}
	}
	return rootDomNode;
}

function _VirtualDom_applyPatch(domNode, patch)
{
	switch (patch.$)
	{
		case 0:
			return _VirtualDom_applyPatchRedraw(domNode, patch.s, patch.u);

		case 4:
			_VirtualDom_applyFacts(domNode, patch.u, patch.s);
			return domNode;

		case 3:
			domNode.replaceData(0, domNode.length, patch.s);
			return domNode;

		case 1:
			return _VirtualDom_applyPatchesHelp(domNode, patch.s);

		case 2:
			if (domNode.elm_event_node_ref)
			{
				domNode.elm_event_node_ref.j = patch.s;
			}
			else
			{
				domNode.elm_event_node_ref = { j: patch.s, p: patch.u };
			}
			return domNode;

		case 6:
			var data = patch.s;
			for (var i = 0; i < data.i; i++)
			{
				domNode.removeChild(domNode.childNodes[data.v]);
			}
			return domNode;

		case 7:
			var data = patch.s;
			var kids = data.e;
			var i = data.v;
			var theEnd = domNode.childNodes[i];
			for (; i < kids.length; i++)
			{
				domNode.insertBefore(_VirtualDom_render(kids[i], patch.u), theEnd);
			}
			return domNode;

		case 9:
			var data = patch.s;
			if (!data)
			{
				domNode.parentNode.removeChild(domNode);
				return domNode;
			}
			var entry = data.A;
			if (typeof entry.r !== 'undefined')
			{
				domNode.parentNode.removeChild(domNode);
			}
			entry.s = _VirtualDom_applyPatchesHelp(domNode, data.w);
			return domNode;

		case 8:
			return _VirtualDom_applyPatchReorder(domNode, patch);

		case 5:
			return patch.s(domNode);

		default:
			_Debug_crash(10); // 'Ran into an unknown patch!'
	}
}


function _VirtualDom_applyPatchRedraw(domNode, vNode, eventNode)
{
	var parentNode = domNode.parentNode;
	var newNode = _VirtualDom_render(vNode, eventNode);

	if (!newNode.elm_event_node_ref)
	{
		newNode.elm_event_node_ref = domNode.elm_event_node_ref;
	}

	if (parentNode && newNode !== domNode)
	{
		parentNode.replaceChild(newNode, domNode);
	}
	return newNode;
}


function _VirtualDom_applyPatchReorder(domNode, patch)
{
	var data = patch.s;

	// remove end inserts
	var frag = _VirtualDom_applyPatchReorderEndInsertsHelp(data.y, patch);

	// removals
	domNode = _VirtualDom_applyPatchesHelp(domNode, data.w);

	// inserts
	var inserts = data.x;
	for (var i = 0; i < inserts.length; i++)
	{
		var insert = inserts[i];
		var entry = insert.A;
		var node = entry.c === 2
			? entry.s
			: _VirtualDom_render(entry.z, patch.u);
		domNode.insertBefore(node, domNode.childNodes[insert.r]);
	}

	// add end inserts
	if (frag)
	{
		_VirtualDom_appendChild(domNode, frag);
	}

	return domNode;
}


function _VirtualDom_applyPatchReorderEndInsertsHelp(endInserts, patch)
{
	if (!endInserts)
	{
		return;
	}

	var frag = _VirtualDom_doc.createDocumentFragment();
	for (var i = 0; i < endInserts.length; i++)
	{
		var insert = endInserts[i];
		var entry = insert.A;
		_VirtualDom_appendChild(frag, entry.c === 2
			? entry.s
			: _VirtualDom_render(entry.z, patch.u)
		);
	}
	return frag;
}


function _VirtualDom_virtualize(node)
{
	// TEXT NODES

	if (node.nodeType === 3)
	{
		return _VirtualDom_text(node.textContent);
	}


	// WEIRD NODES

	if (node.nodeType !== 1)
	{
		return _VirtualDom_text('');
	}


	// ELEMENT NODES

	var attrList = _List_Nil;
	var attrs = node.attributes;
	for (var i = attrs.length; i--; )
	{
		var attr = attrs[i];
		var name = attr.name;
		var value = attr.value;
		attrList = _List_Cons( A2(_VirtualDom_attribute, name, value), attrList );
	}

	var tag = node.tagName.toLowerCase();
	var kidList = _List_Nil;
	var kids = node.childNodes;

	for (var i = kids.length; i--; )
	{
		kidList = _List_Cons(_VirtualDom_virtualize(kids[i]), kidList);
	}
	return A3(_VirtualDom_node, tag, attrList, kidList);
}

function _VirtualDom_dekey(keyedNode)
{
	var keyedKids = keyedNode.e;
	var len = keyedKids.length;
	var kids = new Array(len);
	for (var i = 0; i < len; i++)
	{
		kids[i] = keyedKids[i].b;
	}

	return {
		$: 1,
		c: keyedNode.c,
		d: keyedNode.d,
		e: kids,
		f: keyedNode.f,
		b: keyedNode.b
	};
}




// ELEMENT


var _Debugger_element;

var _Browser_element = _Debugger_element || F4(function(impl, flagDecoder, debugMetadata, args)
{
	return _Platform_initialize(
		flagDecoder,
		args,
		impl.init,
		impl.update,
		impl.subscriptions,
		function(sendToApp, initialModel) {
			var view = impl.view;
			/**_UNUSED/
			var domNode = args['node'];
			//*/
			/**/
			var domNode = args && args['node'] ? args['node'] : _Debug_crash(0);
			//*/
			var currNode = _VirtualDom_virtualize(domNode);

			return _Browser_makeAnimator(initialModel, function(model)
			{
				var nextNode = view(model);
				var patches = _VirtualDom_diff(currNode, nextNode);
				domNode = _VirtualDom_applyPatches(domNode, currNode, patches, sendToApp);
				currNode = nextNode;
			});
		}
	);
});



// DOCUMENT


var _Debugger_document;

var _Browser_document = _Debugger_document || F4(function(impl, flagDecoder, debugMetadata, args)
{
	return _Platform_initialize(
		flagDecoder,
		args,
		impl.init,
		impl.update,
		impl.subscriptions,
		function(sendToApp, initialModel) {
			var divertHrefToApp = impl.setup && impl.setup(sendToApp)
			var view = impl.view;
			var title = _VirtualDom_doc.title;
			var bodyNode = _VirtualDom_doc.body;
			var currNode = _VirtualDom_virtualize(bodyNode);
			return _Browser_makeAnimator(initialModel, function(model)
			{
				_VirtualDom_divertHrefToApp = divertHrefToApp;
				var doc = view(model);
				var nextNode = _VirtualDom_node('body')(_List_Nil)(doc.body);
				var patches = _VirtualDom_diff(currNode, nextNode);
				bodyNode = _VirtualDom_applyPatches(bodyNode, currNode, patches, sendToApp);
				currNode = nextNode;
				_VirtualDom_divertHrefToApp = 0;
				(title !== doc.title) && (_VirtualDom_doc.title = title = doc.title);
			});
		}
	);
});



// ANIMATION


var _Browser_requestAnimationFrame =
	typeof requestAnimationFrame !== 'undefined'
		? requestAnimationFrame
		: function(callback) { setTimeout(callback, 1000 / 60); };


function _Browser_makeAnimator(model, draw)
{
	draw(model);

	var state = 0;

	function updateIfNeeded()
	{
		state = state === 1
			? 0
			: ( _Browser_requestAnimationFrame(updateIfNeeded), draw(model), 1 );
	}

	return function(nextModel, isSync)
	{
		model = nextModel;

		isSync
			? ( draw(model),
				state === 2 && (state = 1)
				)
			: ( state === 0 && _Browser_requestAnimationFrame(updateIfNeeded),
				state = 2
				);
	};
}



// APPLICATION


function _Browser_application(impl)
{
	var onUrlChange = impl.onUrlChange;
	var onUrlRequest = impl.onUrlRequest;
	var key = function() { key.a(onUrlChange(_Browser_getUrl())); };

	return _Browser_document({
		setup: function(sendToApp)
		{
			key.a = sendToApp;
			_Browser_window.addEventListener('popstate', key);
			_Browser_window.navigator.userAgent.indexOf('Trident') < 0 || _Browser_window.addEventListener('hashchange', key);

			return F2(function(domNode, event)
			{
				if (!event.ctrlKey && !event.metaKey && !event.shiftKey && event.button < 1 && !domNode.target && !domNode.download)
				{
					event.preventDefault();
					var href = domNode.href;
					var curr = _Browser_getUrl();
					var next = elm$url$Url$fromString(href).a;
					sendToApp(onUrlRequest(
						(next
							&& curr.protocol === next.protocol
							&& curr.host === next.host
							&& curr.port_.a === next.port_.a
						)
							? elm$browser$Browser$Internal(next)
							: elm$browser$Browser$External(href)
					));
				}
			});
		},
		init: function(flags)
		{
			return A3(impl.init, flags, _Browser_getUrl(), key);
		},
		view: impl.view,
		update: impl.update,
		subscriptions: impl.subscriptions
	});
}

function _Browser_getUrl()
{
	return elm$url$Url$fromString(_VirtualDom_doc.location.href).a || _Debug_crash(1);
}

var _Browser_go = F2(function(key, n)
{
	return A2(elm$core$Task$perform, elm$core$Basics$never, _Scheduler_binding(function() {
		n && history.go(n);
		key();
	}));
});

var _Browser_pushUrl = F2(function(key, url)
{
	return A2(elm$core$Task$perform, elm$core$Basics$never, _Scheduler_binding(function() {
		history.pushState({}, '', url);
		key();
	}));
});

var _Browser_replaceUrl = F2(function(key, url)
{
	return A2(elm$core$Task$perform, elm$core$Basics$never, _Scheduler_binding(function() {
		history.replaceState({}, '', url);
		key();
	}));
});



// GLOBAL EVENTS


var _Browser_fakeNode = { addEventListener: function() {}, removeEventListener: function() {} };
var _Browser_doc = typeof document !== 'undefined' ? document : _Browser_fakeNode;
var _Browser_window = typeof window !== 'undefined' ? window : _Browser_fakeNode;

var _Browser_on = F3(function(node, eventName, sendToSelf)
{
	return _Scheduler_spawn(_Scheduler_binding(function(callback)
	{
		function handler(event)	{ _Scheduler_rawSpawn(sendToSelf(event)); }
		node.addEventListener(eventName, handler, _VirtualDom_passiveSupported && { passive: true });
		return function() { node.removeEventListener(eventName, handler); };
	}));
});

var _Browser_decodeEvent = F2(function(decoder, event)
{
	var result = _Json_runHelp(decoder, event);
	return elm$core$Result$isOk(result) ? elm$core$Maybe$Just(result.a) : elm$core$Maybe$Nothing;
});



// PAGE VISIBILITY


function _Browser_visibilityInfo()
{
	return (typeof _VirtualDom_doc.hidden !== 'undefined')
		? { hidden: 'hidden', change: 'visibilitychange' }
		:
	(typeof _VirtualDom_doc.mozHidden !== 'undefined')
		? { hidden: 'mozHidden', change: 'mozvisibilitychange' }
		:
	(typeof _VirtualDom_doc.msHidden !== 'undefined')
		? { hidden: 'msHidden', change: 'msvisibilitychange' }
		:
	(typeof _VirtualDom_doc.webkitHidden !== 'undefined')
		? { hidden: 'webkitHidden', change: 'webkitvisibilitychange' }
		: { hidden: 'hidden', change: 'visibilitychange' };
}



// ANIMATION FRAMES


function _Browser_rAF()
{
	return _Scheduler_binding(function(callback)
	{
		var id = requestAnimationFrame(function() {
			callback(_Scheduler_succeed(Date.now()));
		});

		return function() {
			cancelAnimationFrame(id);
		};
	});
}


function _Browser_now()
{
	return _Scheduler_binding(function(callback)
	{
		callback(_Scheduler_succeed(Date.now()));
	});
}



// DOM STUFF


function _Browser_withNode(id, doStuff)
{
	return _Scheduler_binding(function(callback)
	{
		_Browser_requestAnimationFrame(function() {
			var node = document.getElementById(id);
			callback(node
				? _Scheduler_succeed(doStuff(node))
				: _Scheduler_fail(elm$browser$Browser$Dom$NotFound(id))
			);
		});
	});
}


function _Browser_withWindow(doStuff)
{
	return _Scheduler_binding(function(callback)
	{
		_Browser_requestAnimationFrame(function() {
			callback(_Scheduler_succeed(doStuff()));
		});
	});
}


// FOCUS and BLUR


var _Browser_call = F2(function(functionName, id)
{
	return _Browser_withNode(id, function(node) {
		node[functionName]();
		return _Utils_Tuple0;
	});
});



// WINDOW VIEWPORT


function _Browser_getViewport()
{
	return {
		scene: _Browser_getScene(),
		viewport: {
			x: _Browser_window.pageXOffset,
			y: _Browser_window.pageYOffset,
			width: _Browser_doc.documentElement.clientWidth,
			height: _Browser_doc.documentElement.clientHeight
		}
	};
}

function _Browser_getScene()
{
	var body = _Browser_doc.body;
	var elem = _Browser_doc.documentElement;
	return {
		width: Math.max(body.scrollWidth, body.offsetWidth, elem.scrollWidth, elem.offsetWidth, elem.clientWidth),
		height: Math.max(body.scrollHeight, body.offsetHeight, elem.scrollHeight, elem.offsetHeight, elem.clientHeight)
	};
}

var _Browser_setViewport = F2(function(x, y)
{
	return _Browser_withWindow(function()
	{
		_Browser_window.scroll(x, y);
		return _Utils_Tuple0;
	});
});



// ELEMENT VIEWPORT


function _Browser_getViewportOf(id)
{
	return _Browser_withNode(id, function(node)
	{
		return {
			scene: {
				width: node.scrollWidth,
				height: node.scrollHeight
			},
			viewport: {
				x: node.scrollLeft,
				y: node.scrollTop,
				width: node.clientWidth,
				height: node.clientHeight
			}
		};
	});
}


var _Browser_setViewportOf = F3(function(id, x, y)
{
	return _Browser_withNode(id, function(node)
	{
		node.scrollLeft = x;
		node.scrollTop = y;
		return _Utils_Tuple0;
	});
});



// ELEMENT


function _Browser_getElement(id)
{
	return _Browser_withNode(id, function(node)
	{
		var rect = node.getBoundingClientRect();
		var x = _Browser_window.pageXOffset;
		var y = _Browser_window.pageYOffset;
		return {
			scene: _Browser_getScene(),
			viewport: {
				x: x,
				y: y,
				width: _Browser_doc.documentElement.clientWidth,
				height: _Browser_doc.documentElement.clientHeight
			},
			element: {
				x: x + rect.left,
				y: y + rect.top,
				width: rect.width,
				height: rect.height
			}
		};
	});
}



// LOAD and RELOAD


function _Browser_reload(skipCache)
{
	return A2(elm$core$Task$perform, elm$core$Basics$never, _Scheduler_binding(function(callback)
	{
		_VirtualDom_doc.location.reload(skipCache);
	}));
}

function _Browser_load(url)
{
	return A2(elm$core$Task$perform, elm$core$Basics$never, _Scheduler_binding(function(callback)
	{
		try
		{
			_Browser_window.location = url;
		}
		catch(err)
		{
			// Only Firefox can throw a NS_ERROR_MALFORMED_URI exception here.
			// Other browsers reload the page, so let's be consistent about that.
			_VirtualDom_doc.location.reload(false);
		}
	}));
}



function _Time_now(millisToPosix)
{
	return _Scheduler_binding(function(callback)
	{
		callback(_Scheduler_succeed(millisToPosix(Date.now())));
	});
}

var _Time_setInterval = F2(function(interval, task)
{
	return _Scheduler_binding(function(callback)
	{
		var id = setInterval(function() { _Scheduler_rawSpawn(task); }, interval);
		return function() { clearInterval(id); };
	});
});

function _Time_here()
{
	return _Scheduler_binding(function(callback)
	{
		callback(_Scheduler_succeed(
			A2(elm$time$Time$customZone, -(new Date().getTimezoneOffset()), _List_Nil)
		));
	});
}


function _Time_getZoneName()
{
	return _Scheduler_binding(function(callback)
	{
		try
		{
			var name = elm$time$Time$Name(Intl.DateTimeFormat().resolvedOptions().timeZone);
		}
		catch (e)
		{
			var name = elm$time$Time$Offset(new Date().getTimezoneOffset());
		}
		callback(_Scheduler_succeed(name));
	});
}
var author$project$Data$Drawer$Home = {$: 'Home'};
var elm$core$Basics$EQ = {$: 'EQ'};
var elm$core$Basics$LT = {$: 'LT'};
var elm$core$Elm$JsArray$foldr = _JsArray_foldr;
var elm$core$Array$foldr = F3(
	function (func, baseCase, _n0) {
		var tree = _n0.c;
		var tail = _n0.d;
		var helper = F2(
			function (node, acc) {
				if (node.$ === 'SubTree') {
					var subTree = node.a;
					return A3(elm$core$Elm$JsArray$foldr, helper, acc, subTree);
				} else {
					var values = node.a;
					return A3(elm$core$Elm$JsArray$foldr, func, acc, values);
				}
			});
		return A3(
			elm$core$Elm$JsArray$foldr,
			helper,
			A3(elm$core$Elm$JsArray$foldr, func, baseCase, tail),
			tree);
	});
var elm$core$List$cons = _List_cons;
var elm$core$Array$toList = function (array) {
	return A3(elm$core$Array$foldr, elm$core$List$cons, _List_Nil, array);
};
var elm$core$Basics$GT = {$: 'GT'};
var elm$core$Dict$foldr = F3(
	function (func, acc, t) {
		foldr:
		while (true) {
			if (t.$ === 'RBEmpty_elm_builtin') {
				return acc;
			} else {
				var key = t.b;
				var value = t.c;
				var left = t.d;
				var right = t.e;
				var $temp$func = func,
					$temp$acc = A3(
					func,
					key,
					value,
					A3(elm$core$Dict$foldr, func, acc, right)),
					$temp$t = left;
				func = $temp$func;
				acc = $temp$acc;
				t = $temp$t;
				continue foldr;
			}
		}
	});
var elm$core$Dict$toList = function (dict) {
	return A3(
		elm$core$Dict$foldr,
		F3(
			function (key, value, list) {
				return A2(
					elm$core$List$cons,
					_Utils_Tuple2(key, value),
					list);
			}),
		_List_Nil,
		dict);
};
var elm$core$Dict$keys = function (dict) {
	return A3(
		elm$core$Dict$foldr,
		F3(
			function (key, value, keyList) {
				return A2(elm$core$List$cons, key, keyList);
			}),
		_List_Nil,
		dict);
};
var elm$core$Set$toList = function (_n0) {
	var dict = _n0.a;
	return elm$core$Dict$keys(dict);
};
var author$project$Data$Drawer$init = {
	drawerAlbum: {
		album: {album_type: '', artists: _List_Nil, id: '', images: _List_Nil, name: '', release_date: '', type_: '', uri: ''},
		tracks: _List_Nil
	},
	drawerArtist: {
		albums: _List_Nil,
		artist: {id: '', images: _List_Nil, name: '', popularity: 0, type_: ''},
		relatedArtists: _List_Nil,
		topTracks: _List_Nil,
		videos: _List_Nil
	},
	drawerCollection: {
		playlist: {
			id: '',
			images: _List_Nil,
			name: '',
			tracks: {items: _List_Nil},
			uri: ''
		},
		tracks: {items: _List_Nil}
	},
	drawerPlaylist: {
		playlist: {
			id: '',
			images: _List_Nil,
			name: '',
			tracks: {items: _List_Nil},
			uri: ''
		},
		tracks: {items: _List_Nil}
	},
	drawerType: author$project$Data$Drawer$Home
};
var elm$core$Basics$False = {$: 'False'};
var author$project$Data$Modal$init = {inPocket: _List_Nil, isOpen: false};
var author$project$Data$Player$init = {
	device: {id: '', name: '', volume_percent: 0},
	is_playing: false,
	item: {
		album: {album_type: '', artists: _List_Nil, id: ' ', images: _List_Nil, name: '', release_date: '', type_: '', uri: ''},
		artists: _List_Nil,
		duration_ms: 0,
		name: '',
		uri: ''
	},
	progress_ms: 0,
	repeat_state: '',
	shuffle_state: false
};
var author$project$Data$Playlist$Playlistslist = function (items) {
	return {items: items};
};
var author$project$Data$Image$Image = function (url) {
	return {url: url};
};
var elm$core$Array$branchFactor = 32;
var elm$core$Array$Array_elm_builtin = F4(
	function (a, b, c, d) {
		return {$: 'Array_elm_builtin', a: a, b: b, c: c, d: d};
	});
var elm$core$Basics$ceiling = _Basics_ceiling;
var elm$core$Basics$fdiv = _Basics_fdiv;
var elm$core$Basics$logBase = F2(
	function (base, number) {
		return _Basics_log(number) / _Basics_log(base);
	});
var elm$core$Basics$toFloat = _Basics_toFloat;
var elm$core$Array$shiftStep = elm$core$Basics$ceiling(
	A2(elm$core$Basics$logBase, 2, elm$core$Array$branchFactor));
var elm$core$Elm$JsArray$empty = _JsArray_empty;
var elm$core$Array$empty = A4(elm$core$Array$Array_elm_builtin, 0, elm$core$Array$shiftStep, elm$core$Elm$JsArray$empty, elm$core$Elm$JsArray$empty);
var elm$core$Array$Leaf = function (a) {
	return {$: 'Leaf', a: a};
};
var elm$core$Array$SubTree = function (a) {
	return {$: 'SubTree', a: a};
};
var elm$core$Elm$JsArray$initializeFromList = _JsArray_initializeFromList;
var elm$core$List$foldl = F3(
	function (func, acc, list) {
		foldl:
		while (true) {
			if (!list.b) {
				return acc;
			} else {
				var x = list.a;
				var xs = list.b;
				var $temp$func = func,
					$temp$acc = A2(func, x, acc),
					$temp$list = xs;
				func = $temp$func;
				acc = $temp$acc;
				list = $temp$list;
				continue foldl;
			}
		}
	});
var elm$core$List$reverse = function (list) {
	return A3(elm$core$List$foldl, elm$core$List$cons, _List_Nil, list);
};
var elm$core$Array$compressNodes = F2(
	function (nodes, acc) {
		compressNodes:
		while (true) {
			var _n0 = A2(elm$core$Elm$JsArray$initializeFromList, elm$core$Array$branchFactor, nodes);
			var node = _n0.a;
			var remainingNodes = _n0.b;
			var newAcc = A2(
				elm$core$List$cons,
				elm$core$Array$SubTree(node),
				acc);
			if (!remainingNodes.b) {
				return elm$core$List$reverse(newAcc);
			} else {
				var $temp$nodes = remainingNodes,
					$temp$acc = newAcc;
				nodes = $temp$nodes;
				acc = $temp$acc;
				continue compressNodes;
			}
		}
	});
var elm$core$Basics$apR = F2(
	function (x, f) {
		return f(x);
	});
var elm$core$Basics$eq = _Utils_equal;
var elm$core$Tuple$first = function (_n0) {
	var x = _n0.a;
	return x;
};
var elm$core$Array$treeFromBuilder = F2(
	function (nodeList, nodeListSize) {
		treeFromBuilder:
		while (true) {
			var newNodeSize = elm$core$Basics$ceiling(nodeListSize / elm$core$Array$branchFactor);
			if (newNodeSize === 1) {
				return A2(elm$core$Elm$JsArray$initializeFromList, elm$core$Array$branchFactor, nodeList).a;
			} else {
				var $temp$nodeList = A2(elm$core$Array$compressNodes, nodeList, _List_Nil),
					$temp$nodeListSize = newNodeSize;
				nodeList = $temp$nodeList;
				nodeListSize = $temp$nodeListSize;
				continue treeFromBuilder;
			}
		}
	});
var elm$core$Basics$add = _Basics_add;
var elm$core$Basics$apL = F2(
	function (f, x) {
		return f(x);
	});
var elm$core$Basics$floor = _Basics_floor;
var elm$core$Basics$gt = _Utils_gt;
var elm$core$Basics$max = F2(
	function (x, y) {
		return (_Utils_cmp(x, y) > 0) ? x : y;
	});
var elm$core$Basics$mul = _Basics_mul;
var elm$core$Basics$sub = _Basics_sub;
var elm$core$Elm$JsArray$length = _JsArray_length;
var elm$core$Array$builderToArray = F2(
	function (reverseNodeList, builder) {
		if (!builder.nodeListSize) {
			return A4(
				elm$core$Array$Array_elm_builtin,
				elm$core$Elm$JsArray$length(builder.tail),
				elm$core$Array$shiftStep,
				elm$core$Elm$JsArray$empty,
				builder.tail);
		} else {
			var treeLen = builder.nodeListSize * elm$core$Array$branchFactor;
			var depth = elm$core$Basics$floor(
				A2(elm$core$Basics$logBase, elm$core$Array$branchFactor, treeLen - 1));
			var correctNodeList = reverseNodeList ? elm$core$List$reverse(builder.nodeList) : builder.nodeList;
			var tree = A2(elm$core$Array$treeFromBuilder, correctNodeList, builder.nodeListSize);
			return A4(
				elm$core$Array$Array_elm_builtin,
				elm$core$Elm$JsArray$length(builder.tail) + treeLen,
				A2(elm$core$Basics$max, 5, depth * elm$core$Array$shiftStep),
				tree,
				builder.tail);
		}
	});
var elm$core$Basics$idiv = _Basics_idiv;
var elm$core$Basics$lt = _Utils_lt;
var elm$core$Elm$JsArray$initialize = _JsArray_initialize;
var elm$core$Array$initializeHelp = F5(
	function (fn, fromIndex, len, nodeList, tail) {
		initializeHelp:
		while (true) {
			if (fromIndex < 0) {
				return A2(
					elm$core$Array$builderToArray,
					false,
					{nodeList: nodeList, nodeListSize: (len / elm$core$Array$branchFactor) | 0, tail: tail});
			} else {
				var leaf = elm$core$Array$Leaf(
					A3(elm$core$Elm$JsArray$initialize, elm$core$Array$branchFactor, fromIndex, fn));
				var $temp$fn = fn,
					$temp$fromIndex = fromIndex - elm$core$Array$branchFactor,
					$temp$len = len,
					$temp$nodeList = A2(elm$core$List$cons, leaf, nodeList),
					$temp$tail = tail;
				fn = $temp$fn;
				fromIndex = $temp$fromIndex;
				len = $temp$len;
				nodeList = $temp$nodeList;
				tail = $temp$tail;
				continue initializeHelp;
			}
		}
	});
var elm$core$Basics$le = _Utils_le;
var elm$core$Basics$remainderBy = _Basics_remainderBy;
var elm$core$Array$initialize = F2(
	function (len, fn) {
		if (len <= 0) {
			return elm$core$Array$empty;
		} else {
			var tailLen = len % elm$core$Array$branchFactor;
			var tail = A3(elm$core$Elm$JsArray$initialize, tailLen, len - tailLen, fn);
			var initialFromIndex = (len - tailLen) - elm$core$Array$branchFactor;
			return A5(elm$core$Array$initializeHelp, fn, initialFromIndex, len, _List_Nil, tail);
		}
	});
var elm$core$Maybe$Just = function (a) {
	return {$: 'Just', a: a};
};
var elm$core$Maybe$Nothing = {$: 'Nothing'};
var elm$core$Result$Err = function (a) {
	return {$: 'Err', a: a};
};
var elm$core$Result$Ok = function (a) {
	return {$: 'Ok', a: a};
};
var elm$core$Basics$True = {$: 'True'};
var elm$core$Result$isOk = function (result) {
	if (result.$ === 'Ok') {
		return true;
	} else {
		return false;
	}
};
var elm$json$Json$Decode$Failure = F2(
	function (a, b) {
		return {$: 'Failure', a: a, b: b};
	});
var elm$json$Json$Decode$Field = F2(
	function (a, b) {
		return {$: 'Field', a: a, b: b};
	});
var elm$json$Json$Decode$Index = F2(
	function (a, b) {
		return {$: 'Index', a: a, b: b};
	});
var elm$json$Json$Decode$OneOf = function (a) {
	return {$: 'OneOf', a: a};
};
var elm$core$Basics$and = _Basics_and;
var elm$core$Basics$append = _Utils_append;
var elm$core$Basics$or = _Basics_or;
var elm$core$Char$toCode = _Char_toCode;
var elm$core$Char$isLower = function (_char) {
	var code = elm$core$Char$toCode(_char);
	return (97 <= code) && (code <= 122);
};
var elm$core$Char$isUpper = function (_char) {
	var code = elm$core$Char$toCode(_char);
	return (code <= 90) && (65 <= code);
};
var elm$core$Char$isAlpha = function (_char) {
	return elm$core$Char$isLower(_char) || elm$core$Char$isUpper(_char);
};
var elm$core$Char$isDigit = function (_char) {
	var code = elm$core$Char$toCode(_char);
	return (code <= 57) && (48 <= code);
};
var elm$core$Char$isAlphaNum = function (_char) {
	return elm$core$Char$isLower(_char) || (elm$core$Char$isUpper(_char) || elm$core$Char$isDigit(_char));
};
var elm$core$List$length = function (xs) {
	return A3(
		elm$core$List$foldl,
		F2(
			function (_n0, i) {
				return i + 1;
			}),
		0,
		xs);
};
var elm$core$List$map2 = _List_map2;
var elm$core$List$rangeHelp = F3(
	function (lo, hi, list) {
		rangeHelp:
		while (true) {
			if (_Utils_cmp(lo, hi) < 1) {
				var $temp$lo = lo,
					$temp$hi = hi - 1,
					$temp$list = A2(elm$core$List$cons, hi, list);
				lo = $temp$lo;
				hi = $temp$hi;
				list = $temp$list;
				continue rangeHelp;
			} else {
				return list;
			}
		}
	});
var elm$core$List$range = F2(
	function (lo, hi) {
		return A3(elm$core$List$rangeHelp, lo, hi, _List_Nil);
	});
var elm$core$List$indexedMap = F2(
	function (f, xs) {
		return A3(
			elm$core$List$map2,
			f,
			A2(
				elm$core$List$range,
				0,
				elm$core$List$length(xs) - 1),
			xs);
	});
var elm$core$String$all = _String_all;
var elm$core$String$fromInt = _String_fromNumber;
var elm$core$String$join = F2(
	function (sep, chunks) {
		return A2(
			_String_join,
			sep,
			_List_toArray(chunks));
	});
var elm$core$String$uncons = _String_uncons;
var elm$core$String$split = F2(
	function (sep, string) {
		return _List_fromArray(
			A2(_String_split, sep, string));
	});
var elm$json$Json$Decode$indent = function (str) {
	return A2(
		elm$core$String$join,
		'\n    ',
		A2(elm$core$String$split, '\n', str));
};
var elm$json$Json$Encode$encode = _Json_encode;
var elm$json$Json$Decode$errorOneOf = F2(
	function (i, error) {
		return '\n\n(' + (elm$core$String$fromInt(i + 1) + (') ' + elm$json$Json$Decode$indent(
			elm$json$Json$Decode$errorToString(error))));
	});
var elm$json$Json$Decode$errorToString = function (error) {
	return A2(elm$json$Json$Decode$errorToStringHelp, error, _List_Nil);
};
var elm$json$Json$Decode$errorToStringHelp = F2(
	function (error, context) {
		errorToStringHelp:
		while (true) {
			switch (error.$) {
				case 'Field':
					var f = error.a;
					var err = error.b;
					var isSimple = function () {
						var _n1 = elm$core$String$uncons(f);
						if (_n1.$ === 'Nothing') {
							return false;
						} else {
							var _n2 = _n1.a;
							var _char = _n2.a;
							var rest = _n2.b;
							return elm$core$Char$isAlpha(_char) && A2(elm$core$String$all, elm$core$Char$isAlphaNum, rest);
						}
					}();
					var fieldName = isSimple ? ('.' + f) : ('[\'' + (f + '\']'));
					var $temp$error = err,
						$temp$context = A2(elm$core$List$cons, fieldName, context);
					error = $temp$error;
					context = $temp$context;
					continue errorToStringHelp;
				case 'Index':
					var i = error.a;
					var err = error.b;
					var indexName = '[' + (elm$core$String$fromInt(i) + ']');
					var $temp$error = err,
						$temp$context = A2(elm$core$List$cons, indexName, context);
					error = $temp$error;
					context = $temp$context;
					continue errorToStringHelp;
				case 'OneOf':
					var errors = error.a;
					if (!errors.b) {
						return 'Ran into a Json.Decode.oneOf with no possibilities' + function () {
							if (!context.b) {
								return '!';
							} else {
								return ' at json' + A2(
									elm$core$String$join,
									'',
									elm$core$List$reverse(context));
							}
						}();
					} else {
						if (!errors.b.b) {
							var err = errors.a;
							var $temp$error = err,
								$temp$context = context;
							error = $temp$error;
							context = $temp$context;
							continue errorToStringHelp;
						} else {
							var starter = function () {
								if (!context.b) {
									return 'Json.Decode.oneOf';
								} else {
									return 'The Json.Decode.oneOf at json' + A2(
										elm$core$String$join,
										'',
										elm$core$List$reverse(context));
								}
							}();
							var introduction = starter + (' failed in the following ' + (elm$core$String$fromInt(
								elm$core$List$length(errors)) + ' ways:'));
							return A2(
								elm$core$String$join,
								'\n\n',
								A2(
									elm$core$List$cons,
									introduction,
									A2(elm$core$List$indexedMap, elm$json$Json$Decode$errorOneOf, errors)));
						}
					}
				default:
					var msg = error.a;
					var json = error.b;
					var introduction = function () {
						if (!context.b) {
							return 'Problem with the given value:\n\n';
						} else {
							return 'Problem with the value at json' + (A2(
								elm$core$String$join,
								'',
								elm$core$List$reverse(context)) + ':\n\n    ');
						}
					}();
					return introduction + (elm$json$Json$Decode$indent(
						A2(elm$json$Json$Encode$encode, 4, json)) + ('\n\n' + msg));
			}
		}
	});
var elm$json$Json$Decode$field = _Json_decodeField;
var elm$json$Json$Decode$map = _Json_map1;
var elm$json$Json$Decode$string = _Json_decodeString;
var author$project$Data$Image$decodeImage = A2(
	elm$json$Json$Decode$map,
	author$project$Data$Image$Image,
	A2(elm$json$Json$Decode$field, 'url', elm$json$Json$Decode$string));
var author$project$Data$Playlist$Playlists = F4(
	function (id, images, name, uri) {
		return {id: id, images: images, name: name, uri: uri};
	});
var elm$core$List$foldrHelper = F4(
	function (fn, acc, ctr, ls) {
		if (!ls.b) {
			return acc;
		} else {
			var a = ls.a;
			var r1 = ls.b;
			if (!r1.b) {
				return A2(fn, a, acc);
			} else {
				var b = r1.a;
				var r2 = r1.b;
				if (!r2.b) {
					return A2(
						fn,
						a,
						A2(fn, b, acc));
				} else {
					var c = r2.a;
					var r3 = r2.b;
					if (!r3.b) {
						return A2(
							fn,
							a,
							A2(
								fn,
								b,
								A2(fn, c, acc)));
					} else {
						var d = r3.a;
						var r4 = r3.b;
						var res = (ctr > 500) ? A3(
							elm$core$List$foldl,
							fn,
							acc,
							elm$core$List$reverse(r4)) : A4(elm$core$List$foldrHelper, fn, acc, ctr + 1, r4);
						return A2(
							fn,
							a,
							A2(
								fn,
								b,
								A2(
									fn,
									c,
									A2(fn, d, res))));
					}
				}
			}
		}
	});
var elm$core$List$foldr = F3(
	function (fn, acc, ls) {
		return A4(elm$core$List$foldrHelper, fn, acc, 0, ls);
	});
var elm$json$Json$Decode$at = F2(
	function (fields, decoder) {
		return A3(elm$core$List$foldr, elm$json$Json$Decode$field, decoder, fields);
	});
var elm$json$Json$Decode$list = _Json_decodeList;
var elm$json$Json$Decode$map4 = _Json_map4;
var author$project$Data$Playlist$decodePlaylists = A5(
	elm$json$Json$Decode$map4,
	author$project$Data$Playlist$Playlists,
	A2(elm$json$Json$Decode$field, 'id', elm$json$Json$Decode$string),
	A2(
		elm$json$Json$Decode$at,
		_List_fromArray(
			['images']),
		elm$json$Json$Decode$list(author$project$Data$Image$decodeImage)),
	A2(elm$json$Json$Decode$field, 'name', elm$json$Json$Decode$string),
	A2(elm$json$Json$Decode$field, 'uri', elm$json$Json$Decode$string));
var author$project$Data$Playlist$decodePlaylistslist = A2(
	elm$json$Json$Decode$map,
	author$project$Data$Playlist$Playlistslist,
	A2(
		elm$json$Json$Decode$at,
		_List_fromArray(
			['items']),
		elm$json$Json$Decode$list(author$project$Data$Playlist$decodePlaylists)));
var author$project$Data$Playlist$init = _List_Nil;
var author$project$Data$Releases$init = {releaseList: _List_Nil, thePrp: _List_Nil};
var author$project$Data$Search$init = {findAlbum: _List_Nil, findArtist: _List_Nil, findTrack: _List_Nil, searchQuery: ''};
var author$project$Request$apiUrl = 'https://api.spotify.com/v1/';
var elm$http$Http$Internal$EmptyBody = {$: 'EmptyBody'};
var elm$http$Http$emptyBody = elm$http$Http$Internal$EmptyBody;
var elm$core$Dict$RBEmpty_elm_builtin = {$: 'RBEmpty_elm_builtin'};
var elm$core$Dict$empty = elm$core$Dict$RBEmpty_elm_builtin;
var elm$core$Basics$compare = _Utils_compare;
var elm$core$Dict$get = F2(
	function (targetKey, dict) {
		get:
		while (true) {
			if (dict.$ === 'RBEmpty_elm_builtin') {
				return elm$core$Maybe$Nothing;
			} else {
				var key = dict.b;
				var value = dict.c;
				var left = dict.d;
				var right = dict.e;
				var _n1 = A2(elm$core$Basics$compare, targetKey, key);
				switch (_n1.$) {
					case 'LT':
						var $temp$targetKey = targetKey,
							$temp$dict = left;
						targetKey = $temp$targetKey;
						dict = $temp$dict;
						continue get;
					case 'EQ':
						return elm$core$Maybe$Just(value);
					default:
						var $temp$targetKey = targetKey,
							$temp$dict = right;
						targetKey = $temp$targetKey;
						dict = $temp$dict;
						continue get;
				}
			}
		}
	});
var elm$core$Dict$Black = {$: 'Black'};
var elm$core$Dict$RBNode_elm_builtin = F5(
	function (a, b, c, d, e) {
		return {$: 'RBNode_elm_builtin', a: a, b: b, c: c, d: d, e: e};
	});
var elm$core$Dict$Red = {$: 'Red'};
var elm$core$Dict$balance = F5(
	function (color, key, value, left, right) {
		if ((right.$ === 'RBNode_elm_builtin') && (right.a.$ === 'Red')) {
			var _n1 = right.a;
			var rK = right.b;
			var rV = right.c;
			var rLeft = right.d;
			var rRight = right.e;
			if ((left.$ === 'RBNode_elm_builtin') && (left.a.$ === 'Red')) {
				var _n3 = left.a;
				var lK = left.b;
				var lV = left.c;
				var lLeft = left.d;
				var lRight = left.e;
				return A5(
					elm$core$Dict$RBNode_elm_builtin,
					elm$core$Dict$Red,
					key,
					value,
					A5(elm$core$Dict$RBNode_elm_builtin, elm$core$Dict$Black, lK, lV, lLeft, lRight),
					A5(elm$core$Dict$RBNode_elm_builtin, elm$core$Dict$Black, rK, rV, rLeft, rRight));
			} else {
				return A5(
					elm$core$Dict$RBNode_elm_builtin,
					color,
					rK,
					rV,
					A5(elm$core$Dict$RBNode_elm_builtin, elm$core$Dict$Red, key, value, left, rLeft),
					rRight);
			}
		} else {
			if ((((left.$ === 'RBNode_elm_builtin') && (left.a.$ === 'Red')) && (left.d.$ === 'RBNode_elm_builtin')) && (left.d.a.$ === 'Red')) {
				var _n5 = left.a;
				var lK = left.b;
				var lV = left.c;
				var _n6 = left.d;
				var _n7 = _n6.a;
				var llK = _n6.b;
				var llV = _n6.c;
				var llLeft = _n6.d;
				var llRight = _n6.e;
				var lRight = left.e;
				return A5(
					elm$core$Dict$RBNode_elm_builtin,
					elm$core$Dict$Red,
					lK,
					lV,
					A5(elm$core$Dict$RBNode_elm_builtin, elm$core$Dict$Black, llK, llV, llLeft, llRight),
					A5(elm$core$Dict$RBNode_elm_builtin, elm$core$Dict$Black, key, value, lRight, right));
			} else {
				return A5(elm$core$Dict$RBNode_elm_builtin, color, key, value, left, right);
			}
		}
	});
var elm$core$Dict$insertHelp = F3(
	function (key, value, dict) {
		if (dict.$ === 'RBEmpty_elm_builtin') {
			return A5(elm$core$Dict$RBNode_elm_builtin, elm$core$Dict$Red, key, value, elm$core$Dict$RBEmpty_elm_builtin, elm$core$Dict$RBEmpty_elm_builtin);
		} else {
			var nColor = dict.a;
			var nKey = dict.b;
			var nValue = dict.c;
			var nLeft = dict.d;
			var nRight = dict.e;
			var _n1 = A2(elm$core$Basics$compare, key, nKey);
			switch (_n1.$) {
				case 'LT':
					return A5(
						elm$core$Dict$balance,
						nColor,
						nKey,
						nValue,
						A3(elm$core$Dict$insertHelp, key, value, nLeft),
						nRight);
				case 'EQ':
					return A5(elm$core$Dict$RBNode_elm_builtin, nColor, nKey, value, nLeft, nRight);
				default:
					return A5(
						elm$core$Dict$balance,
						nColor,
						nKey,
						nValue,
						nLeft,
						A3(elm$core$Dict$insertHelp, key, value, nRight));
			}
		}
	});
var elm$core$Dict$insert = F3(
	function (key, value, dict) {
		var _n0 = A3(elm$core$Dict$insertHelp, key, value, dict);
		if ((_n0.$ === 'RBNode_elm_builtin') && (_n0.a.$ === 'Red')) {
			var _n1 = _n0.a;
			var k = _n0.b;
			var v = _n0.c;
			var l = _n0.d;
			var r = _n0.e;
			return A5(elm$core$Dict$RBNode_elm_builtin, elm$core$Dict$Black, k, v, l, r);
		} else {
			var x = _n0;
			return x;
		}
	});
var elm$core$Dict$getMin = function (dict) {
	getMin:
	while (true) {
		if ((dict.$ === 'RBNode_elm_builtin') && (dict.d.$ === 'RBNode_elm_builtin')) {
			var left = dict.d;
			var $temp$dict = left;
			dict = $temp$dict;
			continue getMin;
		} else {
			return dict;
		}
	}
};
var elm$core$Dict$moveRedLeft = function (dict) {
	if (((dict.$ === 'RBNode_elm_builtin') && (dict.d.$ === 'RBNode_elm_builtin')) && (dict.e.$ === 'RBNode_elm_builtin')) {
		if ((dict.e.d.$ === 'RBNode_elm_builtin') && (dict.e.d.a.$ === 'Red')) {
			var clr = dict.a;
			var k = dict.b;
			var v = dict.c;
			var _n1 = dict.d;
			var lClr = _n1.a;
			var lK = _n1.b;
			var lV = _n1.c;
			var lLeft = _n1.d;
			var lRight = _n1.e;
			var _n2 = dict.e;
			var rClr = _n2.a;
			var rK = _n2.b;
			var rV = _n2.c;
			var rLeft = _n2.d;
			var _n3 = rLeft.a;
			var rlK = rLeft.b;
			var rlV = rLeft.c;
			var rlL = rLeft.d;
			var rlR = rLeft.e;
			var rRight = _n2.e;
			return A5(
				elm$core$Dict$RBNode_elm_builtin,
				elm$core$Dict$Red,
				rlK,
				rlV,
				A5(
					elm$core$Dict$RBNode_elm_builtin,
					elm$core$Dict$Black,
					k,
					v,
					A5(elm$core$Dict$RBNode_elm_builtin, elm$core$Dict$Red, lK, lV, lLeft, lRight),
					rlL),
				A5(elm$core$Dict$RBNode_elm_builtin, elm$core$Dict$Black, rK, rV, rlR, rRight));
		} else {
			var clr = dict.a;
			var k = dict.b;
			var v = dict.c;
			var _n4 = dict.d;
			var lClr = _n4.a;
			var lK = _n4.b;
			var lV = _n4.c;
			var lLeft = _n4.d;
			var lRight = _n4.e;
			var _n5 = dict.e;
			var rClr = _n5.a;
			var rK = _n5.b;
			var rV = _n5.c;
			var rLeft = _n5.d;
			var rRight = _n5.e;
			if (clr.$ === 'Black') {
				return A5(
					elm$core$Dict$RBNode_elm_builtin,
					elm$core$Dict$Black,
					k,
					v,
					A5(elm$core$Dict$RBNode_elm_builtin, elm$core$Dict$Red, lK, lV, lLeft, lRight),
					A5(elm$core$Dict$RBNode_elm_builtin, elm$core$Dict$Red, rK, rV, rLeft, rRight));
			} else {
				return A5(
					elm$core$Dict$RBNode_elm_builtin,
					elm$core$Dict$Black,
					k,
					v,
					A5(elm$core$Dict$RBNode_elm_builtin, elm$core$Dict$Red, lK, lV, lLeft, lRight),
					A5(elm$core$Dict$RBNode_elm_builtin, elm$core$Dict$Red, rK, rV, rLeft, rRight));
			}
		}
	} else {
		return dict;
	}
};
var elm$core$Dict$moveRedRight = function (dict) {
	if (((dict.$ === 'RBNode_elm_builtin') && (dict.d.$ === 'RBNode_elm_builtin')) && (dict.e.$ === 'RBNode_elm_builtin')) {
		if ((dict.d.d.$ === 'RBNode_elm_builtin') && (dict.d.d.a.$ === 'Red')) {
			var clr = dict.a;
			var k = dict.b;
			var v = dict.c;
			var _n1 = dict.d;
			var lClr = _n1.a;
			var lK = _n1.b;
			var lV = _n1.c;
			var _n2 = _n1.d;
			var _n3 = _n2.a;
			var llK = _n2.b;
			var llV = _n2.c;
			var llLeft = _n2.d;
			var llRight = _n2.e;
			var lRight = _n1.e;
			var _n4 = dict.e;
			var rClr = _n4.a;
			var rK = _n4.b;
			var rV = _n4.c;
			var rLeft = _n4.d;
			var rRight = _n4.e;
			return A5(
				elm$core$Dict$RBNode_elm_builtin,
				elm$core$Dict$Red,
				lK,
				lV,
				A5(elm$core$Dict$RBNode_elm_builtin, elm$core$Dict$Black, llK, llV, llLeft, llRight),
				A5(
					elm$core$Dict$RBNode_elm_builtin,
					elm$core$Dict$Black,
					k,
					v,
					lRight,
					A5(elm$core$Dict$RBNode_elm_builtin, elm$core$Dict$Red, rK, rV, rLeft, rRight)));
		} else {
			var clr = dict.a;
			var k = dict.b;
			var v = dict.c;
			var _n5 = dict.d;
			var lClr = _n5.a;
			var lK = _n5.b;
			var lV = _n5.c;
			var lLeft = _n5.d;
			var lRight = _n5.e;
			var _n6 = dict.e;
			var rClr = _n6.a;
			var rK = _n6.b;
			var rV = _n6.c;
			var rLeft = _n6.d;
			var rRight = _n6.e;
			if (clr.$ === 'Black') {
				return A5(
					elm$core$Dict$RBNode_elm_builtin,
					elm$core$Dict$Black,
					k,
					v,
					A5(elm$core$Dict$RBNode_elm_builtin, elm$core$Dict$Red, lK, lV, lLeft, lRight),
					A5(elm$core$Dict$RBNode_elm_builtin, elm$core$Dict$Red, rK, rV, rLeft, rRight));
			} else {
				return A5(
					elm$core$Dict$RBNode_elm_builtin,
					elm$core$Dict$Black,
					k,
					v,
					A5(elm$core$Dict$RBNode_elm_builtin, elm$core$Dict$Red, lK, lV, lLeft, lRight),
					A5(elm$core$Dict$RBNode_elm_builtin, elm$core$Dict$Red, rK, rV, rLeft, rRight));
			}
		}
	} else {
		return dict;
	}
};
var elm$core$Dict$removeHelpPrepEQGT = F7(
	function (targetKey, dict, color, key, value, left, right) {
		if ((left.$ === 'RBNode_elm_builtin') && (left.a.$ === 'Red')) {
			var _n1 = left.a;
			var lK = left.b;
			var lV = left.c;
			var lLeft = left.d;
			var lRight = left.e;
			return A5(
				elm$core$Dict$RBNode_elm_builtin,
				color,
				lK,
				lV,
				lLeft,
				A5(elm$core$Dict$RBNode_elm_builtin, elm$core$Dict$Red, key, value, lRight, right));
		} else {
			_n2$2:
			while (true) {
				if ((right.$ === 'RBNode_elm_builtin') && (right.a.$ === 'Black')) {
					if (right.d.$ === 'RBNode_elm_builtin') {
						if (right.d.a.$ === 'Black') {
							var _n3 = right.a;
							var _n4 = right.d;
							var _n5 = _n4.a;
							return elm$core$Dict$moveRedRight(dict);
						} else {
							break _n2$2;
						}
					} else {
						var _n6 = right.a;
						var _n7 = right.d;
						return elm$core$Dict$moveRedRight(dict);
					}
				} else {
					break _n2$2;
				}
			}
			return dict;
		}
	});
var elm$core$Dict$removeMin = function (dict) {
	if ((dict.$ === 'RBNode_elm_builtin') && (dict.d.$ === 'RBNode_elm_builtin')) {
		var color = dict.a;
		var key = dict.b;
		var value = dict.c;
		var left = dict.d;
		var lColor = left.a;
		var lLeft = left.d;
		var right = dict.e;
		if (lColor.$ === 'Black') {
			if ((lLeft.$ === 'RBNode_elm_builtin') && (lLeft.a.$ === 'Red')) {
				var _n3 = lLeft.a;
				return A5(
					elm$core$Dict$RBNode_elm_builtin,
					color,
					key,
					value,
					elm$core$Dict$removeMin(left),
					right);
			} else {
				var _n4 = elm$core$Dict$moveRedLeft(dict);
				if (_n4.$ === 'RBNode_elm_builtin') {
					var nColor = _n4.a;
					var nKey = _n4.b;
					var nValue = _n4.c;
					var nLeft = _n4.d;
					var nRight = _n4.e;
					return A5(
						elm$core$Dict$balance,
						nColor,
						nKey,
						nValue,
						elm$core$Dict$removeMin(nLeft),
						nRight);
				} else {
					return elm$core$Dict$RBEmpty_elm_builtin;
				}
			}
		} else {
			return A5(
				elm$core$Dict$RBNode_elm_builtin,
				color,
				key,
				value,
				elm$core$Dict$removeMin(left),
				right);
		}
	} else {
		return elm$core$Dict$RBEmpty_elm_builtin;
	}
};
var elm$core$Dict$removeHelp = F2(
	function (targetKey, dict) {
		if (dict.$ === 'RBEmpty_elm_builtin') {
			return elm$core$Dict$RBEmpty_elm_builtin;
		} else {
			var color = dict.a;
			var key = dict.b;
			var value = dict.c;
			var left = dict.d;
			var right = dict.e;
			if (_Utils_cmp(targetKey, key) < 0) {
				if ((left.$ === 'RBNode_elm_builtin') && (left.a.$ === 'Black')) {
					var _n4 = left.a;
					var lLeft = left.d;
					if ((lLeft.$ === 'RBNode_elm_builtin') && (lLeft.a.$ === 'Red')) {
						var _n6 = lLeft.a;
						return A5(
							elm$core$Dict$RBNode_elm_builtin,
							color,
							key,
							value,
							A2(elm$core$Dict$removeHelp, targetKey, left),
							right);
					} else {
						var _n7 = elm$core$Dict$moveRedLeft(dict);
						if (_n7.$ === 'RBNode_elm_builtin') {
							var nColor = _n7.a;
							var nKey = _n7.b;
							var nValue = _n7.c;
							var nLeft = _n7.d;
							var nRight = _n7.e;
							return A5(
								elm$core$Dict$balance,
								nColor,
								nKey,
								nValue,
								A2(elm$core$Dict$removeHelp, targetKey, nLeft),
								nRight);
						} else {
							return elm$core$Dict$RBEmpty_elm_builtin;
						}
					}
				} else {
					return A5(
						elm$core$Dict$RBNode_elm_builtin,
						color,
						key,
						value,
						A2(elm$core$Dict$removeHelp, targetKey, left),
						right);
				}
			} else {
				return A2(
					elm$core$Dict$removeHelpEQGT,
					targetKey,
					A7(elm$core$Dict$removeHelpPrepEQGT, targetKey, dict, color, key, value, left, right));
			}
		}
	});
var elm$core$Dict$removeHelpEQGT = F2(
	function (targetKey, dict) {
		if (dict.$ === 'RBNode_elm_builtin') {
			var color = dict.a;
			var key = dict.b;
			var value = dict.c;
			var left = dict.d;
			var right = dict.e;
			if (_Utils_eq(targetKey, key)) {
				var _n1 = elm$core$Dict$getMin(right);
				if (_n1.$ === 'RBNode_elm_builtin') {
					var minKey = _n1.b;
					var minValue = _n1.c;
					return A5(
						elm$core$Dict$balance,
						color,
						minKey,
						minValue,
						left,
						elm$core$Dict$removeMin(right));
				} else {
					return elm$core$Dict$RBEmpty_elm_builtin;
				}
			} else {
				return A5(
					elm$core$Dict$balance,
					color,
					key,
					value,
					left,
					A2(elm$core$Dict$removeHelp, targetKey, right));
			}
		} else {
			return elm$core$Dict$RBEmpty_elm_builtin;
		}
	});
var elm$core$Dict$remove = F2(
	function (key, dict) {
		var _n0 = A2(elm$core$Dict$removeHelp, key, dict);
		if ((_n0.$ === 'RBNode_elm_builtin') && (_n0.a.$ === 'Red')) {
			var _n1 = _n0.a;
			var k = _n0.b;
			var v = _n0.c;
			var l = _n0.d;
			var r = _n0.e;
			return A5(elm$core$Dict$RBNode_elm_builtin, elm$core$Dict$Black, k, v, l, r);
		} else {
			var x = _n0;
			return x;
		}
	});
var elm$core$Dict$update = F3(
	function (targetKey, alter, dictionary) {
		var _n0 = alter(
			A2(elm$core$Dict$get, targetKey, dictionary));
		if (_n0.$ === 'Just') {
			var value = _n0.a;
			return A3(elm$core$Dict$insert, targetKey, value, dictionary);
		} else {
			return A2(elm$core$Dict$remove, targetKey, dictionary);
		}
	});
var elm$core$Maybe$isJust = function (maybe) {
	if (maybe.$ === 'Just') {
		return true;
	} else {
		return false;
	}
};
var elm$core$Result$map = F2(
	function (func, ra) {
		if (ra.$ === 'Ok') {
			var a = ra.a;
			return elm$core$Result$Ok(
				func(a));
		} else {
			var e = ra.a;
			return elm$core$Result$Err(e);
		}
	});
var elm$http$Http$BadPayload = F2(
	function (a, b) {
		return {$: 'BadPayload', a: a, b: b};
	});
var elm$http$Http$BadStatus = function (a) {
	return {$: 'BadStatus', a: a};
};
var elm$http$Http$BadUrl = function (a) {
	return {$: 'BadUrl', a: a};
};
var elm$http$Http$NetworkError = {$: 'NetworkError'};
var elm$http$Http$Timeout = {$: 'Timeout'};
var elm$http$Http$Internal$FormDataBody = function (a) {
	return {$: 'FormDataBody', a: a};
};
var elm$http$Http$Internal$isStringBody = function (body) {
	if (body.$ === 'StringBody') {
		return true;
	} else {
		return false;
	}
};
var elm$http$Http$expectStringResponse = _Http_expectStringResponse;
var elm$json$Json$Decode$decodeString = _Json_runOnString;
var elm$http$Http$expectJson = function (decoder) {
	return elm$http$Http$expectStringResponse(
		function (response) {
			var _n0 = A2(elm$json$Json$Decode$decodeString, decoder, response.body);
			if (_n0.$ === 'Err') {
				var decodeError = _n0.a;
				return elm$core$Result$Err(
					elm$json$Json$Decode$errorToString(decodeError));
			} else {
				var value = _n0.a;
				return elm$core$Result$Ok(value);
			}
		});
};
var elm$http$Http$Internal$Header = F2(
	function (a, b) {
		return {$: 'Header', a: a, b: b};
	});
var elm$http$Http$header = elm$http$Http$Internal$Header;
var elm$core$Basics$identity = function (x) {
	return x;
};
var elm$http$Http$Internal$Request = function (a) {
	return {$: 'Request', a: a};
};
var elm$http$Http$request = elm$http$Http$Internal$Request;
var author$project$Request$get = F5(
	function (urlBefore, id, urlAfter, decoder, token) {
		return elm$http$Http$request(
			{
				body: elm$http$Http$emptyBody,
				expect: elm$http$Http$expectJson(decoder),
				headers: _List_fromArray(
					[
						A2(elm$http$Http$header, 'Authorization', 'Bearer ' + token)
					]),
				method: 'GET',
				timeout: elm$core$Maybe$Nothing,
				url: _Utils_ap(
					author$project$Request$apiUrl,
					_Utils_ap(
						urlBefore,
						_Utils_ap(id, urlAfter))),
				withCredentials: false
			});
	});
var author$project$Root$SetPlaylists = function (a) {
	return {$: 'SetPlaylists', a: a};
};
var elm$core$Platform$Cmd$batch = _Platform_batch;
var elm$core$Basics$composeL = F3(
	function (g, f, x) {
		return g(
			f(x));
	});
var elm$core$Task$Perform = function (a) {
	return {$: 'Perform', a: a};
};
var elm$core$Task$andThen = _Scheduler_andThen;
var elm$core$Task$succeed = _Scheduler_succeed;
var elm$core$Task$init = elm$core$Task$succeed(_Utils_Tuple0);
var elm$core$List$map = F2(
	function (f, xs) {
		return A3(
			elm$core$List$foldr,
			F2(
				function (x, acc) {
					return A2(
						elm$core$List$cons,
						f(x),
						acc);
				}),
			_List_Nil,
			xs);
	});
var elm$core$Task$map = F2(
	function (func, taskA) {
		return A2(
			elm$core$Task$andThen,
			function (a) {
				return elm$core$Task$succeed(
					func(a));
			},
			taskA);
	});
var elm$core$Task$map2 = F3(
	function (func, taskA, taskB) {
		return A2(
			elm$core$Task$andThen,
			function (a) {
				return A2(
					elm$core$Task$andThen,
					function (b) {
						return elm$core$Task$succeed(
							A2(func, a, b));
					},
					taskB);
			},
			taskA);
	});
var elm$core$Task$sequence = function (tasks) {
	return A3(
		elm$core$List$foldr,
		elm$core$Task$map2(elm$core$List$cons),
		elm$core$Task$succeed(_List_Nil),
		tasks);
};
var elm$core$Platform$sendToApp = _Platform_sendToApp;
var elm$core$Task$spawnCmd = F2(
	function (router, _n0) {
		var task = _n0.a;
		return _Scheduler_spawn(
			A2(
				elm$core$Task$andThen,
				elm$core$Platform$sendToApp(router),
				task));
	});
var elm$core$Task$onEffects = F3(
	function (router, commands, state) {
		return A2(
			elm$core$Task$map,
			function (_n0) {
				return _Utils_Tuple0;
			},
			elm$core$Task$sequence(
				A2(
					elm$core$List$map,
					elm$core$Task$spawnCmd(router),
					commands)));
	});
var elm$core$Task$onSelfMsg = F3(
	function (_n0, _n1, _n2) {
		return elm$core$Task$succeed(_Utils_Tuple0);
	});
var elm$core$Task$cmdMap = F2(
	function (tagger, _n0) {
		var task = _n0.a;
		return elm$core$Task$Perform(
			A2(elm$core$Task$map, tagger, task));
	});
_Platform_effectManagers['Task'] = _Platform_createManager(elm$core$Task$init, elm$core$Task$onEffects, elm$core$Task$onSelfMsg, elm$core$Task$cmdMap);
var elm$core$Task$command = _Platform_leaf('Task');
var elm$core$Task$onError = _Scheduler_onError;
var elm$core$Task$attempt = F2(
	function (resultToMessage, task) {
		return elm$core$Task$command(
			elm$core$Task$Perform(
				A2(
					elm$core$Task$onError,
					A2(
						elm$core$Basics$composeL,
						A2(elm$core$Basics$composeL, elm$core$Task$succeed, resultToMessage),
						elm$core$Result$Err),
					A2(
						elm$core$Task$andThen,
						A2(
							elm$core$Basics$composeL,
							A2(elm$core$Basics$composeL, elm$core$Task$succeed, resultToMessage),
							elm$core$Result$Ok),
						task))));
	});
var elm$http$Http$toTask = function (_n0) {
	var request_ = _n0.a;
	return A2(_Http_toTask, request_, elm$core$Maybe$Nothing);
};
var elm$http$Http$send = F2(
	function (resultToMessage, request_) {
		return A2(
			elm$core$Task$attempt,
			resultToMessage,
			elm$http$Http$toTask(request_));
	});
var author$project$Main$init = F3(
	function (flags, url, key) {
		return _Utils_Tuple2(
			{
				config: {token: flags.token},
				drawer: author$project$Data$Drawer$init,
				modal: author$project$Data$Modal$init,
				player: author$project$Data$Player$init,
				playlists: author$project$Data$Playlist$init,
				releases: author$project$Data$Releases$init,
				searchModel: author$project$Data$Search$init
			},
			elm$core$Platform$Cmd$batch(
				_List_fromArray(
					[
						A2(
						elm$http$Http$send,
						author$project$Root$SetPlaylists,
						A5(author$project$Request$get, 'me/playlists', '', '?limit=50', author$project$Data$Playlist$decodePlaylistslist, flags.token))
					])));
	});
var Gizra$elm_keyboard_event$Keyboard$Event$KeyboardEvent = F7(
	function (altKey, ctrlKey, key, keyCode, metaKey, repeat, shiftKey) {
		return {altKey: altKey, ctrlKey: ctrlKey, key: key, keyCode: keyCode, metaKey: metaKey, repeat: repeat, shiftKey: shiftKey};
	});
var elm$core$String$isEmpty = function (string) {
	return string === '';
};
var elm$json$Json$Decode$andThen = _Json_andThen;
var elm$json$Json$Decode$fail = _Json_fail;
var elm$json$Json$Decode$oneOf = _Json_oneOf;
var elm$json$Json$Decode$succeed = _Json_succeed;
var elm$json$Json$Decode$maybe = function (decoder) {
	return elm$json$Json$Decode$oneOf(
		_List_fromArray(
			[
				A2(elm$json$Json$Decode$map, elm$core$Maybe$Just, decoder),
				elm$json$Json$Decode$succeed(elm$core$Maybe$Nothing)
			]));
};
var Gizra$elm_keyboard_event$Keyboard$Event$decodeKey = elm$json$Json$Decode$maybe(
	A2(
		elm$json$Json$Decode$andThen,
		function (key) {
			return elm$core$String$isEmpty(key) ? elm$json$Json$Decode$fail('empty key') : elm$json$Json$Decode$succeed(key);
		},
		A2(elm$json$Json$Decode$field, 'key', elm$json$Json$Decode$string)));
var elm$json$Json$Decode$int = _Json_decodeInt;
var Gizra$elm_keyboard_event$Keyboard$Event$decodeNonZero = A2(
	elm$json$Json$Decode$andThen,
	function (code) {
		return (!code) ? elm$json$Json$Decode$fail('code was zero') : elm$json$Json$Decode$succeed(code);
	},
	elm$json$Json$Decode$int);
var Gizra$elm_keyboard_event$Keyboard$Event$decodeKeyCode = elm$json$Json$Decode$oneOf(
	_List_fromArray(
		[
			A2(elm$json$Json$Decode$field, 'keyCode', Gizra$elm_keyboard_event$Keyboard$Event$decodeNonZero),
			A2(elm$json$Json$Decode$field, 'which', Gizra$elm_keyboard_event$Keyboard$Event$decodeNonZero),
			A2(elm$json$Json$Decode$field, 'charCode', Gizra$elm_keyboard_event$Keyboard$Event$decodeNonZero),
			elm$json$Json$Decode$succeed(0)
		]));
var SwiftsNamesake$proper_keyboard$Keyboard$Key$A = {$: 'A'};
var SwiftsNamesake$proper_keyboard$Keyboard$Key$Add = {$: 'Add'};
var SwiftsNamesake$proper_keyboard$Keyboard$Key$Alt = {$: 'Alt'};
var SwiftsNamesake$proper_keyboard$Keyboard$Key$Ambiguous = function (a) {
	return {$: 'Ambiguous', a: a};
};
var SwiftsNamesake$proper_keyboard$Keyboard$Key$B = {$: 'B'};
var SwiftsNamesake$proper_keyboard$Keyboard$Key$Backspace = {$: 'Backspace'};
var SwiftsNamesake$proper_keyboard$Keyboard$Key$C = {$: 'C'};
var SwiftsNamesake$proper_keyboard$Keyboard$Key$CapsLock = {$: 'CapsLock'};
var SwiftsNamesake$proper_keyboard$Keyboard$Key$ChromeSearch = {$: 'ChromeSearch'};
var SwiftsNamesake$proper_keyboard$Keyboard$Key$Command = {$: 'Command'};
var SwiftsNamesake$proper_keyboard$Keyboard$Key$Ctrl = function (a) {
	return {$: 'Ctrl', a: a};
};
var SwiftsNamesake$proper_keyboard$Keyboard$Key$D = {$: 'D'};
var SwiftsNamesake$proper_keyboard$Keyboard$Key$Decimal = {$: 'Decimal'};
var SwiftsNamesake$proper_keyboard$Keyboard$Key$Delete = {$: 'Delete'};
var SwiftsNamesake$proper_keyboard$Keyboard$Key$Divide = {$: 'Divide'};
var SwiftsNamesake$proper_keyboard$Keyboard$Key$Down = {$: 'Down'};
var SwiftsNamesake$proper_keyboard$Keyboard$Key$E = {$: 'E'};
var SwiftsNamesake$proper_keyboard$Keyboard$Key$Eight = {$: 'Eight'};
var SwiftsNamesake$proper_keyboard$Keyboard$Key$End = {$: 'End'};
var SwiftsNamesake$proper_keyboard$Keyboard$Key$Enter = {$: 'Enter'};
var SwiftsNamesake$proper_keyboard$Keyboard$Key$Escape = {$: 'Escape'};
var SwiftsNamesake$proper_keyboard$Keyboard$Key$F = {$: 'F'};
var SwiftsNamesake$proper_keyboard$Keyboard$Key$F1 = {$: 'F1'};
var SwiftsNamesake$proper_keyboard$Keyboard$Key$F10 = {$: 'F10'};
var SwiftsNamesake$proper_keyboard$Keyboard$Key$F11 = {$: 'F11'};
var SwiftsNamesake$proper_keyboard$Keyboard$Key$F12 = {$: 'F12'};
var SwiftsNamesake$proper_keyboard$Keyboard$Key$F2 = {$: 'F2'};
var SwiftsNamesake$proper_keyboard$Keyboard$Key$F3 = {$: 'F3'};
var SwiftsNamesake$proper_keyboard$Keyboard$Key$F4 = {$: 'F4'};
var SwiftsNamesake$proper_keyboard$Keyboard$Key$F5 = {$: 'F5'};
var SwiftsNamesake$proper_keyboard$Keyboard$Key$F6 = {$: 'F6'};
var SwiftsNamesake$proper_keyboard$Keyboard$Key$F7 = {$: 'F7'};
var SwiftsNamesake$proper_keyboard$Keyboard$Key$F8 = {$: 'F8'};
var SwiftsNamesake$proper_keyboard$Keyboard$Key$F9 = {$: 'F9'};
var SwiftsNamesake$proper_keyboard$Keyboard$Key$Five = {$: 'Five'};
var SwiftsNamesake$proper_keyboard$Keyboard$Key$Four = {$: 'Four'};
var SwiftsNamesake$proper_keyboard$Keyboard$Key$G = {$: 'G'};
var SwiftsNamesake$proper_keyboard$Keyboard$Key$H = {$: 'H'};
var SwiftsNamesake$proper_keyboard$Keyboard$Key$Home = {$: 'Home'};
var SwiftsNamesake$proper_keyboard$Keyboard$Key$I = {$: 'I'};
var SwiftsNamesake$proper_keyboard$Keyboard$Key$Insert = {$: 'Insert'};
var SwiftsNamesake$proper_keyboard$Keyboard$Key$J = {$: 'J'};
var SwiftsNamesake$proper_keyboard$Keyboard$Key$K = {$: 'K'};
var SwiftsNamesake$proper_keyboard$Keyboard$Key$L = {$: 'L'};
var SwiftsNamesake$proper_keyboard$Keyboard$Key$Left = {$: 'Left'};
var SwiftsNamesake$proper_keyboard$Keyboard$Key$M = {$: 'M'};
var SwiftsNamesake$proper_keyboard$Keyboard$Key$Multiply = {$: 'Multiply'};
var SwiftsNamesake$proper_keyboard$Keyboard$Key$N = {$: 'N'};
var SwiftsNamesake$proper_keyboard$Keyboard$Key$Nine = {$: 'Nine'};
var SwiftsNamesake$proper_keyboard$Keyboard$Key$NumLock = {$: 'NumLock'};
var SwiftsNamesake$proper_keyboard$Keyboard$Key$NumpadEight = {$: 'NumpadEight'};
var SwiftsNamesake$proper_keyboard$Keyboard$Key$NumpadFive = {$: 'NumpadFive'};
var SwiftsNamesake$proper_keyboard$Keyboard$Key$NumpadFour = {$: 'NumpadFour'};
var SwiftsNamesake$proper_keyboard$Keyboard$Key$NumpadNine = {$: 'NumpadNine'};
var SwiftsNamesake$proper_keyboard$Keyboard$Key$NumpadOne = {$: 'NumpadOne'};
var SwiftsNamesake$proper_keyboard$Keyboard$Key$NumpadSeven = {$: 'NumpadSeven'};
var SwiftsNamesake$proper_keyboard$Keyboard$Key$NumpadSix = {$: 'NumpadSix'};
var SwiftsNamesake$proper_keyboard$Keyboard$Key$NumpadThree = {$: 'NumpadThree'};
var SwiftsNamesake$proper_keyboard$Keyboard$Key$NumpadTwo = {$: 'NumpadTwo'};
var SwiftsNamesake$proper_keyboard$Keyboard$Key$NumpadZero = {$: 'NumpadZero'};
var SwiftsNamesake$proper_keyboard$Keyboard$Key$O = {$: 'O'};
var SwiftsNamesake$proper_keyboard$Keyboard$Key$One = {$: 'One'};
var SwiftsNamesake$proper_keyboard$Keyboard$Key$P = {$: 'P'};
var SwiftsNamesake$proper_keyboard$Keyboard$Key$PageDown = {$: 'PageDown'};
var SwiftsNamesake$proper_keyboard$Keyboard$Key$PageUp = {$: 'PageUp'};
var SwiftsNamesake$proper_keyboard$Keyboard$Key$PauseBreak = {$: 'PauseBreak'};
var SwiftsNamesake$proper_keyboard$Keyboard$Key$PrintScreen = {$: 'PrintScreen'};
var SwiftsNamesake$proper_keyboard$Keyboard$Key$Q = {$: 'Q'};
var SwiftsNamesake$proper_keyboard$Keyboard$Key$R = {$: 'R'};
var SwiftsNamesake$proper_keyboard$Keyboard$Key$Right = {$: 'Right'};
var SwiftsNamesake$proper_keyboard$Keyboard$Key$S = {$: 'S'};
var SwiftsNamesake$proper_keyboard$Keyboard$Key$ScrollLock = {$: 'ScrollLock'};
var SwiftsNamesake$proper_keyboard$Keyboard$Key$Seven = {$: 'Seven'};
var SwiftsNamesake$proper_keyboard$Keyboard$Key$Shift = function (a) {
	return {$: 'Shift', a: a};
};
var SwiftsNamesake$proper_keyboard$Keyboard$Key$Six = {$: 'Six'};
var SwiftsNamesake$proper_keyboard$Keyboard$Key$Spacebar = {$: 'Spacebar'};
var SwiftsNamesake$proper_keyboard$Keyboard$Key$Subtract = {$: 'Subtract'};
var SwiftsNamesake$proper_keyboard$Keyboard$Key$T = {$: 'T'};
var SwiftsNamesake$proper_keyboard$Keyboard$Key$Tab = {$: 'Tab'};
var SwiftsNamesake$proper_keyboard$Keyboard$Key$Three = {$: 'Three'};
var SwiftsNamesake$proper_keyboard$Keyboard$Key$Two = {$: 'Two'};
var SwiftsNamesake$proper_keyboard$Keyboard$Key$U = {$: 'U'};
var SwiftsNamesake$proper_keyboard$Keyboard$Key$Unknown = function (a) {
	return {$: 'Unknown', a: a};
};
var SwiftsNamesake$proper_keyboard$Keyboard$Key$Up = {$: 'Up'};
var SwiftsNamesake$proper_keyboard$Keyboard$Key$V = {$: 'V'};
var SwiftsNamesake$proper_keyboard$Keyboard$Key$W = {$: 'W'};
var SwiftsNamesake$proper_keyboard$Keyboard$Key$Windows = {$: 'Windows'};
var SwiftsNamesake$proper_keyboard$Keyboard$Key$X = {$: 'X'};
var SwiftsNamesake$proper_keyboard$Keyboard$Key$Y = {$: 'Y'};
var SwiftsNamesake$proper_keyboard$Keyboard$Key$Z = {$: 'Z'};
var SwiftsNamesake$proper_keyboard$Keyboard$Key$Zero = {$: 'Zero'};
var SwiftsNamesake$proper_keyboard$Keyboard$Key$fromCode = function (keyCode) {
	switch (keyCode) {
		case 8:
			return SwiftsNamesake$proper_keyboard$Keyboard$Key$Backspace;
		case 9:
			return SwiftsNamesake$proper_keyboard$Keyboard$Key$Tab;
		case 13:
			return SwiftsNamesake$proper_keyboard$Keyboard$Key$Enter;
		case 16:
			return SwiftsNamesake$proper_keyboard$Keyboard$Key$Shift(elm$core$Maybe$Nothing);
		case 17:
			return SwiftsNamesake$proper_keyboard$Keyboard$Key$Ctrl(elm$core$Maybe$Nothing);
		case 18:
			return SwiftsNamesake$proper_keyboard$Keyboard$Key$Alt;
		case 19:
			return SwiftsNamesake$proper_keyboard$Keyboard$Key$PauseBreak;
		case 20:
			return SwiftsNamesake$proper_keyboard$Keyboard$Key$CapsLock;
		case 27:
			return SwiftsNamesake$proper_keyboard$Keyboard$Key$Escape;
		case 32:
			return SwiftsNamesake$proper_keyboard$Keyboard$Key$Spacebar;
		case 33:
			return SwiftsNamesake$proper_keyboard$Keyboard$Key$PageUp;
		case 34:
			return SwiftsNamesake$proper_keyboard$Keyboard$Key$PageDown;
		case 35:
			return SwiftsNamesake$proper_keyboard$Keyboard$Key$End;
		case 36:
			return SwiftsNamesake$proper_keyboard$Keyboard$Key$Home;
		case 37:
			return SwiftsNamesake$proper_keyboard$Keyboard$Key$Left;
		case 38:
			return SwiftsNamesake$proper_keyboard$Keyboard$Key$Up;
		case 39:
			return SwiftsNamesake$proper_keyboard$Keyboard$Key$Right;
		case 40:
			return SwiftsNamesake$proper_keyboard$Keyboard$Key$Down;
		case 44:
			return SwiftsNamesake$proper_keyboard$Keyboard$Key$PrintScreen;
		case 45:
			return SwiftsNamesake$proper_keyboard$Keyboard$Key$Insert;
		case 46:
			return SwiftsNamesake$proper_keyboard$Keyboard$Key$Delete;
		case 48:
			return SwiftsNamesake$proper_keyboard$Keyboard$Key$Zero;
		case 49:
			return SwiftsNamesake$proper_keyboard$Keyboard$Key$One;
		case 50:
			return SwiftsNamesake$proper_keyboard$Keyboard$Key$Two;
		case 51:
			return SwiftsNamesake$proper_keyboard$Keyboard$Key$Three;
		case 52:
			return SwiftsNamesake$proper_keyboard$Keyboard$Key$Four;
		case 53:
			return SwiftsNamesake$proper_keyboard$Keyboard$Key$Five;
		case 54:
			return SwiftsNamesake$proper_keyboard$Keyboard$Key$Six;
		case 55:
			return SwiftsNamesake$proper_keyboard$Keyboard$Key$Seven;
		case 56:
			return SwiftsNamesake$proper_keyboard$Keyboard$Key$Eight;
		case 57:
			return SwiftsNamesake$proper_keyboard$Keyboard$Key$Nine;
		case 65:
			return SwiftsNamesake$proper_keyboard$Keyboard$Key$A;
		case 66:
			return SwiftsNamesake$proper_keyboard$Keyboard$Key$B;
		case 67:
			return SwiftsNamesake$proper_keyboard$Keyboard$Key$C;
		case 68:
			return SwiftsNamesake$proper_keyboard$Keyboard$Key$D;
		case 69:
			return SwiftsNamesake$proper_keyboard$Keyboard$Key$E;
		case 70:
			return SwiftsNamesake$proper_keyboard$Keyboard$Key$F;
		case 71:
			return SwiftsNamesake$proper_keyboard$Keyboard$Key$G;
		case 72:
			return SwiftsNamesake$proper_keyboard$Keyboard$Key$H;
		case 73:
			return SwiftsNamesake$proper_keyboard$Keyboard$Key$I;
		case 74:
			return SwiftsNamesake$proper_keyboard$Keyboard$Key$J;
		case 75:
			return SwiftsNamesake$proper_keyboard$Keyboard$Key$K;
		case 76:
			return SwiftsNamesake$proper_keyboard$Keyboard$Key$L;
		case 77:
			return SwiftsNamesake$proper_keyboard$Keyboard$Key$M;
		case 78:
			return SwiftsNamesake$proper_keyboard$Keyboard$Key$N;
		case 79:
			return SwiftsNamesake$proper_keyboard$Keyboard$Key$O;
		case 80:
			return SwiftsNamesake$proper_keyboard$Keyboard$Key$P;
		case 81:
			return SwiftsNamesake$proper_keyboard$Keyboard$Key$Q;
		case 82:
			return SwiftsNamesake$proper_keyboard$Keyboard$Key$R;
		case 83:
			return SwiftsNamesake$proper_keyboard$Keyboard$Key$S;
		case 84:
			return SwiftsNamesake$proper_keyboard$Keyboard$Key$T;
		case 85:
			return SwiftsNamesake$proper_keyboard$Keyboard$Key$U;
		case 86:
			return SwiftsNamesake$proper_keyboard$Keyboard$Key$V;
		case 87:
			return SwiftsNamesake$proper_keyboard$Keyboard$Key$W;
		case 88:
			return SwiftsNamesake$proper_keyboard$Keyboard$Key$X;
		case 89:
			return SwiftsNamesake$proper_keyboard$Keyboard$Key$Y;
		case 90:
			return SwiftsNamesake$proper_keyboard$Keyboard$Key$Z;
		case 91:
			return SwiftsNamesake$proper_keyboard$Keyboard$Key$Ambiguous(
				_List_fromArray(
					[SwiftsNamesake$proper_keyboard$Keyboard$Key$Windows, SwiftsNamesake$proper_keyboard$Keyboard$Key$Command, SwiftsNamesake$proper_keyboard$Keyboard$Key$ChromeSearch]));
		case 96:
			return SwiftsNamesake$proper_keyboard$Keyboard$Key$NumpadZero;
		case 97:
			return SwiftsNamesake$proper_keyboard$Keyboard$Key$NumpadOne;
		case 98:
			return SwiftsNamesake$proper_keyboard$Keyboard$Key$NumpadTwo;
		case 99:
			return SwiftsNamesake$proper_keyboard$Keyboard$Key$NumpadThree;
		case 100:
			return SwiftsNamesake$proper_keyboard$Keyboard$Key$NumpadFour;
		case 101:
			return SwiftsNamesake$proper_keyboard$Keyboard$Key$NumpadFive;
		case 102:
			return SwiftsNamesake$proper_keyboard$Keyboard$Key$NumpadSix;
		case 103:
			return SwiftsNamesake$proper_keyboard$Keyboard$Key$NumpadSeven;
		case 104:
			return SwiftsNamesake$proper_keyboard$Keyboard$Key$NumpadEight;
		case 105:
			return SwiftsNamesake$proper_keyboard$Keyboard$Key$NumpadNine;
		case 106:
			return SwiftsNamesake$proper_keyboard$Keyboard$Key$Multiply;
		case 107:
			return SwiftsNamesake$proper_keyboard$Keyboard$Key$Add;
		case 109:
			return SwiftsNamesake$proper_keyboard$Keyboard$Key$Subtract;
		case 110:
			return SwiftsNamesake$proper_keyboard$Keyboard$Key$Decimal;
		case 111:
			return SwiftsNamesake$proper_keyboard$Keyboard$Key$Divide;
		case 112:
			return SwiftsNamesake$proper_keyboard$Keyboard$Key$F1;
		case 113:
			return SwiftsNamesake$proper_keyboard$Keyboard$Key$F2;
		case 114:
			return SwiftsNamesake$proper_keyboard$Keyboard$Key$F3;
		case 115:
			return SwiftsNamesake$proper_keyboard$Keyboard$Key$F4;
		case 116:
			return SwiftsNamesake$proper_keyboard$Keyboard$Key$F5;
		case 117:
			return SwiftsNamesake$proper_keyboard$Keyboard$Key$F6;
		case 118:
			return SwiftsNamesake$proper_keyboard$Keyboard$Key$F7;
		case 119:
			return SwiftsNamesake$proper_keyboard$Keyboard$Key$F8;
		case 120:
			return SwiftsNamesake$proper_keyboard$Keyboard$Key$F9;
		case 121:
			return SwiftsNamesake$proper_keyboard$Keyboard$Key$F10;
		case 122:
			return SwiftsNamesake$proper_keyboard$Keyboard$Key$F11;
		case 123:
			return SwiftsNamesake$proper_keyboard$Keyboard$Key$F12;
		case 144:
			return SwiftsNamesake$proper_keyboard$Keyboard$Key$NumLock;
		case 145:
			return SwiftsNamesake$proper_keyboard$Keyboard$Key$ScrollLock;
		default:
			return SwiftsNamesake$proper_keyboard$Keyboard$Key$Unknown(keyCode);
	}
};
var elm$json$Json$Decode$bool = _Json_decodeBool;
var elm$json$Json$Decode$map7 = _Json_map7;
var Gizra$elm_keyboard_event$Keyboard$Event$decodeKeyboardEvent = A8(
	elm$json$Json$Decode$map7,
	Gizra$elm_keyboard_event$Keyboard$Event$KeyboardEvent,
	A2(elm$json$Json$Decode$field, 'altKey', elm$json$Json$Decode$bool),
	A2(elm$json$Json$Decode$field, 'ctrlKey', elm$json$Json$Decode$bool),
	Gizra$elm_keyboard_event$Keyboard$Event$decodeKey,
	A2(elm$json$Json$Decode$map, SwiftsNamesake$proper_keyboard$Keyboard$Key$fromCode, Gizra$elm_keyboard_event$Keyboard$Event$decodeKeyCode),
	A2(elm$json$Json$Decode$field, 'metaKey', elm$json$Json$Decode$bool),
	A2(elm$json$Json$Decode$field, 'repeat', elm$json$Json$Decode$bool),
	A2(elm$json$Json$Decode$field, 'shiftKey', elm$json$Json$Decode$bool));
var author$project$Ports$thePrpReleases = _Platform_incomingPort('thePrpReleases', elm$json$Json$Decode$string);
var author$project$Root$AddReleaseThePrp = function (a) {
	return {$: 'AddReleaseThePrp', a: a};
};
var author$project$Root$GetPlayer = function (a) {
	return {$: 'GetPlayer', a: a};
};
var author$project$Root$HandleKeyboardEvent = function (a) {
	return {$: 'HandleKeyboardEvent', a: a};
};
var elm$browser$Browser$Events$Document = {$: 'Document'};
var elm$browser$Browser$Events$MySub = F3(
	function (a, b, c) {
		return {$: 'MySub', a: a, b: b, c: c};
	});
var elm$browser$Browser$Events$State = F2(
	function (subs, pids) {
		return {pids: pids, subs: subs};
	});
var elm$browser$Browser$Events$init = elm$core$Task$succeed(
	A2(elm$browser$Browser$Events$State, _List_Nil, elm$core$Dict$empty));
var elm$browser$Browser$Events$nodeToKey = function (node) {
	if (node.$ === 'Document') {
		return 'd_';
	} else {
		return 'w_';
	}
};
var elm$browser$Browser$Events$addKey = function (sub) {
	var node = sub.a;
	var name = sub.b;
	return _Utils_Tuple2(
		_Utils_ap(
			elm$browser$Browser$Events$nodeToKey(node),
			name),
		sub);
};
var elm$browser$Browser$Events$Event = F2(
	function (key, event) {
		return {event: event, key: key};
	});
var elm$core$Platform$sendToSelf = _Platform_sendToSelf;
var elm$browser$Browser$External = function (a) {
	return {$: 'External', a: a};
};
var elm$browser$Browser$Internal = function (a) {
	return {$: 'Internal', a: a};
};
var elm$browser$Browser$Dom$NotFound = function (a) {
	return {$: 'NotFound', a: a};
};
var elm$core$Basics$never = function (_n0) {
	never:
	while (true) {
		var nvr = _n0.a;
		var $temp$_n0 = nvr;
		_n0 = $temp$_n0;
		continue never;
	}
};
var elm$core$Task$perform = F2(
	function (toMessage, task) {
		return elm$core$Task$command(
			elm$core$Task$Perform(
				A2(elm$core$Task$map, toMessage, task)));
	});
var elm$json$Json$Decode$map2 = _Json_map2;
var elm$virtual_dom$VirtualDom$toHandlerInt = function (handler) {
	switch (handler.$) {
		case 'Normal':
			return 0;
		case 'MayStopPropagation':
			return 1;
		case 'MayPreventDefault':
			return 2;
		default:
			return 3;
	}
};
var elm$core$String$length = _String_length;
var elm$core$String$slice = _String_slice;
var elm$core$String$dropLeft = F2(
	function (n, string) {
		return (n < 1) ? string : A3(
			elm$core$String$slice,
			n,
			elm$core$String$length(string),
			string);
	});
var elm$core$String$startsWith = _String_startsWith;
var elm$url$Url$Http = {$: 'Http'};
var elm$url$Url$Https = {$: 'Https'};
var elm$core$String$indexes = _String_indexes;
var elm$core$String$left = F2(
	function (n, string) {
		return (n < 1) ? '' : A3(elm$core$String$slice, 0, n, string);
	});
var elm$core$String$contains = _String_contains;
var elm$core$String$toInt = _String_toInt;
var elm$url$Url$Url = F6(
	function (protocol, host, port_, path, query, fragment) {
		return {fragment: fragment, host: host, path: path, port_: port_, protocol: protocol, query: query};
	});
var elm$url$Url$chompBeforePath = F5(
	function (protocol, path, params, frag, str) {
		if (elm$core$String$isEmpty(str) || A2(elm$core$String$contains, '@', str)) {
			return elm$core$Maybe$Nothing;
		} else {
			var _n0 = A2(elm$core$String$indexes, ':', str);
			if (!_n0.b) {
				return elm$core$Maybe$Just(
					A6(elm$url$Url$Url, protocol, str, elm$core$Maybe$Nothing, path, params, frag));
			} else {
				if (!_n0.b.b) {
					var i = _n0.a;
					var _n1 = elm$core$String$toInt(
						A2(elm$core$String$dropLeft, i + 1, str));
					if (_n1.$ === 'Nothing') {
						return elm$core$Maybe$Nothing;
					} else {
						var port_ = _n1;
						return elm$core$Maybe$Just(
							A6(
								elm$url$Url$Url,
								protocol,
								A2(elm$core$String$left, i, str),
								port_,
								path,
								params,
								frag));
					}
				} else {
					return elm$core$Maybe$Nothing;
				}
			}
		}
	});
var elm$url$Url$chompBeforeQuery = F4(
	function (protocol, params, frag, str) {
		if (elm$core$String$isEmpty(str)) {
			return elm$core$Maybe$Nothing;
		} else {
			var _n0 = A2(elm$core$String$indexes, '/', str);
			if (!_n0.b) {
				return A5(elm$url$Url$chompBeforePath, protocol, '/', params, frag, str);
			} else {
				var i = _n0.a;
				return A5(
					elm$url$Url$chompBeforePath,
					protocol,
					A2(elm$core$String$dropLeft, i, str),
					params,
					frag,
					A2(elm$core$String$left, i, str));
			}
		}
	});
var elm$url$Url$chompBeforeFragment = F3(
	function (protocol, frag, str) {
		if (elm$core$String$isEmpty(str)) {
			return elm$core$Maybe$Nothing;
		} else {
			var _n0 = A2(elm$core$String$indexes, '?', str);
			if (!_n0.b) {
				return A4(elm$url$Url$chompBeforeQuery, protocol, elm$core$Maybe$Nothing, frag, str);
			} else {
				var i = _n0.a;
				return A4(
					elm$url$Url$chompBeforeQuery,
					protocol,
					elm$core$Maybe$Just(
						A2(elm$core$String$dropLeft, i + 1, str)),
					frag,
					A2(elm$core$String$left, i, str));
			}
		}
	});
var elm$url$Url$chompAfterProtocol = F2(
	function (protocol, str) {
		if (elm$core$String$isEmpty(str)) {
			return elm$core$Maybe$Nothing;
		} else {
			var _n0 = A2(elm$core$String$indexes, '#', str);
			if (!_n0.b) {
				return A3(elm$url$Url$chompBeforeFragment, protocol, elm$core$Maybe$Nothing, str);
			} else {
				var i = _n0.a;
				return A3(
					elm$url$Url$chompBeforeFragment,
					protocol,
					elm$core$Maybe$Just(
						A2(elm$core$String$dropLeft, i + 1, str)),
					A2(elm$core$String$left, i, str));
			}
		}
	});
var elm$url$Url$fromString = function (str) {
	return A2(elm$core$String$startsWith, 'http://', str) ? A2(
		elm$url$Url$chompAfterProtocol,
		elm$url$Url$Http,
		A2(elm$core$String$dropLeft, 7, str)) : (A2(elm$core$String$startsWith, 'https://', str) ? A2(
		elm$url$Url$chompAfterProtocol,
		elm$url$Url$Https,
		A2(elm$core$String$dropLeft, 8, str)) : elm$core$Maybe$Nothing);
};
var elm$browser$Browser$Events$spawn = F3(
	function (router, key, _n0) {
		var node = _n0.a;
		var name = _n0.b;
		var actualNode = function () {
			if (node.$ === 'Document') {
				return _Browser_doc;
			} else {
				return _Browser_window;
			}
		}();
		return A2(
			elm$core$Task$map,
			function (value) {
				return _Utils_Tuple2(key, value);
			},
			A3(
				_Browser_on,
				actualNode,
				name,
				function (event) {
					return A2(
						elm$core$Platform$sendToSelf,
						router,
						A2(elm$browser$Browser$Events$Event, key, event));
				}));
	});
var elm$core$Dict$fromList = function (assocs) {
	return A3(
		elm$core$List$foldl,
		F2(
			function (_n0, dict) {
				var key = _n0.a;
				var value = _n0.b;
				return A3(elm$core$Dict$insert, key, value, dict);
			}),
		elm$core$Dict$empty,
		assocs);
};
var elm$core$Dict$foldl = F3(
	function (func, acc, dict) {
		foldl:
		while (true) {
			if (dict.$ === 'RBEmpty_elm_builtin') {
				return acc;
			} else {
				var key = dict.b;
				var value = dict.c;
				var left = dict.d;
				var right = dict.e;
				var $temp$func = func,
					$temp$acc = A3(
					func,
					key,
					value,
					A3(elm$core$Dict$foldl, func, acc, left)),
					$temp$dict = right;
				func = $temp$func;
				acc = $temp$acc;
				dict = $temp$dict;
				continue foldl;
			}
		}
	});
var elm$core$Dict$merge = F6(
	function (leftStep, bothStep, rightStep, leftDict, rightDict, initialResult) {
		var stepState = F3(
			function (rKey, rValue, _n0) {
				stepState:
				while (true) {
					var list = _n0.a;
					var result = _n0.b;
					if (!list.b) {
						return _Utils_Tuple2(
							list,
							A3(rightStep, rKey, rValue, result));
					} else {
						var _n2 = list.a;
						var lKey = _n2.a;
						var lValue = _n2.b;
						var rest = list.b;
						if (_Utils_cmp(lKey, rKey) < 0) {
							var $temp$rKey = rKey,
								$temp$rValue = rValue,
								$temp$_n0 = _Utils_Tuple2(
								rest,
								A3(leftStep, lKey, lValue, result));
							rKey = $temp$rKey;
							rValue = $temp$rValue;
							_n0 = $temp$_n0;
							continue stepState;
						} else {
							if (_Utils_cmp(lKey, rKey) > 0) {
								return _Utils_Tuple2(
									list,
									A3(rightStep, rKey, rValue, result));
							} else {
								return _Utils_Tuple2(
									rest,
									A4(bothStep, lKey, lValue, rValue, result));
							}
						}
					}
				}
			});
		var _n3 = A3(
			elm$core$Dict$foldl,
			stepState,
			_Utils_Tuple2(
				elm$core$Dict$toList(leftDict),
				initialResult),
			rightDict);
		var leftovers = _n3.a;
		var intermediateResult = _n3.b;
		return A3(
			elm$core$List$foldl,
			F2(
				function (_n4, result) {
					var k = _n4.a;
					var v = _n4.b;
					return A3(leftStep, k, v, result);
				}),
			intermediateResult,
			leftovers);
	});
var elm$core$Dict$union = F2(
	function (t1, t2) {
		return A3(elm$core$Dict$foldl, elm$core$Dict$insert, t2, t1);
	});
var elm$core$Process$kill = _Scheduler_kill;
var elm$browser$Browser$Events$onEffects = F3(
	function (router, subs, state) {
		var stepRight = F3(
			function (key, sub, _n6) {
				var deads = _n6.a;
				var lives = _n6.b;
				var news = _n6.c;
				return _Utils_Tuple3(
					deads,
					lives,
					A2(
						elm$core$List$cons,
						A3(elm$browser$Browser$Events$spawn, router, key, sub),
						news));
			});
		var stepLeft = F3(
			function (_n4, pid, _n5) {
				var deads = _n5.a;
				var lives = _n5.b;
				var news = _n5.c;
				return _Utils_Tuple3(
					A2(elm$core$List$cons, pid, deads),
					lives,
					news);
			});
		var stepBoth = F4(
			function (key, pid, _n2, _n3) {
				var deads = _n3.a;
				var lives = _n3.b;
				var news = _n3.c;
				return _Utils_Tuple3(
					deads,
					A3(elm$core$Dict$insert, key, pid, lives),
					news);
			});
		var newSubs = A2(elm$core$List$map, elm$browser$Browser$Events$addKey, subs);
		var _n0 = A6(
			elm$core$Dict$merge,
			stepLeft,
			stepBoth,
			stepRight,
			state.pids,
			elm$core$Dict$fromList(newSubs),
			_Utils_Tuple3(_List_Nil, elm$core$Dict$empty, _List_Nil));
		var deadPids = _n0.a;
		var livePids = _n0.b;
		var makeNewPids = _n0.c;
		return A2(
			elm$core$Task$andThen,
			function (pids) {
				return elm$core$Task$succeed(
					A2(
						elm$browser$Browser$Events$State,
						newSubs,
						A2(
							elm$core$Dict$union,
							livePids,
							elm$core$Dict$fromList(pids))));
			},
			A2(
				elm$core$Task$andThen,
				function (_n1) {
					return elm$core$Task$sequence(makeNewPids);
				},
				elm$core$Task$sequence(
					A2(elm$core$List$map, elm$core$Process$kill, deadPids))));
	});
var elm$core$List$maybeCons = F3(
	function (f, mx, xs) {
		var _n0 = f(mx);
		if (_n0.$ === 'Just') {
			var x = _n0.a;
			return A2(elm$core$List$cons, x, xs);
		} else {
			return xs;
		}
	});
var elm$core$List$filterMap = F2(
	function (f, xs) {
		return A3(
			elm$core$List$foldr,
			elm$core$List$maybeCons(f),
			_List_Nil,
			xs);
	});
var elm$browser$Browser$Events$onSelfMsg = F3(
	function (router, _n0, state) {
		var key = _n0.key;
		var event = _n0.event;
		var toMessage = function (_n2) {
			var subKey = _n2.a;
			var _n3 = _n2.b;
			var node = _n3.a;
			var name = _n3.b;
			var decoder = _n3.c;
			return _Utils_eq(subKey, key) ? A2(_Browser_decodeEvent, decoder, event) : elm$core$Maybe$Nothing;
		};
		var messages = A2(elm$core$List$filterMap, toMessage, state.subs);
		return A2(
			elm$core$Task$andThen,
			function (_n1) {
				return elm$core$Task$succeed(state);
			},
			elm$core$Task$sequence(
				A2(
					elm$core$List$map,
					elm$core$Platform$sendToApp(router),
					messages)));
	});
var elm$browser$Browser$Events$subMap = F2(
	function (func, _n0) {
		var node = _n0.a;
		var name = _n0.b;
		var decoder = _n0.c;
		return A3(
			elm$browser$Browser$Events$MySub,
			node,
			name,
			A2(elm$json$Json$Decode$map, func, decoder));
	});
_Platform_effectManagers['Browser.Events'] = _Platform_createManager(elm$browser$Browser$Events$init, elm$browser$Browser$Events$onEffects, elm$browser$Browser$Events$onSelfMsg, 0, elm$browser$Browser$Events$subMap);
var elm$browser$Browser$Events$subscription = _Platform_leaf('Browser.Events');
var elm$browser$Browser$Events$on = F3(
	function (node, name, decoder) {
		return elm$browser$Browser$Events$subscription(
			A3(elm$browser$Browser$Events$MySub, node, name, decoder));
	});
var elm$browser$Browser$Events$onKeyDown = A2(elm$browser$Browser$Events$on, elm$browser$Browser$Events$Document, 'keydown');
var elm$core$Platform$Sub$batch = _Platform_batch;
var elm$time$Time$Every = F2(
	function (a, b) {
		return {$: 'Every', a: a, b: b};
	});
var elm$time$Time$State = F2(
	function (taggers, processes) {
		return {processes: processes, taggers: taggers};
	});
var elm$time$Time$init = elm$core$Task$succeed(
	A2(elm$time$Time$State, elm$core$Dict$empty, elm$core$Dict$empty));
var elm$time$Time$addMySub = F2(
	function (_n0, state) {
		var interval = _n0.a;
		var tagger = _n0.b;
		var _n1 = A2(elm$core$Dict$get, interval, state);
		if (_n1.$ === 'Nothing') {
			return A3(
				elm$core$Dict$insert,
				interval,
				_List_fromArray(
					[tagger]),
				state);
		} else {
			var taggers = _n1.a;
			return A3(
				elm$core$Dict$insert,
				interval,
				A2(elm$core$List$cons, tagger, taggers),
				state);
		}
	});
var elm$core$Process$spawn = _Scheduler_spawn;
var elm$time$Time$Name = function (a) {
	return {$: 'Name', a: a};
};
var elm$time$Time$Offset = function (a) {
	return {$: 'Offset', a: a};
};
var elm$time$Time$Zone = F2(
	function (a, b) {
		return {$: 'Zone', a: a, b: b};
	});
var elm$time$Time$customZone = elm$time$Time$Zone;
var elm$time$Time$setInterval = _Time_setInterval;
var elm$time$Time$spawnHelp = F3(
	function (router, intervals, processes) {
		if (!intervals.b) {
			return elm$core$Task$succeed(processes);
		} else {
			var interval = intervals.a;
			var rest = intervals.b;
			var spawnTimer = elm$core$Process$spawn(
				A2(
					elm$time$Time$setInterval,
					interval,
					A2(elm$core$Platform$sendToSelf, router, interval)));
			var spawnRest = function (id) {
				return A3(
					elm$time$Time$spawnHelp,
					router,
					rest,
					A3(elm$core$Dict$insert, interval, id, processes));
			};
			return A2(elm$core$Task$andThen, spawnRest, spawnTimer);
		}
	});
var elm$time$Time$onEffects = F3(
	function (router, subs, _n0) {
		var processes = _n0.processes;
		var rightStep = F3(
			function (_n6, id, _n7) {
				var spawns = _n7.a;
				var existing = _n7.b;
				var kills = _n7.c;
				return _Utils_Tuple3(
					spawns,
					existing,
					A2(
						elm$core$Task$andThen,
						function (_n5) {
							return kills;
						},
						elm$core$Process$kill(id)));
			});
		var newTaggers = A3(elm$core$List$foldl, elm$time$Time$addMySub, elm$core$Dict$empty, subs);
		var leftStep = F3(
			function (interval, taggers, _n4) {
				var spawns = _n4.a;
				var existing = _n4.b;
				var kills = _n4.c;
				return _Utils_Tuple3(
					A2(elm$core$List$cons, interval, spawns),
					existing,
					kills);
			});
		var bothStep = F4(
			function (interval, taggers, id, _n3) {
				var spawns = _n3.a;
				var existing = _n3.b;
				var kills = _n3.c;
				return _Utils_Tuple3(
					spawns,
					A3(elm$core$Dict$insert, interval, id, existing),
					kills);
			});
		var _n1 = A6(
			elm$core$Dict$merge,
			leftStep,
			bothStep,
			rightStep,
			newTaggers,
			processes,
			_Utils_Tuple3(
				_List_Nil,
				elm$core$Dict$empty,
				elm$core$Task$succeed(_Utils_Tuple0)));
		var spawnList = _n1.a;
		var existingDict = _n1.b;
		var killTask = _n1.c;
		return A2(
			elm$core$Task$andThen,
			function (newProcesses) {
				return elm$core$Task$succeed(
					A2(elm$time$Time$State, newTaggers, newProcesses));
			},
			A2(
				elm$core$Task$andThen,
				function (_n2) {
					return A3(elm$time$Time$spawnHelp, router, spawnList, existingDict);
				},
				killTask));
	});
var elm$time$Time$Posix = function (a) {
	return {$: 'Posix', a: a};
};
var elm$time$Time$millisToPosix = elm$time$Time$Posix;
var elm$time$Time$now = _Time_now(elm$time$Time$millisToPosix);
var elm$time$Time$onSelfMsg = F3(
	function (router, interval, state) {
		var _n0 = A2(elm$core$Dict$get, interval, state.taggers);
		if (_n0.$ === 'Nothing') {
			return elm$core$Task$succeed(state);
		} else {
			var taggers = _n0.a;
			var tellTaggers = function (time) {
				return elm$core$Task$sequence(
					A2(
						elm$core$List$map,
						function (tagger) {
							return A2(
								elm$core$Platform$sendToApp,
								router,
								tagger(time));
						},
						taggers));
			};
			return A2(
				elm$core$Task$andThen,
				function (_n1) {
					return elm$core$Task$succeed(state);
				},
				A2(elm$core$Task$andThen, tellTaggers, elm$time$Time$now));
		}
	});
var elm$time$Time$subMap = F2(
	function (f, _n0) {
		var interval = _n0.a;
		var tagger = _n0.b;
		return A2(
			elm$time$Time$Every,
			interval,
			A2(elm$core$Basics$composeL, f, tagger));
	});
_Platform_effectManagers['Time'] = _Platform_createManager(elm$time$Time$init, elm$time$Time$onEffects, elm$time$Time$onSelfMsg, 0, elm$time$Time$subMap);
var elm$time$Time$subscription = _Platform_leaf('Time');
var elm$time$Time$every = F2(
	function (interval, tagger) {
		return elm$time$Time$subscription(
			A2(elm$time$Time$Every, interval, tagger));
	});
var author$project$Main$subscriptions = function (model) {
	return elm$core$Platform$Sub$batch(
		_List_fromArray(
			[
				A2(elm$time$Time$every, 1000, author$project$Root$GetPlayer),
				elm$browser$Browser$Events$onKeyDown(
				A2(elm$json$Json$Decode$map, author$project$Root$HandleKeyboardEvent, Gizra$elm_keyboard_event$Keyboard$Event$decodeKeyboardEvent)),
				author$project$Ports$thePrpReleases(author$project$Root$AddReleaseThePrp)
			]));
};
var author$project$Data$Image$Large = {$: 'Large'};
var elm$core$List$head = function (list) {
	if (list.b) {
		var x = list.a;
		var xs = list.b;
		return elm$core$Maybe$Just(x);
	} else {
		return elm$core$Maybe$Nothing;
	}
};
var elm$core$List$takeReverse = F3(
	function (n, list, kept) {
		takeReverse:
		while (true) {
			if (n <= 0) {
				return kept;
			} else {
				if (!list.b) {
					return kept;
				} else {
					var x = list.a;
					var xs = list.b;
					var $temp$n = n - 1,
						$temp$list = xs,
						$temp$kept = A2(elm$core$List$cons, x, kept);
					n = $temp$n;
					list = $temp$list;
					kept = $temp$kept;
					continue takeReverse;
				}
			}
		}
	});
var elm$core$List$takeTailRec = F2(
	function (n, list) {
		return elm$core$List$reverse(
			A3(elm$core$List$takeReverse, n, list, _List_Nil));
	});
var elm$core$List$takeFast = F3(
	function (ctr, n, list) {
		if (n <= 0) {
			return _List_Nil;
		} else {
			var _n0 = _Utils_Tuple2(n, list);
			_n0$1:
			while (true) {
				_n0$5:
				while (true) {
					if (!_n0.b.b) {
						return list;
					} else {
						if (_n0.b.b.b) {
							switch (_n0.a) {
								case 1:
									break _n0$1;
								case 2:
									var _n2 = _n0.b;
									var x = _n2.a;
									var _n3 = _n2.b;
									var y = _n3.a;
									return _List_fromArray(
										[x, y]);
								case 3:
									if (_n0.b.b.b.b) {
										var _n4 = _n0.b;
										var x = _n4.a;
										var _n5 = _n4.b;
										var y = _n5.a;
										var _n6 = _n5.b;
										var z = _n6.a;
										return _List_fromArray(
											[x, y, z]);
									} else {
										break _n0$5;
									}
								default:
									if (_n0.b.b.b.b && _n0.b.b.b.b.b) {
										var _n7 = _n0.b;
										var x = _n7.a;
										var _n8 = _n7.b;
										var y = _n8.a;
										var _n9 = _n8.b;
										var z = _n9.a;
										var _n10 = _n9.b;
										var w = _n10.a;
										var tl = _n10.b;
										return (ctr > 1000) ? A2(
											elm$core$List$cons,
											x,
											A2(
												elm$core$List$cons,
												y,
												A2(
													elm$core$List$cons,
													z,
													A2(
														elm$core$List$cons,
														w,
														A2(elm$core$List$takeTailRec, n - 4, tl))))) : A2(
											elm$core$List$cons,
											x,
											A2(
												elm$core$List$cons,
												y,
												A2(
													elm$core$List$cons,
													z,
													A2(
														elm$core$List$cons,
														w,
														A3(elm$core$List$takeFast, ctr + 1, n - 4, tl)))));
									} else {
										break _n0$5;
									}
							}
						} else {
							if (_n0.a === 1) {
								break _n0$1;
							} else {
								break _n0$5;
							}
						}
					}
				}
				return list;
			}
			var _n1 = _n0.b;
			var x = _n1.a;
			return _List_fromArray(
				[x]);
		}
	});
var elm$core$List$take = F2(
	function (n, list) {
		return A3(elm$core$List$takeFast, 0, n, list);
	});
var elm$core$Maybe$withDefault = F2(
	function (_default, maybe) {
		if (maybe.$ === 'Just') {
			var value = maybe.a;
			return value;
		} else {
			return _default;
		}
	});
var elm$html$Html$img = _VirtualDom_node('img');
var elm$virtual_dom$VirtualDom$text = _VirtualDom_text;
var elm$html$Html$text = elm$virtual_dom$VirtualDom$text;
var elm$json$Json$Encode$string = _Json_wrap;
var elm$html$Html$Attributes$stringProperty = F2(
	function (key, string) {
		return A2(
			_VirtualDom_property,
			key,
			elm$json$Json$Encode$string(string));
	});
var elm$html$Html$Attributes$src = function (url) {
	return A2(
		elm$html$Html$Attributes$stringProperty,
		'src',
		_VirtualDom_noJavaScriptOrHtmlUri(url));
};
var author$project$Data$Image$imageView = F2(
	function (size, image) {
		var showImage = function (c) {
			return (c.url === '') ? elm$html$Html$text('') : A2(
				elm$html$Html$img,
				_List_fromArray(
					[
						elm$html$Html$Attributes$src(c.url)
					]),
				_List_Nil);
		};
		switch (size.$) {
			case 'Small':
				return showImage(
					A2(
						elm$core$Maybe$withDefault,
						{url: ''},
						elm$core$List$head(
							elm$core$List$reverse(image))));
			case 'Medium':
				return showImage(
					A2(
						elm$core$Maybe$withDefault,
						{url: ''},
						elm$core$List$head(
							elm$core$List$reverse(
								A2(elm$core$List$take, 2, image)))));
			default:
				return showImage(
					A2(
						elm$core$Maybe$withDefault,
						{url: ''},
						elm$core$List$head(image)));
		}
	});
var author$project$Root$ChangePlaying = function (a) {
	return {$: 'ChangePlaying', a: a};
};
var author$project$Root$ChangePlayingTrack = function (a) {
	return {$: 'ChangePlayingTrack', a: a};
};
var author$project$Root$GetArtist = function (a) {
	return {$: 'GetArtist', a: a};
};
var author$project$Root$ModalGetTrack = function (a) {
	return {$: 'ModalGetTrack', a: a};
};
var elm$core$Basics$modBy = _Basics_modBy;
var elm$time$Time$flooredDiv = F2(
	function (numerator, denominator) {
		return elm$core$Basics$floor(numerator / denominator);
	});
var elm$time$Time$posixToMillis = function (_n0) {
	var millis = _n0.a;
	return millis;
};
var elm$time$Time$toAdjustedMinutesHelp = F3(
	function (defaultOffset, posixMinutes, eras) {
		toAdjustedMinutesHelp:
		while (true) {
			if (!eras.b) {
				return posixMinutes + defaultOffset;
			} else {
				var era = eras.a;
				var olderEras = eras.b;
				if (_Utils_cmp(era.start, posixMinutes) < 0) {
					return posixMinutes + era.offset;
				} else {
					var $temp$defaultOffset = defaultOffset,
						$temp$posixMinutes = posixMinutes,
						$temp$eras = olderEras;
					defaultOffset = $temp$defaultOffset;
					posixMinutes = $temp$posixMinutes;
					eras = $temp$eras;
					continue toAdjustedMinutesHelp;
				}
			}
		}
	});
var elm$time$Time$toAdjustedMinutes = F2(
	function (_n0, time) {
		var defaultOffset = _n0.a;
		var eras = _n0.b;
		return A3(
			elm$time$Time$toAdjustedMinutesHelp,
			defaultOffset,
			A2(
				elm$time$Time$flooredDiv,
				elm$time$Time$posixToMillis(time),
				60000),
			eras);
	});
var elm$time$Time$toHour = F2(
	function (zone, time) {
		return A2(
			elm$core$Basics$modBy,
			24,
			A2(
				elm$time$Time$flooredDiv,
				A2(elm$time$Time$toAdjustedMinutes, zone, time),
				60));
	});
var elm$time$Time$toMinute = F2(
	function (zone, time) {
		return A2(
			elm$core$Basics$modBy,
			60,
			A2(elm$time$Time$toAdjustedMinutes, zone, time));
	});
var elm$time$Time$toSecond = F2(
	function (_n0, time) {
		return A2(
			elm$core$Basics$modBy,
			60,
			A2(
				elm$time$Time$flooredDiv,
				elm$time$Time$posixToMillis(time),
				1000));
	});
var elm$time$Time$utc = A2(elm$time$Time$Zone, 0, _List_Nil);
var author$project$Utils$durationFormat = function (duration) {
	var toTime = function (unit) {
		return A2(
			unit,
			elm$time$Time$utc,
			elm$time$Time$millisToPosix(duration));
	};
	var second = (toTime(elm$time$Time$toSecond) < 10) ? ('0' + elm$core$String$fromInt(
		toTime(elm$time$Time$toSecond))) : elm$core$String$fromInt(
		toTime(elm$time$Time$toSecond));
	var minute = elm$core$String$fromInt(
		toTime(elm$time$Time$toMinute)) + ':';
	var hour = (toTime(elm$time$Time$toHour) > 0) ? (elm$core$String$fromInt(
		toTime(elm$time$Time$toHour)) + ':') : '';
	return _Utils_ap(
		hour,
		_Utils_ap(minute, second));
};
var author$project$Utils$durationFormatMinutes = function (duration) {
	var toTime = function (unit) {
		return A2(
			unit,
			elm$time$Time$utc,
			elm$time$Time$millisToPosix(duration));
	};
	var minute = elm$core$String$fromInt(
		toTime(elm$time$Time$toMinute));
	return minute + ' min';
};
var author$project$Utils$releaseDateFormat = function (date) {
	return A2(
		elm$core$Maybe$withDefault,
		'',
		elm$core$List$head(
			A2(elm$core$String$split, '-', date)));
};
var elm$core$Basics$neq = _Utils_notEqual;
var elm$core$List$sum = function (numbers) {
	return A3(elm$core$List$foldl, elm$core$Basics$add, 0, numbers);
};
var elm$html$Html$a = _VirtualDom_node('a');
var elm$html$Html$div = _VirtualDom_node('div');
var elm$html$Html$i = _VirtualDom_node('i');
var elm$html$Html$span = _VirtualDom_node('span');
var elm$html$Html$Attributes$class = elm$html$Html$Attributes$stringProperty('className');
var elm$core$List$filter = F2(
	function (isGood, list) {
		return A3(
			elm$core$List$foldr,
			F2(
				function (x, xs) {
					return isGood(x) ? A2(elm$core$List$cons, x, xs) : xs;
				}),
			_List_Nil,
			list);
	});
var elm$core$Tuple$second = function (_n0) {
	var y = _n0.b;
	return y;
};
var elm$html$Html$Attributes$classList = function (classes) {
	return elm$html$Html$Attributes$class(
		A2(
			elm$core$String$join,
			' ',
			A2(
				elm$core$List$map,
				elm$core$Tuple$first,
				A2(elm$core$List$filter, elm$core$Tuple$second, classes))));
};
var elm$virtual_dom$VirtualDom$Normal = function (a) {
	return {$: 'Normal', a: a};
};
var elm$virtual_dom$VirtualDom$on = _VirtualDom_on;
var elm$html$Html$Events$on = F2(
	function (event, decoder) {
		return A2(
			elm$virtual_dom$VirtualDom$on,
			event,
			elm$virtual_dom$VirtualDom$Normal(decoder));
	});
var elm$html$Html$Events$onClick = function (msg) {
	return A2(
		elm$html$Html$Events$on,
		'click',
		elm$json$Json$Decode$succeed(msg));
};
var elm_community$list_extra$List$Extra$dropWhile = F2(
	function (predicate, list) {
		dropWhile:
		while (true) {
			if (!list.b) {
				return _List_Nil;
			} else {
				var x = list.a;
				var xs = list.b;
				if (predicate(x)) {
					var $temp$predicate = predicate,
						$temp$list = xs;
					predicate = $temp$predicate;
					list = $temp$list;
					continue dropWhile;
				} else {
					return list;
				}
			}
		}
	});
var author$project$View$Album$view = F2(
	function (player, album) {
		var trackSumDuration = elm$core$List$sum(
			A2(
				elm$core$List$map,
				function (d) {
					return d.duration_ms;
				},
				album.tracks));
		var listTracksUri = function (id) {
			return A2(
				elm$core$List$map,
				function (k) {
					return k.uri;
				},
				A2(
					elm_community$list_extra$List$Extra$dropWhile,
					function (e) {
						return !_Utils_eq(e.uri, id);
					},
					album.tracks));
		};
		var trackItem = function (t) {
			return A2(
				elm$html$Html$div,
				_List_fromArray(
					[
						elm$html$Html$Attributes$classList(
						_List_fromArray(
							[
								_Utils_Tuple2('track album-page', true),
								_Utils_Tuple2(
								'active',
								_Utils_eq(t.uri, player.item.uri))
							])),
						elm$html$Html$Events$onClick(
						author$project$Root$ChangePlayingTrack(
							listTracksUri(t.uri)))
					]),
				_List_fromArray(
					[
						_Utils_eq(t.uri, player.item.uri) ? A2(
						elm$html$Html$div,
						_List_Nil,
						_List_fromArray(
							[
								A2(
								elm$html$Html$i,
								_List_fromArray(
									[
										elm$html$Html$Attributes$class('icon-play')
									]),
								_List_Nil)
							])) : A2(
						elm$html$Html$div,
						_List_Nil,
						_List_fromArray(
							[
								A2(
								elm$html$Html$i,
								_List_fromArray(
									[
										elm$html$Html$Attributes$class('icon-music')
									]),
								_List_Nil)
							])),
						A2(
						elm$html$Html$div,
						_List_Nil,
						_List_fromArray(
							[
								elm$html$Html$text(
								elm$core$String$fromInt(t.track_number) + '.')
							])),
						A2(
						elm$html$Html$div,
						_List_Nil,
						_List_fromArray(
							[
								elm$html$Html$text(t.name)
							])),
						A2(
						elm$html$Html$div,
						_List_Nil,
						_List_fromArray(
							[
								elm$html$Html$text(
								author$project$Utils$durationFormat(t.duration_ms))
							]))
					]));
		};
		return A2(
			elm$html$Html$div,
			_List_fromArray(
				[
					elm$html$Html$Attributes$class('album-wrapper')
				]),
			_List_fromArray(
				[
					A2(
					elm$html$Html$div,
					_List_fromArray(
						[
							elm$html$Html$Attributes$class('bg-cover')
						]),
					_List_fromArray(
						[
							A2(author$project$Data$Image$imageView, author$project$Data$Image$Large, album.album.images)
						])),
					A2(
					elm$html$Html$div,
					_List_fromArray(
						[
							elm$html$Html$Attributes$class('album-page-head')
						]),
					_List_fromArray(
						[
							A2(
							elm$html$Html$div,
							_List_fromArray(
								[
									elm$html$Html$Attributes$class('heading-page')
								]),
							_List_fromArray(
								[
									elm$html$Html$text(album.album.name)
								])),
							A2(
							elm$html$Html$div,
							_List_Nil,
							_List_fromArray(
								[
									A2(
									elm$html$Html$span,
									_List_Nil,
									_List_fromArray(
										[
											elm$html$Html$text('By ')
										])),
									A2(
									elm$html$Html$span,
									_List_fromArray(
										[
											elm$html$Html$Attributes$class('artist-name')
										]),
									A2(
										elm$core$List$map,
										function (ar) {
											return A2(
												elm$html$Html$a,
												_List_fromArray(
													[
														elm$html$Html$Events$onClick(
														author$project$Root$GetArtist(ar.id))
													]),
												_List_fromArray(
													[
														elm$html$Html$text(ar.name)
													]));
										},
										album.album.artists))
								]))
						])),
					A2(
					elm$html$Html$div,
					_List_fromArray(
						[
							elm$html$Html$Attributes$class('album-page')
						]),
					_List_fromArray(
						[
							A2(
							elm$html$Html$div,
							_List_Nil,
							_List_fromArray(
								[
									A2(
									elm$html$Html$div,
									_List_fromArray(
										[
											elm$html$Html$Attributes$class('album')
										]),
									_List_fromArray(
										[
											A2(
											elm$html$Html$div,
											_List_fromArray(
												[
													elm$html$Html$Attributes$class('img')
												]),
											_List_fromArray(
												[
													A2(author$project$Data$Image$imageView, author$project$Data$Image$Large, album.album.images)
												])),
											A2(
											elm$html$Html$div,
											_List_fromArray(
												[
													elm$html$Html$Attributes$class('playing-btn'),
													elm$html$Html$Events$onClick(
													author$project$Root$ChangePlaying(album.album.uri))
												]),
											_List_fromArray(
												[
													A2(
													elm$html$Html$i,
													_List_fromArray(
														[
															elm$html$Html$Attributes$class('icon-play')
														]),
													_List_Nil)
												])),
											A2(
											elm$html$Html$div,
											_List_fromArray(
												[
													elm$html$Html$Attributes$class('add-btn'),
													elm$html$Html$Events$onClick(
													author$project$Root$ModalGetTrack(album.album.id))
												]),
											_List_fromArray(
												[
													A2(
													elm$html$Html$i,
													_List_fromArray(
														[
															elm$html$Html$Attributes$class('icon-add')
														]),
													_List_Nil)
												])),
											A2(
											elm$html$Html$div,
											_List_Nil,
											_List_fromArray(
												[
													elm$html$Html$text(
													author$project$Utils$releaseDateFormat(album.album.release_date))
												])),
											A2(
											elm$html$Html$div,
											_List_Nil,
											_List_fromArray(
												[
													elm$html$Html$text(
													author$project$Utils$durationFormatMinutes(trackSumDuration))
												]))
										]))
								])),
							A2(
							elm$html$Html$div,
							_List_Nil,
							_List_fromArray(
								[
									A2(
									elm$html$Html$div,
									_List_Nil,
									A2(elm$core$List$map, trackItem, album.tracks))
								]))
						]))
				]));
	});
var author$project$Data$Image$Small = {$: 'Small'};
var author$project$Data$Image$Medium = {$: 'Medium'};
var author$project$Root$GetAlbum = function (a) {
	return {$: 'GetAlbum', a: a};
};
var author$project$View$AlbumGallery$view = F2(
	function (player, albums) {
		var albumItem = function (a) {
			return A2(
				elm$html$Html$div,
				_List_fromArray(
					[
						elm$html$Html$Attributes$classList(
						_List_fromArray(
							[
								_Utils_Tuple2('album', true),
								_Utils_Tuple2(
								'active',
								_Utils_eq(player.item.album.id, a.id))
							]))
					]),
				_List_fromArray(
					[
						A2(
						elm$html$Html$div,
						_List_fromArray(
							[
								elm$html$Html$Attributes$class('img'),
								elm$html$Html$Events$onClick(
								author$project$Root$GetAlbum(a.id))
							]),
						_List_fromArray(
							[
								A2(author$project$Data$Image$imageView, author$project$Data$Image$Medium, a.images)
							])),
						A2(
						elm$html$Html$div,
						_List_Nil,
						_List_fromArray(
							[
								elm$html$Html$text(a.name)
							])),
						A2(
						elm$html$Html$div,
						_List_fromArray(
							[
								elm$html$Html$Attributes$class('date')
							]),
						_List_fromArray(
							[
								elm$html$Html$text(
								'(' + (author$project$Utils$releaseDateFormat(a.release_date) + ')'))
							])),
						A2(
						elm$html$Html$div,
						_List_fromArray(
							[
								elm$html$Html$Attributes$class('playing-btn'),
								elm$html$Html$Events$onClick(
								author$project$Root$ChangePlaying(a.uri))
							]),
						_List_fromArray(
							[
								A2(
								elm$html$Html$i,
								_List_fromArray(
									[
										elm$html$Html$Attributes$class('icon-play')
									]),
								_List_Nil)
							])),
						A2(
						elm$html$Html$div,
						_List_fromArray(
							[
								elm$html$Html$Attributes$class('add-btn'),
								elm$html$Html$Events$onClick(
								author$project$Root$ModalGetTrack(a.id))
							]),
						_List_fromArray(
							[
								A2(
								elm$html$Html$i,
								_List_fromArray(
									[
										elm$html$Html$Attributes$class('icon-add')
									]),
								_List_Nil)
							]))
					]));
		};
		return A2(
			elm$html$Html$div,
			_List_fromArray(
				[
					elm$html$Html$Attributes$class('album-list-wrapper')
				]),
			A2(elm$core$List$map, albumItem, albums));
	});
var elm$html$Html$iframe = _VirtualDom_node('iframe');
var elm$virtual_dom$VirtualDom$attribute = F2(
	function (key, value) {
		return A2(
			_VirtualDom_attribute,
			_VirtualDom_noOnOrFormAction(key),
			_VirtualDom_noJavaScriptOrHtmlUri(value));
	});
var elm$html$Html$Attributes$attribute = elm$virtual_dom$VirtualDom$attribute;
var elm$html$Html$Attributes$height = function (n) {
	return A2(
		_VirtualDom_attribute,
		'height',
		elm$core$String$fromInt(n));
};
var elm$html$Html$Attributes$href = function (url) {
	return A2(
		elm$html$Html$Attributes$stringProperty,
		'href',
		_VirtualDom_noJavaScriptUri(url));
};
var elm$html$Html$Attributes$target = elm$html$Html$Attributes$stringProperty('target');
var elm$html$Html$Attributes$width = function (n) {
	return A2(
		_VirtualDom_attribute,
		'width',
		elm$core$String$fromInt(n));
};
var author$project$View$Artist$view = F2(
	function (player, data) {
		var videoFrame = function (v) {
			return A2(
				elm$html$Html$div,
				_List_fromArray(
					[
						elm$html$Html$Attributes$class('video-frame')
					]),
				_List_fromArray(
					[
						A2(
						elm$html$Html$iframe,
						_List_fromArray(
							[
								elm$html$Html$Attributes$class('video'),
								A2(elm$html$Html$Attributes$attribute, 'allowfullscreen', ''),
								A2(elm$html$Html$Attributes$attribute, 'frameborder', '0'),
								elm$html$Html$Attributes$width(250),
								elm$html$Html$Attributes$height(140),
								elm$html$Html$Attributes$src('https://www.youtube.com/embed/' + v.id.videoId)
							]),
						_List_Nil),
						A2(
						elm$html$Html$div,
						_List_fromArray(
							[
								elm$html$Html$Attributes$class('video-title')
							]),
						_List_fromArray(
							[
								elm$html$Html$text(v.snippet.title)
							])),
						A2(
						elm$html$Html$div,
						_List_fromArray(
							[
								elm$html$Html$Attributes$class('artist-name')
							]),
						_List_fromArray(
							[
								A2(
								elm$html$Html$a,
								_List_fromArray(
									[
										elm$html$Html$Attributes$target('_BLANK'),
										elm$html$Html$Attributes$href('https://www.youtube.com/channel/' + v.snippet.channelId)
									]),
								_List_fromArray(
									[
										elm$html$Html$text(v.snippet.channelTitle)
									]))
							]))
					]));
		};
		var relatedArtistItem = function (r) {
			return A2(
				elm$html$Html$div,
				_List_fromArray(
					[
						elm$html$Html$Attributes$class('related-artist'),
						elm$html$Html$Events$onClick(
						author$project$Root$GetArtist(r.id))
					]),
				_List_fromArray(
					[
						A2(
						elm$html$Html$div,
						_List_Nil,
						_List_fromArray(
							[
								A2(author$project$Data$Image$imageView, author$project$Data$Image$Small, r.images)
							])),
						A2(
						elm$html$Html$div,
						_List_Nil,
						_List_fromArray(
							[
								elm$html$Html$text(r.name)
							]))
					]));
		};
		var listTracksUri = function (id) {
			return A2(
				elm$core$List$map,
				function (k) {
					return k.uri;
				},
				A2(
					elm_community$list_extra$List$Extra$dropWhile,
					function (e) {
						return !_Utils_eq(e.uri, id);
					},
					data.topTracks));
		};
		var trackItem = function (t) {
			return A2(
				elm$html$Html$div,
				_List_fromArray(
					[
						elm$html$Html$Attributes$classList(
						_List_fromArray(
							[
								_Utils_Tuple2('track', true),
								_Utils_Tuple2(
								'active',
								_Utils_eq(t.uri, player.item.uri))
							])),
						elm$html$Html$Events$onClick(
						author$project$Root$ChangePlayingTrack(
							listTracksUri(t.uri)))
					]),
				_List_fromArray(
					[
						A2(
						elm$html$Html$div,
						_List_Nil,
						_List_fromArray(
							[
								A2(author$project$Data$Image$imageView, author$project$Data$Image$Small, t.album.images)
							])),
						A2(
						elm$html$Html$div,
						_List_Nil,
						_List_fromArray(
							[
								elm$html$Html$text(t.name)
							])),
						A2(
						elm$html$Html$div,
						_List_Nil,
						_List_fromArray(
							[
								elm$html$Html$text(
								author$project$Utils$durationFormat(t.duration_ms))
							]))
					]));
		};
		var link = F4(
			function (name, urlBefore, urlAfter, icon) {
				return A2(
					elm$html$Html$a,
					_List_fromArray(
						[
							elm$html$Html$Attributes$href(
							_Utils_ap(
								urlBefore,
								_Utils_ap(data.artist.name, urlAfter))),
							elm$html$Html$Attributes$target('_BLANK')
						]),
					_List_fromArray(
						[
							A2(
							elm$html$Html$i,
							_List_fromArray(
								[
									elm$html$Html$Attributes$class('icon-' + icon)
								]),
							_List_Nil),
							elm$html$Html$text(name)
						]));
			});
		return A2(
			elm$html$Html$div,
			_List_fromArray(
				[
					elm$html$Html$Attributes$class('artist-wrapper')
				]),
			_List_fromArray(
				[
					A2(
					elm$html$Html$div,
					_List_Nil,
					_List_fromArray(
						[
							A2(
							elm$html$Html$div,
							_List_fromArray(
								[
									elm$html$Html$Attributes$class('heading-page')
								]),
							_List_fromArray(
								[
									elm$html$Html$text(data.artist.name)
								])),
							A2(
							elm$html$Html$div,
							_List_fromArray(
								[
									elm$html$Html$Attributes$class('links')
								]),
							_List_fromArray(
								[
									A4(link, 'Wikipedia', 'https://fr.wikipedia.org/wiki/', '', 'wikipedia'),
									A4(link, 'Sputnik', 'https://www.sputnikmusic.com/search_results.php?genreid=0&search_in=Bands&search_text=', '&x=0&y=0', 'sputnik'),
									A4(link, 'Discogs', 'https://www.discogs.com/fr/search/?q=', '&type=artist&strict=true', 'discogs'),
									A4(link, 'LastFM', 'https://www.last.fm/fr/music/', '', 'lastfm'),
									A4(link, 'Allmusic', 'https://www.allmusic.com/search/artists/', '', 'allmusic')
								])),
							A2(
							elm$html$Html$div,
							_List_fromArray(
								[
									elm$html$Html$Attributes$class('artist-head')
								]),
							_List_fromArray(
								[
									A2(
									elm$html$Html$div,
									_List_fromArray(
										[
											elm$html$Html$Attributes$class('top-tracks')
										]),
									_List_fromArray(
										[
											A2(
											elm$html$Html$div,
											_List_fromArray(
												[
													elm$html$Html$Attributes$class('sub-title')
												]),
											_List_fromArray(
												[
													elm$html$Html$text('Top tracks')
												])),
											A2(
											elm$html$Html$div,
											_List_Nil,
											A2(
												elm$core$List$map,
												trackItem,
												A2(elm$core$List$take, 5, data.topTracks)))
										])),
									A2(
									elm$html$Html$div,
									_List_Nil,
									_List_fromArray(
										[
											A2(
											elm$html$Html$div,
											_List_fromArray(
												[
													elm$html$Html$Attributes$class('sub-title')
												]),
											_List_fromArray(
												[
													elm$html$Html$text('Similar artists')
												])),
											A2(
											elm$html$Html$div,
											_List_fromArray(
												[
													elm$html$Html$Attributes$class('related-artists')
												]),
											A2(
												elm$core$List$map,
												relatedArtistItem,
												A2(elm$core$List$take, 4, data.relatedArtists)))
										]))
								])),
							A2(
							elm$html$Html$div,
							_List_fromArray(
								[
									elm$html$Html$Attributes$class('sub-title')
								]),
							_List_fromArray(
								[
									elm$html$Html$text('Albums')
								])),
							A2(author$project$View$AlbumGallery$view, player, data.albums)
						])),
					A2(
					elm$html$Html$div,
					_List_fromArray(
						[
							elm$html$Html$Attributes$class('video-wrapper')
						]),
					_List_fromArray(
						[
							A2(
							elm$html$Html$div,
							_List_fromArray(
								[
									elm$html$Html$Attributes$class('sub-title')
								]),
							_List_fromArray(
								[
									elm$html$Html$text('Videos')
								])),
							A2(
							elm$html$Html$div,
							_List_Nil,
							A2(elm$core$List$map, videoFrame, data.videos))
						]))
				]));
	});
var author$project$Root$DelCollectionAlbum = F2(
	function (a, b) {
		return {$: 'DelCollectionAlbum', a: a, b: b};
	});
var elm$core$String$replace = F3(
	function (before, after, string) {
		return A2(
			elm$core$String$join,
			after,
			A2(elm$core$String$split, before, string));
	});
var elm$core$String$words = _String_words;
var author$project$View$Collection$view = F2(
	function (player, collection) {
		var albums = A2(
			elm$core$List$map,
			function (a) {
				return {album: a.track.album.name, albumId: a.track.album.id, albumUri: a.track.album.uri, artists: a.track.artists, images: a.track.album.images, release_date: a.track.album.release_date, trackUri: a.track.uri};
			},
			collection.playlist.tracks.items);
		var albumItem = function (al) {
			return A2(
				elm$html$Html$div,
				_List_fromArray(
					[
						elm$html$Html$Attributes$classList(
						_List_fromArray(
							[
								_Utils_Tuple2('album', true),
								_Utils_Tuple2(
								'active',
								_Utils_eq(player.item.album.id, al.albumId))
							]))
					]),
				_List_fromArray(
					[
						A2(
						elm$html$Html$div,
						_List_fromArray(
							[
								elm$html$Html$Attributes$class('img'),
								elm$html$Html$Events$onClick(
								author$project$Root$GetAlbum(al.albumId))
							]),
						_List_fromArray(
							[
								A2(author$project$Data$Image$imageView, author$project$Data$Image$Medium, al.images)
							])),
						A2(
						elm$html$Html$div,
						_List_Nil,
						_List_fromArray(
							[
								elm$html$Html$text(al.album)
							])),
						A2(
						elm$html$Html$div,
						_List_Nil,
						A2(
							elm$core$List$map,
							function (ar) {
								return A2(
									elm$html$Html$a,
									_List_fromArray(
										[
											elm$html$Html$Events$onClick(
											author$project$Root$GetArtist(ar.id)),
											elm$html$Html$Attributes$class('artist-name')
										]),
									_List_fromArray(
										[
											elm$html$Html$text(ar.name)
										]));
							},
							al.artists)),
						A2(
						elm$html$Html$div,
						_List_fromArray(
							[
								elm$html$Html$Attributes$class('date')
							]),
						_List_fromArray(
							[
								elm$html$Html$text(
								'(' + (author$project$Utils$releaseDateFormat(al.release_date) + ')'))
							])),
						A2(
						elm$html$Html$div,
						_List_fromArray(
							[
								elm$html$Html$Attributes$class('playing-btn'),
								elm$html$Html$Events$onClick(
								author$project$Root$ChangePlaying(al.albumUri))
							]),
						_List_fromArray(
							[
								A2(
								elm$html$Html$i,
								_List_fromArray(
									[
										elm$html$Html$Attributes$class('icon-play')
									]),
								_List_Nil)
							])),
						A2(
						elm$html$Html$div,
						_List_fromArray(
							[
								elm$html$Html$Attributes$class('add-btn'),
								elm$html$Html$Events$onClick(
								author$project$Root$ModalGetTrack(al.albumId))
							]),
						_List_fromArray(
							[
								A2(
								elm$html$Html$i,
								_List_fromArray(
									[
										elm$html$Html$Attributes$class('icon-add')
									]),
								_List_Nil)
							])),
						A2(
						elm$html$Html$div,
						_List_fromArray(
							[
								elm$html$Html$Attributes$class('del-btn'),
								elm$html$Html$Events$onClick(
								A2(
									author$project$Root$DelCollectionAlbum,
									collection.playlist.id,
									elm$core$String$words(al.trackUri)))
							]),
						_List_fromArray(
							[
								A2(
								elm$html$Html$i,
								_List_fromArray(
									[
										elm$html$Html$Attributes$class('icon-del')
									]),
								_List_Nil)
							]))
					]));
		};
		return A2(
			elm$html$Html$div,
			_List_Nil,
			_List_fromArray(
				[
					A2(
					elm$html$Html$div,
					_List_fromArray(
						[
							elm$html$Html$Attributes$class('heading-page')
						]),
					_List_fromArray(
						[
							elm$html$Html$text(
							A3(elm$core$String$replace, '#Collection ', '', collection.playlist.name))
						])),
					A2(
					elm$html$Html$div,
					_List_Nil,
					_List_fromArray(
						[
							A2(
							elm$html$Html$div,
							_List_fromArray(
								[
									elm$html$Html$Attributes$class('album-list-wrapper')
								]),
							A2(elm$core$List$map, albumItem, albums))
						]))
				]));
	});
var author$project$View$Home$view = function (model) {
	return A2(
		elm$html$Html$div,
		_List_Nil,
		_List_fromArray(
			[
				elm$html$Html$text('Welcome !')
			]));
};
var author$project$Root$ModalClear = {$: 'ModalClear'};
var author$project$Data$Drawer$DrawCollection = {$: 'DrawCollection'};
var author$project$Root$GetCollection = function (a) {
	return {$: 'GetCollection', a: a};
};
var author$project$Root$ModalAddTrack = function (a) {
	return {$: 'ModalAddTrack', a: a};
};
var author$project$View$Sidebar$viewCollections = F3(
	function (drawer, playlists, isClickable) {
		var collectionItem = function (p) {
			return A2(
				elm$html$Html$div,
				_List_fromArray(
					[
						isClickable ? elm$html$Html$Events$onClick(
						author$project$Root$GetCollection(p.id)) : elm$html$Html$Events$onClick(
						author$project$Root$ModalAddTrack(p.id)),
						elm$html$Html$Attributes$classList(
						_List_fromArray(
							[
								_Utils_Tuple2('playlist', true),
								_Utils_Tuple2(
								'active',
								_Utils_eq(drawer.drawerCollection.playlist.id, p.id) && _Utils_eq(drawer.drawerType, author$project$Data$Drawer$DrawCollection))
							]))
					]),
				_List_fromArray(
					[
						A2(
						elm$html$Html$i,
						_List_fromArray(
							[
								elm$html$Html$Attributes$class('icon-book')
							]),
						_List_Nil),
						elm$html$Html$text(
						A3(elm$core$String$replace, '#Collection ', '', p.name))
					]));
		};
		return elm$core$List$length(playlists) ? A2(
			elm$html$Html$div,
			_List_fromArray(
				[
					elm$html$Html$Attributes$class('collections')
				]),
			_List_fromArray(
				[
					A2(
					elm$html$Html$div,
					_List_fromArray(
						[
							elm$html$Html$Attributes$class('title')
						]),
					_List_fromArray(
						[
							elm$html$Html$text('Collections')
						])),
					A2(
					elm$html$Html$div,
					_List_fromArray(
						[
							elm$html$Html$Attributes$class('playlists-list')
						]),
					A2(
						elm$core$List$map,
						collectionItem,
						A2(
							elm$core$List$filter,
							function (f) {
								return A2(elm$core$String$contains, '#Collection', f.name);
							},
							playlists)))
				])) : elm$html$Html$text('');
	});
var elm$html$Html$button = _VirtualDom_node('button');
var author$project$View$Modal$view = function (model) {
	return model.modal.isOpen ? A2(
		elm$html$Html$div,
		_List_Nil,
		_List_fromArray(
			[
				A2(
				elm$html$Html$div,
				_List_fromArray(
					[
						elm$html$Html$Attributes$class('overlay')
					]),
				_List_Nil),
				A2(
				elm$html$Html$div,
				_List_fromArray(
					[
						elm$html$Html$Attributes$class('modal')
					]),
				_List_fromArray(
					[
						A2(
						elm$html$Html$div,
						_List_fromArray(
							[
								elm$html$Html$Attributes$class('head')
							]),
						_List_fromArray(
							[
								A2(
								elm$html$Html$div,
								_List_fromArray(
									[
										elm$html$Html$Attributes$class('title')
									]),
								_List_fromArray(
									[
										elm$html$Html$text('Add in a collection')
									]))
							])),
						A2(
						elm$html$Html$div,
						_List_fromArray(
							[
								elm$html$Html$Attributes$class('chest')
							]),
						_List_fromArray(
							[
								A3(author$project$View$Sidebar$viewCollections, model.drawer, model.playlists, false)
							])),
						A2(
						elm$html$Html$div,
						_List_fromArray(
							[
								elm$html$Html$Attributes$class('foot')
							]),
						_List_fromArray(
							[
								A2(
								elm$html$Html$button,
								_List_fromArray(
									[
										elm$html$Html$Attributes$class('button'),
										elm$html$Html$Events$onClick(author$project$Root$ModalClear)
									]),
								_List_fromArray(
									[
										elm$html$Html$text('Cancel')
									]))
							]))
					]))
			])) : elm$html$Html$text('');
};
var author$project$Root$PlayerNext = {$: 'PlayerNext'};
var author$project$Root$PlayerPause = {$: 'PlayerPause'};
var author$project$Root$PlayerPlay = {$: 'PlayerPlay'};
var author$project$Root$PlayerPrevious = {$: 'PlayerPrevious'};
var author$project$Root$PlayerSeek = function (a) {
	return {$: 'PlayerSeek', a: a};
};
var author$project$Root$PlayerShuffleOff = {$: 'PlayerShuffleOff'};
var author$project$Root$PlayerShuffleOn = {$: 'PlayerShuffleOn'};
var elm$core$List$intersperse = F2(
	function (sep, xs) {
		if (!xs.b) {
			return _List_Nil;
		} else {
			var hd = xs.a;
			var tl = xs.b;
			var step = F2(
				function (x, rest) {
					return A2(
						elm$core$List$cons,
						sep,
						A2(elm$core$List$cons, x, rest));
				});
			var spersed = A3(elm$core$List$foldr, step, _List_Nil, tl);
			return A2(elm$core$List$cons, hd, spersed);
		}
	});
var author$project$View$Artist$artistList = function (artists) {
	return A2(
		elm$html$Html$span,
		_List_fromArray(
			[
				elm$html$Html$Attributes$class('artist-name')
			]),
		A2(
			elm$core$List$intersperse,
			A2(
				elm$html$Html$span,
				_List_Nil,
				_List_fromArray(
					[
						elm$html$Html$text(', ')
					])),
			A2(
				elm$core$List$map,
				function (ar) {
					return A2(
						elm$html$Html$a,
						_List_fromArray(
							[
								elm$html$Html$Events$onClick(
								author$project$Root$GetArtist(ar.id))
							]),
						_List_fromArray(
							[
								elm$html$Html$text(ar.name)
							]));
				},
				artists)));
};
var elm$core$String$fromFloat = _String_fromNumber;
var elm$html$Html$input = _VirtualDom_node('input');
var elm$html$Html$Attributes$max = elm$html$Html$Attributes$stringProperty('max');
var elm$html$Html$Attributes$min = elm$html$Html$Attributes$stringProperty('min');
var elm$virtual_dom$VirtualDom$style = _VirtualDom_style;
var elm$html$Html$Attributes$style = elm$virtual_dom$VirtualDom$style;
var elm$html$Html$Attributes$type_ = elm$html$Html$Attributes$stringProperty('type');
var elm$html$Html$Attributes$value = elm$html$Html$Attributes$stringProperty('value');
var elm$html$Html$Events$alwaysStop = function (x) {
	return _Utils_Tuple2(x, true);
};
var elm$virtual_dom$VirtualDom$MayStopPropagation = function (a) {
	return {$: 'MayStopPropagation', a: a};
};
var elm$html$Html$Events$stopPropagationOn = F2(
	function (event, decoder) {
		return A2(
			elm$virtual_dom$VirtualDom$on,
			event,
			elm$virtual_dom$VirtualDom$MayStopPropagation(decoder));
	});
var elm$html$Html$Events$targetValue = A2(
	elm$json$Json$Decode$at,
	_List_fromArray(
		['target', 'value']),
	elm$json$Json$Decode$string);
var elm$html$Html$Events$onInput = function (tagger) {
	return A2(
		elm$html$Html$Events$stopPropagationOn,
		'input',
		A2(
			elm$json$Json$Decode$map,
			elm$html$Html$Events$alwaysStop,
			A2(elm$json$Json$Decode$map, tagger, elm$html$Html$Events$targetValue)));
};
var author$project$View$Player$view = function (player) {
	return A2(
		elm$html$Html$div,
		_List_fromArray(
			[
				elm$html$Html$Attributes$class('player')
			]),
		_List_fromArray(
			[
				A2(
				elm$html$Html$div,
				_List_fromArray(
					[
						elm$html$Html$Attributes$class('controls')
					]),
				_List_fromArray(
					[
						A2(
						elm$html$Html$div,
						_List_Nil,
						_List_fromArray(
							[
								player.is_playing ? A2(
								elm$html$Html$button,
								_List_fromArray(
									[
										elm$html$Html$Events$onClick(author$project$Root$PlayerPause),
										elm$html$Html$Attributes$class('play')
									]),
								_List_fromArray(
									[
										A2(
										elm$html$Html$i,
										_List_fromArray(
											[
												elm$html$Html$Attributes$class('icon-pause')
											]),
										_List_Nil)
									])) : A2(
								elm$html$Html$button,
								_List_fromArray(
									[
										elm$html$Html$Events$onClick(author$project$Root$PlayerPlay),
										elm$html$Html$Attributes$class('play')
									]),
								_List_fromArray(
									[
										A2(
										elm$html$Html$i,
										_List_fromArray(
											[
												elm$html$Html$Attributes$class('icon-play')
											]),
										_List_Nil)
									])),
								A2(
								elm$html$Html$button,
								_List_fromArray(
									[
										elm$html$Html$Events$onClick(author$project$Root$PlayerPrevious)
									]),
								_List_fromArray(
									[
										A2(
										elm$html$Html$i,
										_List_fromArray(
											[
												elm$html$Html$Attributes$class('icon-to-start')
											]),
										_List_Nil)
									])),
								A2(
								elm$html$Html$button,
								_List_fromArray(
									[
										elm$html$Html$Events$onClick(author$project$Root$PlayerNext)
									]),
								_List_fromArray(
									[
										A2(
										elm$html$Html$i,
										_List_fromArray(
											[
												elm$html$Html$Attributes$class('icon-to-end')
											]),
										_List_Nil)
									])),
								A2(
								elm$html$Html$button,
								_List_fromArray(
									[
										elm$html$Html$Attributes$classList(
										_List_fromArray(
											[
												_Utils_Tuple2('active', player.shuffle_state)
											])),
										player.shuffle_state ? elm$html$Html$Events$onClick(author$project$Root$PlayerShuffleOff) : elm$html$Html$Events$onClick(author$project$Root$PlayerShuffleOn)
									]),
								_List_fromArray(
									[
										A2(
										elm$html$Html$i,
										_List_fromArray(
											[
												elm$html$Html$Attributes$class('icon-shuffle')
											]),
										_List_Nil)
									])),
								A2(
								elm$html$Html$button,
								_List_Nil,
								_List_fromArray(
									[
										A2(
										elm$html$Html$i,
										_List_fromArray(
											[
												elm$html$Html$Attributes$classList(
												_List_fromArray(
													[
														_Utils_Tuple2('icon-loop', true),
														_Utils_Tuple2('active', player.repeat_state === 'on')
													]))
											]),
										_List_Nil)
									]))
							]))
					])),
				A2(
				elm$html$Html$div,
				_List_fromArray(
					[
						elm$html$Html$Attributes$class('current')
					]),
				_List_fromArray(
					[
						A2(
						elm$html$Html$div,
						_List_fromArray(
							[
								elm$html$Html$Events$onClick(
								author$project$Root$GetAlbum(player.item.album.id))
							]),
						_List_fromArray(
							[
								A2(author$project$Data$Image$imageView, author$project$Data$Image$Small, player.item.album.images)
							])),
						A2(
						elm$html$Html$div,
						_List_Nil,
						_List_fromArray(
							[
								A2(
								elm$html$Html$div,
								_List_Nil,
								_List_fromArray(
									[
										A2(
										elm$html$Html$span,
										_List_fromArray(
											[
												elm$html$Html$Attributes$class('track')
											]),
										_List_fromArray(
											[
												elm$html$Html$text(player.item.name)
											])),
										A2(
										elm$html$Html$span,
										_List_Nil,
										_List_fromArray(
											[
												elm$html$Html$text(' - ')
											])),
										author$project$View$Artist$artistList(player.item.artists)
									])),
								A2(
								elm$html$Html$div,
								_List_fromArray(
									[
										elm$html$Html$Attributes$class('range')
									]),
								_List_fromArray(
									[
										A2(
										elm$html$Html$span,
										_List_fromArray(
											[
												elm$html$Html$Attributes$class('time')
											]),
										_List_fromArray(
											[
												elm$html$Html$text(
												author$project$Utils$durationFormat(player.progress_ms))
											])),
										A2(
										elm$html$Html$input,
										_List_fromArray(
											[
												elm$html$Html$Attributes$type_('range'),
												elm$html$Html$Attributes$value(
												elm$core$String$fromInt(player.progress_ms)),
												elm$html$Html$Attributes$min('0'),
												elm$html$Html$Attributes$max(
												elm$core$String$fromInt(player.item.duration_ms)),
												elm$html$Html$Events$onInput(author$project$Root$PlayerSeek)
											]),
										_List_Nil),
										A2(
										elm$html$Html$span,
										_List_fromArray(
											[
												elm$html$Html$Attributes$class('time')
											]),
										_List_fromArray(
											[
												elm$html$Html$text(
												author$project$Utils$durationFormat(player.item.duration_ms))
											])),
										A2(
										elm$html$Html$div,
										_List_fromArray(
											[
												elm$html$Html$Attributes$class('progress')
											]),
										_List_fromArray(
											[
												A2(
												elm$html$Html$div,
												_List_fromArray(
													[
														A2(
														elm$html$Html$Attributes$style,
														'width',
														elm$core$String$fromFloat((player.progress_ms / player.item.duration_ms) * 100) + '%'),
														elm$html$Html$Attributes$class('progress-current')
													]),
												_List_Nil)
											]))
									]))
							]))
					])),
				A2(
				elm$html$Html$div,
				_List_fromArray(
					[
						elm$html$Html$Attributes$class('options')
					]),
				_List_fromArray(
					[
						A2(
						elm$html$Html$div,
						_List_Nil,
						_List_fromArray(
							[
								A2(
								elm$html$Html$button,
								_List_Nil,
								_List_fromArray(
									[
										A2(
										elm$html$Html$i,
										_List_fromArray(
											[
												elm$html$Html$Attributes$class('icon-sound')
											]),
										_List_Nil)
									]))
							])),
						A2(
						elm$html$Html$div,
						_List_Nil,
						_List_fromArray(
							[
								A2(
								elm$html$Html$input,
								_List_fromArray(
									[
										elm$html$Html$Attributes$type_('range'),
										elm$html$Html$Attributes$value(
										elm$core$String$fromInt(player.device.volume_percent)),
										elm$html$Html$Attributes$min('0'),
										elm$html$Html$Attributes$max('100')
									]),
								_List_Nil)
							]))
					]))
			]));
};
var elm$html$Html$Attributes$title = elm$html$Html$Attributes$stringProperty('title');
var author$project$View$Playlist$view = F2(
	function (player, playlist) {
		var trackSumDuration = elm$core$List$sum(
			A2(
				elm$core$List$map,
				function (d) {
					return d.track.duration_ms;
				},
				playlist.tracks.items));
		var listTracksUri = function (id) {
			return A2(
				elm$core$List$map,
				function (k) {
					return k.track.uri;
				},
				A2(
					elm_community$list_extra$List$Extra$dropWhile,
					function (e) {
						return !_Utils_eq(e.track.uri, id);
					},
					playlist.tracks.items));
		};
		var trackItem = function (t) {
			var releaseType = function (r) {
				switch (r) {
					case 'album':
						return A2(
							elm$html$Html$i,
							_List_fromArray(
								[
									elm$html$Html$Attributes$class('icon-discogs')
								]),
							_List_Nil);
					case 'single':
						return A2(
							elm$html$Html$i,
							_List_fromArray(
								[
									elm$html$Html$Attributes$class('icon-pizza')
								]),
							_List_Nil);
					default:
						return A2(
							elm$html$Html$i,
							_List_fromArray(
								[
									elm$html$Html$Attributes$class('icon-music')
								]),
							_List_Nil);
				}
			};
			var icon = _Utils_eq(t.track.uri, player.item.uri) ? A2(
				elm$html$Html$div,
				_List_Nil,
				_List_fromArray(
					[
						A2(
						elm$html$Html$i,
						_List_fromArray(
							[
								elm$html$Html$Attributes$class('icon-play')
							]),
						_List_Nil)
					])) : A2(
				elm$html$Html$div,
				_List_Nil,
				_List_fromArray(
					[
						A2(
						elm$html$Html$i,
						_List_fromArray(
							[
								elm$html$Html$Attributes$class('icon-music')
							]),
						_List_Nil)
					]));
			return A2(
				elm$html$Html$div,
				_List_fromArray(
					[
						elm$html$Html$Attributes$classList(
						_List_fromArray(
							[
								_Utils_Tuple2('track playlist-page', true),
								_Utils_Tuple2(
								'active',
								_Utils_eq(t.track.uri, player.item.uri))
							]))
					]),
				_List_fromArray(
					[
						icon,
						A2(
						elm$html$Html$div,
						_List_fromArray(
							[
								elm$html$Html$Events$onClick(
								author$project$Root$ChangePlayingTrack(
									listTracksUri(t.track.uri)))
							]),
						_List_fromArray(
							[
								elm$html$Html$text(t.track.name)
							])),
						A2(
						elm$html$Html$div,
						_List_Nil,
						_List_fromArray(
							[
								author$project$View$Artist$artistList(t.track.artists)
							])),
						A2(
						elm$html$Html$div,
						_List_fromArray(
							[
								elm$html$Html$Attributes$title(t.track.album.album_type)
							]),
						_List_fromArray(
							[
								releaseType(t.track.album.album_type),
								A2(
								elm$html$Html$a,
								_List_fromArray(
									[
										elm$html$Html$Events$onClick(
										author$project$Root$GetAlbum(t.track.album.id))
									]),
								_List_fromArray(
									[
										elm$html$Html$text(t.track.album.name)
									]))
							])),
						A2(
						elm$html$Html$div,
						_List_Nil,
						_List_fromArray(
							[
								elm$html$Html$text(
								author$project$Utils$durationFormat(t.track.duration_ms))
							]))
					]));
		};
		return A2(
			elm$html$Html$div,
			_List_fromArray(
				[
					elm$html$Html$Attributes$class('album-wrapper')
				]),
			_List_fromArray(
				[
					A2(
					elm$html$Html$div,
					_List_fromArray(
						[
							elm$html$Html$Attributes$class('album-page-head')
						]),
					_List_fromArray(
						[
							A2(
							elm$html$Html$div,
							_List_fromArray(
								[
									elm$html$Html$Attributes$class('heading-page')
								]),
							_List_fromArray(
								[
									elm$html$Html$text(playlist.playlist.name)
								]))
						])),
					A2(
					elm$html$Html$div,
					_List_fromArray(
						[
							elm$html$Html$Attributes$class('album-page')
						]),
					_List_fromArray(
						[
							A2(
							elm$html$Html$div,
							_List_Nil,
							_List_fromArray(
								[
									A2(author$project$Data$Image$imageView, author$project$Data$Image$Medium, playlist.playlist.images),
									A2(
									elm$html$Html$div,
									_List_Nil,
									_List_fromArray(
										[
											elm$html$Html$text(
											author$project$Utils$durationFormatMinutes(trackSumDuration))
										]))
								])),
							A2(
							elm$html$Html$div,
							_List_Nil,
							_List_fromArray(
								[
									A2(
									elm$html$Html$div,
									_List_Nil,
									A2(elm$core$List$map, trackItem, playlist.tracks.items))
								]))
						]))
				]));
	});
var author$project$Root$Query = function (a) {
	return {$: 'Query', a: a};
};
var elm$core$Basics$not = _Basics_not;
var elm$html$Html$h1 = _VirtualDom_node('h1');
var author$project$View$Releases$view = F2(
	function (player, model) {
		return A2(
			elm$html$Html$div,
			_List_Nil,
			_List_fromArray(
				[
					A2(
					elm$html$Html$h1,
					_List_Nil,
					_List_fromArray(
						[
							elm$html$Html$text('The PRP')
						])),
					A2(
					elm$html$Html$div,
					_List_Nil,
					A2(
						elm$core$List$map,
						function (e) {
							return A2(
								elm$html$Html$div,
								_List_Nil,
								_List_fromArray(
									[
										elm$html$Html$text(e.date),
										elm$html$Html$text(' - '),
										A2(
										elm$html$Html$a,
										_List_fromArray(
											[
												elm$html$Html$Events$onClick(
												author$project$Root$Query(e.artist + (' - ' + e.album)))
											]),
										_List_fromArray(
											[
												elm$html$Html$text(e.artist),
												elm$html$Html$text(' - '),
												elm$html$Html$text(e.album)
											]))
									]));
						},
						A2(
							elm$core$List$filter,
							function (f) {
								return !A2(elm$core$String$contains, 'Remastered', f.album);
							},
							A2(
								elm$core$List$filter,
								function (f) {
									return !A2(elm$core$String$contains, 'Anniversary', f.album);
								},
								A2(
									elm$core$List$filter,
									function (f) {
										return !A2(elm$core$String$contains, 'Reissue', f.album);
									},
									A2(
										elm$core$List$filter,
										function (f) {
											return !A2(elm$core$String$contains, 'Deluxe', f.album);
										},
										A2(
											elm$core$List$filter,
											function (f) {
												return !A2(elm$core$String$contains, 'Vinyl', f.album);
											},
											model.releases.thePrp)))))))
				]));
	});
var elm$html$Html$strong = _VirtualDom_node('strong');
var elm$html$Html$Attributes$placeholder = elm$html$Html$Attributes$stringProperty('placeholder');
var author$project$View$Search$view = function (searchMsg) {
	var trackItem = function (t) {
		return A2(
			elm$html$Html$div,
			_List_fromArray(
				[
					elm$html$Html$Attributes$class('track-item')
				]),
			_List_fromArray(
				[
					A2(
					elm$html$Html$div,
					_List_fromArray(
						[
							elm$html$Html$Events$onClick(
							author$project$Root$ChangePlayingTrack(
								_List_fromArray(
									[t.uri]))),
							elm$html$Html$Attributes$class('track-icon')
						]),
					_List_fromArray(
						[
							A2(
							elm$html$Html$i,
							_List_fromArray(
								[
									elm$html$Html$Attributes$class('icon-play')
								]),
							_List_Nil)
						])),
					A2(
					elm$html$Html$div,
					_List_Nil,
					_List_fromArray(
						[
							A2(
							elm$html$Html$strong,
							_List_Nil,
							_List_fromArray(
								[
									elm$html$Html$text(t.name)
								])),
							A2(
							elm$html$Html$div,
							_List_Nil,
							_List_fromArray(
								[
									author$project$View$Artist$artistList(t.artists)
								]))
						])),
					A2(
					elm$html$Html$div,
					_List_Nil,
					_List_fromArray(
						[
							elm$html$Html$text(
							author$project$Utils$durationFormat(t.duration_ms))
						]))
				]));
	};
	var artistItem = function (a) {
		return A2(
			elm$html$Html$div,
			_List_fromArray(
				[
					elm$html$Html$Attributes$class('artist-item'),
					elm$html$Html$Events$onClick(
					author$project$Root$GetArtist(a.id))
				]),
			_List_fromArray(
				[
					A2(
					elm$html$Html$div,
					_List_fromArray(
						[
							elm$html$Html$Attributes$class('img')
						]),
					_List_fromArray(
						[
							A2(author$project$Data$Image$imageView, author$project$Data$Image$Small, a.images)
						])),
					A2(
					elm$html$Html$span,
					_List_Nil,
					_List_fromArray(
						[
							elm$html$Html$text(a.name)
						]))
				]));
	};
	var albumItem = function (al) {
		return A2(
			elm$html$Html$div,
			_List_fromArray(
				[
					elm$html$Html$Attributes$class('album-item')
				]),
			_List_fromArray(
				[
					A2(
					elm$html$Html$div,
					_List_fromArray(
						[
							elm$html$Html$Attributes$class('search-cover-image'),
							elm$html$Html$Events$onClick(
							author$project$Root$GetAlbum(al.id))
						]),
					_List_fromArray(
						[
							A2(author$project$Data$Image$imageView, author$project$Data$Image$Small, al.images)
						])),
					A2(
					elm$html$Html$div,
					_List_Nil,
					_List_fromArray(
						[
							A2(
							elm$html$Html$strong,
							_List_fromArray(
								[
									elm$html$Html$Events$onClick(
									author$project$Root$GetAlbum(al.id))
								]),
							_List_fromArray(
								[
									elm$html$Html$text(al.name + ' ')
								])),
							elm$html$Html$text(
							'(' + (author$project$Utils$releaseDateFormat(al.release_date) + ')')),
							A2(
							elm$html$Html$div,
							_List_Nil,
							_List_fromArray(
								[
									author$project$View$Artist$artistList(al.artists)
								]))
						]))
				]));
	};
	return A2(
		elm$html$Html$div,
		_List_fromArray(
			[
				elm$html$Html$Attributes$class('search')
			]),
		_List_fromArray(
			[
				A2(
				elm$html$Html$div,
				_List_Nil,
				_List_fromArray(
					[
						A2(
						elm$html$Html$input,
						_List_fromArray(
							[
								elm$html$Html$Attributes$placeholder('Recherche'),
								elm$html$Html$Attributes$type_('text'),
								elm$html$Html$Events$onInput(author$project$Root$Query),
								elm$html$Html$Attributes$value(searchMsg.searchQuery)
							]),
						_List_Nil)
					])),
				(searchMsg.searchQuery !== '') ? A2(
				elm$html$Html$div,
				_List_fromArray(
					[
						elm$html$Html$Attributes$class('results')
					]),
				_List_fromArray(
					[
						A2(
						elm$html$Html$div,
						_List_Nil,
						_List_fromArray(
							[
								A2(
								elm$html$Html$div,
								_List_fromArray(
									[
										elm$html$Html$Attributes$class('title')
									]),
								_List_fromArray(
									[
										elm$html$Html$text('Artists')
									])),
								A2(
								elm$html$Html$div,
								_List_Nil,
								A2(elm$core$List$map, artistItem, searchMsg.findArtist))
							])),
						A2(
						elm$html$Html$div,
						_List_Nil,
						_List_fromArray(
							[
								A2(
								elm$html$Html$div,
								_List_fromArray(
									[
										elm$html$Html$Attributes$class('title')
									]),
								_List_fromArray(
									[
										elm$html$Html$text('Albums')
									])),
								A2(
								elm$html$Html$div,
								_List_Nil,
								A2(
									elm$core$List$map,
									albumItem,
									A2(
										elm$core$List$filter,
										function (a) {
											return a.album_type === 'album';
										},
										searchMsg.findAlbum)))
							])),
						A2(
						elm$html$Html$div,
						_List_Nil,
						_List_fromArray(
							[
								A2(
								elm$html$Html$div,
								_List_fromArray(
									[
										elm$html$Html$Attributes$class('title')
									]),
								_List_fromArray(
									[
										elm$html$Html$text('Tracks')
									])),
								A2(
								elm$html$Html$div,
								_List_Nil,
								A2(elm$core$List$map, trackItem, searchMsg.findTrack))
							]))
					])) : elm$html$Html$text('')
			]));
};
var author$project$Data$Drawer$Listen = {$: 'Listen'};
var author$project$Data$Drawer$Releases = {$: 'Releases'};
var author$project$Root$GoHome = {$: 'GoHome'};
var author$project$Root$GoListen = {$: 'GoListen'};
var author$project$Root$GoReleases = {$: 'GoReleases'};
var author$project$View$Sidebar$topMenuItem = F5(
	function (msg, drawer, page, icon, label) {
		return A2(
			elm$html$Html$div,
			_List_fromArray(
				[
					elm$html$Html$Events$onClick(msg),
					elm$html$Html$Attributes$classList(
					_List_fromArray(
						[
							_Utils_Tuple2(
							'active',
							_Utils_eq(drawer.drawerType, page))
						]))
				]),
			_List_fromArray(
				[
					A2(
					elm$html$Html$i,
					_List_fromArray(
						[
							elm$html$Html$Attributes$class(icon)
						]),
					_List_Nil),
					elm$html$Html$text(label)
				]));
	});
var author$project$Data$Drawer$DrawPlaylist = {$: 'DrawPlaylist'};
var author$project$Root$GetPlaylist = function (a) {
	return {$: 'GetPlaylist', a: a};
};
var author$project$Root$NoOp = {$: 'NoOp'};
var elm$core$List$isEmpty = function (xs) {
	if (!xs.b) {
		return true;
	} else {
		return false;
	}
};
var elm$core$String$toLower = _String_toLower;
var elm$html$Html$label = _VirtualDom_node('label');
var elm$html$Html$li = _VirtualDom_node('li');
var elm$html$Html$ul = _VirtualDom_node('ul');
var elm$html$Html$Attributes$for = elm$html$Html$Attributes$stringProperty('htmlFor');
var elm$html$Html$Attributes$id = elm$html$Html$Attributes$stringProperty('id');
var elm_community$list_extra$List$Extra$oneGroupWhileHelper = F3(
	function (condition, first, list) {
		if (!list.b) {
			return _Utils_Tuple2(_List_Nil, _List_Nil);
		} else {
			var second = list.a;
			var rest = list.b;
			if (A2(condition, first, second)) {
				var _n1 = A3(elm_community$list_extra$List$Extra$oneGroupWhileHelper, condition, second, rest);
				var thisGroup = _n1.a;
				var ungroupedRest = _n1.b;
				return _Utils_Tuple2(
					A2(elm$core$List$cons, second, thisGroup),
					ungroupedRest);
			} else {
				return _Utils_Tuple2(_List_Nil, list);
			}
		}
	});
var elm_community$list_extra$List$Extra$accumulateGroupWhile = F3(
	function (condition, list, accum) {
		accumulateGroupWhile:
		while (true) {
			if (!list.b) {
				return elm$core$List$reverse(accum);
			} else {
				var first = list.a;
				var rest = list.b;
				var _n1 = A3(elm_community$list_extra$List$Extra$oneGroupWhileHelper, condition, first, rest);
				var thisGroup = _n1.a;
				var ungroupedRest = _n1.b;
				var $temp$condition = condition,
					$temp$list = ungroupedRest,
					$temp$accum = A2(
					elm$core$List$cons,
					_Utils_Tuple2(first, thisGroup),
					accum);
				condition = $temp$condition;
				list = $temp$list;
				accum = $temp$accum;
				continue accumulateGroupWhile;
			}
		}
	});
var elm_community$list_extra$List$Extra$groupWhile = F2(
	function (condition, list) {
		return A3(elm_community$list_extra$List$Extra$accumulateGroupWhile, condition, list, _List_Nil);
	});
var author$project$View$Sidebar$viewFolders = F3(
	function (drawer, playlists, isClickable) {
		var formatName = function (n) {
			return A2(
				elm$core$String$left,
				3,
				elm$core$String$toLower(n));
		};
		var test = A2(
			elm$core$List$filter,
			function (_n1) {
				var k = _n1.a;
				var l = _n1.b;
				return !elm$core$List$isEmpty(l);
			},
			A2(
				elm_community$list_extra$List$Extra$groupWhile,
				F2(
					function (a, b) {
						return _Utils_eq(
							formatName(a.name),
							formatName(b.name));
					}),
				A2(
					elm$core$List$filter,
					function (f) {
						return !A2(elm$core$String$contains, '#C', f.name);
					},
					playlists)));
		return elm$core$List$length(test) ? A2(
			elm$html$Html$div,
			_List_fromArray(
				[
					elm$html$Html$Attributes$class('folders')
				]),
			_List_fromArray(
				[
					A2(
					elm$html$Html$div,
					_List_fromArray(
						[
							elm$html$Html$Attributes$class('title')
						]),
					_List_fromArray(
						[
							elm$html$Html$text('Folders')
						])),
					A2(
					elm$html$Html$div,
					_List_fromArray(
						[
							elm$html$Html$Attributes$class('playlists-list')
						]),
					A2(
						elm$core$List$map,
						function (_n0) {
							var title = _n0.a;
							var f = _n0.b;
							return A2(
								elm$html$Html$div,
								_List_Nil,
								_List_fromArray(
									[
										A2(
										elm$html$Html$ul,
										_List_Nil,
										_List_fromArray(
											[
												A2(
												elm$html$Html$li,
												_List_fromArray(
													[
														elm$html$Html$Attributes$class('folder-title')
													]),
												_List_fromArray(
													[
														A2(
														elm$html$Html$i,
														_List_fromArray(
															[
																elm$html$Html$Attributes$class('icon-folder')
															]),
														_List_Nil),
														A2(
														elm$html$Html$label,
														_List_fromArray(
															[
																elm$html$Html$Attributes$for(title.name)
															]),
														_List_fromArray(
															[
																elm$html$Html$text(title.name)
															]))
													])),
												A2(
												elm$html$Html$input,
												_List_fromArray(
													[
														elm$html$Html$Attributes$type_('checkbox'),
														elm$html$Html$Attributes$id(title.name)
													]),
												_List_Nil),
												A2(
												elm$html$Html$ul,
												_List_Nil,
												A2(
													elm$core$List$map,
													function (fe) {
														return A2(
															elm$html$Html$li,
															_List_fromArray(
																[
																	isClickable ? elm$html$Html$Events$onClick(
																	author$project$Root$GetPlaylist(fe.id)) : elm$html$Html$Events$onClick(author$project$Root$NoOp),
																	elm$html$Html$Attributes$classList(
																	_List_fromArray(
																		[
																			_Utils_Tuple2('playlist', true),
																			_Utils_Tuple2(
																			'active',
																			_Utils_eq(drawer.drawerPlaylist.playlist.id, fe.id) && _Utils_eq(drawer.drawerType, author$project$Data$Drawer$DrawPlaylist))
																		]))
																]),
															_List_fromArray(
																[
																	A2(
																	elm$html$Html$i,
																	_List_fromArray(
																		[
																			elm$html$Html$Attributes$class('icon-list')
																		]),
																	_List_Nil),
																	elm$html$Html$text(fe.name)
																]));
													},
													f))
											]))
									]));
						},
						test))
				])) : elm$html$Html$text('');
	});
var author$project$View$Sidebar$viewPlaylists = F3(
	function (drawer, playlists, isClickable) {
		var formatName = function (n) {
			return A2(
				elm$core$String$left,
				3,
				elm$core$String$toLower(n));
		};
		var test = A2(
			elm$core$List$filter,
			function (_n1) {
				var k = _n1.a;
				var l = _n1.b;
				return elm$core$List$isEmpty(l);
			},
			A2(
				elm_community$list_extra$List$Extra$groupWhile,
				F2(
					function (a, b) {
						return _Utils_eq(
							formatName(a.name),
							formatName(b.name));
					}),
				A2(
					elm$core$List$filter,
					function (f) {
						return !A2(elm$core$String$contains, '#C', f.name);
					},
					playlists)));
		return A2(
			elm$html$Html$div,
			_List_fromArray(
				[
					elm$html$Html$Attributes$class('playlists-list')
				]),
			A2(
				elm$core$List$map,
				function (_n0) {
					var title = _n0.a;
					return A2(
						elm$html$Html$div,
						_List_fromArray(
							[
								isClickable ? elm$html$Html$Events$onClick(
								author$project$Root$GetPlaylist(title.id)) : elm$html$Html$Events$onClick(author$project$Root$NoOp),
								elm$html$Html$Attributes$classList(
								_List_fromArray(
									[
										_Utils_Tuple2('playlist', true),
										_Utils_Tuple2(
										'active',
										_Utils_eq(drawer.drawerPlaylist.playlist.id, title.id) && _Utils_eq(drawer.drawerType, author$project$Data$Drawer$DrawPlaylist))
									]))
							]),
						_List_fromArray(
							[
								A2(
								elm$html$Html$i,
								_List_fromArray(
									[
										elm$html$Html$Attributes$class('icon-list')
									]),
								_List_Nil),
								elm$html$Html$text(title.name)
							]));
				},
				test));
	});
var author$project$View$Sidebar$view = function (model) {
	return A2(
		elm$html$Html$div,
		_List_fromArray(
			[
				elm$html$Html$Attributes$class('sidebar')
			]),
		_List_fromArray(
			[
				A2(
				elm$html$Html$div,
				_List_fromArray(
					[
						elm$html$Html$Attributes$class('logo')
					]),
				_List_fromArray(
					[
						A2(
						elm$html$Html$img,
						_List_fromArray(
							[
								elm$html$Html$Attributes$src('./img/logo.png')
							]),
						_List_Nil),
						elm$html$Html$text('Beardify'),
						A2(
						elm$html$Html$span,
						_List_fromArray(
							[
								A2(elm$html$Html$Attributes$style, 'font-size', '0.9rem'),
								A2(elm$html$Html$Attributes$style, 'opacity', '0.3')
							]),
						_List_fromArray(
							[
								elm$html$Html$text(' alpha')
							]))
					])),
				A2(
				elm$html$Html$div,
				_List_fromArray(
					[
						elm$html$Html$Attributes$class('top-menu')
					]),
				_List_fromArray(
					[
						A5(author$project$View$Sidebar$topMenuItem, author$project$Root$GoHome, model.drawer, author$project$Data$Drawer$Home, 'icon-home', 'Home'),
						A5(author$project$View$Sidebar$topMenuItem, author$project$Root$GoReleases, model.drawer, author$project$Data$Drawer$Releases, 'icon-bell', 'Sorties'),
						A5(author$project$View$Sidebar$topMenuItem, author$project$Root$GoListen, model.drawer, author$project$Data$Drawer$Listen, 'icon-bookmark', 'A écouter')
					])),
				A2(
				elm$html$Html$div,
				_List_fromArray(
					[
						elm$html$Html$Attributes$class('relative')
					]),
				_List_fromArray(
					[
						A2(
						elm$html$Html$div,
						_List_fromArray(
							[
								elm$html$Html$Attributes$class('fit')
							]),
						_List_fromArray(
							[
								A3(author$project$View$Sidebar$viewCollections, model.drawer, model.playlists, true),
								A3(author$project$View$Sidebar$viewFolders, model.drawer, model.playlists, true),
								A2(
								elm$html$Html$div,
								_List_fromArray(
									[
										elm$html$Html$Attributes$class('playlists')
									]),
								_List_fromArray(
									[
										A2(
										elm$html$Html$div,
										_List_fromArray(
											[
												elm$html$Html$Attributes$class('title')
											]),
										_List_fromArray(
											[
												elm$html$Html$text('Playlists')
											])),
										A3(author$project$View$Sidebar$viewPlaylists, model.drawer, model.playlists, true)
									]))
							]))
					]))
			]));
};
var author$project$Main$view = function (model) {
	return {
		body: _List_fromArray(
			[
				A2(
				elm$html$Html$div,
				_List_fromArray(
					[
						elm$html$Html$Attributes$class('app')
					]),
				_List_fromArray(
					[
						author$project$View$Sidebar$view(model),
						A2(
						elm$html$Html$div,
						_List_fromArray(
							[
								elm$html$Html$Attributes$class('content')
							]),
						_List_fromArray(
							[
								A2(
								elm$html$Html$div,
								_List_fromArray(
									[
										elm$html$Html$Attributes$class('topbar')
									]),
								_List_fromArray(
									[
										author$project$View$Search$view(model.searchModel)
									])),
								A2(
								elm$html$Html$div,
								_List_fromArray(
									[
										elm$html$Html$Attributes$class('drawer')
									]),
								_List_fromArray(
									[
										function () {
										var _n0 = model.drawer.drawerType;
										switch (_n0.$) {
											case 'DrawArtist':
												return A2(author$project$View$Artist$view, model.player, model.drawer.drawerArtist);
											case 'DrawAlbum':
												return A2(author$project$View$Album$view, model.player, model.drawer.drawerAlbum);
											case 'DrawPlaylist':
												return A2(author$project$View$Playlist$view, model.player, model.drawer.drawerPlaylist);
											case 'DrawCollection':
												return A2(author$project$View$Collection$view, model.player, model.drawer.drawerCollection);
											case 'Home':
												return author$project$View$Home$view(model);
											case 'Releases':
												return A2(author$project$View$Releases$view, model.player, model);
											default:
												return elm$html$Html$text('');
										}
									}()
									])),
								author$project$View$Player$view(model.player)
							])),
						author$project$View$Modal$view(model)
					]))
			]),
		title: 'Beardify'
	};
};
var author$project$Root$UrlChanged = function (a) {
	return {$: 'UrlChanged', a: a};
};
var author$project$Root$UrlRequested = function (a) {
	return {$: 'UrlRequested', a: a};
};
var author$project$Data$Album$Album = F8(
	function (album_type, artists, id, images, name, release_date, type_, uri) {
		return {album_type: album_type, artists: artists, id: id, images: images, name: name, release_date: release_date, type_: type_, uri: uri};
	});
var author$project$Data$Artist$Artists = F2(
	function (id, name) {
		return {id: id, name: name};
	});
var author$project$Data$Artist$decodeArtists = A3(
	elm$json$Json$Decode$map2,
	author$project$Data$Artist$Artists,
	A2(elm$json$Json$Decode$field, 'id', elm$json$Json$Decode$string),
	A2(elm$json$Json$Decode$field, 'name', elm$json$Json$Decode$string));
var elm$json$Json$Decode$map8 = _Json_map8;
var author$project$Data$Album$decodeAlbum = A9(
	elm$json$Json$Decode$map8,
	author$project$Data$Album$Album,
	A2(elm$json$Json$Decode$field, 'album_type', elm$json$Json$Decode$string),
	A2(
		elm$json$Json$Decode$at,
		_List_fromArray(
			['artists']),
		elm$json$Json$Decode$list(author$project$Data$Artist$decodeArtists)),
	A2(elm$json$Json$Decode$field, 'id', elm$json$Json$Decode$string),
	A2(
		elm$json$Json$Decode$at,
		_List_fromArray(
			['images']),
		elm$json$Json$Decode$list(author$project$Data$Image$decodeImage)),
	A2(elm$json$Json$Decode$field, 'name', elm$json$Json$Decode$string),
	A2(elm$json$Json$Decode$field, 'release_date', elm$json$Json$Decode$string),
	A2(elm$json$Json$Decode$field, 'type', elm$json$Json$Decode$string),
	A2(elm$json$Json$Decode$field, 'uri', elm$json$Json$Decode$string));
var author$project$Data$Album$ListAlbum = function (items) {
	return {items: items};
};
var author$project$Data$Album$decodeArtistAlbums = A2(
	elm$json$Json$Decode$map,
	author$project$Data$Album$ListAlbum,
	A2(
		elm$json$Json$Decode$at,
		_List_fromArray(
			['items']),
		elm$json$Json$Decode$list(author$project$Data$Album$decodeAlbum)));
var author$project$Data$Album$decodeListAlbum = A2(
	elm$json$Json$Decode$map,
	author$project$Data$Album$ListAlbum,
	A2(
		elm$json$Json$Decode$at,
		_List_fromArray(
			['albums', 'items']),
		elm$json$Json$Decode$list(author$project$Data$Album$decodeAlbum)));
var elm$json$Json$Encode$object = function (pairs) {
	return _Json_wrap(
		A3(
			elm$core$List$foldl,
			F2(
				function (_n0, obj) {
					var k = _n0.a;
					var v = _n0.b;
					return A3(_Json_addField, k, v, obj);
				}),
			_Json_emptyObject(_Utils_Tuple0),
			pairs));
};
var author$project$Data$Album$encodeAlbum = function (uri) {
	return elm$json$Json$Encode$object(
		_List_fromArray(
			[
				_Utils_Tuple2(
				'context_uri',
				elm$json$Json$Encode$string(uri))
			]));
};
var author$project$Data$Artist$Artist = F5(
	function (id, images, name, popularity, type_) {
		return {id: id, images: images, name: name, popularity: popularity, type_: type_};
	});
var elm$json$Json$Decode$map5 = _Json_map5;
var author$project$Data$Artist$decodeArtist = A6(
	elm$json$Json$Decode$map5,
	author$project$Data$Artist$Artist,
	A2(elm$json$Json$Decode$field, 'id', elm$json$Json$Decode$string),
	A2(
		elm$json$Json$Decode$at,
		_List_fromArray(
			['images']),
		elm$json$Json$Decode$list(author$project$Data$Image$decodeImage)),
	A2(elm$json$Json$Decode$field, 'name', elm$json$Json$Decode$string),
	A2(elm$json$Json$Decode$field, 'popularity', elm$json$Json$Decode$int),
	A2(elm$json$Json$Decode$field, 'type', elm$json$Json$Decode$string));
var author$project$Data$Artist$ListArtist = function (items) {
	return {items: items};
};
var author$project$Data$Artist$decodeListArtist = A2(
	elm$json$Json$Decode$map,
	author$project$Data$Artist$ListArtist,
	A2(
		elm$json$Json$Decode$at,
		_List_fromArray(
			['artists', 'items']),
		elm$json$Json$Decode$list(author$project$Data$Artist$decodeArtist)));
var author$project$Data$Artist$RelatedArtists = function (artists) {
	return {artists: artists};
};
var author$project$Data$Artist$decodeRelatedArtists = A2(
	elm$json$Json$Decode$map,
	author$project$Data$Artist$RelatedArtists,
	A2(
		elm$json$Json$Decode$at,
		_List_fromArray(
			['artists']),
		elm$json$Json$Decode$list(author$project$Data$Artist$decodeArtist)));
var author$project$Data$Drawer$DrawAlbum = {$: 'DrawAlbum'};
var author$project$Data$Drawer$DrawArtist = {$: 'DrawArtist'};
var author$project$Data$Device$Device = F3(
	function (id, name, volume_percent) {
		return {id: id, name: name, volume_percent: volume_percent};
	});
var elm$json$Json$Decode$map3 = _Json_map3;
var author$project$Data$Device$decodeDevice = A4(
	elm$json$Json$Decode$map3,
	author$project$Data$Device$Device,
	A2(elm$json$Json$Decode$field, 'id', elm$json$Json$Decode$string),
	A2(elm$json$Json$Decode$field, 'name', elm$json$Json$Decode$string),
	A2(elm$json$Json$Decode$field, 'volume_percent', elm$json$Json$Decode$int));
var author$project$Data$Player$Model = F6(
	function (device, is_playing, progress_ms, item, repeat_state, shuffle_state) {
		return {device: device, is_playing: is_playing, item: item, progress_ms: progress_ms, repeat_state: repeat_state, shuffle_state: shuffle_state};
	});
var author$project$Data$Track$Track = F5(
	function (name, duration_ms, artists, album, uri) {
		return {album: album, artists: artists, duration_ms: duration_ms, name: name, uri: uri};
	});
var author$project$Data$Track$decodeTrack = A6(
	elm$json$Json$Decode$map5,
	author$project$Data$Track$Track,
	A2(elm$json$Json$Decode$field, 'name', elm$json$Json$Decode$string),
	A2(elm$json$Json$Decode$field, 'duration_ms', elm$json$Json$Decode$int),
	A2(
		elm$json$Json$Decode$at,
		_List_fromArray(
			['artists']),
		elm$json$Json$Decode$list(author$project$Data$Artist$decodeArtists)),
	A2(
		elm$json$Json$Decode$at,
		_List_fromArray(
			['album']),
		author$project$Data$Album$decodeAlbum),
	A2(elm$json$Json$Decode$field, 'uri', elm$json$Json$Decode$string));
var elm$json$Json$Decode$map6 = _Json_map6;
var author$project$Data$Player$decodePlayer = A7(
	elm$json$Json$Decode$map6,
	author$project$Data$Player$Model,
	A2(
		elm$json$Json$Decode$at,
		_List_fromArray(
			['device']),
		author$project$Data$Device$decodeDevice),
	A2(elm$json$Json$Decode$field, 'is_playing', elm$json$Json$Decode$bool),
	A2(elm$json$Json$Decode$field, 'progress_ms', elm$json$Json$Decode$int),
	A2(
		elm$json$Json$Decode$at,
		_List_fromArray(
			['item']),
		author$project$Data$Track$decodeTrack),
	A2(elm$json$Json$Decode$field, 'repeat_state', elm$json$Json$Decode$string),
	A2(elm$json$Json$Decode$field, 'shuffle_state', elm$json$Json$Decode$bool));
var author$project$Data$Playlist$Playlist = F5(
	function (id, images, name, tracks, uri) {
		return {id: id, images: images, name: name, tracks: tracks, uri: uri};
	});
var author$project$Data$Playlist$PlaylistPaging = function (items) {
	return {items: items};
};
var author$project$Data$Playlist$PlaylistTrack = function (track) {
	return {track: track};
};
var author$project$Data$Playlist$decodePlaylistTrack = A2(
	elm$json$Json$Decode$map,
	author$project$Data$Playlist$PlaylistTrack,
	A2(elm$json$Json$Decode$field, 'track', author$project$Data$Track$decodeTrack));
var author$project$Data$Playlist$decodePlaylistPaging = A2(
	elm$json$Json$Decode$map,
	author$project$Data$Playlist$PlaylistPaging,
	A2(
		elm$json$Json$Decode$at,
		_List_fromArray(
			['items']),
		elm$json$Json$Decode$list(author$project$Data$Playlist$decodePlaylistTrack)));
var author$project$Data$Playlist$decodePlaylist = A6(
	elm$json$Json$Decode$map5,
	author$project$Data$Playlist$Playlist,
	A2(elm$json$Json$Decode$field, 'id', elm$json$Json$Decode$string),
	A2(
		elm$json$Json$Decode$at,
		_List_fromArray(
			['images']),
		elm$json$Json$Decode$list(author$project$Data$Image$decodeImage)),
	A2(elm$json$Json$Decode$field, 'name', elm$json$Json$Decode$string),
	A2(elm$json$Json$Decode$field, 'tracks', author$project$Data$Playlist$decodePlaylistPaging),
	A2(elm$json$Json$Decode$field, 'uri', elm$json$Json$Decode$string));
var author$project$Data$Releases$ThePrpReleases = F3(
	function (artist, album, date) {
		return {album: album, artist: artist, date: date};
	});
var author$project$Data$Releases$decodeThePrpReleases = A4(
	elm$json$Json$Decode$map3,
	author$project$Data$Releases$ThePrpReleases,
	A2(elm$json$Json$Decode$field, 'artist', elm$json$Json$Decode$string),
	A2(elm$json$Json$Decode$field, 'album', elm$json$Json$Decode$string),
	A2(elm$json$Json$Decode$field, 'date', elm$json$Json$Decode$string));
var author$project$Data$Track$AlbumTracks = function (items) {
	return {items: items};
};
var author$project$Data$Track$TrackSimplified = F5(
	function (name, duration_ms, artists, track_number, uri) {
		return {artists: artists, duration_ms: duration_ms, name: name, track_number: track_number, uri: uri};
	});
var author$project$Data$Track$decodeTrackSimplified = A6(
	elm$json$Json$Decode$map5,
	author$project$Data$Track$TrackSimplified,
	A2(elm$json$Json$Decode$field, 'name', elm$json$Json$Decode$string),
	A2(elm$json$Json$Decode$field, 'duration_ms', elm$json$Json$Decode$int),
	A2(
		elm$json$Json$Decode$at,
		_List_fromArray(
			['artists']),
		elm$json$Json$Decode$list(author$project$Data$Artist$decodeArtists)),
	A2(elm$json$Json$Decode$field, 'track_number', elm$json$Json$Decode$int),
	A2(elm$json$Json$Decode$field, 'uri', elm$json$Json$Decode$string));
var author$project$Data$Track$decodeAlbumTracks = A2(
	elm$json$Json$Decode$map,
	author$project$Data$Track$AlbumTracks,
	A2(
		elm$json$Json$Decode$at,
		_List_fromArray(
			['items']),
		elm$json$Json$Decode$list(author$project$Data$Track$decodeTrackSimplified)));
var author$project$Data$Track$ArtistTopTracks = function (tracks) {
	return {tracks: tracks};
};
var author$project$Data$Track$decodeArtistTopTracks = A2(
	elm$json$Json$Decode$map,
	author$project$Data$Track$ArtistTopTracks,
	A2(
		elm$json$Json$Decode$at,
		_List_fromArray(
			['tracks']),
		elm$json$Json$Decode$list(author$project$Data$Track$decodeTrack)));
var author$project$Data$Track$ListTrack = function (items) {
	return {items: items};
};
var author$project$Data$Track$decodeListTrack = A2(
	elm$json$Json$Decode$map,
	author$project$Data$Track$ListTrack,
	A2(
		elm$json$Json$Decode$at,
		_List_fromArray(
			['tracks', 'items']),
		elm$json$Json$Decode$list(author$project$Data$Track$decodeTrack)));
var author$project$Data$Track$encodeDelCollectionAlbumInner = function (uri) {
	return elm$json$Json$Encode$object(
		_List_fromArray(
			[
				_Utils_Tuple2(
				'uri',
				elm$json$Json$Encode$string(uri))
			]));
};
var elm$json$Json$Encode$list = F2(
	function (func, entries) {
		return _Json_wrap(
			A3(
				elm$core$List$foldl,
				_Json_addEntry(func),
				_Json_emptyArray(_Utils_Tuple0),
				entries));
	});
var author$project$Data$Track$encodeDelCollectionAlbum = function (uri) {
	return elm$json$Json$Encode$object(
		_List_fromArray(
			[
				_Utils_Tuple2(
				'tracks',
				A2(elm$json$Json$Encode$list, author$project$Data$Track$encodeDelCollectionAlbumInner, uri))
			]));
};
var author$project$Data$Track$encodeTrack = function (uris) {
	return elm$json$Json$Encode$object(
		_List_fromArray(
			[
				_Utils_Tuple2(
				'uris',
				A2(elm$json$Json$Encode$list, elm$json$Json$Encode$string, uris))
			]));
};
var author$project$Data$Youtube$Youtube = function (items) {
	return {items: items};
};
var author$project$Data$Youtube$Video = F2(
	function (id, snippet) {
		return {id: id, snippet: snippet};
	});
var author$project$Data$Youtube$Snippet = F3(
	function (channelId, channelTitle, title) {
		return {channelId: channelId, channelTitle: channelTitle, title: title};
	});
var author$project$Data$Youtube$decodeSnippet = A4(
	elm$json$Json$Decode$map3,
	author$project$Data$Youtube$Snippet,
	A2(elm$json$Json$Decode$field, 'channelId', elm$json$Json$Decode$string),
	A2(elm$json$Json$Decode$field, 'channelTitle', elm$json$Json$Decode$string),
	A2(elm$json$Json$Decode$field, 'title', elm$json$Json$Decode$string));
var author$project$Data$Youtube$VideoId = function (videoId) {
	return {videoId: videoId};
};
var author$project$Data$Youtube$decodeVideoId = A2(
	elm$json$Json$Decode$map,
	author$project$Data$Youtube$VideoId,
	A2(elm$json$Json$Decode$field, 'videoId', elm$json$Json$Decode$string));
var author$project$Data$Youtube$decodeVideo = A3(
	elm$json$Json$Decode$map2,
	author$project$Data$Youtube$Video,
	A2(
		elm$json$Json$Decode$at,
		_List_fromArray(
			['id']),
		author$project$Data$Youtube$decodeVideoId),
	A2(
		elm$json$Json$Decode$at,
		_List_fromArray(
			['snippet']),
		author$project$Data$Youtube$decodeSnippet));
var author$project$Data$Youtube$decodeYoutube = A2(
	elm$json$Json$Decode$map,
	author$project$Data$Youtube$Youtube,
	A2(
		elm$json$Json$Decode$at,
		_List_fromArray(
			['items']),
		elm$json$Json$Decode$list(author$project$Data$Youtube$decodeVideo)));
var elm$http$Http$get = F2(
	function (url, decoder) {
		return elm$http$Http$request(
			{
				body: elm$http$Http$emptyBody,
				expect: elm$http$Http$expectJson(decoder),
				headers: _List_Nil,
				method: 'GET',
				timeout: elm$core$Maybe$Nothing,
				url: url,
				withCredentials: false
			});
	});
var author$project$Data$Youtube$getVideos = function (query) {
	return A2(elm$http$Http$get, 'https://www.googleapis.com/youtube/v3/search?q=' + (query + '&type=video&maxResults=4&part=snippet&key=AIzaSyDjlO4Gb0jCsxrot8KcNslXNSN_cIN5yqs'), author$project$Data$Youtube$decodeYoutube);
};
var elm$json$Json$Encode$null = _Json_encodeNull;
var author$project$Ports$getReleasesThePRP = _Platform_outgoingPort(
	'getReleasesThePRP',
	function ($) {
		return elm$json$Json$Encode$null;
	});
var author$project$Ports$refreshToken = _Platform_outgoingPort(
	'refreshToken',
	function ($) {
		return elm$json$Json$Encode$null;
	});
var elm$http$Http$Internal$StringBody = F2(
	function (a, b) {
		return {$: 'StringBody', a: a, b: b};
	});
var elm$http$Http$jsonBody = function (value) {
	return A2(
		elm$http$Http$Internal$StringBody,
		'application/json',
		A2(elm$json$Json$Encode$encode, 0, value));
};
var author$project$Request$delete = F5(
	function (urlBefore, e, urlAfter, encoder, token) {
		return elm$http$Http$request(
			{
				body: elm$http$Http$jsonBody(encoder),
				expect: elm$http$Http$expectStringResponse(
					function (_n0) {
						return elm$core$Result$Ok(_Utils_Tuple0);
					}),
				headers: _List_fromArray(
					[
						A2(elm$http$Http$header, 'Authorization', 'Bearer ' + token)
					]),
				method: 'DELETE',
				timeout: elm$core$Maybe$Nothing,
				url: _Utils_ap(
					author$project$Request$apiUrl,
					_Utils_ap(
						urlBefore,
						_Utils_ap(e, urlAfter))),
				withCredentials: false
			});
	});
var author$project$Request$play = F3(
	function (e, encoder, token) {
		return elm$http$Http$request(
			{
				body: elm$http$Http$jsonBody(encoder),
				expect: elm$http$Http$expectStringResponse(
					function (_n0) {
						return elm$core$Result$Ok(_Utils_Tuple0);
					}),
				headers: _List_fromArray(
					[
						A2(elm$http$Http$header, 'Authorization', 'Bearer ' + token)
					]),
				method: 'PUT',
				timeout: elm$core$Maybe$Nothing,
				url: author$project$Request$apiUrl + 'me/player/play',
				withCredentials: false
			});
	});
var author$project$Request$post = F4(
	function (urlBefore, e, urlAfter, token) {
		return elm$http$Http$request(
			{
				body: elm$http$Http$emptyBody,
				expect: elm$http$Http$expectStringResponse(
					function (_n0) {
						return elm$core$Result$Ok(_Utils_Tuple0);
					}),
				headers: _List_fromArray(
					[
						A2(elm$http$Http$header, 'Authorization', 'Bearer ' + token)
					]),
				method: 'POST',
				timeout: elm$core$Maybe$Nothing,
				url: _Utils_ap(
					author$project$Request$apiUrl,
					_Utils_ap(
						urlBefore,
						_Utils_ap(e, urlAfter))),
				withCredentials: false
			});
	});
var author$project$Request$put = F4(
	function (urlBefore, e, urlAfter, token) {
		return elm$http$Http$request(
			{
				body: elm$http$Http$emptyBody,
				expect: elm$http$Http$expectStringResponse(
					function (_n0) {
						return elm$core$Result$Ok(_Utils_Tuple0);
					}),
				headers: _List_fromArray(
					[
						A2(elm$http$Http$header, 'Authorization', 'Bearer ' + token)
					]),
				method: 'PUT',
				timeout: elm$core$Maybe$Nothing,
				url: author$project$Request$apiUrl + ('me/player/' + (urlBefore + (e + urlAfter))),
				withCredentials: false
			});
	});
var author$project$Root$FindAlbum = function (a) {
	return {$: 'FindAlbum', a: a};
};
var author$project$Root$FindArtist = function (a) {
	return {$: 'FindArtist', a: a};
};
var author$project$Root$FindTrack = function (a) {
	return {$: 'FindTrack', a: a};
};
var author$project$Root$ModalOpen = function (a) {
	return {$: 'ModalOpen', a: a};
};
var author$project$Root$Play = function (a) {
	return {$: 'Play', a: a};
};
var author$project$Root$PlayerControl = function (a) {
	return {$: 'PlayerControl', a: a};
};
var author$project$Root$SetAlbum = function (a) {
	return {$: 'SetAlbum', a: a};
};
var author$project$Root$SetAlbumTracks = function (a) {
	return {$: 'SetAlbumTracks', a: a};
};
var author$project$Root$SetArtist = function (a) {
	return {$: 'SetArtist', a: a};
};
var author$project$Root$SetArtistAlbums = function (a) {
	return {$: 'SetArtistAlbums', a: a};
};
var author$project$Root$SetArtistTopTracks = function (a) {
	return {$: 'SetArtistTopTracks', a: a};
};
var author$project$Root$SetCollection = function (a) {
	return {$: 'SetCollection', a: a};
};
var author$project$Root$SetModalTrack = function (a) {
	return {$: 'SetModalTrack', a: a};
};
var author$project$Root$SetPlayer = function (a) {
	return {$: 'SetPlayer', a: a};
};
var author$project$Root$SetPlaylist = function (a) {
	return {$: 'SetPlaylist', a: a};
};
var author$project$Root$SetPlaylistTracks = function (a) {
	return {$: 'SetPlaylistTracks', a: a};
};
var author$project$Root$SetRelatedArtists = function (a) {
	return {$: 'SetRelatedArtists', a: a};
};
var author$project$Root$SetReleases = function (a) {
	return {$: 'SetReleases', a: a};
};
var author$project$Root$SetYoutube = function (a) {
	return {$: 'SetYoutube', a: a};
};
var elm$core$Platform$Cmd$none = elm$core$Platform$Cmd$batch(_List_Nil);
var elm$core$Result$withDefault = F2(
	function (def, result) {
		if (result.$ === 'Ok') {
			var a = result.a;
			return a;
		} else {
			return def;
		}
	});
var elm$core$String$concat = function (strings) {
	return A2(elm$core$String$join, '', strings);
};
var author$project$Root$update = F2(
	function (msg, model) {
		var searchModel = model.searchModel;
		var config = model.config;
		var drawer = model.drawer;
		var modal = model.modal;
		var releases = model.releases;
		var token = model.config.token;
		var catchDrawerPlaylist = drawer.drawerPlaylist;
		var catchDrawerCollection = drawer.drawerCollection;
		var catchDrawerArtist = drawer.drawerArtist;
		var catchDrawerAlbum = drawer.drawerAlbum;
		switch (msg.$) {
			case 'UrlChanged':
				var url = msg.a;
				return _Utils_Tuple2(model, elm$core$Platform$Cmd$none);
			case 'UrlRequested':
				var urlRequest = msg.a;
				return _Utils_Tuple2(model, elm$core$Platform$Cmd$none);
			case 'NoOp':
				return _Utils_Tuple2(model, elm$core$Platform$Cmd$none);
			case 'SetPlaylists':
				if (msg.a.$ === 'Ok') {
					var e = msg.a.a;
					return _Utils_Tuple2(
						_Utils_update(
							model,
							{playlists: e.items}),
						elm$core$Platform$Cmd$none);
				} else {
					return _Utils_Tuple2(model, elm$core$Platform$Cmd$none);
				}
			case 'SetPlaylist':
				if (msg.a.$ === 'Ok') {
					var e = msg.a.a;
					var playlist = _Utils_update(
						catchDrawerPlaylist,
						{playlist: e});
					return _Utils_Tuple2(
						_Utils_update(
							model,
							{
								drawer: _Utils_update(
									drawer,
									{drawerPlaylist: playlist, drawerType: author$project$Data$Drawer$DrawPlaylist})
							}),
						elm$core$Platform$Cmd$none);
				} else {
					return _Utils_Tuple2(model, elm$core$Platform$Cmd$none);
				}
			case 'SetCollection':
				if (msg.a.$ === 'Ok') {
					var e = msg.a.a;
					var collection = _Utils_update(
						catchDrawerCollection,
						{playlist: e});
					return _Utils_Tuple2(
						_Utils_update(
							model,
							{
								drawer: _Utils_update(
									drawer,
									{drawerCollection: collection, drawerType: author$project$Data$Drawer$DrawCollection})
							}),
						elm$core$Platform$Cmd$none);
				} else {
					return _Utils_Tuple2(model, elm$core$Platform$Cmd$none);
				}
			case 'GetPlaylist':
				var id = msg.a;
				return _Utils_Tuple2(
					model,
					elm$core$Platform$Cmd$batch(
						_List_fromArray(
							[
								A2(
								elm$http$Http$send,
								author$project$Root$SetPlaylist,
								A5(author$project$Request$get, 'playlists/', id, '', author$project$Data$Playlist$decodePlaylist, token)),
								A2(
								elm$http$Http$send,
								author$project$Root$SetPlaylistTracks,
								A5(author$project$Request$get, 'playlists/', id, '/tracks', author$project$Data$Playlist$decodePlaylistPaging, token))
							])));
			case 'GetCollection':
				var id = msg.a;
				return _Utils_Tuple2(
					model,
					elm$core$Platform$Cmd$batch(
						_List_fromArray(
							[
								A2(
								elm$http$Http$send,
								author$project$Root$SetCollection,
								A5(author$project$Request$get, 'playlists/', id, '', author$project$Data$Playlist$decodePlaylist, token)),
								A2(
								elm$http$Http$send,
								author$project$Root$SetPlaylistTracks,
								A5(author$project$Request$get, 'playlists/', id, '/tracks', author$project$Data$Playlist$decodePlaylistPaging, token))
							])));
			case 'GetAlbum':
				var e = msg.a;
				return _Utils_Tuple2(
					_Utils_update(
						model,
						{
							searchModel: _Utils_update(
								searchModel,
								{searchQuery: ''})
						}),
					elm$core$Platform$Cmd$batch(
						_List_fromArray(
							[
								A2(
								elm$http$Http$send,
								author$project$Root$SetAlbum,
								A5(author$project$Request$get, 'albums/', e, '', author$project$Data$Album$decodeAlbum, token)),
								A2(
								elm$http$Http$send,
								author$project$Root$SetAlbumTracks,
								A5(author$project$Request$get, 'albums/', e, '/tracks', author$project$Data$Track$decodeAlbumTracks, token))
							])));
			case 'SetAlbum':
				if (msg.a.$ === 'Ok') {
					var e = msg.a.a;
					var album = _Utils_update(
						catchDrawerAlbum,
						{album: e});
					return _Utils_Tuple2(
						_Utils_update(
							model,
							{
								drawer: _Utils_update(
									drawer,
									{drawerAlbum: album, drawerType: author$project$Data$Drawer$DrawAlbum})
							}),
						elm$core$Platform$Cmd$none);
				} else {
					return _Utils_Tuple2(model, elm$core$Platform$Cmd$none);
				}
			case 'SetAlbumTracks':
				if (msg.a.$ === 'Ok') {
					var e = msg.a.a;
					var tracks = _Utils_update(
						catchDrawerAlbum,
						{tracks: e.items});
					return _Utils_Tuple2(
						_Utils_update(
							model,
							{
								drawer: _Utils_update(
									drawer,
									{drawerAlbum: tracks})
							}),
						elm$core$Platform$Cmd$none);
				} else {
					var e = msg.a.a;
					return _Utils_Tuple2(model, elm$core$Platform$Cmd$none);
				}
			case 'SetPlaylistTracks':
				if (msg.a.$ === 'Ok') {
					var e = msg.a.a;
					var trackss = _Utils_update(
						catchDrawerPlaylist,
						{tracks: e});
					return _Utils_Tuple2(
						_Utils_update(
							model,
							{
								drawer: _Utils_update(
									drawer,
									{drawerPlaylist: trackss})
							}),
						elm$core$Platform$Cmd$none);
				} else {
					return _Utils_Tuple2(model, elm$core$Platform$Cmd$none);
				}
			case 'GetArtist':
				var id = msg.a;
				return _Utils_Tuple2(
					model,
					elm$core$Platform$Cmd$batch(
						_List_fromArray(
							[
								A2(
								elm$http$Http$send,
								author$project$Root$SetArtist,
								A5(author$project$Request$get, 'artists/', id, '', author$project$Data$Artist$decodeArtist, token)),
								A2(
								elm$http$Http$send,
								author$project$Root$SetArtistAlbums,
								A5(author$project$Request$get, 'artists/', id, '/albums?market=FR&album_type=album', author$project$Data$Album$decodeArtistAlbums, token)),
								A2(
								elm$http$Http$send,
								author$project$Root$SetArtistTopTracks,
								A5(author$project$Request$get, 'artists/', id, '/top-tracks?country=FR', author$project$Data$Track$decodeArtistTopTracks, token)),
								A2(
								elm$http$Http$send,
								author$project$Root$SetRelatedArtists,
								A5(author$project$Request$get, 'artists/', id, '/related-artists', author$project$Data$Artist$decodeRelatedArtists, token))
							])));
			case 'SetArtist':
				if (msg.a.$ === 'Ok') {
					var e = msg.a.a;
					var artist = _Utils_update(
						catchDrawerArtist,
						{artist: e});
					return _Utils_Tuple2(
						_Utils_update(
							model,
							{
								drawer: _Utils_update(
									drawer,
									{drawerArtist: artist, drawerType: author$project$Data$Drawer$DrawArtist}),
								searchModel: _Utils_update(
									searchModel,
									{searchQuery: ''})
							}),
						A2(
							elm$http$Http$send,
							author$project$Root$SetYoutube,
							author$project$Data$Youtube$getVideos(e.name)));
				} else {
					return _Utils_Tuple2(model, elm$core$Platform$Cmd$none);
				}
			case 'SetArtistAlbums':
				if (msg.a.$ === 'Ok') {
					var e = msg.a.a;
					var albums = _Utils_update(
						catchDrawerArtist,
						{albums: e.items});
					return _Utils_Tuple2(
						_Utils_update(
							model,
							{
								drawer: _Utils_update(
									drawer,
									{drawerArtist: albums}),
								searchModel: _Utils_update(
									searchModel,
									{searchQuery: ''})
							}),
						elm$core$Platform$Cmd$none);
				} else {
					return _Utils_Tuple2(model, elm$core$Platform$Cmd$none);
				}
			case 'SetArtistTopTracks':
				if (msg.a.$ === 'Ok') {
					var e = msg.a.a;
					var topTracks = _Utils_update(
						catchDrawerArtist,
						{topTracks: e.tracks});
					return _Utils_Tuple2(
						_Utils_update(
							model,
							{
								drawer: _Utils_update(
									drawer,
									{drawerArtist: topTracks})
							}),
						elm$core$Platform$Cmd$none);
				} else {
					return _Utils_Tuple2(model, elm$core$Platform$Cmd$none);
				}
			case 'SetRelatedArtists':
				if (msg.a.$ === 'Ok') {
					var e = msg.a.a;
					var artists = _Utils_update(
						catchDrawerArtist,
						{relatedArtists: e.artists});
					return _Utils_Tuple2(
						_Utils_update(
							model,
							{
								drawer: _Utils_update(
									drawer,
									{drawerArtist: artists})
							}),
						elm$core$Platform$Cmd$none);
				} else {
					return _Utils_Tuple2(model, elm$core$Platform$Cmd$none);
				}
			case 'SetYoutube':
				if (msg.a.$ === 'Ok') {
					var e = msg.a.a;
					var videos = _Utils_update(
						catchDrawerArtist,
						{videos: e.items});
					return _Utils_Tuple2(
						_Utils_update(
							model,
							{
								drawer: _Utils_update(
									drawer,
									{drawerArtist: videos})
							}),
						elm$core$Platform$Cmd$none);
				} else {
					return _Utils_Tuple2(model, elm$core$Platform$Cmd$none);
				}
			case 'SetPlayer':
				if (msg.a.$ === 'Ok') {
					var e = msg.a.a;
					return _Utils_Tuple2(
						_Utils_update(
							model,
							{player: e}),
						elm$core$Platform$Cmd$none);
				} else {
					return _Utils_Tuple2(
						model,
						author$project$Ports$refreshToken(_Utils_Tuple0));
				}
			case 'GetPlayer':
				return _Utils_Tuple2(
					model,
					A2(
						elm$http$Http$send,
						author$project$Root$SetPlayer,
						A5(author$project$Request$get, 'me/player', '', '', author$project$Data$Player$decodePlayer, token)));
			case 'PlayerControl':
				if (msg.a.$ === 'Ok') {
					var e = msg.a.a;
					return _Utils_Tuple2(model, elm$core$Platform$Cmd$none);
				} else {
					return _Utils_Tuple2(model, elm$core$Platform$Cmd$none);
				}
			case 'PlayerSeek':
				var e = msg.a;
				return _Utils_Tuple2(
					model,
					A2(
						elm$http$Http$send,
						author$project$Root$PlayerControl,
						A4(author$project$Request$put, 'seek?position_ms=', e, '', token)));
			case 'PlayerNext':
				return _Utils_Tuple2(
					model,
					A2(
						elm$http$Http$send,
						author$project$Root$PlayerControl,
						A4(author$project$Request$post, 'me/player/', 'next', '', token)));
			case 'PlayerPrevious':
				return _Utils_Tuple2(
					model,
					A2(
						elm$http$Http$send,
						author$project$Root$PlayerControl,
						A4(author$project$Request$post, 'me/player/', 'previous', '', token)));
			case 'PlayerPlay':
				return _Utils_Tuple2(
					model,
					A2(
						elm$http$Http$send,
						author$project$Root$PlayerControl,
						A4(author$project$Request$put, '', 'play', '', token)));
			case 'PlayerPause':
				return _Utils_Tuple2(
					model,
					A2(
						elm$http$Http$send,
						author$project$Root$PlayerControl,
						A4(author$project$Request$put, '', 'pause', '', token)));
			case 'PlayerShuffleOff':
				return _Utils_Tuple2(
					model,
					A2(
						elm$http$Http$send,
						author$project$Root$PlayerControl,
						A4(author$project$Request$put, '', '', 'shuffle?state=false', token)));
			case 'PlayerShuffleOn':
				return _Utils_Tuple2(
					model,
					A2(
						elm$http$Http$send,
						author$project$Root$PlayerControl,
						A4(author$project$Request$put, '', '', 'shuffle?state=true', token)));
			case 'PlayerRepeatOff':
				return _Utils_Tuple2(
					model,
					A2(
						elm$http$Http$send,
						author$project$Root$PlayerControl,
						A4(author$project$Request$put, '', '', 'repeat?state=off', token)));
			case 'PlayerRepeatOn':
				return _Utils_Tuple2(
					model,
					A2(
						elm$http$Http$send,
						author$project$Root$PlayerControl,
						A4(author$project$Request$put, '', '', 'repeat?state=track', token)));
			case 'Play':
				if (msg.a.$ === 'Ok') {
					var e = msg.a.a;
					return _Utils_Tuple2(model, elm$core$Platform$Cmd$none);
				} else {
					return _Utils_Tuple2(model, elm$core$Platform$Cmd$none);
				}
			case 'ChangePlaying':
				var e = msg.a;
				return _Utils_Tuple2(
					model,
					A2(
						elm$http$Http$send,
						author$project$Root$Play,
						A3(
							author$project$Request$play,
							e,
							author$project$Data$Album$encodeAlbum(e),
							token)));
			case 'ChangePlayingTrack':
				var e = msg.a;
				return _Utils_Tuple2(
					_Utils_update(
						model,
						{
							searchModel: _Utils_update(
								searchModel,
								{searchQuery: ''})
						}),
					A2(
						elm$http$Http$send,
						author$project$Root$Play,
						A3(
							author$project$Request$play,
							e,
							author$project$Data$Track$encodeTrack(e),
							token)));
			case 'FindArtist':
				if (msg.a.$ === 'Ok') {
					var artist = msg.a.a;
					return _Utils_Tuple2(
						_Utils_update(
							model,
							{
								searchModel: _Utils_update(
									searchModel,
									{findArtist: artist.items})
							}),
						elm$core$Platform$Cmd$none);
				} else {
					return _Utils_Tuple2(model, elm$core$Platform$Cmd$none);
				}
			case 'FindAlbum':
				if (msg.a.$ === 'Ok') {
					var album = msg.a.a;
					return _Utils_Tuple2(
						_Utils_update(
							model,
							{
								searchModel: _Utils_update(
									searchModel,
									{findAlbum: album.items})
							}),
						elm$core$Platform$Cmd$none);
				} else {
					return _Utils_Tuple2(model, elm$core$Platform$Cmd$none);
				}
			case 'FindTrack':
				if (msg.a.$ === 'Ok') {
					var track = msg.a.a;
					return _Utils_Tuple2(
						_Utils_update(
							model,
							{
								searchModel: _Utils_update(
									searchModel,
									{findTrack: track.items})
							}),
						elm$core$Platform$Cmd$none);
				} else {
					return _Utils_Tuple2(model, elm$core$Platform$Cmd$none);
				}
			case 'Query':
				var e = msg.a;
				return _Utils_Tuple2(
					_Utils_update(
						model,
						{
							searchModel: _Utils_update(
								searchModel,
								{searchQuery: e})
						}),
					elm$core$Platform$Cmd$batch(
						_List_fromArray(
							[
								A2(
								elm$http$Http$send,
								author$project$Root$FindArtist,
								A5(author$project$Request$get, 'search?q=', e + '*', '&type=artist&limit=10', author$project$Data$Artist$decodeListArtist, token)),
								A2(
								elm$http$Http$send,
								author$project$Root$FindAlbum,
								A5(author$project$Request$get, 'search?q=', e + '*', '&type=album&limit=9', author$project$Data$Album$decodeListAlbum, token)),
								A2(
								elm$http$Http$send,
								author$project$Root$FindTrack,
								A5(author$project$Request$get, 'search?q=', e + '*', '&type=track&limit=12', author$project$Data$Track$decodeListTrack, token))
							])));
			case 'GoHome':
				return _Utils_Tuple2(
					_Utils_update(
						model,
						{
							drawer: _Utils_update(
								drawer,
								{drawerType: author$project$Data$Drawer$Home})
						}),
					elm$core$Platform$Cmd$none);
			case 'SetReleases':
				if (msg.a.$ === 'Ok') {
					var e = msg.a.a;
					return _Utils_Tuple2(
						_Utils_update(
							model,
							{
								releases: _Utils_update(
									releases,
									{releaseList: e.items})
							}),
						elm$core$Platform$Cmd$none);
				} else {
					return _Utils_Tuple2(model, elm$core$Platform$Cmd$none);
				}
			case 'GoReleases':
				return _Utils_Tuple2(
					_Utils_update(
						model,
						{
							drawer: _Utils_update(
								drawer,
								{drawerType: author$project$Data$Drawer$Releases})
						}),
					elm$core$Platform$Cmd$batch(
						_List_fromArray(
							[
								A2(
								elm$http$Http$send,
								author$project$Root$SetReleases,
								A5(author$project$Request$get, 'search?q=', 'year:2018', '&type=album&limit=50', author$project$Data$Album$decodeListAlbum, token)),
								author$project$Ports$getReleasesThePRP(_Utils_Tuple0)
							])));
			case 'GoListen':
				return _Utils_Tuple2(
					_Utils_update(
						model,
						{
							drawer: _Utils_update(
								drawer,
								{drawerType: author$project$Data$Drawer$Listen})
						}),
					elm$core$Platform$Cmd$none);
			case 'ModalOpen':
				if (msg.a.$ === 'Ok') {
					var e = msg.a.a;
					var firstTrack = A2(
						elm$core$List$take,
						1,
						A2(
							elm$core$List$map,
							function (f) {
								return f.uri;
							},
							e.items));
					return _Utils_Tuple2(
						_Utils_update(
							model,
							{
								modal: _Utils_update(
									modal,
									{inPocket: firstTrack, isOpen: true})
							}),
						elm$core$Platform$Cmd$none);
				} else {
					return _Utils_Tuple2(model, elm$core$Platform$Cmd$none);
				}
			case 'ModalGetTrack':
				var e = msg.a;
				return _Utils_Tuple2(
					model,
					elm$core$Platform$Cmd$batch(
						_List_fromArray(
							[
								A2(
								elm$http$Http$send,
								author$project$Root$ModalOpen,
								A5(author$project$Request$get, 'albums/', e, '/tracks', author$project$Data$Track$decodeAlbumTracks, token))
							])));
			case 'ModalAddTrack':
				var e = msg.a;
				var listTracks = elm$core$String$concat(model.modal.inPocket);
				return _Utils_Tuple2(
					model,
					A2(
						elm$http$Http$send,
						author$project$Root$SetModalTrack,
						A4(author$project$Request$post, 'playlists/', e, '/tracks?position=0&uris=' + listTracks, token)));
			case 'SetModalTrack':
				if (msg.a.$ === 'Ok') {
					var e = msg.a.a;
					return _Utils_Tuple2(
						_Utils_update(
							model,
							{
								modal: _Utils_update(
									modal,
									{isOpen: false})
							}),
						elm$core$Platform$Cmd$none);
				} else {
					var e = msg.a.a;
					return _Utils_Tuple2(model, elm$core$Platform$Cmd$none);
				}
			case 'ModalClear':
				return _Utils_Tuple2(
					_Utils_update(
						model,
						{
							modal: _Utils_update(
								modal,
								{isOpen: false})
						}),
					elm$core$Platform$Cmd$none);
			case 'DelCollectionAlbum':
				var p = msg.a;
				var e = msg.b;
				return _Utils_Tuple2(
					model,
					elm$core$Platform$Cmd$batch(
						_List_fromArray(
							[
								A2(
								elm$http$Http$send,
								author$project$Root$Play,
								A5(
									author$project$Request$delete,
									'playlists/',
									p,
									'/tracks',
									author$project$Data$Track$encodeDelCollectionAlbum(e),
									token))
							])));
			case 'HandleKeyboardEvent':
				var event = msg.a;
				var _n1 = event.key;
				if (_n1.$ === 'Just') {
					if (_n1.a === 'Escape') {
						return _Utils_Tuple2(
							_Utils_update(
								model,
								{
									modal: _Utils_update(
										modal,
										{isOpen: false}),
									searchModel: _Utils_update(
										searchModel,
										{searchQuery: ''})
								}),
							elm$core$Platform$Cmd$none);
					} else {
						return _Utils_Tuple2(model, elm$core$Platform$Cmd$none);
					}
				} else {
					return _Utils_Tuple2(model, elm$core$Platform$Cmd$none);
				}
			default:
				var e = msg.a;
				var releaseList = A2(
					elm$json$Json$Decode$decodeString,
					elm$json$Json$Decode$list(author$project$Data$Releases$decodeThePrpReleases),
					e);
				return _Utils_Tuple2(
					_Utils_update(
						model,
						{
							releases: _Utils_update(
								releases,
								{
									thePrp: A2(elm$core$Result$withDefault, _List_Nil, releaseList)
								})
						}),
					elm$core$Platform$Cmd$none);
		}
	});
var elm$browser$Browser$application = _Browser_application;
var author$project$Main$main = elm$browser$Browser$application(
	{init: author$project$Main$init, onUrlChange: author$project$Root$UrlChanged, onUrlRequest: author$project$Root$UrlRequested, subscriptions: author$project$Main$subscriptions, update: author$project$Root$update, view: author$project$Main$view});
_Platform_export({'Main':{'init':author$project$Main$main(
	A2(
		elm$json$Json$Decode$andThen,
		function (token) {
			return elm$json$Json$Decode$succeed(
				{token: token});
		},
		A2(elm$json$Json$Decode$field, 'token', elm$json$Json$Decode$string)))(0)}});}(this));